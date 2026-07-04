import type { NutrientKey } from '@/services/diagnose';
import type { CompareNode, CostVector } from '@/services/environment';

/**
 * コストベクトル上の半順序（skyline query）。
 *
 * x ≻ y ⇔ 選択した全栄養軸で density(x) ≥ density(y) かつ
 *          全コスト軸で cost(x) ≤ cost(y) かつ、いずれかが厳密。
 *
 * 栄養軸はユーザーが 2〜5 個選択する想定。次元 d を上げると
 * ランダムな点同士が比較可能になる確率は 2^{1-d} で落ち、
 * ほぼ全ノードが非支配（antichain）になるため。
 */

export const COST_AXES = ['yen', 'co2eKg', 'landM2', 'waterL'] as const;
export type CostAxis = (typeof COST_AXES)[number];

/**
 * 比較 UI のデフォルト栄養軸。compare ページの初期選択と、
 * 食品詳細ページの局所支配関係ビューで共有する。
 */
export const DEFAULT_COMPARE_NUTRIENT_KEYS: NutrientKey[] = [
  'protein',
  'fiber',
  'vitaminC',
];

export const dominates = (
  x: CompareNode,
  y: CompareNode,
  nutrientKeys: NutrientKey[]
): boolean => {
  const nutrientDiffs = nutrientKeys.map(
    (key) => x.nutrientDensity[key] - y.nutrientDensity[key]
  );
  const costDiffs = COST_AXES.map(
    (axis) => y.costVector[axis] - x.costVector[axis]
  );
  const diffs = [...nutrientDiffs, ...costDiffs];
  return diffs.every((diff) => diff >= 0) && diffs.some((diff) => diff > 0);
};

/** どのノードにも支配されないノード（Pareto フロント） */
export const skyline = (
  nodes: CompareNode[],
  nutrientKeys: NutrientKey[]
): CompareNode[] =>
  nodes.filter(
    (node) => !nodes.some((other) => dominates(other, node, nutrientKeys))
  );

export type DominationEdge = {
  /** 支配する側のノード id */
  from: string;
  /** 支配される側のノード id */
  to: string;
};

/**
 * Hasse 図用のエッジ。全支配対を推移簡約し、被覆関係
 * （x ≻ y かつ間に z が入らない対）だけを残す。
 */
export const hasseEdges = (
  nodes: CompareNode[],
  nutrientKeys: NutrientKey[]
): DominationEdge[] => {
  const pairs = nodes.flatMap((x) =>
    nodes
      .filter((y) => x.id !== y.id && dominates(x, y, nutrientKeys))
      .map((y) => ({ from: x, to: y }))
  );
  return pairs
    .filter(
      ({ from, to }) =>
        !nodes.some(
          (mid) =>
            mid.id !== from.id &&
            mid.id !== to.id &&
            dominates(from, mid, nutrientKeys) &&
            dominates(mid, to, nutrientKeys)
        )
    )
    .map(({ from, to }) => ({ from: from.id, to: to.id }));
};

/**
 * 任意のスカラー化の重み（ユーザー設定。ハードコードしない）。
 * デフォルトの p_co2 の参照アンカーとしては、J-クレジット取引価格
 * （数千円/t-CO2e 程度）〜 炭素の社会的費用（数万円/t-CO2e 程度）が
 * 目安になるが、採用はユーザーに委ねる。
 */
export type ScalarizationWeights = {
  /** 円 / kg-CO2e */
  yenPerKgCo2e: number;
  /** 円 / m2 */
  yenPerM2Land: number;
  /** 円 / L */
  yenPerLWater: number;
};

/** totalCost = 円 + p_co2·CO2e + p_land·土地 + p_water·水 */
export const scalarizeCost = (
  cost: CostVector,
  weights: ScalarizationWeights
): number =>
  cost.yen +
  weights.yenPerKgCo2e * cost.co2eKg +
  weights.yenPerM2Land * cost.landM2 +
  weights.yenPerLWater * cost.waterL;

/** スカラー化した総コストの昇順（安い順）ランキング */
export const rankByScalarizedCost = (
  nodes: CompareNode[],
  weights: ScalarizationWeights
): { node: CompareNode; totalCost: number }[] =>
  nodes
    .map((node) => ({ node, totalCost: scalarizeCost(node.costVector, weights) }))
    .toSorted((a, b) => a.totalCost - b.totalCost);
