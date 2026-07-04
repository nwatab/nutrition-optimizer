import { describe, expect, it } from 'vitest';
import { edibleCostPer100 } from './food-cost';

describe('edibleCostPer100', () => {
  it('廃棄率0の食材（豆・乾物・油）は補正前の price / mass * 100 と一致する（回帰）', () => {
    // 大豆 5kg 2980円
    expect(edibleCostPer100(2980, 5000, 0)).toBe((2980 / 5000) * 100);
    // きざみ昆布（乾物）200g 1339円
    expect(edibleCostPer100(1339, 200, 0)).toBe((1339 / 200) * 100);
    // 食用油 900g 400円
    expect(edibleCostPer100(400, 900, 0)).toBe((400 / 900) * 100);
  });

  it('廃棄率がある食材は可食部あたりの価格が高くなる', () => {
    // キャベツ相当: 廃棄率15%
    expect(edibleCostPer100(200, 1000, 15)).toBeCloseTo(
      (200 / (1000 * 0.85)) * 100
    );
    // バナナ相当: 廃棄率40%
    expect(edibleCostPer100(200, 1000, 40)).toBeCloseTo(
      (200 / (1000 * 0.6)) * 100
    );
    // 廃棄率が高いほど可食部価格は単調に増加する
    const costs = [0, 10, 25, 50].map((refuse) =>
      edibleCostPer100(200, 1000, refuse)
    );
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });

  it('不正な廃棄率（負・100%以上）は例外を投げる', () => {
    expect(() => edibleCostPer100(100, 1000, -1)).toThrow();
    expect(() => edibleCostPer100(100, 1000, 100)).toThrow();
  });
});
