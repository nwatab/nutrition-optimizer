export type Locale = 'en-US' | 'ja-JP';

export const appConfig: {
  i18n: Locale[];
} = {
  i18n: ['en-US', 'ja-JP'],
};

// next/image with `unoptimized` does not prepend basePath, so public
// assets referenced by absolute path must include it themselves.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
