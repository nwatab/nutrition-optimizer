import { redirect } from 'next/navigation';

// 既定ロケールのページ（ヘッダーのタブ等を含む [locale] レイアウト配下）へ集約する。
// ルート `/` に別実装を持つとヘッダー差異が生じるため、`/en-US` へ寄せる。
export default function Home() {
  redirect('/en-US');
}
