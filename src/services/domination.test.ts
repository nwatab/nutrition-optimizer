import { describe, expect, it } from 'vitest';

import type { NutrientKey } from '@/services/diagnose';
import {
  COST_AXES,
  dominates,
  hasseEdges,
  scalarizeCost,
  skyline,
  type ComparisonAxes,
} from '@/services/domination';
import { toCompareNode } from '@/services/environment';
import { loadFoodData } from '@/services/load-food-data';
import { makeCompareNode } from '@/services/test-fixtures';

const axes: ComparisonAxes = {
  nutrientKeys: ['protein', 'fiber'],
  costAxes: ['yen', 'co2eKg'],
};

// 同一食材の有機/慣行ペア: 有機は 円↑・CO2↓
const conventional = makeCompareNode({
  id: 'spinach-conventional',
  productionMethod: 'conventional',
  nutrientDensity: { protein: 2.2, fiber: 2.8 },
  costVector: { yen: 50, co2eKg: 0.053, landM2: 0.038, waterL: 10.3 },
});
const organic = makeCompareNode({
  id: 'spinach-organic',
  productionMethod: 'organic',
  nutrientDensity: { protein: 2.2, fiber: 2.8 },
  costVector: { yen: 80, co2eKg: 0.04, landM2: 0.038, waterL: 10.3 },
});

describe('dominates / skyline', () => {
  it('同一食材の有機/慣行が、円↑・CO2↓のとき Pareto 比較不能になる', () => {
    expect(dominates(conventional, organic, axes)).toBe(false);
    expect(dominates(organic, conventional, axes)).toBe(false);

    const front = skyline([conventional, organic], axes);
    expect(front.map((n) => n.id).toSorted()).toEqual([
      'spinach-conventional',
      'spinach-organic',
    ]);
  });

  it('全軸で同等以上・どこかで厳密に良ければ支配する', () => {
    const worse = makeCompareNode({
      id: 'worse',
      nutrientDensity: { protein: 1.0, fiber: 2.8 },
      costVector: { yen: 90, co2eKg: 0.06, landM2: 0.038, waterL: 10.3 },
    });
    expect(dominates(conventional, worse, axes)).toBe(true);
    expect(skyline([conventional, worse], axes)).toEqual([conventional]);
  });

  it('全軸が同値のノード同士は互いに支配しない（厳密性の要求）', () => {
    const twin = { ...conventional, id: 'twin' };
    expect(dominates(conventional, twin, axes)).toBe(false);
  });

  it('コスト軸の選択で順序が変わる: CO2e だけを見れば有機が慣行を支配する', () => {
    const co2Only: ComparisonAxes = { ...axes, costAxes: ['co2eKg'] };
    expect(dominates(organic, conventional, co2Only)).toBe(true);
    expect(skyline([conventional, organic], co2Only)).toEqual([organic]);
  });

  it('分母に使った軸（例: 1円あたりの円 = 定数1）は比較に影響しない', () => {
    // basis=perYen のとき costVector.yen は全ノードで 1 になる。
    // 差 0 の軸は支配を妨げも作りもしないことを確認する。
    const cheapPerYen = makeCompareNode({
      id: 'cheap',
      nutrientDensity: { protein: 3.0, fiber: 2.8 },
      costVector: { yen: 1, co2eKg: 0.05, landM2: 0.04, waterL: 10 },
    });
    const richPerYen = makeCompareNode({
      id: 'rich',
      nutrientDensity: { protein: 2.0, fiber: 2.8 },
      costVector: { yen: 1, co2eKg: 0.05, landM2: 0.04, waterL: 10 },
    });
    expect(dominates(cheapPerYen, richPerYen, axes)).toBe(true);
  });
});

describe('hasseEdges', () => {
  it('推移的なエッジを簡約する（a≻b≻c のとき a→c を落とす）', () => {
    const a = makeCompareNode({
      id: 'a',
      nutrientDensity: { protein: 3 },
      costVector: { yen: 10 },
    });
    const b = makeCompareNode({
      id: 'b',
      nutrientDensity: { protein: 2 },
      costVector: { yen: 20 },
    });
    const c = makeCompareNode({
      id: 'c',
      nutrientDensity: { protein: 1 },
      costVector: { yen: 30 },
    });

    const edges = hasseEdges([a, b, c], {
      nutrientKeys: ['protein'],
      costAxes: ['yen'],
    });
    expect(edges.toSorted((x, y) => x.from.localeCompare(y.from))).toEqual([
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ]);
  });

  it('比較不能な有機/慣行ペアの間にはエッジが生じない', () => {
    expect(hasseEdges([conventional, organic], axes)).toEqual([]);
  });
});

describe('scalarizeCost', () => {
  const zeroWeights = { yenPerKgCo2e: 0, yenPerM2Land: 0, yenPerLWater: 0 };

  it('価格が全部 0 なら総コストは円に一致する', () => {
    expect(scalarizeCost(conventional.costVector, zeroWeights)).toBe(
      conventional.costVector.yen
    );
  });

  it('p_co2 を上げると有機の総コストが慣行を下回る逆転が起きる', () => {
    // 損益分岐: Δ円 30 / ΔCO2e 0.013kg ≈ 2308 円/kg-CO2e
    const highCarbonPrice = { ...zeroWeights, yenPerKgCo2e: 3000 };
    expect(scalarizeCost(organic.costVector, zeroWeights)).toBeGreaterThan(
      scalarizeCost(conventional.costVector, zeroWeights)
    );
    expect(scalarizeCost(organic.costVector, highCarbonPrice)).toBeLessThan(
      scalarizeCost(conventional.costVector, highCarbonPrice)
    );
  });
});

describe('軸の次元と antichain 化（実データ）', () => {
  // xlsx の読み込みが重いためタイムアウトを延長
  it('34栄養軸 + 全コスト軸ではほぼ全ノードが非支配になる → UI 既定は合計 2〜5 軸にする', { timeout: 60_000 }, async () => {
    const foods = await loadFoodData();
    const nodes = foods
      .map((food) => toCompareNode(food, 'perYen'))
      .filter((node) => node !== null);
    const allKeys = Object.keys(nodes[0].nutrientDensity) as NutrientKey[];
    expect(allKeys).toHaveLength(34);

    const fullDimensionFront = skyline(nodes, {
      nutrientKeys: allKeys,
      costAxes: [...COST_AXES],
    });
    const lowDimensionFront = skyline(nodes, {
      nutrientKeys: ['protein', 'fiber'],
      costAxes: ['yen', 'co2eKg'],
    });

    // 高次元では比較可能な対が 2^{1-d} で消え、ほぼ antichain になる
    expect(fullDimensionFront.length / nodes.length).toBeGreaterThan(0.8);
    // 低次元選択ならフロントが意味のある大きさまで絞れる
    expect(lowDimensionFront.length).toBeLessThan(fullDimensionFront.length);
    expect(lowDimensionFront.length / nodes.length).toBeLessThan(0.5);
  });
});
