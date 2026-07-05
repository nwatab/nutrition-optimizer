import { PROFILE_STORAGE_KEY, type StoredProfile } from '@/config';

const isStoredProfile = (value: unknown): value is StoredProfile =>
  typeof value === 'object' &&
  value !== null &&
  (['sex', 'age', 'weight', 'pal', 'status'] as const).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string'
  );

export const readStoredProfile = (): StoredProfile | null => {
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

export const writeStoredProfile = (profile: StoredProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage が使えない環境では保存を諦める
  }
};
