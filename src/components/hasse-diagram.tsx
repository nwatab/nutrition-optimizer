'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import type { Locale } from '@/config';
import type { Message } from '@/locales';
import type { NutrientKey } from '@/services/diagnose';
import { hasseEdges, skyline } from '@/services/domination';
import type { CompareNode } from '@/services/environment';

/** Hasse 図の層。支配する側が上（層0 = どこからも支配されない）。 */
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

const NODE_WIDTH = 128;
const NODE_HEIGHT = 34;
const LAYER_GAP = 110;
const COLUMN_GAP = 12;

/**
 * コストベクトル上の半順序の Hasse 図。上ほど優位（支配する側）。
 * ノードクリックで食品詳細ページへ遷移する。
 * highlightedIds はサーバーコンポーネントからも渡せるよう配列で受ける。
 */
export const HasseDiagram = ({
  nodes,
  nutrientKeys,
  highlightedIds,
  locale,
  messages,
  showHighlightCount = true,
}: {
  nodes: CompareNode[];
  nutrientKeys: NutrientKey[];
  highlightedIds: readonly string[];
  locale: Locale;
  messages: Message;
  /** 局所ビュー（食品詳細）では「ハイライト中: n 食材」の凡例が冗長なため消せる */
  showHighlightCount?: boolean;
}) => {
  const router = useRouter();
  const highlighted = useMemo(() => new Set(highlightedIds), [highlightedIds]);
  const edges = useMemo(
    () => hasseEdges(nodes, nutrientKeys),
    [nodes, nutrientKeys]
  );
  const front = useMemo(
    () => new Set(skyline(nodes, nutrientKeys).map((n) => n.id)),
    [nodes, nutrientKeys]
  );
  const layers = useMemo(() => computeLayers(nodes, edges), [nodes, edges]);

  const nodesByLayer = useMemo(() => {
    const grouped = new Map<number, CompareNode[]>();
    nodes.forEach((node) => {
      const layer = layers.get(node.id) ?? 0;
      grouped.set(layer, [...(grouped.get(layer) ?? []), node]);
    });
    return grouped;
  }, [nodes, layers]);

  const positions = useMemo(
    () =>
      new Map(
        [...nodesByLayer.entries()].flatMap(([layer, layerNodes]) =>
          layerNodes.map((node, index) => [
            node.id,
            {
              x: index * (NODE_WIDTH + COLUMN_GAP) + NODE_WIDTH / 2,
              y: layer * LAYER_GAP + NODE_HEIGHT / 2 + 10,
            },
          ])
        )
      ),
    [nodesByLayer]
  );

  const width =
    Math.max(...[...nodesByLayer.values()].map((ns) => ns.length)) *
    (NODE_WIDTH + COLUMN_GAP);
  const height = (Math.max(...[...layers.values()], 0) + 1) * LAYER_GAP + 20;

  const tooltip = (node: CompareNode): string =>
    [
      node.label,
      `${messages['intake form']}: ${messages[node.intakeForm]} / ${messages.distribution}: ${messages.retail} / ${node.productionMethod === 'organic' ? messages.organic : messages.conventional}`,
      ...nutrientKeys.map(
        (key) => `${messages[key]}: ${node.nutrientDensity[key].toPrecision(3)}`
      ),
      `${messages.yen}: ${node.costVector.yen.toPrecision(3)}`,
      `CO2e: ${node.costVector.co2eKg.toPrecision(3)} kg`,
      `${messages.land}: ${node.costVector.landM2.toPrecision(3)} m²`,
      `${messages.water}: ${node.costVector.waterL.toPrecision(3)} L`,
      ...(node.pesticideResidue
        ? [
            messages[
              'pesticide residue: present (health impact not assessed)'
            ],
          ]
        : []),
    ].join('\n');

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
      <svg width={width} height={height} className="min-w-full">
        {edges.map(({ from, to }) => {
          const a = positions.get(from);
          const b = positions.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y + NODE_HEIGHT / 2}
              x2={b.x}
              y2={b.y - NODE_HEIGHT / 2}
              stroke="#94a3b8"
              strokeWidth={1}
            />
          );
        })}
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          const organic = node.productionMethod === 'organic';
          const dominated = !front.has(node.id);
          const isHighlighted = highlighted.has(node.id);
          return (
            <g
              key={node.id}
              transform={`translate(${position.x - NODE_WIDTH / 2}, ${position.y - NODE_HEIGHT / 2})`}
              // 支配されたノード（有機を含む）も隠さず、薄くして表示する。
              // ハイライト対象は導線元（リコメンド等）の注目ノードなので薄くしない。
              opacity={dominated && !isHighlighted ? 0.55 : 1}
              className="cursor-pointer"
              onClick={() => router.push(`/${locale}/foods/${node.foodId}`)}
            >
              <title>{tooltip(node)}</title>
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={6}
                fill={
                  organic ? '#dcfce7' : isHighlighted ? '#fffbeb' : '#ffffff'
                }
                stroke={
                  isHighlighted ? '#f59e0b' : organic ? '#16a34a' : '#64748b'
                }
                strokeWidth={isHighlighted ? 3 : front.has(node.id) ? 2 : 1}
              />
              <text x={6} y={14} fontSize={10} fill="#0f172a">
                {truncate(node.label, 12)}
                {organic ? ' 🌱' : ''}
              </text>
              <text x={6} y={27} fontSize={9} fill="#475569">
                {messages[node.intakeForm]}
                {dominated ? ` / ${messages.dominated}` : ''}
                {node.pesticideResidue
                  ? ` / ${messages['pesticide residue (not assessed)']}`
                  : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
