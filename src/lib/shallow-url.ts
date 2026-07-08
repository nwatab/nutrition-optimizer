// basePath は next/link や router が自動で前置するが、window.history.replaceState は
// 素のブラウザ API なので前置しない。usePathname() も basePath を含まない値を返すため、
// シャロー書き換えでは自前で補わないと basePath が URL から落ちる。
// next.config.ts と同じ単一の情報源（BASE_PATH）を参照する。
import { BASE_PATH } from '@/lib/base-path';

/**
 * usePathname() の値とクエリ文字列から、basePath を含むシャロー書き換え用 URL を作る。
 * query が空なら「?」を付けない。
 */
export const withBasePath = (pathname: string, query: string): string =>
  query ? `${BASE_PATH}${pathname}?${query}` : `${BASE_PATH}${pathname}`;
