/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from '@/locales';
import type { NutritionFactBase, NutritionTarget } from '@/types/nutrition';

export default function NutritionRadarChart({
  nutritionFacts,
  referenceDailyIntakes,
  messages,
}: {
  nutritionFacts: NutritionFactBase<number>;
  referenceDailyIntakes: NutritionTarget;
  messages: Message;
}) {
  const keyNutrients: {
    key: keyof NutritionFactBase<number>;
    name: string;
    dailyIntake: number;
  }[] = [
    {
      key: 'calories',
      name: messages.calories,
      dailyIntake: referenceDailyIntakes.calories.equal,
    },
    {
      key: 'carbohydrates',
      name: messages.carbohydrates,
      dailyIntake: referenceDailyIntakes.carbohydrates.min,
    },
    {
      key: 'protein',
      name: messages.protein,
      dailyIntake: referenceDailyIntakes.protein.min,
    },
    {
      key: 'fat',
      name: messages.fat,
      dailyIntake: referenceDailyIntakes.fat.min,
    },
    {
      key: 'vitaminC',
      name: messages.vitaminC,
      dailyIntake: referenceDailyIntakes.vitaminC.min,
    },
    {
      key: 'calcium',
      name: messages.calcium,
      dailyIntake: referenceDailyIntakes.calcium.min,
    },
    {
      key: 'iron',
      name: messages.iron,
      dailyIntake: referenceDailyIntakes.iron.min,
    },
    {
      key: 'fiber',
      name: messages.fiber,
      dailyIntake: referenceDailyIntakes.fiber.min,
    },
    {
      key: 'vitaminA',
      name: messages.vitaminA,
      dailyIntake: referenceDailyIntakes.vitaminA.min,
    },
  ];
  return <div>🚧 </div>;
  // return (
  //   <div className="w-full h-full flex items-center justify-center">
  //     <div className="text-center">
  //       <p className="text-emerald-800 mb-2">
  //         {messages['nutrition rader charts']}
  //       </p>
  //       <div className="mt-4 grid grid-cols-2 gap-4">
  //         {keyNutrients.map((nutrient) => {
  //           const value =
  //             nutritionFacts[nutrient.key as keyof NutritionFactBase<number>];
  //           const percentage = Math.min(
  //             (value / nutrient.dailyIntake) * 100,
  //             100
  //           );

  //           return (
  //             <div key={nutrient.key} className="text-left">
  //               <div className="flex justify-between mb-1">
  //                 <span className="text-sm font-medium text-gray-700">
  //                   {nutrient.name}
  //                 </span>
  //                 <span className="text-sm font-medium text-gray-700">
  //                   {value.toFixed(1)} /{' '}
  //                   {nutrient.dailyIntake.toLocaleString('ja-JP', {
  //                     maximumFractionDigits: 1,
  //                   })}
  //                 </span>
  //               </div>
  //               <div className="w-full bg-gray-200 rounded-full h-2.5">
  //                 <div
  //                   className="h-2.5 rounded-full bg-emerald-500"
  //                   style={{ width: `${percentage}%` }}
  //                 ></div>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   </div>
  // );
}
