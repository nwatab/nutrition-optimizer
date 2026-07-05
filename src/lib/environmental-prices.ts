import type { ScalarizationWeights } from '@/services/domination';

/**
 * 環境負荷の円換算価格の保存。比較（半順序）には使わず、
 * 献立最適化の目的関数と比較表の総コスト列だけが参照する。
 * プロフィールと違い機微情報ではないため localStorage に永続する。
 */

const STORAGE_KEY = 'environmentalPrices';

export const ZERO_WEIGHTS: ScalarizationWeights = Object.freeze({
  yenPerKgCo2e: 0,
  yenPerM2Land: 0,
  yenPerLWater: 0,
});

/**
 * 参考アンカーをそのまま選べるプリセット。既定は 0 で、
 * 換算レートの採否はユーザーに委ねる（ハードコードしない）。
 * market: J-クレジット取引価格・農地借地料・水道料金の中庸値。
 * socialCost: CO2e のみ炭素の社会的費用の推計に置き換えたもの。
 */
export const PRICE_PRESETS = [
  { id: 'zero', weights: ZERO_WEIGHTS },
  {
    id: 'market',
    weights: { yenPerKgCo2e: 2, yenPerM2Land: 10, yenPerLWater: 0.2 },
  },
  {
    id: 'socialCost',
    weights: { yenPerKgCo2e: 25, yenPerM2Land: 10, yenPerLWater: 0.2 },
  },
] as const satisfies readonly { id: string; weights: ScalarizationWeights }[];

export type PricePresetId = (typeof PRICE_PRESETS)[number]['id'];

export const hasNonZeroWeights = (weights: ScalarizationWeights): boolean =>
  weights.yenPerKgCo2e > 0 ||
  weights.yenPerM2Land > 0 ||
  weights.yenPerLWater > 0;

const isWeights = (value: unknown): value is ScalarizationWeights =>
  typeof value === 'object' &&
  value !== null &&
  (['yenPerKgCo2e', 'yenPerM2Land', 'yenPerLWater'] as const).every((key) => {
    const v = (value as Record<string, unknown>)[key];
    return typeof v === 'number' && Number.isFinite(v) && v >= 0;
  });

export const readStoredWeights = (): ScalarizationWeights => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ZERO_WEIGHTS;
    const parsed: unknown = JSON.parse(raw);
    return isWeights(parsed) ? parsed : ZERO_WEIGHTS;
  } catch {
    // プライベートモード等で localStorage が使えない場合は未設定扱い
    return ZERO_WEIGHTS;
  }
};

export const writeStoredWeights = (weights: ScalarizationWeights): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch {
    // 保存できない環境では単に永続化を諦める
  }
};
