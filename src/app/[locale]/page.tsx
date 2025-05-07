import { TopPage } from '@/components/top-page';
import { appConfig } from '@/config';
import type { Locale } from '@/config';
import { enUS, jaJP } from '@/locales';

export async function generateStaticParams() {
  return appConfig.i18n.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const messages = locale === 'ja-JP' ? jaJP : enUS;
  return <TopPage messages={messages} locale={locale} />;
}
