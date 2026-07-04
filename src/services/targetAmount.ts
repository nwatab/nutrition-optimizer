import { NutritionTarget } from '@/types/nutrition';
import {
  AgeBand,
  Sex,
  PalCategory,
  basalMetabolicRate,
  pal,
  vitaminCoefficients,
  proteinCoefficients,
  energyPercentTargets,
  micronutrientTable,
  ironRdaMenstruating,
} from '@/data/dri-2025';

export type BuildTargetParams = {
  ageBand: AgeBand;
  sex: Sex;
  weightKg: number;
  pal: PalCategory;
  /** 女性の月経の有無。鉄の下限に影響する（男性では無視される）。 */
  menstruation?: boolean;
};

/**
 * 推定エネルギー必要量 EER（kcal/日）= 基礎代謝基準値 × 体重 × 身体活動レベル。
 * 体重に比例する。
 */
export const estimateEnergyRequirement = (
  ageBand: AgeBand,
  sex: Sex,
  weightKg: number,
  palCategory: PalCategory
): number => basalMetabolicRate[ageBand][sex] * weightKg * pal[palCategory];

/**
 * たんぱく質推奨量（RDA, g/日）。維持必要量 ÷ 消化率 × 推奨量算定係数 × 体重。体重に比例する。
 */
export const proteinRdaGrams = (weightKg: number): number => {
  const { maintenancePerKg, digestibility, recommendedFactor } =
    proteinCoefficients;
  return (maintenancePerKg / digestibility) * recommendedFactor * weightKg;
};

const gramsFromEnergyPercent = (
  energyKcal: number,
  percent: number,
  kcalPerGram: number
): number => (energyKcal * percent) / kcalPerGram;

/**
 * buildTarget: 年齢帯・性別・体重・PAL・月経有無から NutritionTarget を組み立てる。
 *
 * 指標種別に応じて min（EAR/RDA/AI・目標量下限）と max（耐容上限量 UL・目標量上限）を設定する。
 * - エネルギー: EER（equal）
 * - たんぱく質: min = max(RDA体重比例, 目標量下限13%E), max = 目標量上限20%E
 * - 脂質・飽和脂肪酸・炭水化物: %エネルギー → 質量換算
 * - B1/B2/ナイアシン: エネルギー比例（per-1,000 kcal 係数 × EER/1000）
 * - B6: たんぱく質比例（per-g-protein 係数 × たんぱく質RDA）
 * - それ以外の微量栄養素: [[micronutrientTable]] を表引き（PAL 非依存）
 * - 鉄: 2025年版で UL 撤廃のため max なし。女性・月経ありは min を上げる。
 */
export const buildTarget = ({
  ageBand,
  sex,
  weightKg,
  pal: palCategory,
  menstruation = false,
}: BuildTargetParams): NutritionTarget => {
  const eer = estimateEnergyRequirement(ageBand, sex, weightKg, palCategory);
  const eerMcal = eer / 1000;
  const proteinRda = proteinRdaGrams(weightKg);

  const table = micronutrientTable[ageBand][sex];
  const { protein, fat, saturatedFattyAcids, carbohydrates } =
    energyPercentTargets;

  // 鉄: 女性・月経ありは月経あり列の RDA（65歳以上は区分がないため月経なしのまま）。
  const menstruatingIron =
    sex === 'female' && menstruation ? ironRdaMenstruating[ageBand] : null;
  const iron =
    menstruatingIron !== null ? { min: menstruatingIron } : table.iron;

  return {
    ...table,
    calories: { equal: eer },
    protein: {
      min: Math.max(
        proteinRda,
        gramsFromEnergyPercent(eer, protein.minPercent, protein.kcalPerGram)
      ),
      max: gramsFromEnergyPercent(eer, protein.maxPercent, protein.kcalPerGram),
    },
    fat: {
      min: gramsFromEnergyPercent(eer, fat.minPercent, fat.kcalPerGram),
      max: gramsFromEnergyPercent(eer, fat.maxPercent, fat.kcalPerGram),
    },
    saturatedFattyAcids: {
      max: gramsFromEnergyPercent(
        eer,
        saturatedFattyAcids.maxPercent,
        saturatedFattyAcids.kcalPerGram
      ),
    },
    carbohydrates: {
      min: gramsFromEnergyPercent(
        eer,
        carbohydrates.minPercent,
        carbohydrates.kcalPerGram
      ),
      max: gramsFromEnergyPercent(
        eer,
        carbohydrates.maxPercent,
        carbohydrates.kcalPerGram
      ),
    },
    vitaminB1: { min: vitaminCoefficients.vitaminB1PerMcal * eerMcal },
    vitaminB2: { min: vitaminCoefficients.vitaminB2PerMcal * eerMcal },
    niacin: { min: vitaminCoefficients.niacinPerMcal * eerMcal },
    vitaminB6: {
      min: vitaminCoefficients.vitaminB6PerProteinGram * proteinRda,
    },
    iron,
  };
};

/**
 * 年齢（歳）を報告書の成人年齢帯に丸める。17歳以下は最小の成人区分に丸める（スコープ外の暫定）。
 */
export const toAgeBand = (age: number): AgeBand => {
  if (age < 30) return '18-29';
  if (age < 50) return '30-49';
  if (age < 65) return '50-64';
  if (age < 75) return '65-74';
  return '75+';
};

/**
 * 目標エネルギー（kcal/日）。EER と同一。
 */
export const getDailyCaloryGoal = (
  weightKg: number,
  palCategory: PalCategory,
  ageBand: AgeBand = '30-49',
  sex: Sex = 'male'
): number => estimateEnergyRequirement(ageBand, sex, weightKg, palCategory);

/**
 * 後方互換のための薄いラッパー。旧シグネチャ (sex, age, weight, _dailyCalory) を
 * buildTarget に委譲する。PAL は「ふつう」、月経なしを既定とする。
 * @deprecated buildTarget を直接使うこと。
 */
export const getReferenceDailyIntakes = (
  sex: Sex,
  age: number,
  weight: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _dailyCalory: number = 2750
): NutritionTarget =>
  buildTarget({
    ageBand: toAgeBand(age),
    sex,
    weightKg: weight,
    pal: 'normal',
  });
