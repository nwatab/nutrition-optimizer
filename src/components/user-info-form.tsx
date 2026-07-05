'use client';

import {
  Locale,
  AGE_SEGMENTS,
  CHILD_WEIGHT_SEGMENT,
  WEIGHT_OPTIONS_KG,
  isChildSegment,
  palCategoriesFor,
  statusesFor,
  STATUS_LABEL_KEY,
  type StatusSegment,
  type StoredProfile,
} from '@/config';
import { type PalCategory, type Sex } from '@/data';
import { readStoredProfile, writeStoredProfile } from '@/lib/profile-storage';
import { enUS, jaJP } from '@/locales';
import { capitalize, toTitleCase } from '@/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const PAL_DESCRIPTION_KEY = {
  low: 'You spend most of the day sitting, with little movement.',
  normal:
    'Mostly desk work, but you move around: commuting, shopping, housework, or light sports.',
  high: 'You are on your feet a lot at work, or you exercise regularly.',
} as const;

export default function UserInfoForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const messages = locale === 'ja-JP' ? jaJP : enUS;

  const [sex, setSex] = useState<'' | Sex>('');
  const [age, setAge] = useState('30');
  const [status, setStatus] = useState<StatusSegment>('none');
  const [weight, setWeight] = useState('');
  // 「ふつう」が代表値のため既定選択にし、多くの人は触らず送信できるようにする
  const [pal, setPal] = useState<PalCategory>('normal');

  // 前回のプロフィールを初期値に復元する。localStorage は SSG の HTML と
  // 一致しないため、マウント後に読む。値は選択肢に残っているものだけ採用する。
  useEffect(() => {
    const profile = readStoredProfile();
    if (!profile) return;
    if (profile.sex === 'male' || profile.sex === 'female') setSex(profile.sex);
    if (profile.age in AGE_SEGMENTS) setAge(profile.age);
    if (WEIGHT_OPTIONS_KG.map(String).includes(profile.weight)) {
      setWeight(profile.weight);
    }
    if (palCategoriesFor(profile.age).includes(profile.pal)) {
      setPal(profile.pal);
    }
    setStatus(profile.status);
  }, []);

  const isChild = isChildSegment(age);
  const ageBand = AGE_SEGMENTS[age];
  // 妊娠・授乳／月経の選択肢は性別・年齢帯で変わる。無効になった選択は 'none' に戻す。
  const statusOptions = useMemo<readonly StatusSegment[]>(
    () => (sex ? statusesFor(sex, ageBand) : ['none']),
    [sex, ageBand]
  );
  const effectiveStatus = statusOptions.includes(status) ? status : 'none';
  const palOptions = palCategoriesFor(age);
  const effectivePal = palOptions.includes(pal) ? pal : 'normal';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sex) return;
    // 小児は参照体重を用いるため体重入力を使わず、静的生成と同じトークンを送る。
    const effectiveWeight = isChild ? CHILD_WEIGHT_SEGMENT : weight;
    if (!effectiveWeight) return;
    // ナビの「おすすめ献立」が前回のページへ直接飛べるよう保存する
    const profile: StoredProfile = {
      sex,
      age,
      weight: effectiveWeight,
      pal: effectivePal,
      status: effectiveStatus,
    };
    writeStoredProfile(profile);
    router.push(
      `/${locale}/recommendations/${sex}/${age}/${effectiveWeight}/${effectivePal}/${effectiveStatus}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sex */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">
          {toTitleCase(messages['biological sex'])}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(['male', 'female'] as const).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-md border px-4 py-2.5 text-center text-sm transition-colors ${
                sex === option
                  ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-900 ring-1 ring-emerald-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="sex"
                value={option}
                required
                checked={sex === option}
                onChange={() => setSex(option)}
                className="sr-only"
              />
              {capitalize(messages[option])}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Reproductive status (females with menstruation/pregnancy options) */}
      {sex === 'female' && statusOptions.length > 1 && (
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">
            {toTitleCase(messages['reproductive status'])}
          </legend>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  effectiveStatus === option
                    ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option}
                  checked={effectiveStatus === option}
                  onChange={() => setStatus(option)}
                  className="sr-only"
                />
                {messages[STATUS_LABEL_KEY[option]]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

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
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
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
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">
            {toTitleCase(messages['physical activity level'])}
          </legend>
          <div className="space-y-2">
            {palOptions.map((option) => (
              <label
                key={option}
                className={`block cursor-pointer rounded-md border px-4 py-3 transition-colors ${
                  effectivePal === option
                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="pal"
                  value={option}
                  checked={effectivePal === option}
                  onChange={() => setPal(option)}
                  className="sr-only"
                />
                <span
                  className={`block text-sm font-medium ${
                    effectivePal === option
                      ? 'text-emerald-900'
                      : 'text-gray-900'
                  }`}
                >
                  {capitalize(messages[option])}
                  {option === 'normal' && (
                    <span className="ml-2 font-normal text-xs text-emerald-700">
                      {messages['most people choose this']}
                    </span>
                  )}
                </span>
                <span
                  className={`mt-0.5 block text-xs leading-relaxed ${
                    effectivePal === option
                      ? 'text-emerald-800'
                      : 'text-gray-500'
                  }`}
                >
                  {messages[PAL_DESCRIPTION_KEY[option]]}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            {messages['This helps us calculate your daily calorie needs.']}
          </p>
        </fieldset>
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
