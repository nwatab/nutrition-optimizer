import { LanguageSwitch } from '@/components/language-switcher';
import ThemeImage from '@/components/theme-image';
import { TopPage } from '@/components/top-page';
import { appConfig } from '@/config';
import Link from 'next/link';
import { Suspense } from 'react';
import { enUS } from '@/locales';

export default async function Home() {
  return (
    <>
      <header
        style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}
      >
        <Suspense>
          <LanguageSwitch locale={'en-US'} locales={appConfig.i18n} />
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
      <TopPage locale="en-US" messages={enUS} />;
    </>
  );
}
