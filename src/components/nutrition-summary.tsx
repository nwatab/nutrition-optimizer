import type {
  ConstraintRange,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';
import { Card } from '@/components/ui/card';

type NutritionSummaryProps = {
  totalCost: number;
  totalNutrition: NutritionFactBase<number>;
  target: NutritionTarget;
};

export default function NutritionSummary({
  totalCost,
  totalNutrition,
  target,
}: NutritionSummaryProps) {
  const calculateAchievement = (
    value: number,
    constraintRange: ConstraintRange
  ): { percentage: number; status: 'low' | 'optimal' | 'high' } => {
    if ('equal' in constraintRange) {
      const percentage = (value / constraintRange.equal) * 100;
      if (percentage > 110) {
        return {
          percentage,
          status: 'high',
        };
      }
      if (percentage < 90) {
        return {
          percentage,
          status: 'low',
        };
      }

      return {
        percentage: percentage,
        status: 'optimal',
      };
    }
    const ipsiron = 0.01;
    const excessSafetyMargin = 0.2;
    if ('min' in constraintRange && !('max' in constraintRange)) {
      const percentage = (value / constraintRange.min) * 100;
      if (value < constraintRange.min * (1 - ipsiron))
        return { percentage, status: 'low' };
      return { percentage, status: 'optimal' };
    }

    if (!('min' in constraintRange) && 'max' in constraintRange) {
      const percentage = (value / constraintRange.max) * 100;
      if (value > constraintRange.max * (1 + excessSafetyMargin))
        return { percentage, status: 'high' };
      return { percentage, status: 'optimal' };
    }

    // min と max の両方がある場合
    if ('min' in constraintRange && 'max' in constraintRange) {
      if (value < constraintRange.min * (1 - ipsiron)) {
        return {
          percentage: (value / constraintRange.min) * 100,
          status: 'low',
        };
      }
      if (value > constraintRange.max * (1 + excessSafetyMargin)) {
        return {
          percentage: (value / constraintRange.max) * 100,
          status: 'high',
        };
      }
      // 範囲内の場合、最小値からの達成率を計算
      return {
        percentage: (value / constraintRange.min) * 100,
        status: 'optimal',
      };
    }
    const _never: never = constraintRange;
    console.error(`constraintRange is ${_never}`);

    return { percentage: 100, status: 'optimal' };
  };

  // 主要な栄養素の達成状況
  const keyNutrients = [
    { name: 'カロリー', key: 'calories', unit: 'kcal' },
    { name: 'タンパク質', key: 'protein', unit: 'g' },
    { name: '脂質', key: 'fat', unit: 'g' },
    { name: '炭水化物', key: 'carbohydrates', unit: 'g' },
    { name: '食物繊維', key: 'fiber', unit: 'g' },
  ] as const;

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        栄養摂取サマリー
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <p className="text-lg font-medium text-gray-700">総コスト</p>
          <p className="text-3xl font-bold text-emerald-700">
            {totalCost.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
            <span className="text-sm ml-2">円/日</span>
          </p>
        </div>

        <div className="mt-6 md:mt-0">
          <p className="text-lg font-medium text-gray-700">1日あたりの摂取量</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyNutrients.map(({ name, key, unit }) => {
          const value = totalNutrition[key as keyof NutritionFactBase<number>];
          const targetValue =
            target[key as keyof NutritionFactBase<ConstraintRange>];
          const achievement = calculateAchievement(value, targetValue);

          return (
            <div key={key} className="relative">
              <div className="flex items-end mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {name}
                </span>
                <span className="flex-grow"></span>
                <span className="text-sm font-medium text-gray-700 mr-1">
                  {value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  {unit}
                </span>
                <span className="text-xs">
                  {'min' in targetValue &&
                    !('max' in targetValue) &&
                    ` / ${targetValue.min.toLocaleString('ja-JP', {
                      maximumFractionDigits: 0,
                    })} ${unit}`}
                  {!('min' in targetValue) &&
                    'max' in targetValue &&
                    ` / ${targetValue.max.toLocaleString('ja-JP', {
                      maximumFractionDigits: 0,
                    })} ${unit}`}
                  {'min' in targetValue &&
                    'max' in targetValue &&
                    ` / ${targetValue.min.toLocaleString('ja-JP', {
                      maximumFractionDigits: 0,
                    })} - ${targetValue.max.toLocaleString('ja-JP', {
                      maximumFractionDigits: 0,
                    })} ${unit}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    achievement.status === 'optimal'
                      ? 'bg-emerald-500'
                      : achievement.status === 'low'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(achievement.percentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                {achievement.status === 'optimal'
                  ? '最適'
                  : achievement.status === 'low'
                    ? '目標量を満たすが余裕はない'
                    : '過剰気味'}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
