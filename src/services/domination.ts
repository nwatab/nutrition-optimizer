import type { NutrientKey } from '@/services/diagnose';
import type { CompareNode, CostVector } from '@/services/environment';

/**
 * 選択した軸集合上の半順序（skyline query）。
 *
 * x ≻ y ⇔ 選択した全栄養軸で density(x) ≥ density(y) かつ
 *          選択した全コスト軸で cost(x) ≤ cost(y) かつ、いずれかが厳密。
 *
 * 栄養もコスト（円・CO2e・土地・水）も独立の軸として成分ごとに比較し、
 * 円換算（スカラー化）は比較には使わない。単一の数字が必要な場面
 * （最適化の目的関数・表の総コスト列）だけが scalarizeCost を使う。
 *
 * 軸は合計 1〜5 個選択する想定。1軸なら全順序（鎖）になり全ノードが
 * 一列に順位づけされる。次元 d を上げるとランダムな点同士が比較可能に
 * なる確率は 2^{1-d} で落ち、ほぼ全ノードが非支配（antichain）になる
 * ため上限は 5（domination.test.ts で確認済み）。
 */

export const COST_AXES = ['yen', 'co2eKg', 'landM2', 'waterL'] as const;
export type CostAxis = (typeof COST_AXES)[number];

/** 比較に使う軸の集合。栄養軸は多いほど良い、コスト軸は少ないほど良い。 */
export type ComparisonAxes = {
  nutrientKeys: NutrientKey[];
  costAxes: CostAxis[];
};

/**
 * 比較 UI のデフォルト軸。compare ページの初期選択と、
 * 食品詳細ページの局所支配関係ビューで共有する。
 */
export const DEFAULT_COMPARE_AXES: ComparisonAxes = {
  nutrientKeys: ['protein', 'fiber'],
  costAxes: ['yen', 'co2eKg'],
};

export const dominates = (
  x: CompareNode,
  y: CompareNode,
  axes: ComparisonAxes
): boolean => {
  const nutrientDiffs = axes.nutrientKeys.map(
    (key) => x.nutrientDensity[key] - y.nutrientDensity[key]
  );
  const costDiffs = axes.costAxes.map(
    (axis) => y.costVector[axis] - x.costVector[axis]
  );
  const diffs = [...nutrientDiffs, ...costDiffs];
  return diffs.every((diff) => diff >= 0) && diffs.some((diff) => diff > 0);
};

/** どのノードにも支配されないノード（Pareto フロント） */
export const skyline = (
  nodes: CompareNode[],
  axes: ComparisonAxes
): CompareNode[] =>
  nodes.filter((node) => !nodes.some((other) => dominates(other, node, axes)));

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
  axes: ComparisonAxes
): DominationEdge[] => {
  const pairs = nodes.flatMap((x) =>
    nodes
      .filter((y) => x.id !== y.id && dominates(x, y, axes))
      .map((y) => ({ from: x, to: y }))
  );
  return pairs
    .filter(
      ({ from, to }) =>
        !nodes.some(
          (mid) =>
            mid.id !== from.id &&
            mid.id !== to.id &&
            dominates(from, mid, axes) &&
            dominates(mid, to, axes)
        )
    )
    .map(({ from, to }) => ({ from: from.id, to: to.id }));
};

/**
 * 環境負荷の円換算価格（ユーザー設定。ハードコードしない）。
 * 比較（半順序）には使わず、最適化の目的関数と表の総コスト列だけが使う。
 * p_co2 の参照アンカー: J-クレジット取引価格（数千円/t-CO2e 程度）〜
 * 炭素の社会的費用（数万円/t-CO2e 程度）。採否はユーザーに委ねる。
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
