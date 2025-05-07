import { LanguageSwitch } from '@/components/language-switcher';
import { appConfig, Locale } from '@/config';
import { Suspense } from 'react';

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
}>) {
  const { locale } = await params;

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Suspense>
          <LanguageSwitch locale={locale} locales={appConfig.i18n} />
        </Suspense>
      </header>

      {children}
    </>
  );
}
