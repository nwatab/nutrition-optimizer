import { describe, expect, it } from 'vitest';

import {
  MAX_AXES,
  defaultAxesFor,
  parseAxes,
  parseBasis,
  parseView,
  sameAxes,
  serializeAxes,
} from '@/lib/compare-state';
import { DEFAULT_COMPARE_AXES } from '@/services/domination';

describe('parseBasis / parseView', () => {
  it('不正な値は既定値に丸める', () => {
    expect(parseBasis(null)).toBe('per100g');
    expect(parseBasis('perYen')).toBe('perYen');
    expect(parseBasis('nonsense')).toBe('per100g');
    expect(parseView(null)).toBe('graph');
    expect(parseView('table')).toBe('table');
    expect(parseView('list')).toBe('graph');
  });
});

describe('parseAxes / serializeAxes', () => {
  it('シリアライズと解釈が往復する', () => {
    const axes = parseAxes('protein,fiber,yen,co2eKg', 'per100g');
    expect(axes).toEqual({
      nutrientKeys: ['protein', 'fiber'],
      costAxes: ['yen', 'co2eKg'],
    });
    expect(parseAxes(serializeAxes(axes), 'per100g')).toEqual(axes);
  });

  it('未知のトークンと重複は捨てる', () => {
    expect(parseAxes('protein,protein,unicorn,yen', 'per100g')).toEqual({
      nutrientKeys: ['protein'],
      costAxes: ['yen'],
    });
  });

  it('基準の分母に使っている軸は捨てる（1円あたり→価格、1kcalあたり→カロリー）', () => {
    expect(parseAxes('protein,yen,co2eKg', 'perYen').costAxes).toEqual([
      'co2eKg',
    ]);
    expect(parseAxes('calories,protein,yen', 'perKcal').nutrientKeys).toEqual([
      'protein',
    ]);
  });

  it('空・全滅なら基準に応じた既定値へ', () => {
    expect(parseAxes(null, 'per100g')).toEqual(DEFAULT_COMPARE_AXES);
    expect(parseAxes('', 'per100g')).toEqual(DEFAULT_COMPARE_AXES);
    expect(parseAxes('unicorn', 'per100g')).toEqual(DEFAULT_COMPARE_AXES);
    // perYen の既定は価格を含まない
    expect(defaultAxesFor('perYen').costAxes).toEqual(['co2eKg']);
    expect(parseAxes('yen', 'perYen')).toEqual(defaultAxesFor('perYen'));
  });

  it('MAX_AXES 個で打ち切る', () => {
    const many = 'protein,fiber,vitaminC,iron,calcium,zinc,yen';
    const axes = parseAxes(many, 'per100g');
    expect(axes.nutrientKeys.length + axes.costAxes.length).toBe(MAX_AXES);
  });
});

describe('sameAxes', () => {
  it('順序を無視して比較する', () => {
    expect(
      sameAxes(
        { nutrientKeys: ['protein', 'fiber'], costAxes: ['yen'] },
        { nutrientKeys: ['fiber', 'protein'], costAxes: ['yen'] }
      )
    ).toBe(true);
    expect(
      sameAxes(
        { nutrientKeys: ['protein'], costAxes: ['yen'] },
        { nutrientKeys: ['protein'], costAxes: ['co2eKg'] }
      )
    ).toBe(false);
  });
});
