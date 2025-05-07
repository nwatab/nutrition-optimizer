'use client';

import { Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import { capitalize, toTitleCase } from '@/utils';
import { useRouter } from 'next/navigation';

export default function UserInfoForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const messages = locale === 'ja-JP' ? jaJP : enUS;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const sex = form.sex.value;
    const weight = form.weight.value;
    const pal = form.pal.value;
    router.push(`/${locale}/recommendations/${sex}/${weight}/${pal}`);
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
          defaultValue=""
        >
          <option value="" disabled>
            {toTitleCase(messages['select your sex'])}
          </option>
          <option value="male">{capitalize(messages['male'])}</option>
          <option value="female">{capitalize(messages['female'])}</option>
        </select>
      </div>

      {/* Weight */}
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
          {Array.from({ length: 12 }, (_, i) => 40 + i * 5).map((w) => (
            <option key={w} value={String(w)}>
              {w} kg
            </option>
          ))}
        </select>
      </div>

      {/* Physical Activity Level */}
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
