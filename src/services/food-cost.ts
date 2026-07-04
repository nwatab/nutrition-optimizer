/**
 * 購入価格から可食部100gあたりの価格 [円] を計算する。
 * 栄養成分は「可食部100gあたり」で表されるため、価格も可食部基準に
 * 揃えないと廃棄率の高い食材（野菜・果物など）が系統的に安く見える。
 *
 * @param price 購入価格 [円]
 * @param massGram 購入質量 [g]（廃棄部位を含む）
 * @param refuseRatePercent 廃棄率 [%]（日本食品標準成分表の廃棄率列）
 */
export const edibleCostPer100 = (
  price: number,
  massGram: number,
  refuseRatePercent: number
): number => {
  if (refuseRatePercent < 0 || refuseRatePercent >= 100) {
    throw new Error(`廃棄率が不正です: ${refuseRatePercent}`);
  }
  return (price / (massGram * (1 - refuseRatePercent / 100))) * 100;
};
