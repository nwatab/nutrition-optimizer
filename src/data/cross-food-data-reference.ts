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
    estatId: 1041, // そうめん
    shokuhinbangou: '01043',
  },

  {
    estatId: 1021, // 食パン(1kg)
    shokuhinbangou: '01026',
  },
  {
    estatId: 1042, // スパゲッティ
    shokuhinbangou: '01063',
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
    estatId: 1414, // 大根
    shokuhinbangou: '06132',
  },
  {
    estatId: 1415, // にんじん
    shokuhinbangou: '06212',
  },
  {
    estatId: 1416, // ゴボウ
    shokuhinbangou: '06084',
  },
  {
    estatId: 1417, // たまねぎ
    shokuhinbangou: '06153',
  },
  {
    estatId: 1419, // れんこん
    shokuhinbangou: '06317',
  },
  {
    estatId: 1420, // ながいも
    shokuhinbangou: '02025',
  },
  {
    estatId: 1421, // しょうが
    shokuhinbangou: '06103',
  },
  {
    estatId: 1430, // えだまめ
    shokuhinbangou: '06015',
  },
  {
    estatId: 1432, // さやいんげん
    shokuhinbangou: '06010',
  },
  {
    estatId: 1433, // かぼちゃ
    shokuhinbangou: '06046',
  },
  {
    estatId: 1434, // きゅうり
    shokuhinbangou: '06065',
  },
  {
    estatId: 1435, // なす
    shokuhinbangou: '06191',
  },
  {
    estatId: 1436, // トマト
    shokuhinbangou: '06183',
  },
  {
    estatId: 1437, // ピーマン
    shokuhinbangou: '06245',
  },
  {
    estatId: 1438, // 生しいたけ
    shokuhinbangou: '08039',
  },
  {
    estatId: 1442, // えのきたけ
    shokuhinbangou: '08001',
  },
  {
    estatId: 1443, // ぶなしめじ
    shokuhinbangou: '08016',
  },
  {
    estatId: 1502, // りんご
    shokuhinbangou: '07176',
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
    estatId: 1571, // いちご
    shokuhinbangou: '07012',
  },
  {
    estatId: 1584, // パイナップル
    shokuhinbangou: '07097',
  },
  {
    estatId: 1453, // 干ししいたけ
    shokuhinbangou: '08013',
  },
  {
    estatId: 1461, // 干しのり 10枚
    estatMassGram: 3 * 10, // 3g/枚とする。
    shokuhinbangou: '09003',
  },
  {
    estatId: 1462, // わかめ 多分、乾燥
    shokuhinbangou: '09040',
  },
  {
    estatId: 1463, // こんぶ。栄養価は真昆布を採用。
    shokuhinbangou: '09017',
  },
  {
    estatId: 1464, // ひじき
    shokuhinbangou: '09017',
  },
  {
    estatId: 1471, // 豆腐
    shokuhinbangou: '04032',
  },
  {
    estatId: 1472, // 油揚げ
    shokuhinbangou: '04040',
  },

  {
    estatId: 1473, // 納豆
    estatMassGram: 150,
    shokuhinbangou: '04046',
  },
  {
    estatId: 1481, // こんにゃく
    shokuhinbangou: '02003',
  },
  {
    estatId: 1482, // 梅干し
    shokuhinbangou: '07022',
  },
  {
    estatId: 1483, // 大根漬け
    shokuhinbangou: '06138',
  },
  {
    estatId: 1485, // 昆布佃煮
    shokuhinbangou: '09023',
  },
  {
    estatId: 1486, // はくさい漬け
    shokuhinbangou: '06235',
  },
  {
    estatId: 1487, // キムチ
    shokuhinbangou: '06236',
  },

  {
    estatId: 1594, // ナッツ
    shokuhinbangou: '04023',
  },
  {
    estatId: 1631, // みそ
    estatMassGram: 750,
    shokuhinbangou: '17045',
  },
  {
    estatId: 1983, // 豆乳
    estatMassGram: 1020, // 1.02g/1mlとする。
    shokuhinbangou: '04052',
  },
];
