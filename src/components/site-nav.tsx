'use client';

import {
  PROFILE_STORAGE_KEY,
  type Locale,
  type StoredProfile,
} from '@/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const isStoredProfile = (value: unknown): value is StoredProfile =>
  typeof value === 'object' &&
  value !== null &&
  (['sex', 'age', 'weight', 'pal', 'status'] as const).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string'
  );

const readProfile = (): StoredProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredProfile(parsed) ? parsed : null;
  } catch {
    // プライベートモード等で localStorage が使えない場合は未保存扱い
    return null;
  }
};

export type SiteNavLabels = {
  recommendations: string;
  foods: string;
  compare: string;
};

/**
 * 共通ヘッダーナビ。「おすすめ献立」は保存済みプロフィールがあれば
 * 前回のリコメンドページへ、なければトップのフォームへ飛ぶ。
 */
export function SiteNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: SiteNavLabels;
}) {
  const pathname = usePathname();
  // localStorage は SSG の HTML と一致しないため、マウント後に読む。
  // フォーム送信直後の SPA 遷移でも反映されるよう、ルート変更ごとに再読する。
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  useEffect(() => setProfile(readProfile()), [pathname]);

  const recommendationsHref = profile
    ? `/${locale}/recommendations/${profile.sex}/${profile.age}/${profile.weight}/${profile.pal}/${profile.status}`
    : `/${locale}`;

  const items = [
    {
      href: recommendationsHref,
      label: labels.recommendations,
      active:
        pathname === `/${locale}` ||
        pathname.startsWith(`/${locale}/recommendations`),
    },
    {
      href: `/${locale}/foods`,
      label: labels.foods,
      active: pathname.startsWith(`/${locale}/foods`),
    },
    {
      href: `/${locale}/compare`,
      label: labels.compare,
      active: pathname.startsWith(`/${locale}/compare`),
    },
  ];

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            item.active
              ? 'bg-emerald-100 text-emerald-900'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
