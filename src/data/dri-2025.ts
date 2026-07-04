import { NutritionTarget } from '@/types/nutrition';

/**
 * 「日本人の食事摂取基準（2025年版）」策定検討会報告書の表から転記した係数・基準値。
 * すべての数値は報告書の各栄養素の総括表（成人区分）に由来する。式で導出できる栄養素
 * （エネルギー・たんぱく質・エネルギー比例のビタミン・%エネルギーのマクロ）はここには置かず、
 * formula 側で算出する。ここに置くのは「式で出せない微量栄養素」の表引き値のみ。
 *
 * 出典:
 * - 報告書トップ: https://www.mhlw.go.jp/stf/newpage_44138.html
 * - 基礎代謝基準値: エネルギー 表3
 * - 身体活動レベル: エネルギー 表5（18〜64歳）
 * - 各微量栄養素: ビタミン／ミネラル 各総括表
 */

export type Sex = 'male' | 'female';
export type PalCategory = 'low' | 'normal' | 'high';
/**
 * 年齢帯（成人区分）。報告書の成人の区分に一致させる。
 * 小児・高齢前区分（〜17歳）は本アプリのスコープ外のため未収録。
 */
export type AgeBand = '18-29' | '30-49' | '50-64' | '65-74' | '75+';

export const AGE_BANDS: readonly AgeBand[] = [
  '18-29',
  '30-49',
  '50-64',
  '65-74',
  '75+',
];

/**
 * 基礎代謝基準値（kcal/kg 体重/日）。エネルギー 表3 の (A) 列。
 * EER = basalMetabolicRate × weightKg × PAL で用いる。
 */
export const basalMetabolicRate: Record<AgeBand, Record<Sex, number>> = {
  '18-29': { male: 23.7, female: 22.1 },
  '30-49': { male: 22.5, female: 21.9 },
  '50-64': { male: 21.8, female: 20.7 },
  '65-74': { male: 21.6, female: 20.7 },
  '75+': { male: 21.5, female: 20.7 },
};

/**
 * 身体活動レベル（PAL）。2025年版で名称が 低い/ふつう/高い に変更された（18〜64歳の代表値）。
 * 65歳以上では代表値がやや低いが、本アプリは全成人で 18〜64歳の代表値を用いる。
 */
export const pal: Record<PalCategory, number> = {
  low: 1.5,
  normal: 1.75,
  high: 2.0,
};

/**
 * 式で算出できるビタミンの算定係数（報告書 水溶性ビタミン 各節）。
 * いずれも推奨量（RDA）＝ 推定平均必要量参照値（EAR）× 推奨量算定係数。
 */
export const vitaminCoefficients = {
  /** B1: EAR 0.30 mg/1,000 kcal × 1.4（2025で 0.45→0.30 に改定） */
  vitaminB1PerMcal: 0.3 * 1.4,
  /** B2: EAR 0.50 mg/1,000 kcal × 1.2 */
  vitaminB2PerMcal: 0.5 * 1.2,
  /** ナイアシン: EAR 4.8 mgNE/1,000 kcal × 1.2 */
  niacinPerMcal: 4.8 * 1.2,
  /** B6: EAR 0.019 mg/g たんぱく質 × 1.2（たんぱく質推奨量に乗じる） */
  vitaminB6PerProteinGram: 0.019 * 1.2,
} as const;

/**
 * たんぱく質推奨量（RDA, g/日）の算定係数。
 * RDA = 維持必要量(0.66 g/kg/日) ÷ 日常食の消化率(0.90) × 推奨量算定係数(1.25) × 体重。
 */
export const proteinCoefficients = {
  maintenancePerKg: 0.66,
  digestibility: 0.9,
  recommendedFactor: 1.25,
} as const;

/**
 * %エネルギーで示される栄養素の目標量（DG）。質量換算は formula 側で行う。
 * 出典: エネルギー産生栄養素バランス／脂質／炭水化物 各表（成人共通）。
 */
export const energyPercentTargets = {
  /** たんぱく質 13〜20%エネルギー */
  protein: { minPercent: 0.13, maxPercent: 0.2, kcalPerGram: 4 },
  /** 脂質 20〜30%エネルギー */
  fat: { minPercent: 0.2, maxPercent: 0.3, kcalPerGram: 9 },
  /** 飽和脂肪酸 7%エネルギー以下 */
  saturatedFattyAcids: { maxPercent: 0.07, kcalPerGram: 9 },
  /** 炭水化物 50〜65%エネルギー */
  carbohydrates: { minPercent: 0.5, maxPercent: 0.65, kcalPerGram: 4 },
} as const;

/**
 * 表引きの微量栄養素（PAL 非依存、年齢帯×性別）。指標種別に応じて min/max を設定する。
 * - min: EAR/RDA・AI・目標量下限のいずれか
 * - max: 耐容上限量(UL)・目標量上限のいずれか（設定がなければ省略）
 *
 * 鉄(iron)は 2025年版で UL が撤廃されたため max を持たない。女性の月経ありの min は
 * ironRdaMenstruating で上書きする（[[buildTarget]] 参照）。
 * 表引きしない栄養素（calories/protein/fat/saturatedFattyAcids/carbohydrates/
 * vitaminB1/vitaminB2/vitaminB6/niacin）はここに含めない。
 */
export type TableMicronutrients = Pick<
  NutritionTarget,
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'vitaminB12'
  | 'folate'
  | 'pantothenicAcid'
  | 'biotin'
  | 'vitaminC'
  | 'nacl'
  | 'potassium'
  | 'calcium'
  | 'magnesium'
  | 'phosphorus'
  | 'iron'
  | 'zinc'
  | 'copper'
  | 'manganese'
  | 'iodine'
  | 'selenium'
  | 'chromium'
  | 'molybdenum'
  | 'n6PolyunsaturatedFattyAcids'
  | 'n3PolyunsaturatedFattyAcids'
  | 'fiber'
>;

/**
 * 食塩相当量。EAR相当の下限 1.5 g、上限は高血圧・CKD重症化予防の 6.0 g/日未満（男女共通）。
 * 目標量(DG)は男性 7.5 g/女性 6.5 g 未満だが、より厳しい重症化予防値を上限に用いる。
 */
const nacl = { min: 1.5, max: 6.0 } as const;

// マンガン(AI 男3.5/女3.0, UL 11)・クロム(AI 10, UL 500)・ビオチン(AI 50)・
// ビタミンB12(AI 4)・ビタミンK(AI 男女150)・ビタミンC(RDA 100) は成人で一定。

export const micronutrientTable: Record<
  AgeBand,
  Record<Sex, TableMicronutrients>
> = {
  '18-29': {
    male: {
      vitaminA: { min: 850, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.5, max: 800 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2500, max: 3000 },
      calcium: { min: 800, max: 2500 },
      magnesium: { min: 340 },
      phosphorus: { min: 1000, max: 3000 },
      iron: { min: 7.0 },
      zinc: { min: 9.0, max: 40 },
      copper: { min: 0.8, max: 7 },
      manganese: { min: 3.5, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 30, max: 400 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 30, max: 600 },
      n6PolyunsaturatedFattyAcids: { min: 12 },
      n3PolyunsaturatedFattyAcids: { min: 2.2 },
      fiber: { min: 20 },
    },
    female: {
      vitaminA: { min: 650, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 5.0, max: 650 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 650, max: 2500 },
      magnesium: { min: 280 },
      phosphorus: { min: 800, max: 3000 },
      iron: { min: 6.0 },
      zinc: { min: 7.5, max: 35 },
      copper: { min: 0.7, max: 7 },
      manganese: { min: 3.0, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 500 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 18 },
    },
  },
  '30-49': {
    male: {
      vitaminA: { min: 900, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.5, max: 800 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 1000 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2500, max: 3000 },
      calcium: { min: 750, max: 2500 },
      magnesium: { min: 380 },
      phosphorus: { min: 1000, max: 3000 },
      iron: { min: 7.5 },
      zinc: { min: 9.5, max: 45 },
      copper: { min: 0.9, max: 7 },
      manganese: { min: 3.5, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 35, max: 450 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 30, max: 600 },
      n6PolyunsaturatedFattyAcids: { min: 11 },
      n3PolyunsaturatedFattyAcids: { min: 2.2 },
      fiber: { min: 22 },
    },
    female: {
      vitaminA: { min: 700, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.0, max: 700 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 1000 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 650, max: 2500 },
      magnesium: { min: 290 },
      phosphorus: { min: 800, max: 3000 },
      iron: { min: 6.0 },
      zinc: { min: 8.0, max: 35 },
      copper: { min: 0.7, max: 7 },
      manganese: { min: 3.0, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 500 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 18 },
    },
  },
  '50-64': {
    male: {
      vitaminA: { min: 900, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.5, max: 800 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 1000 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2500, max: 3000 },
      calcium: { min: 750, max: 2500 },
      magnesium: { min: 370 },
      phosphorus: { min: 1000, max: 3000 },
      iron: { min: 7.0 },
      zinc: { min: 9.5, max: 45 },
      copper: { min: 0.9, max: 7 },
      manganese: { min: 3.5, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 30, max: 450 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 30, max: 600 },
      n6PolyunsaturatedFattyAcids: { min: 11 },
      n3PolyunsaturatedFattyAcids: { min: 2.3 },
      fiber: { min: 22 },
    },
    female: {
      vitaminA: { min: 700, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.0, max: 700 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 1000 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 650, max: 2500 },
      magnesium: { min: 290 },
      phosphorus: { min: 800, max: 3000 },
      iron: { min: 6.0 },
      zinc: { min: 8.0, max: 35 },
      copper: { min: 0.7, max: 7 },
      manganese: { min: 3.0, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 500 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 1.9 },
      fiber: { min: 18 },
    },
  },
  '65-74': {
    male: {
      vitaminA: { min: 850, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 7.0, max: 800 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2500, max: 3000 },
      calcium: { min: 750, max: 2500 },
      magnesium: { min: 350 },
      phosphorus: { min: 1000, max: 3000 },
      iron: { min: 7.0 },
      zinc: { min: 9.0, max: 45 },
      copper: { min: 0.8, max: 7 },
      manganese: { min: 3.5, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 30, max: 450 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 30, max: 600 },
      n6PolyunsaturatedFattyAcids: { min: 10 },
      n3PolyunsaturatedFattyAcids: { min: 2.3 },
      fiber: { min: 21 },
    },
    female: {
      vitaminA: { min: 700, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 7.0, max: 700 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 650, max: 2500 },
      magnesium: { min: 280 },
      phosphorus: { min: 800, max: 3000 },
      iron: { min: 6.0 },
      zinc: { min: 7.5, max: 35 },
      copper: { min: 0.7, max: 7 },
      manganese: { min: 3.0, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 500 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 2.0 },
      fiber: { min: 18 },
    },
  },
  '75+': {
    male: {
      vitaminA: { min: 800, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 7.0, max: 800 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2500, max: 3000 },
      calcium: { min: 750, max: 2500 },
      magnesium: { min: 330 },
      phosphorus: { min: 1000, max: 3000 },
      iron: { min: 6.5 },
      zinc: { min: 9.0, max: 40 },
      copper: { min: 0.8, max: 7 },
      manganese: { min: 3.5, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 30, max: 400 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 600 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 2.3 },
      fiber: { min: 20 },
    },
    female: {
      vitaminA: { min: 650, max: 2700 },
      vitaminD: { min: 9, max: 100 },
      vitaminE: { min: 6.0, max: 650 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl,
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 600, max: 2500 },
      magnesium: { min: 270 },
      phosphorus: { min: 800, max: 3000 },
      iron: { min: 5.5 },
      zinc: { min: 7.0, max: 35 },
      copper: { min: 0.7, max: 7 },
      manganese: { min: 3.0, max: 11 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 10, max: 500 },
      molybdenum: { min: 25, max: 500 },
      n6PolyunsaturatedFattyAcids: { min: 8 },
      n3PolyunsaturatedFattyAcids: { min: 2.0 },
      fiber: { min: 17 },
    },
  },
};

/**
 * 女性・月経ありの鉄の推奨量（RDA, mg/日）。鉄 表（女性・月経あり列）。
 * 65歳以上には月経ありの区分がないため null（月経なしの値を用いる）。
 */
export const ironRdaMenstruating: Record<AgeBand, number | null> = {
  '18-29': 10.0,
  '30-49': 10.5,
  '50-64': 10.5,
  '65-74': null,
  '75+': null,
};
