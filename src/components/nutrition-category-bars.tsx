import { unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type { NutritionFactBase } from '@/types/nutrition';
import { toTitleCase } from '@/utils';

type NutritionCategoryBarsProps = {
  nutritionFacts: NutritionFactBase<number>;
  items: Array<keyof NutritionFactBase<number>>;
  messages: Message;
};

// 栄養素の単位マッピング

// 栄養素の基準値マッピング（一般的な1日の推奨摂取量の目安）
const benchmarkMap: Record<keyof NutritionFactBase<number>, number> = {
  calories: 2000,
  protein: 60,
  fat: 60,
  carbohydrates: 320,
  fiber: 20,
  vitaminA: 900,
  vitaminD: 8.5,
  vitaminE: 6.5,
  vitaminK: 150,
  vitaminB1: 1.2,
  vitaminB2: 1.4,
  vitaminB6: 1.4,
  vitaminB12: 2.4,
  vitaminC: 100,
  niacin: 15,
  folate: 240,
  pantothenicAcid: 5,
  biotin: 50,
  saturatedFattyAcids: 16,
  n6PolyunsaturatedFattyAcids: 10,
  n3PolyunsaturatedFattyAcids: 2,
  nacl: 7.5,
  potassium: 2500,
  calcium: 650,
  magnesium: 340,
  phosphorus: 800,
  iron: 7.5,
  zinc: 10,
  copper: 0.9,
  manganese: 4,
  iodine: 130,
  selenium: 30,
  chromium: 10,
  molybdenum: 25,
};

export default function NutritionCategoryBars({
  nutritionFacts,
  items,
  messages,
}: NutritionCategoryBarsProps) {
  // 最大値を計算して相対的なバーの長さを決定
  const maxValue = Math.max(
    ...items.map((item) => (nutritionFacts[item] / benchmarkMap[item]) * 100)
  );

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = nutritionFacts[item];
        const benchmark = benchmarkMap[item];
        const percentage = (value / benchmark) * 100;
        const relativeWidth = (percentage / maxValue) * 100;

        return (
          <div key={item} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3 text-sm font-medium text-gray-700">
              {toTitleCase(messages[item])}
            </div>
            <div className="col-span-7">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(relativeWidth, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="col-span-2 text-right text-sm text-gray-600">
              {value.toLocaleString('ja-JP', {
                maximumFractionDigits: 0,
              })}{' '}
              {unitMap[item]}
            </div>
          </div>
        );
      })}
      <div className="text-xs text-gray-500 mt-2">
        * {messages['The bar length indicates relative score']}
      </div>
    </div>
  );
}
