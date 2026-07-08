import { describe, expect, it } from 'vitest';

import {
  DISPLAY_CATEGORY_ORDER,
  displayCategoryMeta,
  displayCategoryOf,
  type DisplayCategory,
} from '@/services/food-category';
import { makeManualFood, makeNutritionFacts } from '@/services/test-fixtures';
import type {
  EstatPriceFoodData,
  FoodToOptimize,
  ManualPriceFoodData,
  MextFoodData,
  WithId,
  WithIngredientType,
} from '@/types/nutrition';

const makeEstatFood = (
  shokuhinbangou: string,
  name = 'テスト食品'
): WithId<WithIngredientType<EstatPriceFoodData, 'estat'>> => ({
  id: shokuhinbangou,
  type: 'estat',
  nameInEstat: name,
  nameInNutritionFacts: name,
  nameEnInNutritionFacts: name,
  shokuhinbangou,
  cost: 100,
  nutritionFacts: makeNutritionFacts(),
});

const makeManualPriceFood = (
  shokuhinbangou: string,
  productName = 'テスト商品'
): WithId<WithIngredientType<ManualPriceFoodData, 'manualPrice'>> => ({
  id: shokuhinbangou,
  type: 'manualPrice',
  productName,
  productNameJa: productName,
  productNameEn: productName,
  nameInNutritionFacts: productName,
  nameEnInNutritionFacts: productName,
  shokuhinbangou,
  cost: 100,
  nutritionFacts: makeNutritionFacts(),
  url: 'https://example.com',
});

const makeMextFood = (
  shokuhinbangou: string
): WithId<WithIngredientType<MextFoodData, 'mext'>> => ({
  id: shokuhinbangou,
  type: 'mext',
  nameInNutritionFacts: 'テスト食品',
  nameEnInNutritionFacts: 'Test food',
  shokuhinbangou,
  cost: null,
  nutritionFacts: makeNutritionFacts(),
});

describe('displayCategoryOf', () => {
  it('食品番号の食品群から表示カテゴリーを導く', () => {
    const cases: [string, DisplayCategory][] = [
      ['01126', 'grains'], // 穀類（そばの実）
      ['02017', 'potatoes'], // いも類
      ['04104', 'pulses'], // 豆類（大豆）
      ['05018', 'nutsAndSeeds'], // 種実類
      ['06061', 'vegetables'], // 野菜類
      ['07148', 'fruits'], // 果実類
      ['08001', 'mushrooms'], // きのこ類
      ['09044', 'seaweed'], // 藻類（ほしひじき）
      ['14006', 'oils'], // 油脂類
      ['17012', 'other'], // 調味料
    ];
    cases.forEach(([shokuhinbangou, expected]) => {
      expect(displayCategoryOf(makeEstatFood(shokuhinbangou))).toBe(expected);
    });
  });

  it('manualPrice も食品番号で分類する', () => {
    expect(displayCategoryOf(makeManualPriceFood('04104'))).toBe('pulses');
    expect(displayCategoryOf(makeManualPriceFood('09044'))).toBe('seaweed');
  });

  it('価格なし食材（mext）も食品番号で分類する', () => {
    expect(displayCategoryOf(makeMextFood('09002'))).toBe('seaweed');
    expect(displayCategoryOf(makeMextFood('01011'))).toBe('grains');
    // 食品群が表に無い番号（魚介 10）は other にフォールバックする
    expect(displayCategoryOf(makeMextFood('10001'))).toBe('other');
  });

  it('食品番号を持たない manual 食材はキーワード分類にフォールバックする', () => {
    const hemp = makeManualFood({ id: 'hemp', cost: 550 });
    // makeManualFood は productName に id を入れるため、名称でカテゴリーを与える
    const hempWithName: FoodToOptimize = {
      ...hemp,
      productName: 'ヘンププロテイン パウダー',
    };
    expect(displayCategoryOf(hempWithName)).toBe('nutsAndSeeds');
  });

  it('分類できない manual 食材は other になる', () => {
    const unknown = makeManualFood({ id: '謎の加工食品', cost: 100 });
    expect(displayCategoryOf(unknown)).toBe('other');
  });
});

describe('displayCategory metadata', () => {
  it('全カテゴリーが並び順とメタを持つ（過不足なし）', () => {
    const metaKeys = Object.keys(displayCategoryMeta).sort();
    const orderKeys = [...DISPLAY_CATEGORY_ORDER].sort();
    expect(orderKeys).toEqual(metaKeys);
  });

  it('各カテゴリーがアイコンと両ロケールのラベルを持つ', () => {
    DISPLAY_CATEGORY_ORDER.forEach((category) => {
      const meta = displayCategoryMeta[category];
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.label['ja-JP'].length).toBeGreaterThan(0);
      expect(meta.label['en-US'].length).toBeGreaterThan(0);
    });
  });
});
