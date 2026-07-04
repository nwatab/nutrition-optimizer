import { promises as fs } from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { crossFoodReference, foodIngredientDataReference } from '@/data';
import { englishFoodNameOverrides } from '@/data/food-name-en-reference';
import {
  cleanEnglishFoodName,
  getEnglishFoodNamesFromExcelWorkbook,
  readExcelWorkbook,
} from '@/services';

// 英語名の解決漏れ検知。参照データに食品番号を追加した際、
// 七訂英語版にもオーバーライドにも無ければここで落ちる
// （load-food-data 側でも throw するが、テストで先に検知する）。
describe('English food names', { timeout: 60_000 }, () => {
  it('参照データの全食品番号が英語名を解決できる', async () => {
    const buffer = await fs.readFile(
      path.join(process.cwd(), 'public_data', '1374049_1r12_1.xlsx')
    );
    const readEnglishName = getEnglishFoodNamesFromExcelWorkbook(
      readExcelWorkbook(buffer)
    );

    const shokuhinbangous = [
      ...new Set([
        ...crossFoodReference.map((food) => food.shokuhinbangou),
        ...foodIngredientDataReference.map((food) => food.shokuhinbangou),
      ]),
    ];

    const unresolved = shokuhinbangous.filter(
      (shokuhinbangou) =>
        !(
          readEnglishName(shokuhinbangou) ??
          englishFoodNameOverrides[shokuhinbangou]
        )
    );
    expect(unresolved).toEqual([]);
  });

  it('英語名から脚注マーカーと注記が除去される', () => {
    expect(
      cleanEnglishFoodName('Common oats*, oatmeal, raw\r\n［*Syn. Oats］')
    ).toBe('Common oats, oatmeal, raw');
  });
});
