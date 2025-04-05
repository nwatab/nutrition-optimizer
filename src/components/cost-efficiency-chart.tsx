import type { NutritionFactBase } from '@/types/nutrition';

type CostEfficiencyChartProps = {
  nutritionPer100Yen: NutritionFactBase<number>;
  cost: number;
};

export default function CostEfficiencyChart({
  nutritionPer100Yen,
}: CostEfficiencyChartProps) {
  // コスト効率の高い栄養素を選択
  const keyNutrients = [
    { key: 'protein', name: 'タンパク質 (g)', benchmark: 10 },
    { key: 'calories', name: 'カロリー (kcal)', benchmark: 200 },
    { key: 'vitaminC', name: 'ビタミンC (mg)', benchmark: 30 },
    { key: 'calcium', name: 'カルシウム (mg)', benchmark: 200 },
    { key: 'iron', name: '鉄分 (mg)', benchmark: 3 },
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
          const percentage = (value / nutrient.benchmark) * 100;

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
                <span>{nutrient.benchmark}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        * 基準値は一般的な食品の平均値を元に設定
      </p>
    </div>
  );
}
