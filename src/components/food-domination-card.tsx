import Link from 'next/link';

import { HasseDiagram } from '@/components/hasse-diagram';
import { Card } from '@/components/ui/card';
import type { Locale } from '@/config';
import type { Message } from '@/locales';
import {
  DEFAULT_COMPARE_NUTRIENT_KEYS,
  dominates,
} from '@/services/domination';
import { toCompareNode, type CompareNode } from '@/services/environment';
import type { FoodToOptimize } from '@/types/nutrition';

const MAX_LISTED = 6;

/**
 * 支配関係にある食材のリスト。多すぎる場合は先頭 MAX_LISTED 件 + 残数。
 */
function NodeList({
  nodes,
  locale,
  messages,
}: {
  nodes: CompareNode[];
  locale: Locale;
  messages: Message;
}) {
  if (nodes.length === 0) {
    return <p className="text-sm text-gray-400">{messages['(none)']}</p>;
  }
  const listed = nodes.slice(0, MAX_LISTED);
  const rest = nodes.length - listed.length;
  return (
    <ul className="flex flex-wrap gap-2">
      {listed.map((node) => (
        <li key={node.id}>
          <Link
            href={`/${locale}/foods/${node.foodId}`}
            className="inline-block rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
          >
            {node.label}
          </Link>
        </li>
      ))}
      {rest > 0 && (
        <li className="self-center text-xs text-gray-500">
          {messages['and {count} more'].replace('{count}', String(rest))}
        </li>
      )}
    </ul>
  );
}

/**
 * 食品詳細ページ用の局所半順序ビュー。この食材を支配する食材／
 * この食材が支配する食材だけを見せる（フル Hasse 図は compare へ）。
 * 軸は compare ページのデフォルトと同じ（可食部100gあたり）。
 */
export default function FoodDominationCard({
  food,
  foods,
  messages,
  locale,
}: {
  food: FoodToOptimize;
  foods: FoodToOptimize[];
  messages: Message;
  locale: Locale;
}) {
  const self = toCompareNode(food, 'per100g', locale);
  if (self === null) return null;

  const others = foods
    .filter((other) => other.id !== food.id)
    .map((other) => toCompareNode(other, 'per100g', locale))
    .filter((node): node is CompareNode => node !== null);

  const nutrientKeys = DEFAULT_COMPARE_NUTRIENT_KEYS;
  const dominators = others.filter((other) =>
    dominates(other, self, nutrientKeys)
  );
  const dominated = others.filter((other) =>
    dominates(self, other, nutrientKeys)
  );
  const incomparableCount =
    others.length - dominators.length - dominated.length;

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-emerald-800">
          {messages['Position in the cost-nutrition trade-off']}
        </h2>
        {dominators.length === 0 && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            {messages['On the Pareto front (not dominated by any food)']}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {messages['domination axes note']}
      </p>

      {/* この食材の近傍だけの局所 Hasse 図（関係がある場合のみ） */}
      {dominators.length + dominated.length > 0 && (
        <div className="mb-6">
          <HasseDiagram
            nodes={[...dominators, self, ...dominated]}
            nutrientKeys={nutrientKeys}
            highlightedIds={[self.id]}
            locale={locale}
            messages={messages}
            showHighlightCount={false}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-emerald-700 mb-2">
            {messages['Foods that dominate this food']}
          </h3>
          <NodeList nodes={dominators} locale={locale} messages={messages} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-emerald-700 mb-2">
            {messages['Foods this food dominates']}
          </h3>
          <NodeList nodes={dominated} locale={locale} messages={messages} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-100 pt-3">
        <p className="text-xs text-gray-500">
          {messages['Incomparable with {count} foods (trade-off relations)'].replace(
            '{count}',
            String(incomparableCount)
          )}
        </p>
        <Link
          href={`/${locale}/compare?highlight=${encodeURIComponent(food.id)}`}
          className="text-sm font-medium text-emerald-700 underline hover:text-emerald-900"
        >
          {messages['See in the full Hasse diagram']} →
        </Link>
      </div>
    </Card>
  );
}
