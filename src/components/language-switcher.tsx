'use client';
import { Locale } from '@/config';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export interface LanguageSwitchProps {
  /** Current locale code, e.g. 'en-US', 'ja-JP' */
  locale: Locale;
  /** Array of supported locale codes */
  locales: Locale[];
}

/**
 * A minimalistic language switch component.
 * Renders a native <select> for choosing between locales.
 */
export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  locale,
  locales,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const localeMap: Record<Locale, string> = {
    'en-US': 'English',
    'ja-JP': '日本語',
  };

  return (
    <select
      value={locale}
      onChange={(e) => {
        if (pathname === '/') {
          router.push(`/${e.target.value}`);
          return;
        }
        router.push(pathname.replace(`/${locale}`, `/${e.target.value}`));
      }}
      aria-label="Select language"
      className="p-1 text-base rounded border border-gray-300 cursor-pointer"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeMap[loc]}
        </option>
      ))}
    </select>
  );
};
