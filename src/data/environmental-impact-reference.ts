import type { EnvironmentalImpact } from '@/types/nutrition';

/**
 * 食材カテゴリ別の環境負荷（食材 1kg あたり）。
 *
 * 出典: Poore & Nemecek (2018) "Reducing food's environmental impacts
 * through producers and consumers", Science 360(6392).
 * 数値は Our World in Data が集計した世界平均値（グローバル・ミーン）。
 *
 * 注意（根拠の透明性のため明記）:
 * - すべて世界平均値であり、原産地（国産/輸入、産地間）の差は未補正。
 * - water は淡水取水量 (freshwater withdrawals)。
 * - 慣行/有機の栽培方法差も未補正（現状は同一カテゴリ値を共有）。
 * - `※P&N未収載` と記したカテゴリは P&N (2018) にデータがなく、
 *   近縁カテゴリ等からの粗い近似値。精度を要する用途には使わないこと。
 */
export type EnvCategoryId =
  | 'rice'
  | 'wheatAndRye'
  | 'potatoes'
  | 'otherPulses'
  | 'soyProducts'
  | 'nutsAndSeeds'
  | 'brassicas'
  | 'onionsAndLeeks'
  | 'rootVegetables'
  | 'tomatoes'
  | 'otherVegetables'
  | 'bananas'
  | 'apples'
  | 'citrusFruit'
  | 'otherFruits'
  | 'mushrooms'
  | 'seaweed'
  | 'vegetableOils'
  | 'otherCrops';

export const environmentalImpactByCategory: Record<
  EnvCategoryId,
  EnvironmentalImpact
> = {
  rice: { co2eKgPerKg: 4.45, landM2PerKg: 2.8, waterLPerKg: 2248 },
  wheatAndRye: { co2eKgPerKg: 1.57, landM2PerKg: 3.85, waterLPerKg: 648 },
  potatoes: { co2eKgPerKg: 0.46, landM2PerKg: 0.88, waterLPerKg: 59 },
  otherPulses: { co2eKgPerKg: 1.79, landM2PerKg: 15.57, waterLPerKg: 436 },
  // 豆腐の値で代表（大豆加工品全般に適用）
  soyProducts: { co2eKgPerKg: 3.16, landM2PerKg: 3.52, waterLPerKg: 149 },
  nutsAndSeeds: { co2eKgPerKg: 0.43, landM2PerKg: 12.96, waterLPerKg: 4134 },
  brassicas: { co2eKgPerKg: 0.51, landM2PerKg: 0.55, waterLPerKg: 119 },
  onionsAndLeeks: { co2eKgPerKg: 0.5, landM2PerKg: 0.39, waterLPerKg: 14 },
  rootVegetables: { co2eKgPerKg: 0.43, landM2PerKg: 0.33, waterLPerKg: 28 },
  tomatoes: { co2eKgPerKg: 2.09, landM2PerKg: 0.8, waterLPerKg: 370 },
  otherVegetables: { co2eKgPerKg: 0.53, landM2PerKg: 0.38, waterLPerKg: 103 },
  bananas: { co2eKgPerKg: 0.86, landM2PerKg: 1.93, waterLPerKg: 115 },
  apples: { co2eKgPerKg: 0.43, landM2PerKg: 0.63, waterLPerKg: 180 },
  citrusFruit: { co2eKgPerKg: 0.39, landM2PerKg: 0.86, waterLPerKg: 83 },
  otherFruits: { co2eKgPerKg: 1.05, landM2PerKg: 0.89, waterLPerKg: 154 },
  // ※P&N未収載: 栽培きのこの LCA 文献値からの粗い近似
  mushrooms: { co2eKgPerKg: 2.0, landM2PerKg: 0.2, waterLPerKg: 200 },
  // ※P&N未収載: 養殖海藻は施肥・給餌不要で負荷が小さいとされる粗い近似
  seaweed: { co2eKgPerKg: 0.5, landM2PerKg: 0.01, waterLPerKg: 10 },
  // 菜種油の値で代表（植物油全般に適用）
  vegetableOils: { co2eKgPerKg: 3.77, landM2PerKg: 10.7, waterLPerKg: 240 },
  // ※P&N未収載: 茶葉・香辛料など少量消費の作物のフォールバック
  otherCrops: { co2eKgPerKg: 1.0, landM2PerKg: 1.5, waterLPerKg: 300 },
};
