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
 * 妊娠・授乳の状態。女性のみ意味を持つ。付加量（[[maternalAdditions]]）で
 * 女性の基準値に加算する。乳児（0〜11 か月）は母乳前提のためスコープ外。
 */
export type MaternalStatus =
  | 'none'
  | 'pregnancy-early'
  | 'pregnancy-mid'
  | 'pregnancy-late'
  | 'lactation';

/**
 * 年齢帯。報告書の区分に一致させる。小児は 1〜17 歳を収録する
 * （乳児 0〜11 か月は母乳・離乳食が主体で本アプリの最適化対象外）。
 * 小児は基礎代謝・たんぱく質・微量栄養素いずれも成人と算定法が異なり、
 * エネルギーには組織増加分（[[energyDeposition]]）を加える。
 */
export type AgeBand =
  | '1-2'
  | '3-5'
  | '6-7'
  | '8-9'
  | '10-11'
  | '12-14'
  | '15-17'
  | '18-29'
  | '30-49'
  | '50-64'
  | '65-74'
  | '75+';

/** 小児区分（1〜17 歳）。成人と算定法が異なる分岐判定に用いる。 */
export const CHILD_AGE_BANDS: readonly AgeBand[] = [
  '1-2',
  '3-5',
  '6-7',
  '8-9',
  '10-11',
  '12-14',
  '15-17',
];

export const AGE_BANDS: readonly AgeBand[] = [
  ...CHILD_AGE_BANDS,
  '18-29',
  '30-49',
  '50-64',
  '65-74',
  '75+',
];

export const isChildBand = (band: AgeBand): boolean =>
  (CHILD_AGE_BANDS as readonly string[]).includes(band);

/**
 * 基礎代謝基準値（kcal/kg 体重/日）。エネルギー 表3 の (A) 列。
 * EER = basalMetabolicRate × weightKg × PAL で用いる。
 */
export const basalMetabolicRate: Record<AgeBand, Record<Sex, number>> = {
  '1-2': { male: 61, female: 59.7 },
  '3-5': { male: 54.8, female: 52.2 },
  '6-7': { male: 44.3, female: 41.9 },
  '8-9': { male: 40.8, female: 38.3 },
  '10-11': { male: 37.4, female: 34.8 },
  '12-14': { male: 31, female: 29.6 },
  '15-17': { male: 27, female: 25.3 },
  '18-29': { male: 23.7, female: 22.1 },
  '30-49': { male: 22.5, female: 21.9 },
  '50-64': { male: 21.8, female: 20.7 },
  '65-74': { male: 21.6, female: 20.7 },
  '75+': { male: 21.5, female: 20.7 },
};

/**
 * 身体活動レベル（PAL）。2025年版で名称が 低い/ふつう/高い に変更された。
 * 成人（18歳以上）は 18〜64歳の代表値を全区分で用いる（65歳以上も同値）。
 * 小児は年齢区分別（エネルギー 表4, 男女共通）。1〜5 歳は「ふつう」のみ設定される
 * ため、低い/高いを選んでも「ふつう」の値に丸める。
 */
const adultPal = { low: 1.5, normal: 1.75, high: 2.0 } as const;
export const palByBand: Record<AgeBand, Record<PalCategory, number>> = {
  '1-2': { low: 1.35, normal: 1.35, high: 1.35 },
  '3-5': { low: 1.45, normal: 1.45, high: 1.45 },
  '6-7': { low: 1.35, normal: 1.55, high: 1.75 },
  '8-9': { low: 1.4, normal: 1.6, high: 1.8 },
  '10-11': { low: 1.45, normal: 1.65, high: 1.85 },
  '12-14': { low: 1.5, normal: 1.7, high: 1.9 },
  '15-17': { low: 1.55, normal: 1.75, high: 1.95 },
  '18-29': adultPal,
  '30-49': adultPal,
  '50-64': adultPal,
  '65-74': adultPal,
  '75+': adultPal,
};

/**
 * 小児の成長に伴う組織増加分のエネルギー（エネルギー蓄積量, kcal/日, エネルギー 表6 E列）。
 * 小児の EER は 基礎代謝基準値 × 体重 × PAL に本値を加える。成人は 0。
 */
export const energyDeposition: Partial<Record<AgeBand, Record<Sex, number>>> = {
  '1-2': { male: 20, female: 15 },
  '3-5': { male: 10, female: 10 },
  '6-7': { male: 15, female: 20 },
  '8-9': { male: 25, female: 30 },
  '10-11': { male: 40, female: 30 },
  '12-14': { male: 20, female: 25 },
  '15-17': { male: 10, female: 10 },
};

/**
 * 小児のたんぱく質推奨量（RDA, g/日, たんぱく質 総括表）。小児は要因加算法で算定され、
 * 成人の体重比例式（[[proteinCoefficients]]）とは異なるため表引きする。
 */
export const childProteinRda: Partial<Record<AgeBand, Record<Sex, number>>> = {
  '1-2': { male: 20, female: 20 },
  '3-5': { male: 25, female: 25 },
  '6-7': { male: 30, female: 30 },
  '8-9': { male: 40, female: 40 },
  '10-11': { male: 45, female: 45 },
  '12-14': { male: 60, female: 60 },
  '15-17': { male: 65, female: 55 },
};

/**
 * 小児の参照体重（kg, エネルギー 表3 参照体重）。小児は体重を入力させず、
 * 年齢区分・性別の参照体重で EER を算定する（成長期の体重は個人差が大きく、
 * 離散的な体重入力を掛け合わせても意味が乏しいため）。
 */
export const childReferenceWeight: Partial<
  Record<AgeBand, Record<Sex, number>>
> = {
  '1-2': { male: 11.5, female: 11.0 },
  '3-5': { male: 16.5, female: 16.1 },
  '6-7': { male: 22.2, female: 21.9 },
  '8-9': { male: 28.0, female: 27.4 },
  '10-11': { male: 35.6, female: 36.3 },
  '12-14': { male: 49.0, female: 47.5 },
  '15-17': { male: 59.7, female: 51.9 },
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
  '1-2': {
    male: {
      vitaminA: { min: 400, max: 600 },
      vitaminD: { min: 3.5, max: 25 },
      vitaminE: { min: 3, max: 150 },
      vitaminK: { min: 50 },
      vitaminB12: { min: 1.5 },
      folate: { min: 90, max: 200 },
      pantothenicAcid: { min: 3 },
      biotin: { min: 20 },
      vitaminC: { min: 35 },
      nacl: { min: 1.5, max: 3 },
      potassium: { min: 900 },
      calcium: { min: 450 },
      magnesium: { min: 70 },
      phosphorus: { min: 600 },
      iron: { min: 4 },
      zinc: { min: 3.5 },
      copper: { min: 0.3 },
      manganese: { min: 1.5 },
      iodine: { min: 50, max: 600 },
      selenium: { min: 10, max: 100 },
      chromium: { min: 0 },
      molybdenum: { min: 10 },
      n6PolyunsaturatedFattyAcids: { min: 4 },
      n3PolyunsaturatedFattyAcids: { min: 0.7 },
      fiber: { min: 0 },
    },
    female: {
      vitaminA: { min: 350, max: 600 },
      vitaminD: { min: 3.5, max: 25 },
      vitaminE: { min: 3, max: 150 },
      vitaminK: { min: 60 },
      vitaminB12: { min: 1.5 },
      folate: { min: 90, max: 200 },
      pantothenicAcid: { min: 3 },
      biotin: { min: 20 },
      vitaminC: { min: 35 },
      nacl: { min: 1.5, max: 2.5 },
      potassium: { min: 800 },
      calcium: { min: 400 },
      magnesium: { min: 70 },
      phosphorus: { min: 500 },
      iron: { min: 4 },
      zinc: { min: 3 },
      copper: { min: 0.3 },
      manganese: { min: 1.5 },
      iodine: { min: 50, max: 600 },
      selenium: { min: 10, max: 100 },
      chromium: { min: 0 },
      molybdenum: { min: 10 },
      n6PolyunsaturatedFattyAcids: { min: 4 },
      n3PolyunsaturatedFattyAcids: { min: 0.7 },
      fiber: { min: 0 },
    },
  },
  '3-5': {
    male: {
      vitaminA: { min: 500, max: 700 },
      vitaminD: { min: 4.5, max: 30 },
      vitaminE: { min: 4, max: 200 },
      vitaminK: { min: 60 },
      vitaminB12: { min: 1.5 },
      folate: { min: 100, max: 300 },
      pantothenicAcid: { min: 4 },
      biotin: { min: 20 },
      vitaminC: { min: 40 },
      nacl: { min: 1.5, max: 3.5 },
      potassium: { min: 1100, max: 1600 },
      calcium: { min: 600 },
      magnesium: { min: 100 },
      phosphorus: { min: 700 },
      iron: { min: 5 },
      zinc: { min: 4 },
      copper: { min: 0.4 },
      manganese: { min: 2 },
      iodine: { min: 60, max: 900 },
      selenium: { min: 15, max: 100 },
      chromium: { min: 0 },
      molybdenum: { min: 10 },
      n6PolyunsaturatedFattyAcids: { min: 6 },
      n3PolyunsaturatedFattyAcids: { min: 1.2 },
      fiber: { min: 8 },
    },
    female: {
      vitaminA: { min: 500, max: 700 },
      vitaminD: { min: 4.5, max: 30 },
      vitaminE: { min: 4, max: 200 },
      vitaminK: { min: 70 },
      vitaminB12: { min: 1.5 },
      folate: { min: 100, max: 300 },
      pantothenicAcid: { min: 4 },
      biotin: { min: 20 },
      vitaminC: { min: 40 },
      nacl: { min: 1.5, max: 3.5 },
      potassium: { min: 1000, max: 1400 },
      calcium: { min: 550 },
      magnesium: { min: 100 },
      phosphorus: { min: 700 },
      iron: { min: 5 },
      zinc: { min: 3.5 },
      copper: { min: 0.3 },
      manganese: { min: 2 },
      iodine: { min: 60, max: 900 },
      selenium: { min: 10, max: 100 },
      chromium: { min: 0 },
      molybdenum: { min: 10 },
      n6PolyunsaturatedFattyAcids: { min: 6 },
      n3PolyunsaturatedFattyAcids: { min: 1 },
      fiber: { min: 8 },
    },
  },
  '6-7': {
    male: {
      vitaminA: { min: 500, max: 950 },
      vitaminD: { min: 5.5, max: 40 },
      vitaminE: { min: 4.5, max: 300 },
      vitaminK: { min: 80 },
      vitaminB12: { min: 2 },
      folate: { min: 130, max: 400 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 30 },
      vitaminC: { min: 50 },
      nacl: { min: 1.5, max: 4.5 },
      potassium: { min: 1300, max: 1800 },
      calcium: { min: 600 },
      magnesium: { min: 130 },
      phosphorus: { min: 900 },
      iron: { min: 6 },
      zinc: { min: 5 },
      copper: { min: 0.4 },
      manganese: { min: 2 },
      iodine: { min: 75, max: 1200 },
      selenium: { min: 15, max: 150 },
      chromium: { min: 0 },
      molybdenum: { min: 15 },
      n6PolyunsaturatedFattyAcids: { min: 8 },
      n3PolyunsaturatedFattyAcids: { min: 1.4 },
      fiber: { min: 10 },
    },
    female: {
      vitaminA: { min: 500, max: 950 },
      vitaminD: { min: 5.5, max: 40 },
      vitaminE: { min: 4, max: 300 },
      vitaminK: { min: 90 },
      vitaminB12: { min: 2 },
      folate: { min: 130, max: 400 },
      pantothenicAcid: { min: 5 },
      biotin: { min: 30 },
      vitaminC: { min: 50 },
      nacl: { min: 1.5, max: 4.5 },
      potassium: { min: 1200, max: 1600 },
      calcium: { min: 550 },
      magnesium: { min: 130 },
      phosphorus: { min: 800 },
      iron: { min: 6 },
      zinc: { min: 4.5 },
      copper: { min: 0.4 },
      manganese: { min: 2 },
      iodine: { min: 75, max: 1200 },
      selenium: { min: 15, max: 150 },
      chromium: { min: 0 },
      molybdenum: { min: 15 },
      n6PolyunsaturatedFattyAcids: { min: 7 },
      n3PolyunsaturatedFattyAcids: { min: 1.2 },
      fiber: { min: 9 },
    },
  },
  '8-9': {
    male: {
      vitaminA: { min: 500, max: 1200 },
      vitaminD: { min: 6.5, max: 40 },
      vitaminE: { min: 5, max: 350 },
      vitaminK: { min: 90 },
      vitaminB12: { min: 2.5 },
      folate: { min: 150, max: 500 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 30 },
      vitaminC: { min: 60 },
      nacl: { min: 1.5, max: 5 },
      potassium: { min: 1600, max: 2000 },
      calcium: { min: 650 },
      magnesium: { min: 170 },
      phosphorus: { min: 1000 },
      iron: { min: 7.5 },
      zinc: { min: 5.5 },
      copper: { min: 0.5 },
      manganese: { min: 2.5 },
      iodine: { min: 90, max: 1500 },
      selenium: { min: 20, max: 200 },
      chromium: { min: 0 },
      molybdenum: { min: 20 },
      n6PolyunsaturatedFattyAcids: { min: 8 },
      n3PolyunsaturatedFattyAcids: { min: 1.5 },
      fiber: { min: 11 },
    },
    female: {
      vitaminA: { min: 500, max: 1200 },
      vitaminD: { min: 6.5, max: 40 },
      vitaminE: { min: 5, max: 350 },
      vitaminK: { min: 110 },
      vitaminB12: { min: 2.5 },
      folate: { min: 150, max: 500 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 30 },
      vitaminC: { min: 60 },
      nacl: { min: 1.5, max: 5 },
      potassium: { min: 1400, max: 1800 },
      calcium: { min: 750 },
      magnesium: { min: 160 },
      phosphorus: { min: 900 },
      iron: { min: 8 },
      zinc: { min: 5.5 },
      copper: { min: 0.5 },
      manganese: { min: 2.5 },
      iodine: { min: 90, max: 1500 },
      selenium: { min: 20, max: 200 },
      chromium: { min: 0 },
      molybdenum: { min: 15 },
      n6PolyunsaturatedFattyAcids: { min: 8 },
      n3PolyunsaturatedFattyAcids: { min: 1.4 },
      fiber: { min: 11 },
    },
  },
  '10-11': {
    male: {
      vitaminA: { min: 600, max: 1500 },
      vitaminD: { min: 8, max: 60 },
      vitaminE: { min: 5, max: 450 },
      vitaminK: { min: 110 },
      vitaminB12: { min: 3 },
      folate: { min: 180, max: 700 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 40 },
      vitaminC: { min: 70 },
      nacl: { min: 1.5, max: 6 },
      potassium: { min: 1900, max: 2200 },
      calcium: { min: 700 },
      magnesium: { min: 210 },
      phosphorus: { min: 1100 },
      iron: { min: 9.5 },
      zinc: { min: 8 },
      copper: { min: 0.6 },
      manganese: { min: 3 },
      iodine: { min: 110, max: 2000 },
      selenium: { min: 25, max: 250 },
      chromium: { min: 0 },
      molybdenum: { min: 20 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 13 },
    },
    female: {
      vitaminA: { min: 600, max: 1500 },
      vitaminD: { min: 8, max: 60 },
      vitaminE: { min: 5.5, max: 450 },
      vitaminK: { min: 130 },
      vitaminB12: { min: 3 },
      folate: { min: 180, max: 700 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 40 },
      vitaminC: { min: 70 },
      nacl: { min: 1.5, max: 6 },
      potassium: { min: 1800, max: 2000 },
      calcium: { min: 750 },
      magnesium: { min: 220 },
      phosphorus: { min: 1000 },
      iron: { min: 9 },
      zinc: { min: 7.5 },
      copper: { min: 0.6 },
      manganese: { min: 3 },
      iodine: { min: 110, max: 2000 },
      selenium: { min: 25, max: 250 },
      chromium: { min: 0 },
      molybdenum: { min: 20 },
      n6PolyunsaturatedFattyAcids: { min: 9 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 13 },
    },
  },
  '12-14': {
    male: {
      vitaminA: { min: 800, max: 2100 },
      vitaminD: { min: 9, max: 80 },
      vitaminE: { min: 6.5, max: 650 },
      vitaminK: { min: 140 },
      vitaminB12: { min: 4 },
      folate: { min: 230, max: 900 },
      pantothenicAcid: { min: 7 },
      biotin: { min: 50 },
      vitaminC: { min: 90 },
      nacl: { min: 1.5, max: 7 },
      potassium: { min: 2400, max: 2600 },
      calcium: { min: 1000 },
      magnesium: { min: 290 },
      phosphorus: { min: 1200 },
      iron: { min: 9 },
      zinc: { min: 8.5 },
      copper: { min: 0.8 },
      manganese: { min: 3.5 },
      iodine: { min: 140, max: 2500 },
      selenium: { min: 30, max: 350 },
      chromium: { min: 0 },
      molybdenum: { min: 25 },
      n6PolyunsaturatedFattyAcids: { min: 11 },
      n3PolyunsaturatedFattyAcids: { min: 2.2 },
      fiber: { min: 17 },
    },
    female: {
      vitaminA: { min: 700, max: 2100 },
      vitaminD: { min: 9, max: 80 },
      vitaminE: { min: 6, max: 600 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 230, max: 900 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 90 },
      nacl: { min: 1.5, max: 6.5 },
      potassium: { min: 2200, max: 2400 },
      calcium: { min: 800 },
      magnesium: { min: 290 },
      phosphorus: { min: 1100 },
      iron: { min: 8 },
      zinc: { min: 8.5 },
      copper: { min: 0.8 },
      manganese: { min: 3 },
      iodine: { min: 140, max: 2500 },
      selenium: { min: 30, max: 300 },
      chromium: { min: 0 },
      molybdenum: { min: 25 },
      n6PolyunsaturatedFattyAcids: { min: 11 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 16 },
    },
  },
  '15-17': {
    male: {
      vitaminA: { min: 900, max: 2600 },
      vitaminD: { min: 9, max: 90 },
      vitaminE: { min: 7, max: 750 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 7 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl: { min: 1.5, max: 7.5 },
      potassium: { min: 2800, max: 3000 },
      calcium: { min: 800 },
      magnesium: { min: 360 },
      phosphorus: { min: 1200 },
      iron: { min: 9 },
      zinc: { min: 10 },
      copper: { min: 0.9 },
      manganese: { min: 3.5 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 35, max: 400 },
      chromium: { min: 0 },
      molybdenum: { min: 30 },
      n6PolyunsaturatedFattyAcids: { min: 13 },
      n3PolyunsaturatedFattyAcids: { min: 2.2 },
      fiber: { min: 19 },
    },
    female: {
      vitaminA: { min: 650, max: 2600 },
      vitaminD: { min: 9, max: 90 },
      vitaminE: { min: 6, max: 650 },
      vitaminK: { min: 150 },
      vitaminB12: { min: 4 },
      folate: { min: 240, max: 900 },
      pantothenicAcid: { min: 6 },
      biotin: { min: 50 },
      vitaminC: { min: 100 },
      nacl: { min: 1.5, max: 6.5 },
      potassium: { min: 2000, max: 2600 },
      calcium: { min: 650 },
      magnesium: { min: 310 },
      phosphorus: { min: 1000 },
      iron: { min: 6.5 },
      zinc: { min: 8 },
      copper: { min: 0.7 },
      manganese: { min: 3 },
      iodine: { min: 140, max: 3000 },
      selenium: { min: 25, max: 350 },
      chromium: { min: 0 },
      molybdenum: { min: 25 },
      n6PolyunsaturatedFattyAcids: { min: 11 },
      n3PolyunsaturatedFattyAcids: { min: 1.7 },
      fiber: { min: 18 },
    },
  },
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
 * 月経ありの区分が設定されない年齢帯（9歳以下・65歳以上）は null（月経なしの値を用いる）。
 */
export const ironRdaMenstruating: Record<AgeBand, number | null> = {
  '1-2': null,
  '3-5': null,
  '6-7': null,
  '8-9': null,
  '10-11': 12.5,
  '12-14': 12.5,
  '15-17': 11,
  '18-29': 10.0,
  '30-49': 10.5,
  '50-64': 10.5,
  '65-74': null,
  '75+': null,
};

/** 妊娠期の3区分ごとの付加量。 */
type TrimesterAmounts = { early: number; mid: number; late: number };

/**
 * 妊婦・授乳婦の付加量（女性の基準値に加算する）。報告書 各総括表の
 * 「妊婦（付加量）」「授乳婦（付加量）」列。エネルギー・たんぱく質・鉄・ビタミンAは
 * 妊娠の初期/中期/後期で異なるため区分別、その他は妊娠期一律。すべて推奨量（RDA）
 * ベースの付加量で、対象栄養素の下限（min）に加える。上限（UL）は変更しない。
 *
 * B1/B2/ナイアシン/B6 はエネルギー・たんぱく質比例で算定されるため、エネルギー付加量に
 * 伴って自動的に増える（[[buildTarget]]）。ここには含めない。
 * AI（目安量）で示される栄養素（ビタミンD/E/K、パントテン酸、ビオチン、カリウム、
 * リン、マンガン等）の妊婦・授乳婦の値は非妊娠時とほぼ同一のため、付加なしとして扱う。
 */
export const maternalAdditions: {
  calories: { preg: TrimesterAmounts; lact: number };
  protein: { preg: TrimesterAmounts; lact: number };
  vitaminA: { preg: TrimesterAmounts; lact: number };
  iron: { preg: TrimesterAmounts; lact: number };
  folate: { preg: number; lact: number };
  vitaminC: { preg: number; lact: number };
  vitaminB12: { preg: number; lact: number };
  magnesium: { preg: number; lact: number };
  zinc: { preg: number; lact: number };
  copper: { preg: number; lact: number };
  iodine: { preg: number; lact: number };
  selenium: { preg: number; lact: number };
  molybdenum: { preg: number; lact: number };
  calcium: { preg: number; lact: number };
} = {
  calories: { preg: { early: 50, mid: 250, late: 450 }, lact: 350 },
  protein: { preg: { early: 0, mid: 5, late: 25 }, lact: 20 },
  vitaminA: { preg: { early: 0, mid: 0, late: 80 }, lact: 450 },
  iron: { preg: { early: 2.5, mid: 8.5, late: 8.5 }, lact: 2.0 },
  folate: { preg: 240, lact: 100 },
  vitaminC: { preg: 10, lact: 45 },
  vitaminB12: { preg: 0.4, lact: 0.8 },
  magnesium: { preg: 40, lact: 0 },
  zinc: { preg: 2.0, lact: 3.0 },
  copper: { preg: 0.1, lact: 0.6 },
  iodine: { preg: 110, lact: 140 },
  selenium: { preg: 5, lact: 20 },
  molybdenum: { preg: 0, lact: 3.5 },
  calcium: { preg: 0, lact: 0 },
};
