'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import type { Locale } from '@/config';
import { unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type { NutrientKey } from '@/services/diagnose';
import {
  hasseEdges,
  skyline,
  type ComparisonAxes,
  type CostAxis,
} from '@/services/domination';
import type { CompareNode } from '@/services/environment';
import type { Basis } from '@/services/nutrient-density';

/** Hasse 図の層。上位互換の側が上（層0 = どの食品にも上位互換されない）。 */
const computeLayers = (
  nodes: CompareNode[],
  edges: { from: string; to: string }[]
): Map<string, number> => {
  const parents = new Map<string, string[]>();
  edges.forEach(({ from, to }) =>
    parents.set(to, [...(parents.get(to) ?? []), from])
  );
  const memo = new Map<string, number>();
  const layerOf = (id: string): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    const dominators = parents.get(id) ?? [];
    const layer =
      dominators.length === 0 ? 0 : 1 + Math.max(...dominators.map(layerOf));
    memo.set(id, layer);
    return layer;
  };
  nodes.forEach((node) => layerOf(node.id));
  return memo;
};

export const truncate = (text: string, length: number): string =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const NODE_WIDTH = 150;
const COLUMN_GAP = 12;
const ROW_GAP = 10;
/** 層間の余白。ここに層をまたぐ線が描かれる。 */
const LAYER_GAP = 60;
const TOP_PAD = 4;
/** 1層が横に伸び続けないよう、この列数で折り返す。 */
const MAX_PER_ROW = 7;
/** 名前行・摂取形態行 + 選択中の軸1行あたり11px。 */
const nodeHeight = (axisCount: number): number => 33 + 11 * axisCount;

const chunk = <T,>(items: readonly T[], size: number): T[][] =>
  items.length === 0
    ? []
    : [items.slice(0, size), ...chunk(items.slice(size), size)];

type Position = { x: number; y: number };

/**
 * コストベクトル上の半順序の Hasse 図。上ほど優位（上位互換の側）。
 * 選択中の栄養素の値は食品カードに直接表示する。
 * どの食品とも線で結ばれない食品は図に混ぜず、下の別セクションに分ける
 * （層0に置くと「最上位」に見えてしまうため）。
 * 食品カードのクリックで食品詳細ページへ遷移する。
 * highlightedIds はサーバーコンポーネントからも渡せるよう配列で受ける。
 */
export const HasseDiagram = ({
  nodes,
  axes,
  highlightedIds,
  locale,
  messages,
  basis = 'per100g',
  showHighlightCount = true,
}: {
  nodes: CompareNode[];
  /** 比較に使う軸（栄養は多いほど・コストは少ないほど良い） */
  axes: ComparisonAxes;
  highlightedIds: readonly string[];
  locale: Locale;
  messages: Message;
  /** 栄養密度の基準。カードに表示する単位の分母に使う。 */
  basis?: Basis;
  /** 局所ビュー（食品詳細）では「ハイライト中: n 食材」の凡例が冗長なため消せる */
  showHighlightCount?: boolean;
}) => {
  const router = useRouter();
  const highlighted = useMemo(() => new Set(highlightedIds), [highlightedIds]);
  const edges = useMemo(() => hasseEdges(nodes, axes), [nodes, axes]);
  const front = useMemo(
    () => new Set(skyline(nodes, axes).map((n) => n.id)),
    [nodes, axes]
  );
  const linked = useMemo(
    () => new Set(edges.flatMap(({ from, to }) => [from, to])),
    [edges]
  );
  const connected = useMemo(
    () => nodes.filter((node) => linked.has(node.id)),
    [nodes, linked]
  );
  const isolated = useMemo(
    () => nodes.filter((node) => !linked.has(node.id)),
    [nodes, linked]
  );
  const layers = useMemo(
    () => computeLayers(connected, edges),
    [connected, edges]
  );

  const height = nodeHeight(axes.nutrientKeys.length + axes.costAxes.length);

  // 層ごとに MAX_PER_ROW で折り返した格子状レイアウト
  const layout = useMemo(() => {
    const grouped = connected.reduce((acc, node) => {
      const layer = layers.get(node.id) ?? 0;
      return acc.set(layer, [...(acc.get(layer) ?? []), node]);
    }, new Map<number, CompareNode[]>());
    const layerRows = [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, layerNodes]) => chunk(layerNodes, MAX_PER_ROW));
    const layerHeights = layerRows.map(
      (rows) => rows.length * (height + ROW_GAP) - ROW_GAP
    );
    const layerTops = layerHeights.reduce<number[]>(
      (tops, _, index) => [
        ...tops,
        index === 0
          ? TOP_PAD
          : tops[index - 1] + layerHeights[index - 1] + LAYER_GAP,
      ],
      []
    );
    const positions = new Map<string, Position>(
      layerRows.flatMap((rows, layerIndex) =>
        rows.flatMap((row, rowIndex) =>
          row.map((node, columnIndex): [string, Position] => [
            node.id,
            {
              x: columnIndex * (NODE_WIDTH + COLUMN_GAP) + NODE_WIDTH / 2,
              y:
                layerTops[layerIndex] +
                rowIndex * (height + ROW_GAP) +
                height / 2,
            },
          ])
        )
      )
    );
    const columns = Math.max(
      1,
      ...layerRows.flatMap((rows) => rows.map((row) => row.length))
    );
    return {
      positions,
      width: columns * (NODE_WIDTH + COLUMN_GAP),
      totalHeight:
        layerHeights.length === 0
          ? 0
          : layerTops[layerTops.length - 1] +
            layerHeights[layerHeights.length - 1] +
            TOP_PAD,
    };
  }, [connected, layers, height]);

  const isolatedRows = useMemo(() => chunk(isolated, MAX_PER_ROW), [isolated]);

  // 単位: 基準が 1円/1kcal あたりのときは分母を明示する
  const basisSuffix =
    basis === 'perYen' ? `/${messages.yen}` : basis === 'perKcal' ? '/kcal' : '';
  const unitOf = (key: NutrientKey): string => `${unitMap[key]}${basisSuffix}`;
  const costLabels: Record<CostAxis, string> = {
    yen: messages.price,
    co2eKg: 'CO2e',
    landM2: messages.land,
    waterL: messages.water,
  };
  const costUnits: Record<CostAxis, string> = {
    yen: messages.yen,
    co2eKg: 'kg',
    landM2: 'm²',
    waterL: 'L',
  };

  // 栄養素はカードに表示済みなので、ツールチップはコスト内訳だけにする
  const tooltip = (node: CompareNode): string =>
    [
      node.label,
      `${messages['intake form']}: ${messages[node.intakeForm]} / ${messages.distribution}: ${messages.retail} / ${node.productionMethod === 'organic' ? messages.organic : messages.conventional}`,
      `${messages.yen}: ${node.costVector.yen.toPrecision(3)}`,
      `CO2e: ${node.costVector.co2eKg.toPrecision(3)} kg`,
      `${messages.land}: ${node.costVector.landM2.toPrecision(3)} m²`,
      `${messages.water}: ${node.costVector.waterL.toPrecision(3)} L`,
      ...(node.pesticideResidue
        ? [messages['pesticide residue: present (health impact not assessed)']]
        : []),
    ].join('\n');

  const renderCard = (node: CompareNode, position: Position) => {
    const organic = node.productionMethod === 'organic';
    const dominated = !front.has(node.id);
    const isHighlighted = highlighted.has(node.id);
    return (
      <g
        key={node.id}
        transform={`translate(${position.x - NODE_WIDTH / 2}, ${position.y - height / 2})`}
        // 上位互換のある食品（有機を含む）も隠さず、薄くして表示する。
        // ハイライト対象は導線元（リコメンド等）の注目食品なので薄くしない。
        opacity={dominated && !isHighlighted ? 0.55 : 1}
        className="cursor-pointer"
        onClick={() => router.push(`/${locale}/foods/${node.foodId}`)}
      >
        <title>{tooltip(node)}</title>
        <rect
          width={NODE_WIDTH}
          height={height}
          rx={6}
          fill={organic ? '#dcfce7' : isHighlighted ? '#fffbeb' : '#ffffff'}
          stroke={isHighlighted ? '#f59e0b' : organic ? '#16a34a' : '#64748b'}
          strokeWidth={isHighlighted ? 3 : front.has(node.id) ? 2 : 1}
        />
        <text x={6} y={13} fontSize={10} fill="#0f172a">
          {truncate(node.label, 13)}
          {organic ? ' 🌱' : ''}
        </text>
        <text x={6} y={25} fontSize={9} fill="#475569">
          {messages[node.intakeForm]}
          {dominated ? ` / ${messages.dominated}` : ''}
          {node.pesticideResidue
            ? ` / ${messages['pesticide residue (not assessed)']}`
            : ''}
        </text>
        {axes.nutrientKeys.map((key, index) => (
          <g key={key}>
            <text x={6} y={36 + index * 11} fontSize={8.5} fill="#475569">
              {truncate(messages[key], 9)}
            </text>
            <text
              x={NODE_WIDTH - 6}
              y={36 + index * 11}
              fontSize={8.5}
              fill="#0f172a"
              textAnchor="end"
            >
              {node.nutrientDensity[key].toPrecision(3)} {unitOf(key)}
            </text>
          </g>
        ))}
        {axes.costAxes.map((axis, index) => (
          <g key={axis}>
            <text
              x={6}
              y={36 + (axes.nutrientKeys.length + index) * 11}
              fontSize={8.5}
              fill="#475569"
            >
              {truncate(costLabels[axis], 9)}
            </text>
            <text
              x={NODE_WIDTH - 6}
              y={36 + (axes.nutrientKeys.length + index) * 11}
              fontSize={8.5}
              fill="#0f172a"
              textAnchor="end"
            >
              {node.costVector[axis].toPrecision(3)} {costUnits[axis]}
              {basisSuffix}
            </text>
          </g>
        ))}
      </g>
    );
  };

  const highlightedCount = nodes.filter((node) =>
    highlighted.has(node.id)
  ).length;

  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-xs text-gray-500">
        {messages['hasse orientation note']}
      </p>
      {showHighlightCount && highlightedCount > 0 && (
        <p className="mb-2 text-xs font-medium text-amber-700">
          {messages['Highlighting {count} foods'].replace(
            '{count}',
            String(highlightedCount)
          )}
        </p>
      )}
      {connected.length > 0 && (
        <svg width={layout.width} height={layout.totalHeight}>
          {edges.map(({ from, to }) => {
            const a = layout.positions.get(from);
            const b = layout.positions.get(to);
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y + height / 2}
                x2={b.x}
                y2={b.y - height / 2}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            );
          })}
          {connected.map((node) => {
            const position = layout.positions.get(node.id);
            return position ? renderCard(node, position) : null;
          })}
        </svg>
      )}
      {isolated.length > 0 && (
        <>
          <p className="mt-6 mb-2 text-xs font-medium text-gray-600">
            {messages['isolated foods heading']}
          </p>
          <svg
            width={
              Math.min(isolated.length, MAX_PER_ROW) * (NODE_WIDTH + COLUMN_GAP)
            }
            height={
              isolatedRows.length * (height + ROW_GAP) - ROW_GAP + 2 * TOP_PAD
            }
          >
            {isolatedRows.flatMap((row, rowIndex) =>
              row.map((node, columnIndex) =>
                renderCard(node, {
                  x: columnIndex * (NODE_WIDTH + COLUMN_GAP) + NODE_WIDTH / 2,
                  y: TOP_PAD + rowIndex * (height + ROW_GAP) + height / 2,
                })
              )
            )}
          </svg>
        </>
      )}
    </div>
  );
};
