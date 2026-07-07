'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import IngredientsList from '@/components/ingredients-list';
import IngredientsListDetail from '@/components/ingredients-list-detail';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/config';
import { BASE_PATH } from '@/lib/base-path';
import {
  PRICE_PRESETS,
  ZERO_WEIGHTS,
  hasNonZeroWeights,
  readStoredWeights,
  writeStoredWeights,
  type PricePresetId,
} from '@/lib/environmental-prices';
import type { Message } from '@/locales';
import type { ScalarizationWeights } from '@/services/domination';
import { optimizeDiet } from '@/services/optimizer';
import type { FoodToOptimize, NutritionTarget } from '@/types/nutrition';

type PlanResult = ReturnType<typeof optimizeDiet>;

const PRESET_LABELS: Record<PricePresetId, keyof Message> = {
  zero: 'no pricing',
  market: 'market price guide',
  socialCost: 'social cost guide',
};

const SLIDERS = [
  ['yenPerKgCo2e', 'CO2e price [yen/kg-CO2e]', 'co2e price reference', 100],
  ['yenPerM2Land', 'land price [yen/m2]', 'land price reference', 20],
  ['yenPerLWater', 'water price [yen/L]', 'water price reference', 1],
] as const;

const sameWeights = (
  a: ScalarizationWeights,
  b: ScalarizationWeights
): boolean =>
  a.yenPerKgCo2e === b.yenPerKgCo2e &&
  a.yenPerM2Land === b.yenPerM2Land &&
  a.yenPerLWater === b.yenPerLWater;

/**
 * 献立の結果表示 + 環境コストの価格づけパネル。
 * 静的ページは価格 0（円のみ最小化）で生成し、保存済みの価格が
 * 0 でないときだけ foods を取得してブラウザ内で再最適化する。
 */
export default function RecommendationResults({
  initialPlan,
  target,
  messages,
  locale,
}: {
  initialPlan: PlanResult;
  target: NutritionTarget;
  messages: Message;
  locale: Locale;
}) {
  // SSG の出力（価格 0）と一致させるため、初期値は 0 にして
  // マウント後に保存済みの価格を読む。
  const [weights, setWeights] = useState<ScalarizationWeights>(ZERO_WEIGHTS);
  const [foods, setFoods] = useState<FoodToOptimize[] | null>(null);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'error'>(
    'idle'
  );

  useEffect(() => {
    setWeights(readStoredWeights());
  }, []);

  useEffect(() => {
    if (!hasNonZeroWeights(weights) || foods !== null || fetchState !== 'idle')
      return;
    // fetchState を 'loading' にすると effect は再実行されるが、上のガードで
    // 二重取得にはならない。cleanup で破棄すると自身の setState が取得結果を
    // 捨ててしまうため、あえて破棄しない（unmount 後の setState は無害）。
    setFetchState('loading');
    fetch(`${BASE_PATH}/api/foods`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data: FoodToOptimize[]) => {
        setFoods(data);
        setFetchState('idle');
      })
      .catch(() => {
        setFetchState('error');
      });
  }, [weights, foods, fetchState]);

  const updateWeights = (next: ScalarizationWeights) => {
    setWeights(next);
    writeStoredWeights(next);
    // 失敗後に価格を触ったら再取得を試せるように戻す
    setFetchState((state) => (state === 'error' ? 'idle' : state));
  };

  // 価格 0 ならビルド時の解をそのまま使う（再計算不要で SSG と一致）。
  // stale = 価格は 0 でないが foods 未取得等でまだ価格 0 の解を表示中。
  const plan = useMemo((): { result: PlanResult; stale: boolean } => {
    if (!hasNonZeroWeights(weights)) return { result: initialPlan, stale: false };
    if (foods === null) return { result: initialPlan, stale: true };
    try {
      return { result: optimizeDiet(foods, target, weights), stale: false };
    } catch {
      return { result: initialPlan, stale: true };
    }
  }, [weights, foods, target, initialPlan]);

  const { result } = plan;

  return (
    <div className="grid gap-8">
      <Card>
        <CardContent className="p-6 grid gap-3">
          <h2 className="text-lg font-semibold text-emerald-800">
            {messages['environmental pricing']}
          </h2>
          <p className="text-xs text-gray-500">
            {messages['environmental pricing intro']}
          </p>
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateWeights(preset.weights)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  sameWeights(weights, preset.weights)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {messages[PRESET_LABELS[preset.id]]}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SLIDERS.map(([field, labelKey, referenceKey, max]) => (
              <label key={field} className="text-sm text-gray-700">
                {messages[labelKey]}: {weights[field]}
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={max / 100}
                  value={weights[field]}
                  onChange={(event) =>
                    updateWeights({
                      ...weights,
                      [field]: Number(event.target.value),
                    })
                  }
                  className="w-full"
                />
                <span className="block text-xs font-normal text-gray-500">
                  {messages[referenceKey]}
                </span>
              </label>
            ))}
          </div>
          {fetchState === 'loading' && plan.stale && (
            <p className="text-sm text-emerald-700">
              {messages['recalculating the plan']}
            </p>
          )}
          {fetchState === 'error' && (
            <p className="text-sm text-red-700">
              {messages['failed to recalculate']}
            </p>
          )}
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
            <div>
              <dt className="inline text-gray-500">
                {messages['food spending [yen]']}:{' '}
              </dt>
              <dd className="inline font-medium">
                {result.totalYen.toFixed(0)}
              </dd>
            </div>
            {hasNonZeroWeights(weights) && !plan.stale && (
              <div>
                <dt className="inline text-gray-500">
                  {messages['total cost incl. environmental impact [yen]']}:{' '}
                </dt>
                <dd className="inline font-medium">
                  {result.totalCost.toFixed(0)}
                </dd>
              </div>
            )}
            <div>
              <dt className="inline text-gray-500">CO2e [kg]: </dt>
              <dd className="inline font-medium">
                {result.environmentalTotals.co2eKg.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="inline text-gray-500">
                {messages.land} [m²]:{' '}
              </dt>
              <dd className="inline font-medium">
                {result.environmentalTotals.landM2.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="inline text-gray-500">
                {messages.water} [L]:{' '}
              </dt>
              <dd className="inline font-medium">
                {result.environmentalTotals.waterL.toFixed(0)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 総合サマリー（コストは円の支出。環境コスト込みの値は上のパネルに表示） */}
      <NutritionSummary
        totalCost={result.totalYen}
        totalNutrition={result.totalNutritionFacts}
        target={target}
        messages={messages}
      />

      {/* 食材リスト */}
      <IngredientsList
        ingredients={result.breakdown}
        messages={messages}
        locale={locale}
      />
      {/* 選定根拠への導線: 選ばれた食材を比較グラフ上でハイライトする */}
      <p className="-mt-4 text-center">
        <Link
          href={`/${locale}/compare?highlight=${result.breakdown
            .map((ingredient) => encodeURIComponent(ingredient.id))
            .join(',')}`}
          className="text-sm text-emerald-700 underline hover:text-emerald-900"
        >
          {messages['Why these foods? See the rationale on the Hasse diagram']}{' '}
          →
        </Link>
      </p>
      <IngredientsListDetail
        ingredients={result.breakdown}
        referenceDailyIntakes={target}
        messages={messages}
        locale={locale}
      />
      {/* 栄養素カテゴリー別チャート */}
      <NutritionCategoryCharts
        totalNutrition={result.totalNutritionFacts}
        target={target}
        breakdown={result.breakdown}
        messages={messages}
        locale={locale}
      />
    </div>
  );
}
