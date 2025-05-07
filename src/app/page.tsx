import { LanguageSwitch } from '@/components/language-switcher';
import { TopPage } from '@/components/top-page';
import { appConfig } from '@/config';
import { Suspense } from 'react';

export default async function Home() {
  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Suspense>
          <LanguageSwitch locale={'en-US'} locales={appConfig.i18n} />
        </Suspense>
      </header>
      <TopPage locale="en-US" />;
    </>
  );
}
