import { Card } from '@/components/ui/card';
import type {
  NutritionFactBase,
  FoodRequired,
  ConstraintRange,
} from '@/types/nutrition';

type NutritionCategoryChartsProps = {
  totalNutrition: NutritionFactBase<number>;
  target: NutritionFactBase<ConstraintRange>;
  breakdown: FoodRequired[];
};

export default function NutritionCategoryCharts({
  totalNutrition,
  target,
  breakdown,
}: NutritionCategoryChartsProps) {
  // 栄養素カテゴリー

  // 以下で分けたい
  //   　ビタミン（脂溶性ビタミン）［1.5MB］別ウィンドウで開く
  // 　　ビタミン（水溶性ビタミン）［1.4MB］別ウィンドウで開く
  // 　　ミネラル（多量ミネラル）［1.3MB］別ウィンドウで開く
  // 　　ミネラル（微量ミネラル）［1.5MB］別ウィンドウで開く
  const categories = [
    {
      id: 'macros',
      name: 'マクロ栄養素',
      keys: ['calories', 'protein', 'fat', 'carbohydrates', 'fiber'],
    },

    {
      id: 'fat-soluble-vitamins',
      name: '脂溶性ビタミン',
      keys: ['vitaminA', 'vitaminD', 'vitaminE', 'vitaminK'],
    },
    {
      id: 'water-soluble-vitamins',
      name: '水溶性ビタミン',
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
      name: '多量ミネラル',
      keys: ['potassium', 'calcium', 'magnesium', 'phosphorus', 'nacl'],
    },
    {
      id: 'trace-minerals',
      name: '微量ミネラル',
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
  const renderNutrientData = (key: string) => {
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
              {nutrientNames[key] || key}
            </h3>
            <p className="text-sm text-gray-600">
              {value.toLocaleString('ja-JP', {
                maximumFractionDigits: 1,
              })}
              {nutrientUnits[key]}
              {'min' in targetValue &&
                ` / 目標: ${targetValue.min.toFixed(1)}${nutrientUnits[key]}`}
              {'max' in targetValue &&
                ` (上限: ${targetValue.max.toFixed(1)}${nutrientUnits[key]})`}
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
                title={`${contribution.name}: ${contribution.value}${nutrientUnits[key]} (${Math.round(contribution.percentage)}%)`}
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
        栄養素カテゴリー分析
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
