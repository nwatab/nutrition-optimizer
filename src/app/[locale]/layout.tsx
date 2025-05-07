import { LanguageSwitch } from '@/components/language-switcher';
import ThemeImage from '@/components/theme-image';
import { appConfig, Locale } from '@/config';
import Link from 'next/link';
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
      <header
        style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}
      >
        <Suspense>
          <LanguageSwitch locale={locale} locales={appConfig.i18n} />
        </Suspense>
        <Link
          href="https://github.com/nwatab/nutrition-optimizer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <ThemeImage
            srcLight="/github-mark.svg"
            // srcDark="/github-mark-white.svg" ToDo
            srcDark="/github-mark.svg"
            alt="GitHub"
            width={24}
            height={24}
          />
        </Link>
      </header>

      {children}
    </>
  );
}
