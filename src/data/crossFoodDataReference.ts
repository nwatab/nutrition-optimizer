// 主要品目の都市別小売価格, 主要品目の東京都区部小売価格
// https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200571&tstat=000000680001&cycle=1&year=20250&month=11010302&result_back=1&tclass1val=0

type CrossFoodDataReference = {
  estatId: number;
  estatMassGram?: number;
  shokuhinbangou: string;
};
export const crossFoodReference: CrossFoodDataReference[] = [
  {
    estatId: 1001, // コシヒカリ
    shokuhinbangou: '01083',
  },
  {
    estatId: 1002, // コシヒカリ以外
    shokuhinbangou: '01084',
  },
  {
    estatId: 1401, // キャベツ
    shokuhinbangou: '06061',
  },
  {
    estatId: 1402, // ほうれん草
    shokuhinbangou: '06267',
  },
  {
    estatId: 1403, // 白菜
    shokuhinbangou: '06233',
  },
  {
    estatId: 1405, // ねぎ
    shokuhinbangou: '06226',
  },
  {
    estatId: 1406, // レタス
    shokuhinbangou: '06312',
  },
  {
    estatId: 1407, // もやし
    shokuhinbangou: '06287',
  },
  {
    estatId: 1409, // ブロッコリー
    shokuhinbangou: '06263',
  },
  {
    estatId: 1410, // アスパラガス
    shokuhinbangou: '06007',
  },
  {
    estatId: 1411, // さつまいも
    shokuhinbangou: '02045',
  },
  {
    estatId: 1412, // ジャガイモ
    shokuhinbangou: '02063',
  },
  {
    estatId: 1413, // 里芋
    shokuhinbangou: '02010',
  },
  {
    estatId: 1417, // たまねぎ
    shokuhinbangou: '06153',
  },
  {
    estatId: 1438, // しいたけ
    shokuhinbangou: '08039',
  },
  {
    estatId: 1443, // ぶなしめじ
    shokuhinbangou: '08016',
  },
  {
    estatId: 1411, // さつまいも
    shokuhinbangou: '02045',
  },
  {
    estatId: 1471, // 豆腐
    shokuhinbangou: '04032',
  },
  {
    estatId: 1473, // 納豆
    estatMassGram: 150,
    shokuhinbangou: '04046',
  },
  {
    estatId: 1583, // アボカド
    shokuhinbangou: '07006',
  },
  {
    estatId: 1581, // バナナ
    shokuhinbangou: '07107',
  },
  {
    estatId: 1594, // ナッツ
    shokuhinbangou: '04023',
  },
  {
    estatId: 1983, // 豆乳
    estatMassGram: 1020, // 1.02g/1mlとする。
    shokuhinbangou: '04052',
  },
  {
    estatId: 1415, // にんじん
    shokuhinbangou: '06212',
  },
];
