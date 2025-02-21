import { Food } from './types';

// 値は100gあたりのものです。値段は税込。
export const foods: Food[] = [
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
