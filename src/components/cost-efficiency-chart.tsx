import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';

type CostEfficiencyChartProps = {
  nutritionPer100Yen: NutritionFactBase<number>;
  referenceDailyIntakes: NutritionTarget;
};

export default function CostEfficiencyChart({
  nutritionPer100Yen,
  referenceDailyIntakes,
}: CostEfficiencyChartProps) {
  // コスト効率の高い栄養素を選択

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

  return (
    <div className="w-full h-full">
      <p className="text-sm text-gray-600 mb-4">
        100円あたりの栄養素量（基準値に対する割合）
      </p>
      <div className="space-y-6">
        {keyNutrients.map((nutrient) => {
          const value =
            nutritionPer100Yen[nutrient.key as keyof NutritionFactBase<number>];
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
