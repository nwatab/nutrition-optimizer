import { Card } from '@/components/ui/card';
import type { Locale } from '@/config';
import type { Message } from '@/locales';
import type { FoodRequired } from '@/types/nutrition';
import {
  capitalize,
  foodDisplayName,
  foodNutritionFactsName,
  toTitleCase,
} from '@/utils';
import Link from 'next/link';

type NumericColumn = {
  key: string;
  label: (messages: Message) => string;
  value: (ingredient: FoodRequired) => number;
  /** md 以上のテーブルでの表示制御。カード表示（モバイル）では全列を表示する。 */
  tableCellClass: string;
};

const numericColumns: readonly NumericColumn[] = [
  {
    key: 'weight',
    label: (m) => `${toTitleCase(m['food weight'])} (g)`,
    value: (i) => i.hectoGrams * 100,
    tableCellClass: 'table-cell',
  },
  {
    key: 'cost',
    label: (m) => `${m['food cost']} (${m['yen']})`,
    value: (i) => i.cost,
    tableCellClass: 'table-cell',
  },
  {
    key: 'calories',
    label: (m) => m['calories'],
    value: (i) => i.nutritionFacts.calories,
    tableCellClass: 'table-cell',
  },
  {
    key: 'protein',
    label: (m) => m['protein'],
    value: (i) => i.nutritionFacts.protein,
    tableCellClass: 'hidden lg:table-cell',
  },
  {
    key: 'fat',
    label: (m) => m['fat'],
    value: (i) => i.nutritionFacts.fat,
    tableCellClass: 'hidden lg:table-cell',
  },
  {
    key: 'carbohydrates',
    label: (m) => m['carbohydrates'],
    value: (i) => i.nutritionFacts.carbohydrates,
    tableCellClass: 'hidden xl:table-cell',
  },
  {
    key: 'fiber',
    label: (m) => m['fiber'],
    value: (i) => i.nutritionFacts.fiber,
    tableCellClass: 'hidden xl:table-cell',
  },
];

const formatAmount = (value: number): string =>
  value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });

const columnTotal = (
  column: NumericColumn,
  ingredients: FoodRequired[]
): number =>
  ingredients.reduce((sum, ingredient) => sum + column.value(ingredient), 0);

function ExternalLinkIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

/**
 * 食材名の表示。商品（manual / manualPrice）は商品ページへの外部リンク、
 * 補足の成分表名は食材詳細ページへの内部リンク。
 */
function FoodName({
  ingredient,
  messages,
  locale,
}: {
  ingredient: FoodRequired;
  messages: Message;
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-1">
      {ingredient.type === 'estat' ? (
        <span className="text-sm font-normal text-emerald-600 line-clamp-2 break-words">
          {foodDisplayName(ingredient, locale)}
        </span>
      ) : (
        <Link
          href={ingredient.url}
          className="group text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline inline-flex relative w-full"
          target="_blank"
        >
          <span className="line-clamp-2 pr-1">
            {foodDisplayName(ingredient, locale)}
          </span>
          <ExternalLinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 inline-block align-text-top" />
        </Link>
      )}
      <Link
        href={`/${locale}/foods/${ingredient.id}`}
        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline break-words"
      >
        {foodNutritionFactsName(ingredient, locale) ??
          capitalize(messages['to nutition factors'])}
      </Link>
    </div>
  );
}

/** モバイル向けカード表示。テーブルでは入り切らない全項目をラベル付きで見せる。 */
function IngredientCards({
  ingredients,
  messages,
  locale,
}: {
  ingredients: FoodRequired[];
  messages: Message;
  locale: Locale;
}) {
  const [weight, cost, ...nutrients] = numericColumns;
  return (
    <ul className="md:hidden flex flex-col gap-3">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="rounded-lg border border-emerald-100 bg-white/60 p-4 shadow-sm"
        >
          <FoodName
            ingredient={ingredient}
            messages={messages}
            locale={locale}
          />
          <div className="mt-3 flex items-end justify-between border-t border-emerald-100 pt-3">
            {[weight, cost].map((column) => (
              <div key={column.key}>
                <div className="text-xs text-emerald-700">
                  {column.label(messages)}
                </div>
                <div className="text-lg font-bold text-emerald-800 tabular-nums">
                  {formatAmount(column.value(ingredient))}
                </div>
              </div>
            ))}
          </div>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {nutrients.map((column) => (
              <div key={column.key} className="flex gap-1">
                <dt>{column.label(messages)}</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmount(column.value(ingredient))}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
      <li className="rounded-lg bg-emerald-100/70 p-4">
        <div className="text-sm font-semibold text-emerald-800">
          {capitalize(messages['total'])}
        </div>
        <div className="mt-2 flex items-end justify-between">
          {[weight, cost].map((column) => (
            <div key={column.key}>
              <div className="text-xs text-emerald-700">
                {column.label(messages)}
              </div>
              <div className="text-lg font-bold text-emerald-800 tabular-nums">
                {formatAmount(columnTotal(column, ingredients))}
              </div>
            </div>
          ))}
        </div>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
          {nutrients.map((column) => (
            <div key={column.key} className="flex gap-1">
              <dt>{column.label(messages)}</dt>
              <dd className="font-semibold tabular-nums">
                {formatAmount(columnTotal(column, ingredients))}
              </dd>
            </div>
          ))}
        </dl>
      </li>
    </ul>
  );
}

/** md 以上のテーブル表示。数値列は右揃え・等幅数字で桁を揃える。 */
function IngredientTable({
  ingredients,
  messages,
  locale,
}: {
  ingredients: FoodRequired[];
  messages: Message;
  locale: Locale;
}) {
  return (
    <div className="hidden md:block relative overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-emerald-200 table-auto">
        <thead className="bg-emerald-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-emerald-700 tracking-wider whitespace-nowrap rounded-tl-lg"
            >
              {toTitleCase(messages['food name'])}
            </th>
            {numericColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-right text-xs font-medium text-emerald-700 tracking-wider whitespace-nowrap last:rounded-tr-lg ${column.tableCellClass}`}
              >
                {column.label(messages)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-emerald-200">
          {ingredients.map((ingredient, index) => (
            <tr
              key={ingredient.id}
              className={`${
                index % 2 === 0 ? 'bg-white/50' : 'bg-emerald-50/50'
              } hover:bg-emerald-50`}
            >
              <td className="px-4 py-3">
                <FoodName
                  ingredient={ingredient}
                  messages={messages}
                  locale={locale}
                />
              </td>
              {numericColumns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-right tabular-nums whitespace-nowrap ${column.tableCellClass}`}
                >
                  {formatAmount(column.value(ingredient))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-emerald-800 bg-emerald-100/70">
            <td className="px-4 py-3 whitespace-nowrap rounded-bl-lg">
              {capitalize(messages['total'])}
            </td>
            {numericColumns.map((column) => (
              <td
                key={column.key}
                className={`px-4 py-3 text-right tabular-nums whitespace-nowrap last:rounded-br-lg ${column.tableCellClass}`}
              >
                {formatAmount(columnTotal(column, ingredients))}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function IngredientsList({
  ingredients,
  messages,
  locale,
}: {
  ingredients: FoodRequired[];
  messages: Message;
  locale: Locale;
}) {
  return (
    <Card className="p-4 md:p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        {messages['Optimized list of food']}
      </h2>
      <IngredientCards
        ingredients={ingredients}
        messages={messages}
        locale={locale}
      />
      <IngredientTable
        ingredients={ingredients}
        messages={messages}
        locale={locale}
      />
    </Card>
  );
}
