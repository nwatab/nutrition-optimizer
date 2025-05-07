import { Locale } from '@/config';
import { Leaf } from 'lucide-react';

import UserInfoForm from './user-info-form';
import { enUS, jaJP } from '@/locales';

export function TopPage({ locale }: { locale: Locale }) {
  const messages = locale === 'ja-JP' ? jaJP : enUS;
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Card Header */}
        <header className="text-center px-6 py-8">
          <div className="mx-auto bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 mb-2">
            {messages['Vegan Food Planner']}
          </h1>
          <p className="text-gray-600">
            {
              messages[
                'Tell us about yourself to get personalized nutrition targets'
              ]
            }
          </p>
        </header>

        {/* Card Content / Form */}
        <div className="px-6 pb-8">
          <UserInfoForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
