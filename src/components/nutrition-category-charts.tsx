import { Card } from '@/components/ui/card';
import { unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type {
  NutritionFactBase,
  FoodRequired,
  ConstraintRange,
} from '@/types/nutrition';

type NutritionCategoryChartsProps = {
  totalNutrition: NutritionFactBase<number>;
  target: NutritionFactBase<ConstraintRange>;
  breakdown: FoodRequired[];
  messages: Message;
};

export default function NutritionCategoryCharts({
  totalNutrition,
  target,
  breakdown,
  messages,
}: NutritionCategoryChartsProps) {
  const categories = [
    {
      id: 'macros',
      name: messages['macronutrients'],
      keys: ['calories', 'protein', 'fat', 'carbohydrates', 'fiber'],
    },

    {
      id: 'fat-soluble-vitamins',
      name: messages['fat-soluble vitamins'],
      keys: ['vitaminA', 'vitaminD', 'vitaminE', 'vitaminK'],
    },
    {
      id: 'water-soluble-vitamins',
      name: messages['water-soluble vitamins'],
      keys: [
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
      id: 'macro-minerals',
      name: messages['macro-minerals'],
      keys: ['potassium', 'calcium', 'magnesium', 'phosphorus', 'nacl'],
    },
    {
      id: 'trace-minerals',
      name: messages['micro-minerals'],
      keys: [
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
      name: messages['fatty acids'],
      keys: [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ],
    },
  ] as const;

  /**
   * 達成率を計算する関数
   * @param value 実際の栄養素の値
   * @param constraintRange 制約の範囲
   * @returns 達成率 (%)
   */
  const calculateAchievement = (
    value: number,
    constraintRange: ConstraintRange
  ): number => {
    if ('equal' in constraintRange) {
      return (value / constraintRange.equal) * 100;
    }

    // 下限のみある場合（最低摂取量を満たすべき栄養素）
    if ('min' in constraintRange && !('max' in constraintRange)) {
      return (value / constraintRange.min) * 100;
    }

    // 上限のみある場合（摂りすぎに注意すべき栄養素）
    if (!('min' in constraintRange && 'max' in constraintRange)) {
      if (value < constraintRange.max) {
        return 100;
      }
      return (constraintRange.max / value) * 100; // 逆数とする
    }

    // 両方ある場合（適正範囲のある栄養素）
    if ('min' in constraintRange && 'max' in constraintRange) {
      if (value < constraintRange.min) {
        // 下限未満の場合は達成率を下限に対する割合で表す
        return (value / constraintRange.min) * 100;
      }
      // 範囲内なら100%
      return 100;
    }
    const _never: never = constraintRange;

    throw new Error(`Unexpected constraintRange:`, _never);
  };

  // 食材ごとの色
  const ingredientColors = [
    'bg-teal-400',
    'bg-emerald-400',
    'bg-green-400',
    'bg-lime-400',
    'bg-yellow-400',
    'bg-amber-400',
    'bg-orange-400',
    'bg-cyan-400',
  ];

  // 栄養素データを表示する関数
  const renderNutrientData = (key: keyof NutritionFactBase<number>) => {
    const nutrientKey = key as keyof NutritionFactBase<number>;
    const value = totalNutrition[nutrientKey];
    const targetValue =
      target[nutrientKey as keyof NutritionFactBase<ConstraintRange>];
    const achievement = calculateAchievement(value, targetValue);

    // 各食材の寄与度を計算
    const contributions = breakdown.map((food) => {
      const nutrientValue = food.nutritionFacts[nutrientKey] || 0;
      return {
        name: food.type === 'estat' ? food.nameInEstat : food.productName,
        value: nutrientValue,
        percentage: value > 0 ? (nutrientValue / value) * 100 : 0,
      };
    });

    return (
      <div key={key} className="space-y-2 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-medium text-emerald-800">
              {messages[key] || key}
            </h3>
            <p className="text-sm text-gray-600">
              {value.toLocaleString('ja-JP', {
                maximumFractionDigits: 1,
              })}
              {unitMap[key]}
              {'min' in targetValue &&
                ` / 目標: ${targetValue.min.toFixed(1)}${unitMap[key]}`}
              {'max' in targetValue &&
                ` (上限: ${targetValue.max.toFixed(1)}${unitMap[key]})`}
            </p>
          </div>
          <div className="text-sm font-medium">
            {messages['achievement rate']}: {Math.round(achievement)}%
          </div>
        </div>

        {/* {messages['achievement rate']}バー */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className={`h-2.5 rounded-full ${
              achievement < 90
                ? 'bg-amber-500'
                : achievement > 110 && 'max' in targetValue
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          ></div>
        </div>

        {/* 食材ごとの寄与度 */}
        <div className="flex h-8 w-full rounded-md overflow-hidden">
          {contributions
            .sort((a, b) => b.percentage - a.percentage)
            .map((contribution, index) => (
              <div
                key={`${key}-${index}`}
                className={`${ingredientColors[index % ingredientColors.length]} h-full`}
                style={{ width: `${contribution.percentage}%` }}
                title={`${contribution.name}: ${contribution.value}${unitMap[key]} (${Math.round(contribution.percentage)}%)`}
              ></div>
            ))}
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
          {contributions
            .filter((contr) => contr.percentage > 0.5)
            .sort((a, b) => b.percentage - a.percentage)
            .map((contribution, index) => (
              <div
                key={`legend-${key}-${index}`}
                className="flex items-center text-xs"
              >
                <div
                  className={`w-3 h-3 mr-1 ${ingredientColors[index % ingredientColors.length]}`}
                ></div>
                <span
                  className={`${contribution.percentage > 50 ? 'font-bold' : contribution.percentage > 10 ? 'font-normal' : 'font-thin'}`}
                >
                  {contribution.name} ({Math.round(contribution.percentage)}%)
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        {messages['nutrition categorical analysis']}
      </h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <a
            key={category.id}
            href={'#' + category.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:shadow-md
              border border-emerald-200 hover:border-emerald-300
            `}
          >
            {category.name}
          </a>
        ))}
      </div>

      {/* すべてのカテゴリを表示 */}
      <div className="space-y-20">
        {categories.map((category) => (
          <div key={category.id} id={category.id}>
            <h2 className="text-xl font-bold text-emerald-700 mb-4 pt-6 border-t border-emerald-100 first:border-t-0 first:pt-0">
              {category.name}
            </h2>
            <div className="space-y-8">
              {category.keys.map((key) => renderNutrientData(key))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
