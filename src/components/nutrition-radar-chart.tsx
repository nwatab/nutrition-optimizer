import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';

export default function NutritionRadarChart({
  nutritionFacts,
  referenceDailyIntakes,
}: {
  nutritionFacts: NutritionFactBase<number>;
  referenceDailyIntakes: NutritionTarget;
}) {
  const keyNutrients: {
    key: keyof NutritionFactBase<number>;
    name: string;
    dailyIntake: number;
  }[] = [
    {
      key: 'calories',
      name: 'カロリー',
      dailyIntake: referenceDailyIntakes.calories.equal,
    },
    {
      key: 'carbohydrates',
      name: '炭水化物',
      dailyIntake: referenceDailyIntakes.carbohydrates.min,
    },
    {
      key: 'protein',
      name: 'タンパク質',
      dailyIntake: referenceDailyIntakes.protein.min,
    },
    {
      key: 'fat',
      name: '脂質',
      dailyIntake: referenceDailyIntakes.fat.min,
    },
    {
      key: 'vitaminC',
      name: 'ビタミンC',
      dailyIntake: referenceDailyIntakes.vitaminC.min,
    },
    {
      key: 'calcium',
      name: 'カルシウム',
      dailyIntake: referenceDailyIntakes.calcium.min,
    },
    { key: 'iron', name: '鉄分', dailyIntake: referenceDailyIntakes.iron.min },
    {
      key: 'fiber',
      name: '食物繊維',
      dailyIntake: referenceDailyIntakes.fiber.min,
    },
    {
      key: 'vitaminA',
      name: 'ビタミンA',
      dailyIntake: referenceDailyIntakes.vitaminA.min,
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-emerald-800 mb-2">栄養素レーダーチャート</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {keyNutrients.map((nutrient) => {
            const value =
              nutritionFacts[nutrient.key as keyof NutritionFactBase<number>];
            const percentage = Math.min(
              (value / nutrient.dailyIntake) * 100,
              100
            );

            return (
              <div key={nutrient.key} className="text-left">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {nutrient.name}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {value.toFixed(1)} /{' '}
                    {nutrient.dailyIntake.toLocaleString('ja-JP', {
                      maximumFractionDigits: 1,
                    })}
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
