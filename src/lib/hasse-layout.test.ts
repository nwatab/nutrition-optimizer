import { describe, expect, it } from 'vitest';

import { barycenterOrder, truncate } from '@/lib/hasse-layout';

describe('barycenterOrder', () => {
  // 2層。上[A,B]・下[X,Y]、辺 A–Y と B–X は初期状態で交差する。
  // 重心法は下層を親の列で、上層を子の列で揃え、交差ゼロの並びに収束する。
  it('交差する初期配置を揃えて解消する', () => {
    const neighbors = new Map<string, string[]>([
      ['A', ['Y']],
      ['B', ['X']],
      ['X', ['B']],
      ['Y', ['A']],
    ]);
    const ordered = barycenterOrder([['A', 'B'], ['X', 'Y']], neighbors);
    // 上層の i 番目と下層の i 番目が辺で結ばれる（縦に揃う）
    expect(ordered).toEqual([['B', 'A'], ['X', 'Y']]);
  });

  it('層の分割（各層の集合）は保ち、内部順だけを並べ替える', () => {
    const neighbors = new Map<string, string[]>([
      ['A', ['Z']],
      ['B', ['X']],
      ['C', ['Y']],
      ['X', ['B']],
      ['Y', ['C']],
      ['Z', ['A']],
    ]);
    const input = [
      ['A', 'B', 'C'],
      ['X', 'Y', 'Z'],
    ];
    const ordered = barycenterOrder(input, neighbors);
    expect(ordered.map((layer) => [...layer].sort())).toEqual(
      input.map((layer) => [...layer].sort())
    );
  });

  it('相手のいないノードは元の相対位置を保つ', () => {
    const ordered = barycenterOrder([['A', 'B', 'C']], new Map());
    expect(ordered).toEqual([['A', 'B', 'C']]);
  });

  it('入力を破壊しない', () => {
    const input = [['A', 'B'], ['X', 'Y']];
    const snapshot = JSON.parse(JSON.stringify(input));
    barycenterOrder(input, new Map([['A', ['Y']], ['Y', ['A']]]));
    expect(input).toEqual(snapshot);
  });
});

describe('truncate', () => {
  it('長い文字列だけ省略記号で丸める', () => {
    expect(truncate('abcde', 3)).toBe('abc…');
    expect(truncate('abc', 3)).toBe('abc');
  });
});
