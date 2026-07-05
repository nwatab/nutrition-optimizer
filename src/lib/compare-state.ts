import type { NutrientKey } from '@/services/diagnose';
import {
  COST_AXES,
  DEFAULT_COMPARE_AXES,
  type ComparisonAxes,
  type CostAxis,
} from '@/services/domination';
import type { Basis } from '@/services/nutrient-density';

/**
 * 比較ページの選択状態（基準・軸・ビュー）と URL クエリの相互変換。
 * 選択状態は URL を単一の情報源とし、共有・リロード・戻るボタンに耐える。
 * 不正なクエリは例外にせず、黙って既定値へ丸める（共有リンクの劣化耐性）。
 */

/** 比較 UI で選択できる栄養軸 */
export const NUTRIENT_KEYS: NutrientKey[] = [
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

// 軸は栄養+コスト合計で 2〜5 個。高次元では比較可能対が 2^{1-d} で消えて
// ほぼ全ノードが antichain 化するため（domination.test.ts で確認済み）。
export const MIN_AXES = 2;
export const MAX_AXES = 5;

export type CompareView = 'graph' | 'table';

// 基準の分母に使っている量は全ノードで定数になるため、軸から外す
export const denominatorNutrientOf = (basis: Basis): NutrientKey | null =>
  basis === 'perKcal' ? 'calories' : null;
export const denominatorCostOf = (basis: Basis): CostAxis | null =>
  basis === 'perYen' ? 'yen' : null;

const isCostAxis = (token: string): token is CostAxis =>
  (COST_AXES as readonly string[]).includes(token);
const isNutrientKey = (token: string): token is NutrientKey =>
  (NUTRIENT_KEYS as readonly string[]).includes(token);

export const parseBasis = (value: string | null): Basis =>
  value === 'perYen' || value === 'perKcal' ? value : 'per100g';

export const parseView = (value: string | null): CompareView =>
  value === 'table' ? 'table' : 'graph';

/** 既定の軸から、基準の分母に使っている軸を除いたもの */
export const defaultAxesFor = (basis: Basis): ComparisonAxes => ({
  nutrientKeys: DEFAULT_COMPARE_AXES.nutrientKeys.filter(
    (key) => key !== denominatorNutrientOf(basis)
  ),
  costAxes: DEFAULT_COMPARE_AXES.costAxes.filter(
    (axis) => axis !== denominatorCostOf(basis)
  ),
});

/**
 * ?axes=protein,fiber,yen,co2eKg を解釈する。未知のトークン・重複・
 * 分母に使っている軸は捨て、MAX_AXES 個で打ち切る。残らなければ既定値。
 */
export const parseAxes = (
  value: string | null,
  basis: Basis
): ComparisonAxes => {
  if (!value) return defaultAxesFor(basis);
  const tokens = [...new Set(value.split(','))]
    .filter((token) => isCostAxis(token) || isNutrientKey(token))
    .filter(
      (token) =>
        token !== denominatorNutrientOf(basis) &&
        token !== denominatorCostOf(basis)
    )
    .slice(0, MAX_AXES);
  if (tokens.length === 0) return defaultAxesFor(basis);
  return {
    nutrientKeys: tokens.filter(isNutrientKey),
    costAxes: tokens.filter(isCostAxis),
  };
};

export const serializeAxes = (axes: ComparisonAxes): string =>
  [...axes.nutrientKeys, ...axes.costAxes].join(',');

/** 順序を無視した軸集合の一致（URL を既定値のとき省略するための判定） */
export const sameAxes = (a: ComparisonAxes, b: ComparisonAxes): boolean =>
  a.nutrientKeys.length === b.nutrientKeys.length &&
  a.costAxes.length === b.costAxes.length &&
  a.nutrientKeys.every((key) => b.nutrientKeys.includes(key)) &&
  a.costAxes.every((axis) => b.costAxes.includes(axis));
