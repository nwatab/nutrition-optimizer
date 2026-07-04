import type { Message } from '@/locales';
import { unitMap } from '@/lib/unitmap';
import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';

const CENTER_X = 200;
const CENTER_Y = 168;
const RADIUS = 112;
const LABEL_RADIUS = RADIUS + 16;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1] as const;

const angleOf = (index: number, count: number): number =>
  (index / count) * 2 * Math.PI;

const pointAt = (angle: number, radius: number): { x: number; y: number } => ({
  x: CENTER_X + radius * Math.sin(angle),
  y: CENTER_Y - radius * Math.cos(angle),
});

const polygonPoints = (radii: readonly number[]): string =>
  radii
    .map((radius, index) => {
      const { x, y } = pointAt(angleOf(index, radii.length), radius);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

/** 軸ラベルのアンカー。左右の軸は外側へ、真上・真下は中央揃え。 */
const anchorOf = (angle: number): 'start' | 'middle' | 'end' => {
  const sin = Math.sin(angle);
  if (Math.abs(sin) < 0.15) return 'middle';
  return sin > 0 ? 'start' : 'end';
};

const formatAmount = (value: number): string =>
  value.toLocaleString('ja-JP', { maximumFractionDigits: 1 });

export default function NutritionRadarChart({
  nutritionFacts,
  referenceDailyIntakes,
  messages,
}: {
  nutritionFacts: NutritionFactBase<number>;
  referenceDailyIntakes: NutritionTarget;
  messages: Message;
}) {
  const keyNutrients: {
    key: keyof NutritionFactBase<number>;
    name: string;
    dailyIntake: number;
  }[] = [
    {
      key: 'calories',
      name: messages.calories,
      dailyIntake: referenceDailyIntakes.calories.equal,
    },
    {
      key: 'carbohydrates',
      name: messages.carbohydrates,
      dailyIntake: referenceDailyIntakes.carbohydrates.min,
    },
    {
      key: 'protein',
      name: messages.protein,
      dailyIntake: referenceDailyIntakes.protein.min,
    },
    {
      key: 'fat',
      name: messages.fat,
      dailyIntake: referenceDailyIntakes.fat.min,
    },
    {
      key: 'vitaminC',
      name: messages.vitaminC,
      dailyIntake: referenceDailyIntakes.vitaminC.min,
    },
    {
      key: 'calcium',
      name: messages.calcium,
      dailyIntake: referenceDailyIntakes.calcium.min,
    },
    {
      key: 'iron',
      name: messages.iron,
      dailyIntake: referenceDailyIntakes.iron.min,
    },
    {
      key: 'fiber',
      name: messages.fiber,
      dailyIntake: referenceDailyIntakes.fiber.min,
    },
    {
      key: 'vitaminA',
      name: messages.vitaminA,
      dailyIntake: referenceDailyIntakes.vitaminA.min,
    },
  ];

  const axes = keyNutrients.map((nutrient, index) => {
    const value = nutritionFacts[nutrient.key];
    const ratio = nutrient.dailyIntake > 0 ? value / nutrient.dailyIntake : 0;
    return {
      ...nutrient,
      index,
      value,
      ratio,
      angle: angleOf(index, keyNutrients.length),
      unit: unitMap[nutrient.key],
    };
  });

  return (
    <div className="w-full h-full flex flex-col">
      <svg
        viewBox="0 0 400 336"
        className="w-full flex-1 min-h-0"
        role="img"
        aria-label={messages['nutrition rader charts']}
      >
        {GRID_LEVELS.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(axes.map(() => RADIUS * level))}
            className="fill-none stroke-emerald-200"
            strokeWidth="1"
          />
        ))}
        {axes.map((axis) => {
          const outer = pointAt(axis.angle, RADIUS);
          return (
            <line
              key={axis.key}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={outer.x.toFixed(1)}
              y2={outer.y.toFixed(1)}
              className="stroke-emerald-200"
              strokeWidth="1"
            />
          );
        })}
        {GRID_LEVELS.map((level) => (
          <text
            key={level}
            x={CENTER_X + 4}
            y={CENTER_Y - RADIUS * level + 3}
            className="fill-gray-400"
            fontSize="8"
          >
            {level * 100}%
          </text>
        ))}
        <polygon
          points={polygonPoints(
            axes.map((axis) => RADIUS * Math.min(axis.ratio, 1))
          )}
          className="fill-emerald-500/25 stroke-emerald-600"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {axes.map((axis) => {
          const point = pointAt(axis.angle, RADIUS * Math.min(axis.ratio, 1));
          return (
            <circle
              key={axis.key}
              cx={point.x.toFixed(1)}
              cy={point.y.toFixed(1)}
              r="3"
              className="fill-emerald-600"
            >
              <title>
                {`${axis.name}: ${formatAmount(axis.value)} ${axis.unit} / ${formatAmount(axis.dailyIntake)} ${axis.unit}`}
              </title>
            </circle>
          );
        })}
        {axes.map((axis) => {
          const point = pointAt(axis.angle, LABEL_RADIUS);
          // 真上の軸はラベルを上へ、真下の軸は下へ逃がして重なりを防ぐ
          const yOffset = -Math.cos(axis.angle) * 8;
          return (
            <text
              key={axis.key}
              x={point.x.toFixed(1)}
              y={(point.y + yOffset).toFixed(1)}
              textAnchor={anchorOf(axis.angle)}
              className="fill-gray-700"
              fontSize="11"
            >
              <tspan>{axis.name}</tspan>
              <tspan
                x={point.x.toFixed(1)}
                dy="12"
                className="fill-emerald-700 font-semibold"
                fontSize="10"
              >
                {Math.round(axis.ratio * 100).toLocaleString('ja-JP')}%
              </tspan>
            </text>
          );
        })}
      </svg>
      <p className="text-xs text-gray-500 text-center">
        {messages['Share of daily reference intake per 100 g']}
      </p>
    </div>
  );
}
