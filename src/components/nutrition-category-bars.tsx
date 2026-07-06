'use client';

import { useState } from 'react';
import type { Locale } from '@/config';
import { formatNutrientAmount, unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type {
  ConstraintRange,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';
import { toTitleCase } from '@/utils';

type Sex = 'male' | 'female';

type NutritionCategoryBarsProps = {
  /** 可食部100gあたりの栄養成分 */
  nutritionFacts: NutritionFactBase<number>;
  /** 代表プロフィール（30–49歳）の1日基準量。詳細ページは静的生成のため♂♀両方を渡す。 */
  targets: { male: NutritionTarget; female: NutritionTarget };
  messages: Message;
  locale: Locale;
};

type NutrientKey = keyof NutritionFactBase<number>;

/**
 * 上限型（少ないほど良い）栄養素。バーは「上限量に対する割合」で描き、
 * 超過を赤で示す。食塩は下限も持つが目標は上限側なので明示的に含める
 * （レーダーチャートの塩分警告と同じ扱い）。飽和脂肪酸は上限のみ。
 */
const LIMIT_NUTRIENTS = new Set<NutrientKey>([
  'nacl',
  'saturatedFattyAcids',
]);

/**
 * 基準が性別で大きく変わり、併記が意思決定に効く栄養素。エネルギー比例で
 * 微差が出るだけの栄養素まで併記すると煩雑になるため、レーダーチャートと
 * 同じく鉄・カルシウムに限定する。
 */
const DUAL_SEX_NUTRIENTS = new Set<NutrientKey>(['iron', 'calcium']);

// 結果ページ（nutrition-category-charts）と同一の6分類に統一する。
const CATEGORIES: { id: string; nameKey: keyof Message; keys: NutrientKey[] }[] =
  [
    {
      id: 'macros',
      nameKey: 'macronutrients',
      keys: ['calories', 'protein', 'fat', 'carbohydrates', 'fiber'],
    },
    {
      id: 'fat-soluble-vitamins',
      nameKey: 'fat-soluble vitamins',
      keys: ['vitaminA', 'vitaminD', 'vitaminE', 'vitaminK'],
    },
    {
      id: 'water-soluble-vitamins',
      nameKey: 'water-soluble vitamins',
      keys: [
        'vitaminB1',
        'vitaminB2',
        'vitaminB6',
        'vitaminB12',
        'vitaminC',
        'niacin',
        'folate',
        'pantothenicAcid',
        'biotin',
      ],
    },
    {
      id: 'macro-minerals',
      nameKey: 'macro-minerals',
      keys: ['potassium', 'calcium', 'magnesium', 'phosphorus', 'nacl'],
    },
    {
      id: 'trace-minerals',
      nameKey: 'micro-minerals',
      keys: [
        'iron',
        'zinc',
        'copper',
        'manganese',
        'iodine',
        'selenium',
        'chromium',
        'molybdenum',
      ],
    },
    {
      id: 'fats',
      nameKey: 'fatty acids',
      keys: [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ],
    },
  ];

type BarModel = {
  /** 基準となる量（1日推奨量、または上限量） */
  reference: number;
  /** 基準に対する割合 [%] */
  percent: number;
  /** 上限型（少ないほど良い）か */
  isLimit: boolean;
  /** 上限を超えているか（過剰） */
  isOver: boolean;
};

/**
 * 実量と基準量から1本のバーの意味を決める。正規化は「実量 → 基準比」の1回のみ。
 * - 上限型（食塩・飽和脂肪酸）: 上限量に対する割合。超過で過剰。
 * - エネルギー: EER（equal）に対する割合。
 * - 下限型・範囲型: 下限（推奨量）に対する割合。上限があり超えていれば過剰。
 */
const buildBar = (
  key: NutrientKey,
  value: number,
  range: ConstraintRange
): BarModel | null => {
  const isLimit =
    LIMIT_NUTRIENTS.has(key) || ('max' in range && !('min' in range));

  if (isLimit) {
    const reference =
      'max' in range && range.max !== undefined
        ? range.max
        : 'min' in range
          ? range.min
          : undefined;
    if (reference === undefined || reference <= 0) return null;
    const percent = (value / reference) * 100;
    return { reference, percent, isLimit: true, isOver: percent > 100 };
  }

  const reference =
    'equal' in range ? range.equal : 'min' in range ? range.min : undefined;
  if (reference === undefined || reference <= 0) return null;
  const percent = (value / reference) * 100;
  const max = 'max' in range ? range.max : undefined;
  return {
    reference,
    percent,
    isLimit: false,
    isOver: max !== undefined && value > max,
  };
};

export default function NutritionCategoryBars({
  nutritionFacts,
  targets,
  messages,
  locale,
}: NutritionCategoryBarsProps) {
  const [sex, setSex] = useState<Sex>('male');
  const activeTarget = targets[sex];
  const otherSex: Sex = sex === 'male' ? 'female' : 'male';
  const otherTarget = targets[otherSex];

  return (
    <div className="space-y-6">
      {/* 基準の明示（何あたり・何に対する割合か）と性別トグル */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {messages['Share of daily reference intake per 100 g']}
          <span className="text-gray-400">
            {' '}
            ·{' '}
            {messages[
              'daily reference intake (ages 30–49, {sex})'
            ].replace('{sex}', messages[sex])}
          </span>
        </p>
        <div
          className="inline-flex rounded-full border border-emerald-200 p-0.5"
          role="group"
        >
          {(['male', 'female'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSex(option)}
              aria-pressed={sex === option}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sex === option
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {messages[option]}
            </button>
          ))}
        </div>
      </div>

      {CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-700">
            {messages[category.nameKey]}
          </h3>
          {category.keys.map((key) => {
            const value = nutritionFacts[key];
            const bar = buildBar(key, value, activeTarget[key]);
            const otherBar = buildBar(key, value, otherTarget[key]);
            const percent = bar?.percent ?? 0;
            const width = Math.min(Math.max(percent, 0), 100);
            const barColor = bar?.isOver
              ? 'bg-rose-500'
              : bar?.isLimit
                ? 'bg-emerald-500'
                : 'bg-emerald-500';
            const shareText = bar
              ? (bar.isLimit
                  ? messages['{percent}% of upper limit']
                  : messages['{percent}% of daily reference']
                ).replace(
                  '{percent}',
                  Math.round(bar.percent).toLocaleString(locale)
                )
              : null;
            // 鉄・カルシウムのみ、性差が意思決定に効くため他方の割合を併記する。
            const showOther =
              DUAL_SEX_NUTRIENTS.has(key) &&
              bar !== null &&
              otherBar !== null &&
              Math.round(otherBar.percent) !== Math.round(bar.percent);

            return (
              <div
                key={key}
                className="grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-3 text-sm font-medium text-gray-700">
                  {toTitleCase(messages[key])}
                </div>
                <div className="col-span-6">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${barColor}`}
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-sm text-gray-700">
                    {formatNutrientAmount(key, value, locale)} {unitMap[key]}
                  </div>
                  {shareText && (
                    <div
                      className={`text-xs ${bar?.isOver ? 'text-rose-600' : 'text-gray-500'}`}
                    >
                      {shareText}
                      {showOther && otherBar && (
                        <span className="text-gray-400">
                          {' '}
                          ({messages[otherSex]}{' '}
                          {Math.round(otherBar.percent).toLocaleString(locale)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
