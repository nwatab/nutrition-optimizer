'use client';

import {
  Locale,
  AGE_SEGMENTS,
  CHILD_WEIGHT_SEGMENT,
  WEIGHT_OPTIONS_KG,
  isChildSegment,
  palCategoriesFor,
  statusesFor,
  PROFILE_STORAGE_KEY,
  type StatusSegment,
  type StoredProfile,
} from '@/config';
import { type Sex } from '@/data';
import { enUS, jaJP } from '@/locales';
import { capitalize, toTitleCase } from '@/utils';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const STATUS_LABEL_KEY: Record<StatusSegment, keyof typeof enUS> = {
  none: 'not menstruating or pregnant',
  menstruation: 'menstruating',
  'pregnancy-early': 'pregnancy (first trimester)',
  'pregnancy-mid': 'pregnancy (second trimester)',
  'pregnancy-late': 'pregnancy (third trimester)',
  lactation: 'lactating',
};

export default function UserInfoForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const messages = locale === 'ja-JP' ? jaJP : enUS;

  const [sex, setSex] = useState<'' | Sex>('');
  const [age, setAge] = useState('30');
  const [status, setStatus] = useState<StatusSegment>('none');

  const isChild = isChildSegment(age);
  const ageBand = AGE_SEGMENTS[age];
  // 妊娠・授乳／月経の選択肢は性別・年齢帯で変わる。無効になった選択は 'none' に戻す。
  const statusOptions = useMemo<readonly StatusSegment[]>(
    () => (sex ? statusesFor(sex, ageBand) : ['none']),
    [sex, ageBand]
  );
  const effectiveStatus = statusOptions.includes(status) ? status : 'none';
  const palOptions = palCategoriesFor(age);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // 1〜5歳は PAL が「ふつう」のみのため選択させず、静的生成と同じトークンを送る。
    const pal = palOptions.length === 1 ? palOptions[0] : form.pal.value;
    // 小児は参照体重を用いるため体重入力を使わず、静的生成と同じトークンを送る。
    const weight = isChild ? CHILD_WEIGHT_SEGMENT : form.weight.value;
    // ナビの「おすすめ献立」が前回のページへ直接飛べるよう保存する
    try {
      const profile: StoredProfile = {
        sex: sex as StoredProfile['sex'],
        age,
        weight,
        pal,
        status: effectiveStatus,
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // localStorage が使えない環境では保存を諦める
    }
    router.push(
      `/${locale}/recommendations/${sex}/${age}/${weight}/${pal}/${effectiveStatus}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sex */}
      <div>
        <label
          htmlFor="sex"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {toTitleCase(messages['biological sex'])}
        </label>
        <select
          id="sex"
          name="sex"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          value={sex}
          onChange={(e) => setSex(e.target.value as Sex)}
        >
          <option value="" disabled>
            {toTitleCase(messages['select your sex'])}
          </option>
          <option value="male">{capitalize(messages['male'])}</option>
          <option value="female">{capitalize(messages['female'])}</option>
        </select>
      </div>

      {/* Age band */}
      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {toTitleCase(messages['age'])}
        </label>
        <select
          id="age"
          name="age"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        >
          {Object.entries(AGE_SEGMENTS).map(([segment, band]) => (
            <option key={segment} value={segment}>
              {band.replace('-', '–')}
            </option>
          ))}
        </select>
      </div>

      {/* Reproductive status (females with menstruation/pregnancy options) */}
      {sex === 'female' && statusOptions.length > 1 && (
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {toTitleCase(messages['reproductive status'])}
          </label>
          <select
            id="status"
            name="status"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            value={effectiveStatus}
            onChange={(e) => setStatus(e.target.value as StatusSegment)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {messages[STATUS_LABEL_KEY[s]]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Weight (adults only; children use reference body weight) */}
      {!isChild && (
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {toTitleCase(messages['body weight'])} (kg)
          </label>
          <select
            id="weight"
            name="weight"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            defaultValue=""
          >
            <option value="" disabled>
              {messages['select your weight']}
            </option>
            {WEIGHT_OPTIONS_KG.map((w) => (
              <option key={w} value={String(w)}>
                {w} kg
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Physical Activity Level (hidden for ages 1-5; only 'normal' is defined) */}
      {palOptions.length > 1 && (
        <div>
          <label
            htmlFor="pal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {toTitleCase(messages['physical activity level'])}
          </label>
          <select
            id="pal"
            name="pal"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            defaultValue=""
          >
            <option value="" disabled>
              {messages['select your activity level']}
            </option>
            <option value="low">
              {messages['low']} (
              {
                messages[
                  'When most of your daily life is spent sitting and your activities are predominantly static.'
                ]
              }
              )
            </option>
            <option value="normal">
              {messages['normal']} (
              {
                messages[
                  'Your work is mainly sedentary, but you also include any of the following: moving around or standing at work (e.g. serving), commuting, shopping, housework, or light sports.'
                ]
              }
              )
            </option>
            <option value="high">
              {messages['high']} (
              {
                messages[
                  'You have a job involving a lot of movement or standing, or you maintain an active exercise habit in your leisure time (e.g. regular sports).'
                ]
              }
              )
            </option>
          </select>
          <p className="mt-4 text-xs text-gray-500">
            {messages['This helps us calculate your daily calorie needs.']}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        {messages['Calculate My Nutrition Plan']}
      </button>
    </form>
  );
}
