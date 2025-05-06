'use client';

import { useRouter } from 'next/navigation';
export default function UserInfoForm() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const sex = form.sex.value;
    const weight = form.weight.value;
    const pal = form.pal.value;
    router.push(`/recommendations/${sex}/${weight}/${pal}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sex */}
      <div>
        <label
          htmlFor="sex"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Biological Sex
        </label>
        <select
          id="sex"
          name="sex"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>
            Select your sex
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Weight */}
      <div>
        <label
          htmlFor="weight"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Weight (kg)
        </label>
        <select
          id="weight"
          name="weight"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>
            Select your weight
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
          Physical Activity Level
        </label>
        <select
          id="pal"
          name="pal"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>
            Select your activity level
          </option>
          <option value="low">Low (Sedentary lifestyle)</option>
          <option value="normal">Normal (Moderate activity)</option>
          <option value="high">High (Very active)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          This helps us calculate your daily calorie needs
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Calculate My Nutrition Plan
      </button>
    </form>
  );
}
