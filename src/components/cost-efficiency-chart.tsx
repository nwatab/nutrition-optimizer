'use client';

import { useState } from 'react';
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
};

const basisOptions: {
  basis: Basis;
  label: string;
  description: string;
  /**
   * density は per100g / 1円あたり / 1kcalあたり を返すため、
   * 表示単位（100円・100kcal）に合わせて掛ける係数
   */
  displayScale: number;
}[] = [
  {
    basis: 'perYen',
    label: '100円あたり',
    description: '100円あたりの栄養素量（基準値に対する割合）',
    displayScale: 100,
  },
  {
    basis: 'per100g',
    label: '100gあたり',
    description: '可食部100gあたりの栄養素量（基準値に対する割合）',
    displayScale: 1,
  },
  {
    basis: 'perKcal',
    label: '100kcalあたり',
    description: '100kcalあたりの栄養素量（基準値に対する割合）',
    displayScale: 100,
  },
];

export default function CostEfficiencyChart({
  nutritionFacts,
  cost,
  referenceDailyIntakes,
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
      name: 'タンパク質 (g)',
      reference: referenceDailyIntakes.protein.min,
    },
    {
      key: 'calories',
      name: 'カロリー (kcal)',
      reference: referenceDailyIntakes.calories.equal,
    },
    {
      key: 'vitaminC',
      name: 'ビタミンC (mg)',
      reference: referenceDailyIntakes.vitaminC.min,
    },
    {
      key: 'calcium',
      name: 'カルシウム (mg)',
      reference: referenceDailyIntakes.calcium.min,
    },
    {
      key: 'iron',
      name: '鉄分 (mg)',
      reference: referenceDailyIntakes.iron.min,
    },
  ];

  const selectedOption =
    basisOptions.find((option) => option.basis === basis) ?? basisOptions[0];

  return (
    <div className="w-full h-full">
      <div className="flex gap-2 mb-2" role="group" aria-label="コスト分母">
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
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 mb-4">{selectedOption.description}</p>
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
                  カロリーが微小のため、この分母では比較できません
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
        * 基準値は一般的な成人が1日に必要な目安量
      </p>
    </div>
  );
}
