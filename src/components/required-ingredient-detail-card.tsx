import { getNutrientUnit } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type {
  ConstraintRange,
  FoodRequired,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';

const calculatePercentage = (
  value: number,
  reference: ConstraintRange | undefined
): { percentage: string; value: number } => {
  if (!reference || !('min' in reference)) {
    return { percentage: '-', value: 0 };
  }

  const percentValue = Math.round((value / reference.min) * 100);
  return {
    percentage: `${percentValue}%`,
    value: percentValue,
  };
};

export default function RequiredIngredientDetailCard({
  ingredient,
  referenceDailyIntakes,
  messages,
}: {
  ingredient: FoodRequired;
  referenceDailyIntakes: NutritionTarget;
  messages: Message;
}) {
  const renderNutrientRow = (key: string, value: number) => {
    const nutrientKey = key as keyof NutritionFactBase<number>;
    const percentageData = calculatePercentage(
      value,
      referenceDailyIntakes[nutrientKey]
    );

    const rowClassName =
      50 < percentageData.value
        ? 'font-bold'
        : 10 < percentageData.value
          ? 'font-normal'
          : 'font-thin';

    return (
      <div
        key={key}
        className={`flex justify-between items-center ${rowClassName}`}
      >
        <span className="text-gray-600">{key}</span>
        <div className="flex space-x-3">
          <span>
            {value.toFixed(1)} {getNutrientUnit(nutrientKey)}
          </span>
          <span className="text-emerald-600 w-12 text-right">
            {percentageData.percentage}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      key={`detail-${ingredient.id}`}
      className="p-4 bg-white/80 rounded-lg shadow"
    >
      <h4 className="font-medium text-emerald-700 mb-2">
        {ingredient.type === 'estat'
          ? ingredient.nameInEstat +
            ' (' +
            ingredient.nameInNutritionFacts +
            ')'
          : ingredient.type === 'manualPrice'
            ? ingredient.productName +
              ' (' +
              ingredient.nameInNutritionFacts +
              ')'
            : ingredient.productName}
      </h4>
      <p className="text-sm text-gray-500 mb-3">
        {(ingredient.hectoGrams * 100).toFixed(0)}g /{' '}
        {ingredient.cost.toFixed(0)}
        {messages.yen}
      </p>

      <div className="space-y-2">
        <details className="group">
          <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
            <span className="text-sm text-emerald-600">{messages.details}</span>
            <span className="transition group-open:rotate-180">
              <svg
                fill="none"
                height="24"
                width="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </summary>
          <div className="text-xs mt-2 space-y-1">
            {/* 主要栄養素 */}
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                {messages.macronutrients}
              </h5>
              {Object.entries(ingredient.nutritionFacts)
                .filter(([key]) =>
                  [
                    'calories',
                    'protein',
                    'fat',
                    'carbohydrates',
                    'fiber',
                  ].includes(key)
                )
                .sort(([keyA], [keyB]) => {
                  const order = [
                    'calories',
                    'protein',
                    'fat',
                    'carbohydrates',
                    'fiber',
                  ];
                  return order.indexOf(keyA) - order.indexOf(keyB);
                })
                .map(([key, value]) => renderNutrientRow(key, value))}
            </div>

            {/* ビタミン */}
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                {messages.vitamins}
              </h5>
              {Object.entries(ingredient.nutritionFacts)
                .filter(([key]) => key.toLowerCase().includes('vitamin'))
                .sort(([keyA], [keyB]) => {
                  const order = [
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
                  ];
                  return order.indexOf(keyA) - order.indexOf(keyB);
                })
                .map(([key, value]) => renderNutrientRow(key, value))}
            </div>

            {/* ミネラル */}
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                {messages.minerals}
              </h5>
              {Object.entries(ingredient.nutritionFacts)
                .filter(([key]) =>
                  [
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
                  ].includes(key)
                )
                .sort(([keyA], [keyB]) => {
                  // 元素の英語名と原子番号のマッピング
                  const atomicNumber = {
                    potassium: 19,
                    calcium: 20,
                    magnesium: 12,
                    phosphorus: 15,
                    iron: 26,
                    zinc: 30,
                    copper: 29,
                    manganese: 25,
                    iodine: 53,
                    selenium: 34,
                    chromium: 24,
                    molybdenum: 42,
                  } as const;

                  return (
                    atomicNumber[keyA as keyof typeof atomicNumber] -
                    atomicNumber[keyB as keyof typeof atomicNumber]
                  );
                })
                .map(([key, value]) => renderNutrientRow(key, value))}
            </div>

            {/* 脂質詳細 */}
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                {messages['fatty acids']}
              </h5>
              {Object.entries(ingredient.nutritionFacts)
                .filter(([key]) =>
                  [
                    'saturatedFattyAcids',
                    'n3PolyunsaturatedFattyAcids',
                    'n6PolyunsaturatedFattyAcids',
                  ].includes(key)
                )
                .sort(([keyA], [keyB]) => {
                  const order = [
                    'saturatedFattyAcids',
                    'n3PolyunsaturatedFattyAcids',
                    'n6PolyunsaturatedFattyAcids',
                  ];
                  return order.indexOf(keyA) - order.indexOf(keyB);
                })
                .map(([key, value]) => renderNutrientRow(key, value))}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
