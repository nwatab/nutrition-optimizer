import { Card } from '@/components/ui/card';
import type { FoodRequired, NutritionTarget } from '@/types/nutrition';
import RequiredIngredientDetailCard from './required-ingredient-detail-card';

export default function IngredientsListDetail({
  ingredients,
  referenceDailyIntakes,
}: {
  ingredients: FoodRequired[];
  referenceDailyIntakes: NutritionTarget;
}) {
  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        食材リストの詳細な栄養素情報
      </h2>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-emerald-800 mb-3"></h3>
        <p className="text-sm text-gray-600 mb-4">
          各食材に含まれる詳細な栄養素情報を確認できます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <RequiredIngredientDetailCard
              key={ingredient.id}
              ingredient={ingredient}
              referenceDailyIntakes={referenceDailyIntakes}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
