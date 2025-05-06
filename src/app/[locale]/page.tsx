import { TopPage } from '@/components/top-page';
import { appConfig } from '@/config';
import type { Locale } from '@/config';

export async function generateStaticParams() {
  return appConfig.i18n.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const staticParams = await params;
  return TopPage({
    locale: staticParams.locale,
  });
}
