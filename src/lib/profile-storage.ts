import { PROFILE_STORAGE_KEY, type StoredProfile } from '@/config';

const isStoredProfile = (value: unknown): value is StoredProfile =>
  typeof value === 'object' &&
  value !== null &&
  (['sex', 'age', 'weight', 'pal', 'status'] as const).every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string'
  );

// 妊娠状態を含むためブラウザを閉じたら消える sessionStorage を使う。
// 共用PCで前回のプロフィールが無期限に残らないようにするための選択で、
// localStorage に戻さないこと。
export const readStoredProfile = (): StoredProfile | null => {
  try {
    // 以前は localStorage に保存していた。残っていると無期限に持ち続けて
    // しまうため、読み出しのついでに旧データを消す。
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredProfile(parsed) ? parsed : null;
  } catch {
    // プライベートモード等で sessionStorage が使えない場合は未保存扱い
    return null;
  }
};

export const writeStoredProfile = (profile: StoredProfile): void => {
  try {
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // sessionStorage が使えない環境では保存を諦める
  }
};
