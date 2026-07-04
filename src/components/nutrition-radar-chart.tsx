import type { Message } from '@/locales';
import { unitMap } from '@/lib/unitmap';
import { inq, PER_KCAL_MIN_CALORIES } from '@/services/nutrient-density';
import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';

const CENTER_X = 200;
const CENTER_Y = 168;
const RADIUS = 112;
const LABEL_RADIUS = RADIUS + 16;

/**
 * INQ 表示の外周値。これを超える値は外周にクランプし、ラベルには実値を出す
 * （レバーのビタミンA など数十× の外れ値情報を潰さないため）。
 */
const INQ_MAX = 2;

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

const formatInq = (value: number): string => `${formatAmount(value)}×`;

type GridLevel = {
  /** 半径に対する割合 (0..1] */
  fraction: number;
  label: string;
  /** 1×（カロリー相応）の基準リングを強調する */
  emphasized?: boolean;
};

type AxisView = {
  key: string;
  name: string;
  valueText: string;
  /** クランプ済みの半径割合 (0..1) */
  fraction: number;
  /** 鉄・カルシウムのみ: 女性（月経あり）基準の値 */
  female?: { valueText: string; fraction: number };
  tooltip: string;
};

function RadarSvg({
  axes,
  gridLevels,
  ariaLabel,
}: {
  axes: AxisView[];
  gridLevels: GridLevel[];
  ariaLabel: string;
}) {
  const positioned = axes.map((axis, index) => ({
    ...axis,
    angle: angleOf(index, axes.length),
  }));
  return (
    <svg
      viewBox="0 0 400 336"
      className="w-full flex-1 min-h-0"
      role="img"
      aria-label={ariaLabel}
    >
      {gridLevels.map((level) => (
        <polygon
          key={level.fraction}
          points={polygonPoints(axes.map(() => RADIUS * level.fraction))}
          className={
            level.emphasized
              ? 'fill-none stroke-emerald-400'
              : 'fill-none stroke-emerald-200'
          }
          strokeWidth={level.emphasized ? 1.5 : 1}
          strokeDasharray={level.emphasized ? '4 3' : undefined}
        />
      ))}
      {positioned.map((axis) => {
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
      {gridLevels.map((level) => (
        <text
          key={level.fraction}
          x={CENTER_X + 4}
          y={CENTER_Y - RADIUS * level.fraction + 3}
          className="fill-gray-400"
          fontSize="8"
        >
          {level.label}
        </text>
      ))}
      <polygon
        points={polygonPoints(
          positioned.map((axis) => RADIUS * axis.fraction)
        )}
        className="fill-emerald-500/25 stroke-emerald-600"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {positioned.map((axis) => {
        const point = pointAt(axis.angle, RADIUS * axis.fraction);
        return (
          <circle
            key={axis.key}
            cx={point.x.toFixed(1)}
            cy={point.y.toFixed(1)}
            r="3"
            className="fill-emerald-600"
          >
            <title>{axis.tooltip}</title>
          </circle>
        );
      })}
      {positioned.map((axis) => {
        if (!axis.female) return null;
        const point = pointAt(axis.angle, RADIUS * axis.female.fraction);
        return (
          <circle
            key={axis.key}
            cx={point.x.toFixed(1)}
            cy={point.y.toFixed(1)}
            r="3"
            className="fill-white stroke-violet-600"
            strokeWidth="1.5"
          >
            <title>{`♀ ${axis.name}: ${axis.female.valueText}`}</title>
          </circle>
        );
      })}
      {positioned.map((axis) => {
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
              {axis.valueText}
            </tspan>
            {axis.female && (
              <tspan
                x={point.x.toFixed(1)}
                dy="11"
                className="fill-violet-700"
                fontSize="10"
              >
                {`♀ ${axis.female.valueText}`}
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * INQ モード: 「この食材だけで1日のエネルギーを摂ったとき、各栄養素は
 * 1日基準量の何倍か」。1× = カロリー相応。軸は「多いほど良い」栄養素のみに
 * 絞る（脂質・炭水化物は範囲型のため外側=良いという読みが成立しない）。
 * 鉄・カルシウムは性別で基準が大きく変わるため女性（月経あり）基準を併記し、
 * 閲覧者によらず1枚のチャートで正直になるようにする。
 */
function InqRadar({
  nutritionFacts,
  targets,
  messages,
}: {
  nutritionFacts: NutritionFactBase<number>;
  targets: { male: NutritionTarget; female: NutritionTarget };
  messages: Message;
}) {
  const maleEnergy = targets.male.calories.equal;
  const femaleEnergy = targets.female.calories.equal;

  const keyNutrients: {
    key: keyof NutritionFactBase<number>;
    name: string;
    dailyMale: number;
    dailyFemale?: number;
  }[] = [
    {
      key: 'protein',
      name: messages.protein,
      dailyMale: targets.male.protein.min,
    },
    { key: 'fiber', name: messages.fiber, dailyMale: targets.male.fiber.min },
    {
      key: 'vitaminC',
      name: messages.vitaminC,
      dailyMale: targets.male.vitaminC.min,
    },
    {
      key: 'calcium',
      name: messages.calcium,
      dailyMale: targets.male.calcium.min,
      dailyFemale: targets.female.calcium.min,
    },
    {
      key: 'iron',
      name: messages.iron,
      dailyMale: targets.male.iron.min,
      dailyFemale: targets.female.iron.min,
    },
    {
      key: 'vitaminA',
      name: messages.vitaminA,
      dailyMale: targets.male.vitaminA.min,
    },
  ];

  const axes: AxisView[] = keyNutrients.map((nutrient) => {
    const value = nutritionFacts[nutrient.key];
    const male = inq(nutritionFacts, nutrient.key, nutrient.dailyMale, maleEnergy) ?? 0;
    const female =
      nutrient.dailyFemale === undefined
        ? undefined
        : (inq(nutritionFacts, nutrient.key, nutrient.dailyFemale, femaleEnergy) ?? 0);
    return {
      key: nutrient.key,
      name: nutrient.name,
      valueText: formatInq(male),
      fraction: Math.min(male / INQ_MAX, 1),
      female:
        female === undefined
          ? undefined
          : {
              valueText: formatInq(female),
              fraction: Math.min(female / INQ_MAX, 1),
            },
      tooltip: `${nutrient.name}: ${formatAmount(value)} ${unitMap[nutrient.key]} (${formatInq(male)})`,
    };
  });

  const gridLevels: GridLevel[] = [
    { fraction: 0.25, label: formatInq(INQ_MAX * 0.25) },
    { fraction: 0.5, label: formatInq(INQ_MAX * 0.5), emphasized: true },
    { fraction: 0.75, label: formatInq(INQ_MAX * 0.75) },
    { fraction: 1, label: formatInq(INQ_MAX) },
  ];

  // 食塩は上限型: INQ > 1 は「この食材だけでエネルギーを満たすと目標上限を超える」
  const naclMax = targets.male.nacl.max;
  const saltInq =
    naclMax === undefined
      ? undefined
      : inq(nutritionFacts, 'nacl', naclMax, maleEnergy);
  const saltWarning = saltInq !== undefined && saltInq > 1;

  return (
    <div className="w-full h-full flex flex-col">
      <RadarSvg
        axes={axes}
        gridLevels={gridLevels}
        ariaLabel={messages['nutrition rader charts']}
      />
      {saltWarning && (
        <p className="text-xs text-red-600 text-center font-semibold">
          {`${messages.nacl} ${formatInq(saltInq)} — ${messages['exceeds the daily salt limit when this food supplies all daily energy']}`}
        </p>
      )}
      <p className="text-xs text-gray-500 text-center">
        {
          messages[
            'multiples of daily reference when this food supplies all daily energy'
          ]
        }
      </p>
      <p className="text-[10px] text-violet-700 text-center">
        {messages['female reference legend for iron and calcium']}
      </p>
    </div>
  );
}

/**
 * フォールバック: エネルギー源にならない食材（水・こんにゃく等）では
 * 「この食材でエネルギーを摂る」という INQ の仮定が成立しないため、
 * 従来の可食部100gあたり %基準量 表示に切り替える。
 */
function Per100gRadar({
  nutritionFacts,
  reference,
  messages,
}: {
  nutritionFacts: NutritionFactBase<number>;
  reference: NutritionTarget;
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
      dailyIntake: reference.calories.equal,
    },
    {
      key: 'carbohydrates',
      name: messages.carbohydrates,
      dailyIntake: reference.carbohydrates.min,
    },
    { key: 'protein', name: messages.protein, dailyIntake: reference.protein.min },
    { key: 'fat', name: messages.fat, dailyIntake: reference.fat.min },
    {
      key: 'vitaminC',
      name: messages.vitaminC,
      dailyIntake: reference.vitaminC.min,
    },
    {
      key: 'calcium',
      name: messages.calcium,
      dailyIntake: reference.calcium.min,
    },
    { key: 'iron', name: messages.iron, dailyIntake: reference.iron.min },
    { key: 'fiber', name: messages.fiber, dailyIntake: reference.fiber.min },
    {
      key: 'vitaminA',
      name: messages.vitaminA,
      dailyIntake: reference.vitaminA.min,
    },
  ];

  const axes: AxisView[] = keyNutrients.map((nutrient) => {
    const value = nutritionFacts[nutrient.key];
    const ratio = nutrient.dailyIntake > 0 ? value / nutrient.dailyIntake : 0;
    return {
      key: nutrient.key,
      name: nutrient.name,
      valueText: `${Math.round(ratio * 100).toLocaleString('ja-JP')}%`,
      fraction: Math.min(ratio, 1),
      tooltip: `${nutrient.name}: ${formatAmount(value)} ${unitMap[nutrient.key]} / ${formatAmount(nutrient.dailyIntake)} ${unitMap[nutrient.key]}`,
    };
  });

  const gridLevels: GridLevel[] = [0.25, 0.5, 0.75, 1].map((fraction) => ({
    fraction,
    label: `${fraction * 100}%`,
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <RadarSvg
        axes={axes}
        gridLevels={gridLevels}
        ariaLabel={messages['nutrition rader charts']}
      />
      <p className="text-xs text-gray-500 text-center">
        {messages['Share of daily reference intake per 100 g']}
      </p>
      <p className="text-[10px] text-gray-400 text-center">
        {messages['too low in calories for INQ']}
      </p>
    </div>
  );
}

export default function NutritionRadarChart({
  nutritionFacts,
  targets,
  messages,
}: {
  nutritionFacts: NutritionFactBase<number>;
  /** 代表プロフィールの1日基準量。詳細ページは静的生成のため全閲覧者共通。 */
  targets: { male: NutritionTarget; female: NutritionTarget };
  messages: Message;
}) {
  return nutritionFacts.calories > PER_KCAL_MIN_CALORIES ? (
    <InqRadar
      nutritionFacts={nutritionFacts}
      targets={targets}
      messages={messages}
    />
  ) : (
    <Per100gRadar
      nutritionFacts={nutritionFacts}
      reference={targets.male}
      messages={messages}
    />
  );
}
