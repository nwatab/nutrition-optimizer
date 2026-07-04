import { promises as fs } from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

/**
 * UI 層（src/components, src/app）に日本語リテラルを直書きさせないガード。
 * 表示文字列は locales/*.json に置き、messages 経由で参照する。
 * services/data 層は対象外（成分表名称のキーワード判定・開発者向けエラー等）。
 */

const CJK_PATTERN = /[ぁ-んァ-ヶ一-龯々〜]/;

// 言語スイッチャーの自言語表記（endonym）は慣例として許可する。
const ALLOWED_LITERALS = ["'日本語'"];

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

const listFilesRecursively = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory()
        ? listFilesRecursively(fullPath)
        : Promise.resolve([fullPath]);
    })
  );
  return files.flat();
};

describe('no hardcoded Japanese in UI layer', () => {
  it.each(['src/components', 'src/app'])(
    '%s に日本語リテラルが無い',
    async (dir) => {
      const files = (
        await listFilesRecursively(path.join(process.cwd(), dir))
      ).filter((file) => /\.(tsx|ts)$/.test(file));

      const violations = (
        await Promise.all(
          files.map(async (file) => {
            const source = stripComments(await fs.readFile(file, 'utf8'));
            return source
              .split('\n')
              .map((line, index) => ({ line, lineNumber: index + 1 }))
              .filter(({ line }) => {
                const withoutAllowed = ALLOWED_LITERALS.reduce(
                  (rest, literal) => rest.replaceAll(literal, ''),
                  line
                );
                return CJK_PATTERN.test(withoutAllowed);
              })
              .map(
                ({ line, lineNumber }) =>
                  `${path.relative(process.cwd(), file)}:${lineNumber}: ${line.trim()}`
              );
          })
        )
      ).flat();

      expect(violations).toEqual([]);
    }
  );
});
