// 主要品目の都市別小売価格, 主要品目の東京都区部小売価格
// https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200571&tstat=000000680001&cycle=1&year=20250&month=11010302&result_back=1&tclass1val=0

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
    estatId: 1401, // キャベツ
    estatMassGram: 1000,
    shokuhinbangou: '06061',
  },
  {
    estatId: 1402, // ほうれん草
    estatMassGram: 1000,
    shokuhinbangou: '06267',
  },
  {
    estatId: 1403, // 白菜
    estatMassGram: 1000,
    shokuhinbangou: '06233',
  },
  {
    estatId: 1405, // ねぎ
    estatMassGram: 1000,
    shokuhinbangou: '06226',
  },
  {
    estatId: 1406, // レタス
    estatMassGram: 1000,
    shokuhinbangou: '06312',
  },
  {
    estatId: 1407, // もやし
    estatMassGram: 1000,
    shokuhinbangou: '06287',
  },
  {
    estatId: 1409, // ブロッコリー
    estatMassGram: 1000,
    shokuhinbangou: '06263',
  },
  {
    estatId: 1410, // アスパラガス
    estatMassGram: 1000,
    shokuhinbangou: '06007',
  },
  {
    estatId: 1411, // さつまいも
    estatMassGram: 1000,
    shokuhinbangou: '08016',
  },
  {
    estatId: 1412, // ジャガイモ
    estatMassGram: 1000,
    shokuhinbangou: '02063',
  },
  {
    estatId: 1413, // 里芋
    estatMassGram: 1000,
    shokuhinbangou: '02010',
  },
  {
    estatId: 1417, // たまねぎ
    estatMassGram: 1000,
    shokuhinbangou: '06153',
  },
  {
    estatId: 1438, // しいたけ
    estatMassGram: 1000,
    shokuhinbangou: '08039',
  },
  {
    estatId: 1443, // ぶなしめじ
    estatMassGram: 1000,
    shokuhinbangou: '08016',
  },
  {
    estatId: 1411, // さつまいも
    estatMassGram: 1000,
    shokuhinbangou: '02045',
  },
  {
    estatId: 1471, // 豆腐
    estatMassGram: 1000,
    shokuhinbangou: '04032',
  },
  {
    estatId: 1473, // 納豆
    estatMassGram: 1000,
    shokuhinbangou: '04046',
  },
  {
    estatId: 1583, // アボカド
    estatMassGram: 1000,
    shokuhinbangou: '07006',
  },
  {
    estatId: 1581, // バナナ
    estatMassGram: 1000,
    shokuhinbangou: '07107',
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
  {
    estatId: 1415, // にんじん
    estatMassGram: 1000,
    shokuhinbangou: '06212',
  },
];
