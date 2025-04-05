'use client';

import { Card } from '@/components/ui/card';
import type {
  NutritionFactBase,
  MinMaxRange,
  FoodRequired,
} from '@/types/nutrition';
import { useState } from 'react';

type NutritionCategoryChartsProps = {
  totalNutrition: NutritionFactBase<number>;
  target: NutritionFactBase<MinMaxRange>;
  breakdown: FoodRequired[];
};

export default function NutritionCategoryCharts({
  totalNutrition,
  target,
  breakdown,
}: NutritionCategoryChartsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('macros');

  // 栄養素カテゴリー
  const categories = [
    {
      id: 'macros',
      name: 'マクロ栄養素',
      keys: ['protein', 'fat', 'carbohydrates', 'fiber'],
    },
    {
      id: 'vitamins',
      name: 'ビタミン',
      keys: [
        'vitaminA',
        'vitaminD',
        'vitaminE',
        'vitaminK',
        'vitaminB1',
        'vitaminB2',
        'vitaminB6',
        'vitaminB12',
        'vitaminC',
        'niacin',
        'folate',
        'pantothenicAcid',
        'biotin',
      ],
    },
    {
      id: 'minerals',
      name: 'ミネラル',
      keys: [
        'potassium',
        'calcium',
        'magnesium',
        'phosphorus',
        'iron',
        'zinc',
        'copper',
        'manganese',
        'iodine',
        'selenium',
        'chromium',
        'molybdenum',
      ],
    },
    {
      id: 'fats',
      name: '脂質詳細',
      keys: [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ],
    },
  ];

  // 栄養素の日本語名
  const nutrientNames: Record<string, string> = {
    calories: 'カロリー',
    protein: 'タンパク質',
    fat: '脂質',
    fiber: '食物繊維',
    vitaminB6: 'ビタミンB6',
    vitaminB12: 'ビタミンB12',
    vitaminC: 'ビタミンC',
    saturatedFattyAcids: '飽和脂肪酸',
    n6PolyunsaturatedFattyAcids: 'n-6系多価不飽和脂肪酸',
    n3PolyunsaturatedFattyAcids: 'n-3系多価不飽和脂肪酸',
    carbohydrates: '炭水化物',
    vitaminA: 'ビタミンA',
    vitaminD: 'ビタミンD',
    vitaminE: 'ビタミンE',
    vitaminK: 'ビタミンK',
    vitaminB1: 'ビタミンB1',
    vitaminB2: 'ビタミンB2',
    niacin: 'ナイアシン',
    folate: '葉酸',
    pantothenicAcid: 'パントテン酸',
    biotin: 'ビオチン',
    nacl: '食塩相当量',
    potassium: 'カリウム',
    calcium: 'カルシウム',
    magnesium: 'マグネシウム',
    phosphorus: 'リン',
    iron: '鉄',
    zinc: '亜鉛',
    copper: '銅',
    manganese: 'マンガン',
    iodine: 'ヨウ素',
    selenium: 'セレン',
    chromium: 'クロム',
    molybdenum: 'モリブデン',
  };

  // 栄養素の単位
  const nutrientUnits: Record<string, string> = {
    calories: 'kcal',
    protein: 'g',
    fat: 'g',
    fiber: 'g',
    vitaminB6: 'mg',
    vitaminB12: 'μg',
    vitaminC: 'mg',
    saturatedFattyAcids: 'g',
    n6PolyunsaturatedFattyAcids: 'g',
    n3PolyunsaturatedFattyAcids: 'g',
    carbohydrates: 'g',
    vitaminA: 'μg',
    vitaminD: 'μg',
    vitaminE: 'mg',
    vitaminK: 'μg',
    vitaminB1: 'mg',
    vitaminB2: 'mg',
    niacin: 'mg',
    folate: 'μg',
    pantothenicAcid: 'mg',
    biotin: 'μg',
    nacl: 'g',
    potassium: 'mg',
    calcium: 'mg',
    magnesium: 'mg',
    phosphorus: 'mg',
    iron: 'mg',
    zinc: 'mg',
    copper: 'mg',
    manganese: 'mg',
    iodine: 'μg',
    selenium: 'μg',
    chromium: 'μg',
    molybdenum: 'μg',
  };

  // 達成率を計算する関数
  const calculateAchievement = (
    value: number,
    targetRange: MinMaxRange
  ): number | null => {
    // 両方の値がない場合はnullとする
    if (!targetRange.min && !targetRange.max) return null;

    // 下限のみある場合（最低摂取量を満たすべき栄養素）
    if (targetRange.min && !targetRange.max) {
      return (value / targetRange.min) * 100;
    }

    // 上限のみある場合（摂りすぎに注意すべき栄養素）
    if (!targetRange.min && targetRange.max) {
      return (value / targetRange.max) * 100;
    }

    // 両方ある場合（適正範囲のある栄養素）
    if (targetRange.min && targetRange.max) {
      if (value < targetRange.min) {
        // 下限未満の場合は達成率を下限に対する割合で表す
        return (value / targetRange.min) * 100;
      }
      // 範囲内なら100%
      return 100;
    }

    return null; // デフォルト
  };
  // 現在のカテゴリーの栄養素を取得
  const currentCategory =
    categories.find((cat) => cat.id === activeCategory) || categories[0];

  // 食材ごとの色
  const ingredientColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
  ];

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        栄養素カテゴリー分析
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {currentCategory.keys.map((key) => {
          const nutrientKey = key as keyof NutritionFactBase<number>;
          const value = totalNutrition[nutrientKey];
          const targetValue =
            target[nutrientKey as keyof NutritionFactBase<MinMaxRange>];
          const achievement = calculateAchievement(value, targetValue) ?? 0;

          // 各食材の寄与度を計算
          const contributions = breakdown.map((food) => {
            const nutrientValue = food.nutritionFacts[nutrientKey] || 0;
            return {
              name: food.type === 'estat' ? food.nameInEstat : food.productName,
              value: nutrientValue,
              // 寄与度の計算は正しい（その食材の栄養素の量 / 全体の栄養素の量）
              percentage: value > 0 ? (nutrientValue / value) * 100 : 0,
            };
          });

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-medium text-emerald-800">
                    {nutrientNames[key] || key}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {value.toFixed(2)} {nutrientUnits[key]}
                    {targetValue.min &&
                      ` / 目標: ${targetValue.min}${nutrientUnits[key]}`}
                    {targetValue.max &&
                      ` (上限: ${targetValue.max}${nutrientUnits[key]})`}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  達成率: {Math.round(achievement)}%
                </div>
              </div>

              {/* 達成率バー */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full ${
                    achievement < 90
                      ? 'bg-amber-500'
                      : achievement > 110 && targetValue.max
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(achievement, 100)}%` }}
                ></div>
              </div>

              {/* 食材ごとの寄与度 */}
              <div className="flex h-8 w-full rounded-md overflow-hidden">
                {contributions.map((contribution, index) => (
                  <div
                    key={`${key}-${index}`}
                    className={`${ingredientColors[index % ingredientColors.length]} h-full`}
                    style={{ width: `${contribution.percentage}%` }}
                    title={`${contribution.name}: ${contribution.value}${nutrientUnits[key]} (${Math.round(contribution.percentage)}%)`}
                  ></div>
                ))}
              </div>

              {/* 凡例 */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {contributions.map((contribution, index) => (
                  <div
                    key={`legend-${key}-${index}`}
                    className="flex items-center text-xs"
                  >
                    <div
                      className={`w-3 h-3 mr-1 ${ingredientColors[index % ingredientColors.length]}`}
                    ></div>
                    <span>
                      {contribution.name} ({Math.round(contribution.percentage)}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
