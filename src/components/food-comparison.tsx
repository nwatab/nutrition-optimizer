'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { HasseDiagram, truncate } from '@/components/hasse-diagram';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/config';
import {
  MAX_AXES,
  MIN_AXES,
  NUTRIENT_KEYS,
  defaultAxesFor,
  denominatorCostOf,
  denominatorNutrientOf,
  parseAxes,
  parseBasis,
  parseView,
  sameAxes,
  serializeAxes,
  type CompareView,
} from '@/lib/compare-state';
import {
  ZERO_WEIGHTS,
  hasNonZeroWeights,
  readStoredWeights,
} from '@/lib/environmental-prices';
import { unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type { NutrientKey } from '@/services/diagnose';
import {
  COST_AXES,
  scalarizeCost,
  skyline,
  type ComparisonAxes,
  type CostAxis,
  type ScalarizationWeights,
} from '@/services/domination';
import { toCompareNode, type CompareNode } from '@/services/environment';
import type { Basis } from '@/services/nutrient-density';
import type { FoodToOptimize } from '@/types/nutrition';

const BASIS_LABELS: Record<Basis, keyof Message> = {
  per100g: 'per 100 g edible portion',
  perYen: 'per 1 yen',
  perKcal: 'per 1 kcal',
};

const costAxisLabels = (messages: Message): Record<CostAxis, string> => ({
  yen: messages.price,
  co2eKg: 'CO2e',
  landM2: messages.land,
  waterL: messages.water,
});

const costAxisUnits = (messages: Message): Record<CostAxis, string> => ({
  yen: messages.yen,
  co2eKg: 'kg',
  landM2: 'm²',
  waterL: 'L',
});

type SortKey =
  | { kind: 'label' }
  | { kind: 'cost'; axis: CostAxis }
  | { kind: 'nutrient'; key: NutrientKey }
  | { kind: 'totalCost' };

const sortValueOf = (
  node: CompareNode,
  key: SortKey,
  weights: ScalarizationWeights
): number | string => {
  switch (key.kind) {
    case 'label':
      return node.label;
    case 'cost':
      return node.costVector[key.axis];
    case 'nutrient':
      return node.nutrientDensity[key.key];
    case 'totalCost':
      return scalarizeCost(node.costVector, weights);
  }
};

const sameSortKey = (a: SortKey, b: SortKey): boolean =>
  a.kind === b.kind &&
  (a.kind !== 'cost' || a.axis === (b as { axis: CostAxis }).axis) &&
  (a.kind !== 'nutrient' || a.key === (b as { key: NutrientKey }).key);

/**
 * 表ビュー。順位ではなく、選択中の軸の生の値を並べた表。
 * ソートは表示上の操作で、比較（上位互換バッジ）は軸選択だけから決まる。
 * 総コスト列は換算価格が設定されているときだけ現れる導出列。
 */
const ComparisonTable = ({
  nodes,
  axes,
  weights,
  highlightedIds,
  locale,
  messages,
  basis,
}: {
  nodes: CompareNode[];
  axes: ComparisonAxes;
  weights: ScalarizationWeights;
  highlightedIds: ReadonlySet<string>;
  locale: Locale;
  messages: Message;
  basis: Basis;
}) => {
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({
    key: { kind: 'label' },
    ascending: true,
  });
  const front = useMemo(
    () => new Set(skyline(nodes, axes).map((node) => node.id)),
    [nodes, axes]
  );
  const showTotalCost = hasNonZeroWeights(weights);

  const basisSuffix =
    basis === 'perYen' ? `/${messages.yen}` : basis === 'perKcal' ? '/kcal' : '';
  const costLabels = costAxisLabels(messages);
  const costUnits = costAxisUnits(messages);

  const columns: { key: SortKey; label: string }[] = [
    { key: { kind: 'label' }, label: messages['food name'] },
    ...axes.costAxes.map((axis) => ({
      key: { kind: 'cost', axis } as SortKey,
      label: `${costLabels[axis]} [${costUnits[axis]}${basisSuffix}]`,
    })),
    ...(showTotalCost
      ? [
          {
            key: { kind: 'totalCost' } as SortKey,
            label: messages['total cost [yen]'],
          },
        ]
      : []),
    ...axes.nutrientKeys.map((key) => ({
      key: { kind: 'nutrient', key } as SortKey,
      label: `${messages[key]} [${unitMap[key]}${basisSuffix}]`,
    })),
  ];

  const sorted = useMemo(
    () =>
      nodes.toSorted((a, b) => {
        const va = sortValueOf(a, sort.key, weights);
        const vb = sortValueOf(b, sort.key, weights);
        const diff =
          typeof va === 'string'
            ? va.localeCompare(vb as string, locale)
            : va - (vb as number);
        return sort.ascending ? diff : -diff;
      }),
    [nodes, sort, weights, locale]
  );

  const toggleSort = (key: SortKey) =>
    setSort((previous) =>
      sameSortKey(previous.key, key)
        ? { key, ascending: !previous.ascending }
        : { key, ascending: true }
    );

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">{messages['table note']}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-emerald-800 border-b border-emerald-200">
              {columns.map((column, index) => (
                <th
                  key={column.label}
                  className={`py-2 pr-2 cursor-pointer select-none whitespace-nowrap ${
                    index > 0 ? 'text-right' : ''
                  }`}
                  onClick={() => toggleSort(column.key)}
                >
                  {column.label}
                  {sameSortKey(sort.key, column.key)
                    ? sort.ascending
                      ? ' ↑'
                      : ' ↓'
                    : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((node) => (
              <tr
                key={node.id}
                className={`border-b border-gray-100 ${
                  highlightedIds.has(node.id) ? 'bg-amber-50' : ''
                }`}
              >
                <td className="py-1 pr-2">
                  <Link
                    href={`/${locale}/foods/${node.foodId}`}
                    className="hover:text-emerald-800 hover:underline"
                  >
                    {truncate(node.label, 24)}
                  </Link>
                  {front.has(node.id) && (
                    <span className="ml-1 rounded bg-emerald-100 px-1 text-xs text-emerald-700">
                      {messages['not dominated']}
                    </span>
                  )}
                  {node.productionMethod === 'organic' && (
                    <span className="ml-1 rounded bg-green-100 px-1 text-xs text-green-700">
                      {messages.organic}
                    </span>
                  )}
                  {node.pesticideResidue && (
                    <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-700">
                      {messages['pesticide residue (not assessed)']}
                    </span>
                  )}
                </td>
                {axes.costAxes.map((axis) => (
                  <td key={axis} className="py-1 pr-2 text-right">
                    {node.costVector[axis].toPrecision(3)}
                  </td>
                ))}
                {showTotalCost && (
                  <td className="py-1 pr-2 text-right font-medium">
                    {scalarizeCost(node.costVector, weights).toPrecision(4)}
                  </td>
                )}
                {axes.nutrientKeys.map((key) => (
                  <td key={key} className="py-1 pr-2 text-right">
                    {node.nutrientDensity[key].toPrecision(3)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showTotalCost && (
        <p className="mt-2 text-xs text-gray-500">
          {messages['total cost note']}
        </p>
      )}
    </div>
  );
};

export default function FoodComparison({
  foods,
  messages,
  locale,
}: {
  foods: FoodToOptimize[];
  messages: Message;
  locale: Locale;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 導線元（リコメンド・食品詳細）から ?highlight=id1,id2 で注目食材を受け取る
  const highlightedIds = useMemo(
    () =>
      new Set((searchParams.get('highlight') ?? '').split(',').filter(Boolean)),
    [searchParams]
  );

  // 選択状態（基準・軸・ビュー）は URL クエリを単一の情報源にする。
  // 見えている比較をそのまま共有でき、リロードや戻るボタンでも保たれる。
  // 既定値のパラメータは URL から省く。
  const basis = parseBasis(searchParams.get('basis'));
  const view = parseView(searchParams.get('view'));
  const axes = useMemo(
    () => parseAxes(searchParams.get('axes'), basis),
    [searchParams, basis]
  );

  // ページ遷移ではないので history.replaceState で浅く書き換える
  // （Next 14.1+ は useSearchParams に反映される）。
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) =>
      value === null ? params.delete(key) : params.set(key, value)
    );
    const query = params.toString();
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
  };

  const changeView = (next: CompareView) =>
    updateQuery({ view: next === 'graph' ? null : next });

  const applyAxes = (next: ComparisonAxes, nextBasis: Basis = basis) =>
    updateQuery({
      basis: nextBasis === 'per100g' ? null : nextBasis,
      axes: sameAxes(next, defaultAxesFor(nextBasis))
        ? null
        : serializeAxes(next),
    });

  // 環境負荷の円換算価格はおすすめ献立ページで設定し、ここでは
  // 表の総コスト列（導出値）にだけ使う。SSG と一致させるため初期値 0。
  const [weights, setWeights] =
    useState<ScalarizationWeights>(ZERO_WEIGHTS);
  useEffect(() => {
    setWeights(readStoredWeights());
  }, []);

  const nodes = useMemo(
    () =>
      foods
        .map((food) => toCompareNode(food, basis, locale))
        .filter((node): node is CompareNode => node !== null),
    [foods, basis, locale]
  );

  const axisCount = axes.nutrientKeys.length + axes.costAxes.length;

  const toggleNutrientKey = (key: NutrientKey) => {
    const checked = axes.nutrientKeys.includes(key);
    if (checked ? axisCount <= MIN_AXES : axisCount >= MAX_AXES) return;
    applyAxes({
      ...axes,
      nutrientKeys: checked
        ? axes.nutrientKeys.filter((k) => k !== key)
        : [...axes.nutrientKeys, key],
    });
  };

  const toggleCostAxis = (axis: CostAxis) => {
    const checked = axes.costAxes.includes(axis);
    if (checked ? axisCount <= MIN_AXES : axisCount >= MAX_AXES) return;
    applyAxes({
      ...axes,
      costAxes: checked
        ? axes.costAxes.filter((a) => a !== axis)
        : [...axes.costAxes, axis],
    });
  };

  const changeBasis = (next: Basis) =>
    // 分母に使う量は全ノードで定数になるため、選択から外す
    applyAxes(
      {
        nutrientKeys: axes.nutrientKeys.filter(
          (k) => k !== denominatorNutrientOf(next)
        ),
        costAxes: axes.costAxes.filter((a) => a !== denominatorCostOf(next)),
      },
      next
    );

  const costLabels = costAxisLabels(messages);

  return (
    <div className="grid gap-6">
      {/* grid 直下の子は min-width:auto で中身（SVG や表）の幅までページを
          押し広げてしまうため、min-w-0 でカード内スクロールに閉じ込める */}
      <Card className="min-w-0">
        <CardContent className="p-6 grid gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1 rounded-lg bg-emerald-100 p-1">
              {(['graph', 'table'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => changeView(m)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    view === m
                      ? 'bg-white text-emerald-800 shadow'
                      : 'text-emerald-700'
                  }`}
                >
                  {m === 'graph' ? messages.graph : messages.table}
                </button>
              ))}
            </div>
            <label className="text-sm text-emerald-800">
              {messages.denominator}:{' '}
              <select
                value={basis}
                onChange={(event) => changeBasis(event.target.value as Basis)}
                className="border rounded px-2 py-1"
              >
                {(Object.keys(BASIS_LABELS) as Basis[]).map((b) => (
                  <option key={b} value={b}>
                    {messages[BASIS_LABELS[b]]}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-gray-500">
              {messages[
                '{count} nodes (foods without a defined density on this basis are excluded)'
              ].replace('{count}', String(nodes.length))}
            </span>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-emerald-800 mb-2">
              {messages['comparison axes (select {min}-{max}, currently {count})']
                .replace('{min}', String(MIN_AXES))
                .replace('{max}', String(MAX_AXES))
                .replace('{count}', String(axisCount))}
            </legend>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-xs font-medium text-gray-600">
                {messages['cost axes']}:
              </span>
              {COST_AXES.map((axis) => {
                const checked = axes.costAxes.includes(axis);
                const isDenominator = denominatorCostOf(basis) === axis;
                const disabled =
                  isDenominator ||
                  (checked ? axisCount <= MIN_AXES : axisCount >= MAX_AXES);
                return (
                  <label
                    key={axis}
                    className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleCostAxis(axis)}
                      className="mr-1"
                    />
                    {costLabels[axis]}
                    {isDenominator &&
                      ` (${messages['used as the denominator']})`}
                  </label>
                );
              })}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-xs font-medium text-gray-600">
                {messages['nutrient axes']}:
              </span>
              {NUTRIENT_KEYS.map((key) => {
                const checked = axes.nutrientKeys.includes(key);
                const isDenominator = denominatorNutrientOf(basis) === key;
                const disabled =
                  isDenominator ||
                  (checked ? axisCount <= MIN_AXES : axisCount >= MAX_AXES);
                return (
                  <label
                    key={key}
                    className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleNutrientKey(key)}
                      className="mr-1"
                    />
                    {messages[key]}
                    {isDenominator &&
                      ` (${messages['used as the denominator']})`}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardContent className="p-6">
          {view === 'graph' ? (
            <HasseDiagram
              nodes={nodes}
              axes={axes}
              highlightedIds={[...highlightedIds]}
              locale={locale}
              messages={messages}
              basis={basis}
            />
          ) : (
            <ComparisonTable
              nodes={nodes}
              axes={axes}
              weights={weights}
              highlightedIds={highlightedIds}
              locale={locale}
              messages={messages}
              basis={basis}
            />
          )}
          <p className="mt-4 text-xs text-gray-500">
            {messages['compare methodology note']}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
