import type { AgeBand } from '@/data';

export type Locale = 'en-US' | 'ja-JP';

export const appConfig: {
  i18n: Locale[];
} = {
  i18n: ['en-US', 'ja-JP'],
};

/**
 * [age] ルートセグメント（開始年齢）→ 年齢帯のマッピング。
 * '+' 等の URL 非互換文字を避けるため、区分の開始年齢を文字列で用いる。
 * 静的エクスポートでは generateStaticParams に無いパスは 404 になるため、
 * フォームの選択肢と generateStaticParams の両方がここを参照する。
 */
export const AGE_SEGMENTS: Record<string, AgeBand> = {
  '18': '18-29',
  '30': '30-49',
  '50': '50-64',
  '65': '65-74',
  '75': '75+',
};

/** 体重の選択肢（kg）。AGE_SEGMENTS と同じ理由でフォームと静的生成で共有する。 */
export const WEIGHT_OPTIONS_KG: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => 40 + i * 5
);

// next/image with `unoptimized` does not prepend basePath, so public
// assets referenced by absolute path must include it themselves.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
