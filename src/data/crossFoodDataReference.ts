// https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200571&tstat=000000680001&cycle=1&year=20250&month=11010302&result_back=1&tclass1val=0

import { FoodData } from '@/types';

type CrossFoodDataReference = {
  estatId: number;
  estatMassGram: number;
  shokuhinbangou: string;
};
export const crossFoodReference: CrossFoodDataReference[] = [
  {
    estatId: 1001, // コシヒカリ
    estatMassGram: 5000,
    shokuhinbangou: '01083',
  },
  {
    estatId: 1002, // コシヒカリ以外
    estatMassGram: 5000,
    shokuhinbangou: '01084',
  },
  {
    estatId: 1594, // ナッツ
    estatMassGram: 100,
    shokuhinbangou: '04023',
  },
  {
    estatId: 1983, // 豆乳
    estatMassGram: 1020, // 1.02g/1mlとする。
    shokuhinbangou: '04052',
  },
];
