import { describe, expect, it } from 'vitest';

import { loadFoodData } from '@/services/load-food-data';
import { density } from '@/services/nutrient-density';
import { isPriced } from '@/types/nutrition';

// public_data/ の xlsx を差し替えた際の回帰テスト。
// 価格スナップショットはデータ更新のたびに `pnpm vitest run -u` で更新する。
// 初回の loadFoodData は Excel 読み込みで数秒かかるためタイムアウトを延長する。
describe('loadFoodData', { timeout: 60_000 }, () => {
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

  it('価格なし食材（mext）が含まれ、cost は null で type は mext、isPriced で除外できる', async () => {
    const foods = await loadFoodData();
    const unpriced = foods.filter((f) => f.cost === null);
    expect(unpriced.length).toBeGreaterThan(0);
    expect(unpriced.every((f) => f.type === 'mext')).toBe(true);
    // 価格なし食材にも成分表由来の栄養値が入っている
    expect(unpriced.every((f) => f.nutritionFacts.calories >= 0)).toBe(true);
    // isPriced で価格ありだけに絞れる
    const priced = foods.filter(isPriced);
    expect(priced.length).toBe(foods.length - unpriced.length);
    expect(priced.every((f) => f.cost !== null)).toBe(true);
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
          Number((f.cost ?? NaN).toFixed(2)),
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

  it('廃棄率0の食材（豆・乾物・油）は補正前の price / mass * 100 と厳密一致する（廃棄率補正の回帰）', async () => {
    const foods = await loadFoodData();
    const costOf = (shokuhinbangou: string) => {
      const food = foods.find(
        (f) => 'shokuhinbangou' in f && f.shokuhinbangou === shokuhinbangou
      );
      if (!food) throw new Error(`food not found: ${shokuhinbangou}`);
      return food.cost;
    };

    // 大豆 04104（乾・廃棄率0）: (2100 + 880)円 / 5000g
    expect(costOf('04104')).toBeCloseTo(((2100 + 880) / 5000) * 100, 10);
    // そばの実 01126（乾物・廃棄率0）: 7380円 / 5000g
    expect(costOf('01126')).toBeCloseTo((7380 / 5000) * 100, 10);
    // 亜麻仁油 14023（油・廃棄率0）: 3781円 / 510g
    expect(costOf('14023')).toBeCloseTo((3781 / 510) * 100, 10);
  });

  it('こんにゃく（calories≈0）は perKcal が undefined になり比較から除外できる', async () => {
    const foods = await loadFoodData();
    const konnyaku = foods.find(
      (f) => 'shokuhinbangou' in f && f.shokuhinbangou === '02003'
    );
    if (!konnyaku) throw new Error('こんにゃくが見つかりません');
    if (!isPriced(konnyaku)) throw new Error('こんにゃくに価格がありません');
    expect(density(konnyaku, 'perKcal', 'fiber')).toBeUndefined();
    expect(density(konnyaku, 'perYen', 'fiber')).toBeDefined();
  });
});
