import { solve } from 'yalps';

type NutritionFacts = {
  calories: number; // 100gあたりの栄養価
  protein: number;
  fat: number;
  fiber: number;
  vitaminB12: number;
  vitaminC: number;
};

type Food = NutritionFacts & {
  name: string;
  shokuhinbangou: string;
  cost: number; // 100gあたりの金額
};

export default async function DietPage() {
  // 最適化を実行する関数
  async function optimizeDiet() {
    // 1日に必要な栄養素の量
    const referenceDailyIntakes: NutritionFacts = {
      calories: 2700, // kcal
      protein: 65, // g
      fat: (2700 * 0.2) / 9, // g. 9kcal/g
      fiber: 21, // g
      vitaminB12: 2.4, // μg
      vitaminC: 100, // mg
    };

    // 各食材の栄養素データとコスト.
    // 値は100gあたりのものです。値段は税込。
    const foods: Food[] = [
      {
        name: '白米',
        shokuhinbangou: '01083',
        cost: (1996 / 2000) * 100, //無洗米　秋田こまち
        calories: 342,
        protein: 6.2,
        fat: 0.9,
        fiber: 0.4,
        vitaminB12: 0,
        vitaminC: 0,
      },
      {
        name: '蕎麦の実',
        shokuhinbangou: '01126',
        cost: (1850 / 1000) * 100,
        calories: 347,
        protein: 9.6,
        fat: 2.5,
        fiber: 3.7,
        vitaminB12: 0,
        vitaminC: 0,
      },
      {
        name: 'ロウカット玄米',
        shokuhinbangou: '01080',
        cost: (1726 / 2000) * 100,
        calories: 346,
        protein: 6.8,
        fat: 2.7,
        fiber: 3.0,
        vitaminB12: 0,
        vitaminC: 0,
      },
      {
        name: '大豆 黄 乾',
        shokuhinbangou: '04023',
        cost: (1050 / 900) * 100,
        calories: 372,
        protein: 33.8,
        fat: 19.7,
        fiber: 21.5,
        vitaminB12: 0,
        vitaminC: 3,
      },
    ];

    // モデルの作成
    const model = {
      direction: 'minimize' as const,
      objective: 'cost',
      constraints: {
        // ※ここでは各栄養素が「必要最小量」を満たすように設定しています
        calories: { min: referenceDailyIntakes.calories },
        protein: { min: referenceDailyIntakes.protein },
        fat: { min: referenceDailyIntakes.fat },
        fiber: { min: referenceDailyIntakes.fiber },
      },
      variables: {} as {
        [key: string]: {
          cost: number;
          calories: number;
          protein: number;
          fat: number;
          fiber: number;
          vitaminB12: number;
          vitaminC: number;
        };
      },
    };

    // foods 配列から各食材をモデルの変数として追加
    // ※各変数は「100gあたり」の値をもとにしています
    for (const food of foods) {
      model.variables[food.name] = {
        cost: food.cost,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        fiber: food.fiber,
        vitaminB12: food.vitaminB12,
        vitaminC: food.vitaminC,
      };
    }

    // 最適化を実行
    const solution = solve(model);
    // solution の形式は以下のようなオブジェクトになります:
    // {
    //   status: "optimal",
    //   result: <最終的な目的関数の値>,
    //   variables: [ [変数名, 値], ... ]
    // }

    // 各食材の購入量と費用内訳を計算する
    // ※変数の値は「100g単位」としているので、最終的なグラム数は value * 100
    const breakdown = solution.variables.map(([name, value]) => {
      const food = foods.find((f) => f.name === name);
      if (!food) return { name, grams: 0, cost: 0 };
      const grams = value * 100; // 100g単位 → グラムに変換
      const foodCost = value * food.cost; // 各食材の合計費用
      return {
        name,
        grams: grams,
        cost: foodCost,
      };
    });

    return {
      totalCost: solution.result,
      breakdown,
    };
  }

  // サーバー側で最適化を実行
  const { totalCost, breakdown } = await optimizeDiet();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">1日に最適な食材の組み合わせ</h1>
      <p className="mb-2">
        総コスト: <strong>¥{Math.ceil(totalCost)}</strong>
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">購入量と金額内訳:</h2>
      <ul className="list-disc list-inside">
        {breakdown.map(({ name, grams, cost }) => (
          <li key={name}>
            {name}: ¥{Math.round(cost)} / {grams.toFixed(2)} g
          </li>
        ))}
      </ul>
    </main>
  );
}
