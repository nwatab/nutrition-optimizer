type FoodIngredientDataReference = {
  name: string;
  price: number;
  massGram: number;
  shokuhinbangou: string;
  url: string;
};

export const foodIngredientDataReference: FoodIngredientDataReference[] = [
  {
    name: '大豆 岩手県産 宮城県産 規格外 B級品令和６年産】',
    price: 2100 + 880, // 大豆
    massGram: 5000,
    shokuhinbangou: '04104',
    url: 'https://item.rakuten.co.jp/mamehei/no5_5kg/',
  },
  {
    name: 'ひよこ豆 ガルバンソ　カレー　サラダ　大容量 アメリカ産5kg',
    price: 3900 + 880,
    massGram: 5000,
    shokuhinbangou: '04065',
    url: 'https://item.rakuten.co.jp/mamehei/hiyoko_5kg/',
  },
  {
    name: 'そばの実',
    price: 7380 + 0,
    massGram: 5000,
    shokuhinbangou: '01126',
    url: 'https://item.rakuten.co.jp/auc-takumi/10000012/',
  },
];
