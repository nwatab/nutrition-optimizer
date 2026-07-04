'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { HasseDiagram, truncate } from '@/components/hasse-diagram';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/config';
import type { Message } from '@/locales';
import type { NutrientKey } from '@/services/diagnose';
import {
  DEFAULT_COMPARE_NUTRIENT_KEYS,
  rankByScalarizedCost,
  type ScalarizationWeights,
} from '@/services/domination';
import { toCompareNode, type CompareNode } from '@/services/environment';
import type { Basis } from '@/services/nutrient-density';
import type { FoodToOptimize } from '@/types/nutrition';

const NUTRIENT_KEYS: NutrientKey[] = [
  'calories',
  'protein',
  'fat',
  'saturatedFattyAcids',
  'n6PolyunsaturatedFattyAcids',
  'n3PolyunsaturatedFattyAcids',
  'carbohydrates',
  'fiber',
  'vitaminA',
  'vitaminD',
  'vitaminE',
  'vitaminK',
  'vitaminB1',
  'vitaminB2',
  'vitaminB6',
  'vitaminB12',
  'niacin',
  'folate',
  'pantothenicAcid',
  'biotin',
  'vitaminC',
  'nacl',
  'potassium',
  'calcium',
  'magnesium',
  'phosphorus',
  'iron',
  'zinc',
  'copper',
  'manganese',
  'iodine',
  'selenium',
  'chromium',
  'molybdenum',
];

// 栄養軸は 2〜5 個。高次元では比較可能対が 2^{1-d} で消えて
// ほぼ全ノードが antichain 化するため（domination.test.ts で確認済み）。
const MIN_AXES = 2;
const MAX_AXES = 5;

const BASIS_LABELS: Record<Basis, keyof Message> = {
  per100g: 'per 100 g edible portion',
  perYen: 'per 1 yen',
  perKcal: 'per 1 kcal',
};

const ScalarizedRanking = ({
  nodes,
  weights,
  highlightedIds,
  locale,
  messages,
}: {
  nodes: CompareNode[];
  weights: ScalarizationWeights;
  highlightedIds: ReadonlySet<string>;
  locale: Locale;
  messages: Message;
}) => {
  const ranking = useMemo(
    () => rankByScalarizedCost(nodes, weights),
    [nodes, weights]
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-emerald-800 border-b border-emerald-200">
          <th className="py-2 pr-2">#</th>
          <th className="py-2 pr-2">{messages['food name']}</th>
          <th className="py-2 pr-2 text-right">
            {messages['total cost [yen]']}
          </th>
          <th className="py-2 pr-2 text-right">{messages.yen}</th>
          <th className="py-2 pr-2 text-right">
            {messages['CO2e share [yen]']}
          </th>
          <th className="py-2 pr-2 text-right">
            {messages['land share [yen]']}
          </th>
          <th className="py-2 pr-2 text-right">
            {messages['water share [yen]']}
          </th>
        </tr>
      </thead>
      <tbody>
        {ranking.map(({ node, totalCost }, index) => (
          <tr
            key={node.id}
            className={`border-b border-gray-100 ${
              highlightedIds.has(node.id) ? 'bg-amber-50' : ''
            }`}
          >
            <td className="py-1 pr-2 text-gray-500">{index + 1}</td>
            <td className="py-1 pr-2">
              <Link
                href={`/${locale}/foods/${node.foodId}`}
                className="hover:text-emerald-800 hover:underline"
              >
                {truncate(node.label, 24)}
              </Link>
              {node.productionMethod === 'organic' && (
                <span className="ml-1 rounded bg-green-100 px-1 text-xs text-green-700">
                  {messages.organic}
                </span>
              )}
              {node.pesticideResidue && (
                <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-700">
                  {
                    messages[
                      'pesticide residue: present (health impact not assessed)'
                    ]
                  }
                </span>
              )}
            </td>
            <td className="py-1 pr-2 text-right font-medium">
              {totalCost.toPrecision(4)}
            </td>
            <td className="py-1 pr-2 text-right">
              {node.costVector.yen.toPrecision(3)}
            </td>
            <td className="py-1 pr-2 text-right">
              {(weights.yenPerKgCo2e * node.costVector.co2eKg).toPrecision(3)}
            </td>
            <td className="py-1 pr-2 text-right">
              {(weights.yenPerM2Land * node.costVector.landM2).toPrecision(3)}
            </td>
            <td className="py-1 pr-2 text-right">
              {(weights.yenPerLWater * node.costVector.waterL).toPrecision(3)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
  const searchParams = useSearchParams();
  // 導線元（リコメンド・食品詳細）から ?highlight=id1,id2 で注目食材を受け取る
  const highlightedIds = useMemo(
    () =>
      new Set(
        (searchParams.get('highlight') ?? '').split(',').filter(Boolean)
      ),
    [searchParams]
  );

  const [basis, setBasis] = useState<Basis>('per100g');
  const [mode, setMode] = useState<'pareto' | 'scalarized'>('pareto');
  const [nutrientKeys, setNutrientKeys] = useState<NutrientKey[]>(
    DEFAULT_COMPARE_NUTRIENT_KEYS
  );
  // p_* はユーザー設定。デフォルト 0（円のみのランキングに一致）。
  // p_co2 の参照アンカー: J-クレジット取引価格（数千円/t-CO2e ≈ 数円/kg）〜
  // 炭素の社会的費用（数万円/t-CO2e ≈ 数十円/kg）。採否はユーザーに委ねる。
  const [weights, setWeights] = useState<ScalarizationWeights>({
    yenPerKgCo2e: 0,
    yenPerM2Land: 0,
    yenPerLWater: 0,
  });

  const nodes = useMemo(
    () =>
      foods
        .map((food) => toCompareNode(food, basis, locale))
        .filter((node): node is CompareNode => node !== null),
    [foods, basis, locale]
  );

  const toggleNutrientKey = (key: NutrientKey) =>
    setNutrientKeys((previous) =>
      previous.includes(key)
        ? previous.length > MIN_AXES
          ? previous.filter((k) => k !== key)
          : previous
        : previous.length < MAX_AXES
          ? [...previous, key]
          : previous
    );

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1 rounded-lg bg-emerald-100 p-1">
              {(['pareto', 'scalarized'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    mode === m
                      ? 'bg-white text-emerald-800 shadow'
                      : 'text-emerald-700'
                  }`}
                >
                  {m === 'pareto'
                    ? messages['Pareto (Hasse diagram)']
                    : messages.scalarized}
                </button>
              ))}
            </div>
            <label className="text-sm text-emerald-800">
              {messages.denominator}:{' '}
              <select
                value={basis}
                onChange={(event) => setBasis(event.target.value as Basis)}
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
              {messages['nutrient axes (select {min}-{max}, currently {count})']
                .replace('{min}', String(MIN_AXES))
                .replace('{max}', String(MAX_AXES))
                .replace('{count}', String(nutrientKeys.length))}
            </legend>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {NUTRIENT_KEYS.map((key) => {
                const checked = nutrientKeys.includes(key);
                const disabled = checked
                  ? nutrientKeys.length <= MIN_AXES
                  : nutrientKeys.length >= MAX_AXES;
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
                  </label>
                );
              })}
            </div>
          </fieldset>

          {mode === 'scalarized' && (
            <div className="grid gap-2 md:grid-cols-3">
              {(
                [
                  ['yenPerKgCo2e', `p_co2 [${messages.yen}/kg-CO2e]`, 100],
                  ['yenPerM2Land', `p_land [${messages.yen}/m²]`, 20],
                  ['yenPerLWater', `p_water [${messages.yen}/L]`, 1],
                ] as const
              ).map(([field, label, max]) => (
                <label key={field} className="text-sm text-gray-700">
                  {label}: {weights[field]}
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={max / 100}
                    value={weights[field]}
                    onChange={(event) =>
                      setWeights((previous) => ({
                        ...previous,
                        [field]: Number(event.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {mode === 'pareto' ? (
            <HasseDiagram
              nodes={nodes}
              nutrientKeys={nutrientKeys}
              highlightedIds={[...highlightedIds]}
              locale={locale}
              messages={messages}
            />
          ) : (
            <ScalarizedRanking
              nodes={nodes}
              weights={weights}
              highlightedIds={highlightedIds}
              locale={locale}
              messages={messages}
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
