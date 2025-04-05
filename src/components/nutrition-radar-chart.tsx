import type { NutritionFactBase } from '@/types/nutrition';

// SSGページなので、クライアントサイドでのみ実行されるチャートのプレースホルダー
export default function NutritionRadarChart({
  nutritionFacts,
}: {
  nutritionFacts: NutritionFactBase<number>;
}) {
  // 主要な栄養素を選択
  const keyNutrients = [
    { key: 'protein', name: 'タンパク質', max: 30 },
    { key: 'vitaminC', name: 'ビタミンC', max: 100 },
    { key: 'calcium', name: 'カルシウム', max: 800 },
    { key: 'iron', name: '鉄分', max: 10 },
    { key: 'fiber', name: '食物繊維', max: 20 },
    { key: 'vitaminA', name: 'ビタミンA', max: 900 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-emerald-800 mb-2">栄養素レーダーチャート</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {keyNutrients.map((nutrient) => {
            const value =
              nutritionFacts[nutrient.key as keyof NutritionFactBase<number>];
            const percentage = Math.min((value / nutrient.max) * 100, 100);

            return (
              <div key={nutrient.key} className="text-left">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {nutrient.name}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {value.toFixed(1)} / {nutrient.max}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
