import { loadFoodData } from '@/services';

// output: 'export' でもビルド時に静的ファイルとして書き出される。
// おすすめ献立ページのクライアント側再最適化（環境コストの価格づけ）が
// 必要になったときだけ読む。全 recommendations ページの RSC ペイロードに
// foods を埋め込むとビルド出力が食品数×ページ数で膨らむため、この形にする。
export const dynamic = 'force-static';

export async function GET() {
  return Response.json(await loadFoodData());
}
