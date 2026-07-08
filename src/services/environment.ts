import {
  environmentalImpactByCategory,
  type EnvCategoryId,
} from '@/data/environmental-impact-reference';
import {
  PER_KCAL_MIN_CALORIES,
  type Basis,
} from '@/services/nutrient-density';
import type {
  EnvironmentalImpact,
  FoodToOptimize,
  NutritionFactBase,
  ProductionMethod,
} from '@/types/nutrition';
import type { Locale } from '@/config';
import { foodDisplayName } from '@/utils';

/**
 * 食材を Poore & Nemecek (2018) の環境負荷カテゴリへ対応付ける。
 * 名称キーワード → 食品番号の食品群 の順で解決する。
 * 世界平均値への対応付けであり、原産地差は未補正（データ側コメント参照）。
 */

export const displayNameOf = (food: FoodToOptimize): string =>
  food.type === 'estat' ? food.nameInEstat : food.productName;

const namesOf = (food: FoodToOptimize): string =>
  food.type === 'manual'
    ? food.productName
    : `${displayNameOf(food)} ${food.nameInNutritionFacts}`;

// 上から順に評価する。先に書いたものが優先。
const keywordRules: [EnvCategoryId, string[]][] = [
  ['rice', ['うるち米', '玄米', 'コシヒカリ', 'こしひかり', 'ライス']],
  [
    'wheatAndRye',
    // 'パン' は「パンプキン」「ジャパン」等に部分一致するため '食パン' に限定。
    // 一般的なパン類は食品番号の食品群（01 穀類）で解決される。
    ['食パン', 'そうめん', 'スパゲッティ', 'パスタ', 'うどん', '小麦', 'そば', 'キヌア', 'アマランサス', 'オートミール'],
  ],
  ['potatoes', ['じゃがいも', 'さつまいも', 'さといも', 'ながいも', 'いも', 'でん粉']],
  ['soyProducts', ['大豆', '豆腐', '納豆', 'テンペ', 'きなこ', '豆乳', 'ソイ']],
  ['otherPulses', ['ひよこ豆', 'レンズ豆', 'えんどう', 'いんげん', 'あずき', '豆']],
  [
    'nutsAndSeeds',
    ['ごま', 'ゴマ', 'クルミ', 'くるみ', 'アーモンド', '落花生', 'ピーナッツ', 'ヘンプ', 'チア', 'アマニ', '亜麻仁', 'えごま', 'ナッツ', 'カシュー', 'ヒマワリ', 'かぼちゃの種'],
  ],
  [
    'brassicas',
    ['キャベツ', 'ブロッコリー', 'カリフラワー', 'はくさい', '白菜', 'こまつな', '小松菜', 'チンゲン', 'ケール', '芽キャベツ'],
  ],
  ['onionsAndLeeks', ['たまねぎ', '玉ねぎ', 'ねぎ', 'にんにく', 'ニンニク', 'らっきょう', 'ニラ', 'にら']],
  [
    'rootVegetables',
    ['にんじん', '人参', 'だいこん', '大根', 'ごぼう', 'かぶ', 'ビーツ', 'れんこん', 'しょうが', '生姜'],
  ],
  ['tomatoes', ['トマト']],
  ['bananas', ['バナナ']],
  ['apples', ['りんご', 'リンゴ']],
  ['citrusFruit', ['みかん', 'レモン', 'ゆず', 'グレープフルーツ', 'オレンジ', 'かんきつ']],
  [
    'mushrooms',
    ['きのこ', 'しいたけ', 'きくらげ', 'エリンギ', 'まいたけ', 'しめじ', 'えのき', 'マッシュルーム', 'なめこ'],
  ],
  ['seaweed', ['昆布', 'わかめ', 'のり', 'あおさ', 'ひじき', 'もずく', '海藻', '寒天']],
  ['vegetableOils', ['油', 'オイル', 'オリーブ']],
];

// 食品番号（shokuhinbangou）の先頭2桁 = 日本食品標準成分表の食品群
const categoryByFoodGroup: Record<string, EnvCategoryId> = {
  '01': 'wheatAndRye', // 穀類（米は名称キーワードで先に rice に解決される）
  '02': 'potatoes', // いも及びでん粉類
  '04': 'otherPulses', // 豆類
  '05': 'nutsAndSeeds', // 種実類
  '06': 'otherVegetables', // 野菜類
  '07': 'otherFruits', // 果実類
  '08': 'mushrooms', // きのこ類
  '09': 'seaweed', // 藻類
  '14': 'vegetableOils', // 油脂類
  '16': 'otherCrops', // し好飲料類
  '17': 'otherCrops', // 調味料及び香辛料類
};

export const classifyEnvCategory = (food: FoodToOptimize): EnvCategoryId => {
  const name = namesOf(food);
  const matched = keywordRules.find(([, keywords]) =>
    keywords.some((keyword) => name.includes(keyword))
  );
  if (matched) return matched[0];

  if (food.type !== 'manual') {
    const group = categoryByFoodGroup[food.shokuhinbangou.slice(0, 2)];
    if (group) return group;
  }
  return 'otherCrops';
};

export const environmentalImpactOf = (
  food: FoodToOptimize
): EnvironmentalImpact => environmentalImpactByCategory[classifyEnvCategory(food)];

/**
 * 生産方法。データに明示フィールドが無いため、現状は商品名の
 * 有機JAS 系キーワードから推定する（有機/慣行は別ノードになる）。
 */
export const productionMethodOf = (food: FoodToOptimize): ProductionMethod =>
  ['有機', 'オーガニック', 'organic'].some((keyword) =>
    namesOf(food).toLowerCase().includes(keyword)
  )
    ? 'organic'
    : 'conventional';

export type IntakeForm = 'boiled' | 'roasted' | 'dried' | 'raw' | 'as is';

// 判定は日本語の成分表名称に対して行い、表示用のキーを返す（UI 側で翻訳する）。
const intakeFormKeywords: [string, IntakeForm][] = [
  ['ゆで', 'boiled'],
  ['焼き', 'roasted'],
  ['乾', 'dried'],
  ['生', 'raw'],
];

/**
 * 摂取形態。日本食品標準成分表の名称（「ゆで」「生」「乾」等）から推定する。
 */
export const intakeFormOf = (food: FoodToOptimize): IntakeForm => {
  const name = food.type === 'manual' ? food.productName : food.nameInNutritionFacts;
  return (
    intakeFormKeywords.find(([keyword]) => name.includes(keyword))?.[1] ??
    'as is'
  );
};

/**
 * コストはスカラーでなくベクトル (円, CO2e, 土地, 水)。
 * 値はいずれも basis の1単位あたり（perYen なら 1円あたり）。
 */
export type CostVector = {
  yen: number;
  co2eKg: number;
  landM2: number;
  waterL: number;
};

/**
 * 比較の1ノード。ノード同一性 = (食材, 摂取形態, 流通段階, 生産方法)。
 * 有機/慣行は別ノードとして扱う。
 */
export type CompareNode = {
  id: string;
  label: string;
  foodId: string;
  intakeForm: IntakeForm;
  /** 現状の価格データはすべて小売価格 */
  distributionStage: 'retail';
  productionMethod: ProductionMethod;
  pesticideResidue?: boolean;
  envCategory: EnvCategoryId;
  /** basis の1単位あたりの栄養価 */
  nutrientDensity: NutritionFactBase<number>;
  costVector: CostVector;
};

/**
 * basis に対応する分母（可食部100gあたりの値）。
 * nutrient-density.ts の density() と同じ判定基準で、密度が定義できない
 * 食材（cost 0、低カロリー等）は undefined。
 */
const basisDenominatorPer100g = (
  food: FoodToOptimize,
  basis: Basis
): number | undefined => {
  switch (basis) {
    case 'per100g':
      return 1;
    case 'perYen':
      return food.cost > 0 ? food.cost : undefined;
    case 'perKcal':
      return food.nutritionFacts.calories > PER_KCAL_MIN_CALORIES
        ? food.nutritionFacts.calories
        : undefined;
  }
};

/**
 * 食材を比較ノードへ変換する。basis の分母が定義できない食材
 * （perKcal かつ低カロリー等）は null を返す。
 */
export const toCompareNode = (
  food: FoodToOptimize,
  basis: Basis,
  locale: Locale = 'ja-JP'
): CompareNode | null => {
  const denominator = basisDenominatorPer100g(food, basis);
  if (denominator === undefined) return null;

  const nutrientDensity = Object.fromEntries(
    Object.entries(food.nutritionFacts).map(([key, value]) => [
      key,
      value / denominator,
    ])
  ) as NutritionFactBase<number>;

  const env = environmentalImpactOf(food);
  const productionMethod = productionMethodOf(food);
  // env は 1kg あたり → 100g あたりに直してから basis で正規化
  const costVector: CostVector = {
    yen: food.cost / denominator,
    co2eKg: env.co2eKgPerKg / 10 / denominator,
    landM2: env.landM2PerKg / 10 / denominator,
    waterL: env.waterLPerKg / 10 / denominator,
  };

  return {
    id: food.id,
    label: foodDisplayName(food, locale),
    foodId: food.id,
    intakeForm: intakeFormOf(food),
    distributionStage: 'retail',
    productionMethod,
    envCategory: classifyEnvCategory(food),
    nutrientDensity,
    costVector,
  };
};
