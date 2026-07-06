/**
 * ハッセ図のレイアウト用の純粋関数。JSX を含まないため単体テストしやすい。
 */

export const truncate = (text: string, length: number): string =>
  text.length > length ? `${text.slice(0, length)}…` : text;

/**
 * 各層内のノード順を重心法で並べ替えて層をまたぐ線の交差を減らす。
 * 隣接する相手ノードの列位置の平均でソートするスイープを、上下交互に
 * 数回繰り返す。支配は厳密な半順序なので同一層内に辺はなく、相手は必ず
 * 別の層にいる。layerOrder は上（層0）から順の id 配列で、外側の並び
 * （＝層の順序）は保ったまま各層の内部順だけを返す。入力は破壊しない。
 */
const SWEEPS = 6;

export const barycenterOrder = (
  layerOrder: readonly (readonly string[])[],
  neighbors: ReadonlyMap<string, readonly string[]>
): string[][] => {
  const columnsOf = (order: readonly (readonly string[])[]): Map<string, number> =>
    new Map(order.flatMap((layer) => layer.map((id, i) => [id, i] as const)));
  const reorder = (
    layer: readonly string[],
    column: ReadonlyMap<string, number>
  ): string[] =>
    layer
      .map((id) => {
        const cols = (neighbors.get(id) ?? [])
          .map((n) => column.get(n))
          .filter((c): c is number => c !== undefined);
        const own = column.get(id) ?? 0;
        const key = cols.length
          ? cols.reduce((a, b) => a + b, 0) / cols.length
          : own;
        return { id, key, own };
      })
      // 相手のいないノードは元の位置を保つよう own で tie-break
      .sort((a, b) => a.key - b.key || a.own - b.own)
      .map((s) => s.id);
  // 1スイープ = 全層を端から順に、その時点の列割り当てで並べ替える（逐次更新）
  const sweep = (order: string[][], topDown: boolean): string[][] => {
    const indices = topDown ? [...order.keys()] : [...order.keys()].reverse();
    return indices.reduce<string[][]>(
      (acc, i) =>
        acc.map((layer, j) => (j === i ? reorder(layer, columnsOf(acc)) : layer)),
      order
    );
  };
  return Array.from({ length: SWEEPS }).reduce<string[][]>(
    (order, _, k) => sweep(order, k % 2 === 0),
    layerOrder.map((layer) => [...layer])
  );
};
