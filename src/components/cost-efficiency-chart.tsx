'use client';

import { useState } from 'react';
import type { Message } from '@/locales';
import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';
import { density, type Basis } from '@/services/nutrient-density';

type CostEfficiencyChartProps = {
  /**
   * 可食部100gあたりの栄養成分
   */
  nutritionFacts: NutritionFactBase<number>;
  /**
   * 可食部100gあたりの金額 [円]
   */
  cost: number;
  referenceDailyIntakes: NutritionTarget;
  messages: Message;
};

const basisOptions: {
  basis: Basis;
  label: keyof Message;
  description: keyof Message;
  /**
   * density は per100g / 1円あたり / 1kcalあたり を返すため、
   * 表示単位（100円・100kcal）に合わせて掛ける係数
   */
  displayScale: number;
}[] = [
  {
    basis: 'perYen',
    label: 'per 100 yen',
    description: 'Nutrients per 100 yen relative to daily reference',
    displayScale: 100,
  },
  {
    basis: 'per100g',
    label: 'per 100 g',
    description: 'Nutrients per 100 g relative to daily reference',
    displayScale: 1,
  },
  {
    basis: 'perKcal',
    label: 'per 100 kcal',
    description: 'Nutrients per 100 kcal relative to daily reference',
    displayScale: 100,
  },
];

export default function CostEfficiencyChart({
  nutritionFacts,
  cost,
  referenceDailyIntakes,
  messages,
}: CostEfficiencyChartProps) {
  const [basis, setBasis] = useState<Basis>('perYen');
  // ToDo: コスト効率の高い栄養素を選択

  const keyNutrients: {
    key: keyof NutritionTarget;
    name: string;
    reference: number;
  }[] = [
    {
      key: 'protein',
      name: `${messages.protein} (g)`,
      reference: referenceDailyIntakes.protein.min,
    },
    {
      key: 'calories',
      name: `${messages.calories} (kcal)`,
      reference: referenceDailyIntakes.calories.equal,
    },
    {
      key: 'vitaminC',
      name: `${messages.vitaminC} (mg)`,
      reference: referenceDailyIntakes.vitaminC.min,
    },
    {
      key: 'calcium',
      name: `${messages.calcium} (mg)`,
      reference: referenceDailyIntakes.calcium.min,
    },
    {
      key: 'iron',
      name: `${messages.iron} (mg)`,
      reference: referenceDailyIntakes.iron.min,
    },
  ];

  const selectedOption =
    basisOptions.find((option) => option.basis === basis) ?? basisOptions[0];

  return (
    <div className="w-full h-full">
      <div
        className="flex gap-2 mb-2"
        role="group"
        aria-label={messages['cost basis']}
      >
        {basisOptions.map((option) => (
          <button
            key={option.basis}
            type="button"
            onClick={() => setBasis(option.basis)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              option.basis === basis
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
            }`}
          >
            {messages[option.label]}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {messages[selectedOption.description]}
      </p>
      <div className="space-y-6">
        {keyNutrients.map((nutrient) => {
          const densityValue = density(
            { nutritionFacts, cost },
            basis,
            nutrient.key as keyof NutritionFactBase<number>
          );
          if (densityValue === undefined) {
            return (
              <div key={nutrient.key}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {nutrient.name}
                  </span>
                  <span className="text-sm text-gray-400">—</span>
                </div>
                <p className="text-xs text-gray-400">
                  {
                    messages[
                      'Calories are negligible, so this basis is not comparable'
                    ]
                  }
                </p>
              </div>
            );
          }
          const value = densityValue * selectedOption.displayScale;
          const percentage = (value / nutrient.reference) * 100;

          return (
            <div key={nutrient.key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {nutrient.name}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {value.toFixed(nutrient.key === 'calories' ? 0 : 1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>
                  {nutrient.reference.toLocaleString('ja-JP', {
                    maximumFractionDigits: 1,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        {messages['* Reference values are daily requirements for a typical adult']}
      </p>
    </div>
  );
}
