import UserInfoForm from '@/components/user-info-form';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="text-center px-6 py-8">
          <div className="mx-auto bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 mb-2">
            Vegan Food Planner
          </h1>
          <p className="text-gray-600">
            Tell us about yourself to get personalized nutrition targets
          </p>
        </div>

        {/* Card Content / Form */}
        <div className="px-6 pb-8">
          <UserInfoForm />
        </div>
      </div>
    </div>
  );
}
