import { LanguageSwitch } from '@/components/language-switcher';
import { SiteNav } from '@/components/site-nav';
import ThemeImage from '@/components/theme-image';
import { appConfig, basePath, Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
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
  const messages = locale === 'ja-JP' ? jaJP : enUS;

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 py-1 overflow-x-auto">
        <SiteNav
          locale={locale}
          labels={{
            recommendations: messages['My plan'],
            foods: messages['Food database'],
            compare: messages.Compare,
          }}
        />
        <div className="flex items-center gap-2">
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
              srcLight={`${basePath}/github-mark.svg`}
              // srcDark={`${basePath}/github-mark-white.svg`} ToDo
              srcDark={`${basePath}/github-mark.svg`}
              alt="GitHub"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </header>

      {children}
    </>
  );
}
