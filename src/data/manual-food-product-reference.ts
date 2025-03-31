import { NutritionFacts } from '@/types';

type FoodProductDataReference = {
  name: string;
  price: number;
  productMassGram: number;
  massForNutritionGram: number;
  url: string;
} & NutritionFacts;

export const foodProductDataReferences: FoodProductDataReference[] = [
  {
    name: 'HEMP STYLE 有機 ヘンププロテイン パウダー 非加熱 オーガニック カナダ産 栄養管理士監修 1kg(1000g)',
    price: 5500,
    productMassGram: 1000,
    massForNutritionGram: 20,
    url: 'https://www.amazon.co.jp/%E3%83%98%E3%83%B3%E3%83%97%E3%83%97%E3%83%AD%E3%83%86%E3%82%A4%E3%83%B3-%E6%A4%8D%E7%89%A9%E6%80%A7%E3%83%97%E3%83%AD%E3%83%86%E3%82%A4%E3%83%B3-100%EF%BC%85%E3%82%AB%E3%83%8A%E3%83%80%E7%94%A3-%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC%E3%83%95%E3%83%BC%E3%83%89-protein/dp/B08HKX5VZ7/ref=sr_1_2_sspa?dib=eyJ2IjoiMSJ9.O8MzzLOvPXe6582pkqM95_rNNAI5dDWgymMREVEsb9ijSsvJLf8M0xqo7uTs0VXq46P9SA3-TeBxFh35fN30oOHlpVXQ2kpSNA-JB8X7X7S6t3DZFtarrIgynuE0wioGbBQ9QaPoclKr3Ug96lLkm33OyAEynkXmJSCOep63fWiQ08j52zeDEWOqFMLCzhL_y4i22mAam0YbhggpfJ4P3BpdDKRjsKs4fGUTFe9zW42kmgccWsJnh1OWD1UUIQ16C1FQeMPNtD8aDNsj6JwvMaUTXJ89ftISjbgGiZwWino.miuHbSJFdPNVTvFAizH93am-rd9rBC6qbp4QKz7tk7Q&dib_tag=se&keywords=%E3%83%98%E3%83%B3%E3%83%97%E3%83%97%E3%83%AD%E3%83%86%E3%82%A4%E3%83%B3&qid=1743427922&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1',

    // 提供されたデータから取得した値
    calories: 68,
    protein: 10.7,
    fat: 1.9,
    carbohydrates: 0.1, // 糖質
    fiber: 4.2,
    nacl: 0,
    iron: 4.9,
    copper: 0.6,
    magnesium: 193.4,
    zinc: 2.9,
    vitaminB1: 0.23,
    vitaminB6: 0.16,
    // 型定義にあるが、提供されたデータにはない値
    calcium: 0,
    vitaminB12: 0,
    vitaminC: 0,
    vitaminA: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminB2: 0,
    niacin: 0,
    folate: 0,
    pantothenicAcid: 0,
    biotin: 0,
    potassium: 0,
    phosphorus: 0,
    manganese: 0,
    iodine: 0,
    selenium: 0,
    chromium: 0,
    molybdenum: 0,

    // 脂肪酸情報
    saturatedFattyAcids: 0, // 提供データに記載なし
    n3PolyunsaturatedFattyAcids: 0.4,
    n6PolyunsaturatedFattyAcids: 1.2,
    // NutritionFacts型に含まれていない追加情報
    // n9MonounsaturatedFattyAcids: 0.2,
  },
];
