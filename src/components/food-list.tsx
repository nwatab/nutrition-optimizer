'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/config';
import { withBasePath } from '@/lib/shallow-url';
import { formatNutrientAmount, unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type { NutrientKey } from '@/services/diagnose';
import {
  DISPLAY_CATEGORY_ORDER,
  displayCategoryMeta,
  displayCategoryOf,
  type DisplayCategory,
} from '@/services/food-category';
import type { Food } from '@/types/nutrition';
import { foodDisplayName } from '@/utils';

type SortOrder = 'asc' | 'desc';

const parseCategory = (raw: string | null): DisplayCategory | null =>
  raw !== null && DISPLAY_CATEGORY_ORDER.includes(raw as DisplayCategory)
    ? (raw as DisplayCategory)
    : null;

// 一覧に並べる栄養素列（いずれも可食部100gあたり）。
const NUTRIENT_COLUMNS: NutrientKey[] = [
  'protein',
  'fat',
  'carbohydrates',
  'fiber',
  'calcium',
  'iron',
  'nacl',
];

type Column = {
  /** orderBy クエリの値。 */
  id: string;
  /** 右寄せ表示にし、列選択時の既定を降順にする数値列か。 */
  numeric: boolean;
  label: (messages: Message) => string;
  unit: (messages: Message) => string;
  // null は価格なし（mext 食材）。並べ替えでは末尾に置く。
  value: (food: Food, locale: Locale) => number | string | null;
  format: (food: Food, locale: Locale) => string;
};

const nameColumn: Column = {
  id: 'name',
  numeric: false,
  label: (messages) => messages['food name'],
  unit: () => '',
  value: (food, locale) => foodDisplayName(food, locale),
  format: (food, locale) => foodDisplayName(food, locale),
};

// エネルギー（kcal）。栄養データ上は calories だが表示・並べ替えは「エネルギー」。
const energyColumn: Column = {
  id: 'energy',
  numeric: true,
  label: (messages) => messages.energy,
  unit: () => 'kcal',
  value: (food) => food.nutritionFacts.calories,
  format: (food, locale) =>
    formatNutrientAmount('calories', food.nutritionFacts.calories, locale),
};

const costColumn: Column = {
  id: 'cost',
  numeric: true,
  label: (messages) => messages['food cost'],
  unit: (messages) => messages.yen,
  value: (food) => food.cost,
  format: (food, locale) =>
    food.cost === null
      ? '—'
      : food.cost.toLocaleString(locale, { maximumFractionDigits: 1 }),
};

const nutrientColumns: Column[] = NUTRIENT_COLUMNS.map((key) => ({
  id: key,
  numeric: true,
  label: (messages) => messages[key],
  unit: () => unitMap[key],
  value: (food) => food.nutritionFacts[key],
  format: (food, locale) =>
    formatNutrientAmount(key, food.nutritionFacts[key], locale),
}));

// 食材名→エネルギー→コスト→主要栄養素の順。
const COLUMNS: Column[] = [
  nameColumn,
  energyColumn,
  costColumn,
  ...nutrientColumns,
];
const COLUMN_IDS = new Set(COLUMNS.map((column) => column.id));

// 既定はエネルギー降順。既定値のクエリは URL から省く。
const DEFAULT_ORDER_BY = 'energy';
const DEFAULT_ORDER: SortOrder = 'desc';

const parseOrderBy = (raw: string | null): string =>
  raw !== null && COLUMN_IDS.has(raw) ? raw : DEFAULT_ORDER_BY;
const parseOrder = (raw: string | null): SortOrder =>
  raw === 'asc' || raw === 'desc' ? raw : DEFAULT_ORDER;

/**
 * 食品データベースの一覧（表）。並べ替えの状態は order / order_by の
 * クエリパラメータを単一の情報源にする。列見出しのクリックで浅く書き換え、
 * リロードや共有 URL でも並び順が保たれる。
 */
export default function FoodList({
  foods,
  messages,
  locale,
}: {
  foods: Food[];
  messages: Message;
  locale: Locale;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderBy = parseOrderBy(searchParams.get('order_by'));
  const order = parseOrder(searchParams.get('order'));
  const activeCategory = parseCategory(searchParams.get('category'));

  const activeColumn =
    COLUMNS.find((column) => column.id === orderBy) ?? energyColumn;

  // データに実在するカテゴリーだけを規定の順で並べる（空のチップを出さない）。
  const presentCategories = useMemo(() => {
    const present = new Set(foods.map(displayCategoryOf));
    return DISPLAY_CATEGORY_ORDER.filter((category) => present.has(category));
  }, [foods]);

  // ページ遷移ではないので history.replaceState で浅く書き換える
  // （Next 14.1+ は useSearchParams に反映される）。
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) =>
      value === null ? params.delete(key) : params.set(key, value)
    );
    window.history.replaceState(null, '', withBasePath(pathname, params.toString()));
  };

  const changeSort = (column: Column) => {
    const isActive = column.id === orderBy;
    const nextOrder: SortOrder = isActive
      ? order === 'desc'
        ? 'asc'
        : 'desc'
      : column.numeric
        ? 'desc'
        : 'asc';
    updateQuery({
      order_by: column.id === DEFAULT_ORDER_BY ? null : column.id,
      order: nextOrder === DEFAULT_ORDER ? null : nextOrder,
    });
  };

  const sorted = useMemo(() => {
    const factor = order === 'asc' ? 1 : -1;
    const visible =
      activeCategory === null
        ? foods
        : foods.filter((food) => displayCategoryOf(food) === activeCategory);
    return visible.toSorted((a, b) => {
      const va = activeColumn.value(a, locale);
      const vb = activeColumn.value(b, locale);
      // 価格なし（null）は昇順・降順のどちらでも末尾へ。
      if (va === null || vb === null) {
        if (va === null && vb === null) return 0;
        return va === null ? 1 : -1;
      }
      const diff =
        typeof va === 'string'
          ? va.localeCompare(vb as string, locale)
          : va - (vb as number);
      return factor * diff;
    });
  }, [foods, activeCategory, activeColumn, order, locale]);

  return (
    <Card className="min-w-0">
      <CardContent className="p-6">
        {/* カテゴリーの絞り込みチップ。状態は category クエリを情報源にする。 */}
        {presentCategories.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <CategoryChip
              icon={null}
              label={messages['all categories']}
              active={activeCategory === null}
              onClick={() => updateQuery({ category: null })}
            />
            {presentCategories.map((category) => {
              const meta = displayCategoryMeta[category];
              return (
                <CategoryChip
                  key={category}
                  icon={meta.icon}
                  label={meta.label[locale]}
                  active={activeCategory === category}
                  onClick={() =>
                    updateQuery({
                      category: activeCategory === category ? null : category,
                    })
                  }
                />
              );
            })}
          </div>
        )}
        <p className="mb-3 text-xs text-gray-500">
          {messages['per 100 g edible portion']}
        </p>
        {/* grid 直下ではないが、長い表を親幅に閉じ込めてカード内でスクロールさせる */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-800 border-b border-emerald-200">
                <th className="py-2 pr-2 w-6" aria-label={messages['food category']} />
                {COLUMNS.map((column, index) => {
                  const isActive = column.id === orderBy;
                  const unit = column.unit(messages);
                  return (
                    <th
                      key={column.id}
                      aria-sort={
                        isActive
                          ? order === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      onClick={() => changeSort(column)}
                      className={`py-2 pr-3 cursor-pointer select-none whitespace-nowrap ${
                        index > 0 ? 'text-right' : ''
                      } ${isActive ? 'font-semibold' : ''}`}
                    >
                      {column.label(messages)}
                      {unit ? ` [${unit}]` : ''}
                      <span className="ml-0.5 inline-block w-3 text-emerald-500">
                        {isActive ? (order === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((food) => {
                const category = displayCategoryOf(food);
                const meta = displayCategoryMeta[category];
                return (
                <tr
                  key={food.id}
                  className="border-b border-gray-100 hover:bg-emerald-50/50"
                >
                  <td
                    className="py-1.5 pr-2 text-center align-middle"
                    title={meta.label[locale]}
                  >
                    <span aria-label={meta.label[locale]} role="img">
                      {meta.icon}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3">
                    <Link
                      href={`/${locale}/foods/${food.id}`}
                      className="font-medium text-emerald-800 hover:underline"
                    >
                      {foodDisplayName(food, locale)}
                    </Link>
                  </td>
                  {COLUMNS.slice(1).map((column) => (
                    <td
                      key={column.id}
                      className="py-1.5 pr-3 text-right tabular-nums"
                    >
                      {column.format(food, locale)}
                    </td>
                  ))}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/** カテゴリー絞り込みチップ。アクティブは塗り、非アクティブは枠線のみ。 */
function CategoryChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string | null;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm whitespace-nowrap transition-colors ${
        active
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50'
      }`}
    >
      {icon !== null && (
        <span aria-hidden="true" className="text-base leading-none">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
