import type { AgeBand, PalCategory, Sex } from '@/data';

export type Locale = 'en-US' | 'ja-JP';

export const appConfig: {
  i18n: Locale[];
} = {
  i18n: ['en-US', 'ja-JP'],
};

/**
 * [age] ルートセグメント（開始年齢）→ 年齢帯のマッピング。小児（1〜17歳）と成人を含む。
 * '+' 等の URL 非互換文字を避けるため、区分の開始年齢を文字列で用いる。
 * 静的エクスポートでは generateStaticParams に無いパスは 404 になるため、
 * フォームの選択肢と generateStaticParams の両方がここを参照する。
 */
export const AGE_SEGMENTS: Record<string, AgeBand> = {
  '1': '1-2',
  '3': '3-5',
  '6': '6-7',
  '8': '8-9',
  '10': '10-11',
  '12': '12-14',
  '15': '15-17',
  '18': '18-29',
  '30': '30-49',
  '50': '50-64',
  '65': '65-74',
  '75': '75+',
};

/** 小児区分か（1〜17歳）。小児は参照体重を用いるため体重入力を伴わない。 */
export const isChildSegment = (segment: string): boolean =>
  ['1', '3', '6', '8', '10', '12', '15'].includes(segment);

/**
 * 小児の [weight] ルートセグメント。小児は年齢区分・性別の参照体重で算定し
 * URL の体重を用いないため、具体的な数値ではなく固定トークンを置く。
 */
export const CHILD_WEIGHT_SEGMENT = 'ref';

/** 体重の選択肢（kg, 成人用）。AGE_SEGMENTS と同じ理由でフォームと静的生成で共有する。 */
export const WEIGHT_OPTIONS_KG: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => 40 + i * 5
);

/** PAL が「ふつう」のみ設定される小児区分（1〜5歳, エネルギー 表4）。 */
const SINGLE_PAL_SEGMENTS: readonly string[] = ['1', '3'];

/**
 * 年齢区分で選択可能な [pal_category] の一覧。1〜5歳は「ふつう」のみ設定される
 * ため 'normal' の1トークンに畳む。フォームと generateStaticParams の両方が参照する。
 */
export const palCategoriesFor = (segment: string): readonly PalCategory[] =>
  SINGLE_PAL_SEGMENTS.includes(segment)
    ? ['normal']
    : ['low', 'normal', 'high'];

/**
 * [status] ルートセグメント（女性の生理・妊娠・授乳の状態）。
 * 男性・小児は 'none' のみ。ページ側で月経有無と妊娠授乳の付加量に変換する。
 */
export type StatusSegment =
  | 'none'
  | 'menstruation'
  | 'pregnancy-early'
  | 'pregnancy-mid'
  | 'pregnancy-late'
  | 'lactation';

/** 月経ありを選べる年齢帯（鉄に月経あり列がある区分）。 */
const MENSTRUATION_BANDS: ReadonlySet<AgeBand> = new Set<AgeBand>([
  '10-11',
  '12-14',
  '15-17',
  '18-29',
  '30-49',
  '50-64',
]);

/** 妊娠・授乳を選べる年齢帯（生殖年齢の成人女性）。 */
const MATERNAL_BANDS: ReadonlySet<AgeBand> = new Set<AgeBand>([
  '18-29',
  '30-49',
]);

/**
 * 性別・年齢帯で選択可能な [status] の一覧。男性・小児（月経・妊娠のない区分）は
 * 'none' のみ。フォームの選択肢と generateStaticParams の両方がこれを参照する。
 */
export const statusesFor = (
  sex: Sex,
  ageBand: AgeBand
): readonly StatusSegment[] => {
  if (sex !== 'female') return ['none'];
  const out: StatusSegment[] = ['none'];
  if (MENSTRUATION_BANDS.has(ageBand)) out.push('menstruation');
  if (MATERNAL_BANDS.has(ageBand)) {
    out.push('pregnancy-early', 'pregnancy-mid', 'pregnancy-late', 'lactation');
  }
  return out;
};

// next/image with `unoptimized` does not prepend basePath, so public
// assets referenced by absolute path must include it themselves.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * フォーム入力（リコメンド URL のセグメント）の localStorage 保存先。
 * ナビの「おすすめ献立」が前回のプロフィールのページへ直接飛ぶために参照する。
 */
export const PROFILE_STORAGE_KEY = 'nutrition-optimizer.profile';

/** 保存するプロフィール。値はすべて URL セグメントの文字列。 */
export type StoredProfile = {
  sex: Sex;
  age: string;
  weight: string;
  pal: PalCategory;
  status: StatusSegment;
};
