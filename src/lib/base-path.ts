// GitHub Pages のプロジェクトサイトは /<repo> 配下で配信されるため basePath が要る。
// basePath の値の「単一の情報源」。next.config.ts（ビルド設定）と client の
// withBasePath（history.replaceState 用）の両方がここから導出し、食い違いを防ぐ。
// 本番ビルドのみ basePath を付け、dev はルート配信で URL をクリーンに保つ。
// next build は NODE_ENV=production、next dev は development で実行される。
export const BASE_PATH =
  process.env.NODE_ENV === 'production' ? '/nutrition-optimizer' : '';
