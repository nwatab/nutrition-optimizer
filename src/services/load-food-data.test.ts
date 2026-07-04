import { describe, expect, it } from 'vitest';

import { loadFoodData } from '@/services/load-food-data';

// public_data/ の xlsx を差し替えた際の回帰テスト。
// 価格スナップショットはデータ更新のたびに `pnpm vitest run -u` で更新する。
describe('loadFoodData', () => {
  it('例外なく完走し、全食材の nutritionFacts に null / NaN が残らない', async () => {
    const foods = await loadFoodData();
    expect(foods.length).toBeGreaterThan(0);

    const invalid = foods.filter((food) =>
      Object.values(food.nutritionFacts).some(
        (value) => value === null || Number.isNaN(value)
      )
    );
    expect(invalid).toEqual([]);
  });

  it('主要食材の pricePer100 が妥当域にある', async () => {
    const foods = await loadFoodData();
    const estatCost = (name: string) => {
      const food = foods.find(
        (f) => f.type === 'estat' && f.nameInEstat === name
      );
      if (!food) throw new Error(`estat food not found: ${name}`);
      return food.cost;
    };
    const soy = foods.find(
      (f) => f.type === 'manualPrice' && f.productName.includes('大豆')
    );
    if (!soy) throw new Error('manualPrice food not found: 大豆');

    // 円/100g の妥当域（データ更新でスナップショットを取り直す際の暴走検知）
    expect(estatCost('うるち米(単一原料米,｢コシヒカリ｣)')).toBeGreaterThan(30);
    expect(estatCost('うるち米(単一原料米,｢コシヒカリ｣)')).toBeLessThan(300);
    expect(estatCost('ブロッコリー')).toBeGreaterThan(20);
    expect(estatCost('ブロッコリー')).toBeLessThan(400);
    expect(estatCost('キャベツ')).toBeGreaterThan(5);
    expect(estatCost('キャベツ')).toBeLessThan(150);
    expect(soy.cost).toBeGreaterThan(5);
    expect(soy.cost).toBeLessThan(200);
  });

  it('主要食材の pricePer100 スナップショット', async () => {
    const foods = await loadFoodData();
    const keyFoodNames = [
      'うるち米(単一原料米,｢コシヒカリ｣)',
      'うるち米(単一原料米,｢コシヒカリ｣以外)',
      '食パン',
      'キャベツ',
      'ブロッコリー',
      'じゃがいも',
      'たまねぎ',
      'にんじん',
      'トマト',
      'バナナ',
      '豆腐',
      '納豆',
    ];
    const estatPrices = Object.fromEntries(
      foods
        .filter(
          (f) => f.type === 'estat' && keyFoodNames.includes(f.nameInEstat)
        )
        .map((f) => [
          f.type === 'estat' ? f.nameInEstat : '',
          Number(f.cost.toFixed(2)),
        ])
    );
    const soy = foods.find(
      (f) => f.type === 'manualPrice' && f.productName.includes('大豆')
    );
    const snapshotTarget = {
      ...estatPrices,
      大豆: Number((soy?.cost ?? NaN).toFixed(2)),
    };
    expect(snapshotTarget).toMatchSnapshot();
  });
});
