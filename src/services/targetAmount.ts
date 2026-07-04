import { NutritionTarget } from '@/types/nutrition';
import {
  AgeBand,
  Sex,
  PalCategory,
  MaternalStatus,
  basalMetabolicRate,
  palByBand,
  energyDeposition,
  childProteinRda,
  vitaminCoefficients,
  proteinCoefficients,
  energyPercentTargets,
  micronutrientTable,
  ironRdaMenstruating,
  maternalAdditions,
} from '@/data/dri-2025';

export type BuildTargetParams = {
  ageBand: AgeBand;
  sex: Sex;
  weightKg: number;
  pal: PalCategory;
  /** 女性の月経の有無。鉄の下限に影響する（男性では無視される）。 */
  menstruation?: boolean;
  /** 妊娠・授乳の状態。女性の基準値に付加量を加える（男性では無視される）。 */
  maternalStatus?: MaternalStatus;
};

/**
 * 推定エネルギー必要量 EER（kcal/日）= 基礎代謝基準値 × 体重 × 身体活動レベル。
 * 小児は成長に伴う組織増加分（エネルギー蓄積量）を加える。体重に比例する。
 */
export const estimateEnergyRequirement = (
  ageBand: AgeBand,
  sex: Sex,
  weightKg: number,
  palCategory: PalCategory
): number =>
  basalMetabolicRate[ageBand][sex] * weightKg * palByBand[ageBand][palCategory] +
  (energyDeposition[ageBand]?.[sex] ?? 0);

/**
 * たんぱく質推奨量（RDA, g/日）。成人は 維持必要量 ÷ 消化率 × 推奨量算定係数 × 体重
 * （体重比例）。小児は要因加算法で別に算定されるため表引き（[[childProteinRda]]）。
 */
export const proteinRdaGrams = (
  weightKg: number,
  ageBand?: AgeBand,
  sex?: Sex
): number => {
  if (ageBand && sex) {
    const childRda = childProteinRda[ageBand]?.[sex];
    if (childRda !== undefined) return childRda;
  }
  const { maintenancePerKg, digestibility, recommendedFactor } =
    proteinCoefficients;
  return (maintenancePerKg / digestibility) * recommendedFactor * weightKg;
};

/**
 * 妊婦（初期/中期/後期）・授乳婦の付加量を解決する。'none' や男性では 0。
 */
const resolveAddition = (
  amounts:
    | { preg: { early: number; mid: number; late: number }; lact: number }
    | { preg: number; lact: number },
  status: MaternalStatus
): number => {
  switch (status) {
    case 'lactation':
      return amounts.lact;
    case 'pregnancy-early':
      return typeof amounts.preg === 'number' ? amounts.preg : amounts.preg.early;
    case 'pregnancy-mid':
      return typeof amounts.preg === 'number' ? amounts.preg : amounts.preg.mid;
    case 'pregnancy-late':
      return typeof amounts.preg === 'number' ? amounts.preg : amounts.preg.late;
    default:
      return 0;
  }
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
  maternalStatus = 'none',
}: BuildTargetParams): NutritionTarget => {
  // 妊娠・授乳の付加量は女性のみ適用する。
  const status: MaternalStatus =
    sex === 'female' ? maternalStatus : 'none';
  const add = (
    amounts: Parameters<typeof resolveAddition>[0]
  ): number => resolveAddition(amounts, status);

  // エネルギー・たんぱく質は付加量を先に反映し、比例算定するビタミン
  // （B1/B2/ナイアシン=エネルギー比例、B6=たんぱく質比例）に波及させる。
  const eer =
    estimateEnergyRequirement(ageBand, sex, weightKg, palCategory) +
    add(maternalAdditions.calories);
  const eerMcal = eer / 1000;
  const proteinRda =
    proteinRdaGrams(weightKg, ageBand, sex) + add(maternalAdditions.protein);

  const table = micronutrientTable[ageBand][sex];
  const { protein, fat, saturatedFattyAcids, carbohydrates } =
    energyPercentTargets;

  // 表引き微量栄養素に妊婦・授乳婦の付加量（下限に加算、上限は変更しない）を反映する。
  const withAddition = (
    range: { min: number; max?: number },
    amounts: Parameters<typeof resolveAddition>[0]
  ): { min: number; max?: number } => ({
    ...range,
    min: range.min + add(amounts),
  });

  // 鉄: 妊娠・授乳中は月経なしの基準に付加量を加える。それ以外で月経ありなら月経あり列。
  const menstruatingIron =
    status === 'none' && sex === 'female' && menstruation
      ? ironRdaMenstruating[ageBand]
      : null;
  const ironBase =
    menstruatingIron !== null ? { min: menstruatingIron } : table.iron;
  const iron = { min: ironBase.min + add(maternalAdditions.iron) };

  return {
    ...table,
    vitaminA: withAddition(table.vitaminA, maternalAdditions.vitaminA),
    folate: withAddition(table.folate, maternalAdditions.folate),
    vitaminC: withAddition(table.vitaminC, maternalAdditions.vitaminC),
    vitaminB12: withAddition(table.vitaminB12, maternalAdditions.vitaminB12),
    magnesium: withAddition(table.magnesium, maternalAdditions.magnesium),
    zinc: withAddition(table.zinc, maternalAdditions.zinc),
    copper: withAddition(table.copper, maternalAdditions.copper),
    iodine: withAddition(table.iodine, maternalAdditions.iodine),
    selenium: withAddition(table.selenium, maternalAdditions.selenium),
    molybdenum: withAddition(table.molybdenum, maternalAdditions.molybdenum),
    calcium: withAddition(table.calcium, maternalAdditions.calcium),
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
 * 年齢（歳）を報告書の年齢帯に丸める。1〜17歳は小児区分、18歳以上は成人区分。
 * 1歳未満（乳児）は最小の小児区分 '1-2' に丸める（乳児は本アプリのスコープ外の暫定）。
 */
export const toAgeBand = (age: number): AgeBand => {
  if (age < 3) return '1-2';
  if (age < 6) return '3-5';
  if (age < 8) return '6-7';
  if (age < 10) return '8-9';
  if (age < 12) return '10-11';
  if (age < 15) return '12-14';
  if (age < 18) return '15-17';
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
