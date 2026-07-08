import type { EnvCategoryId } from '@/data/environmental-impact-reference';
import { classifyEnvCategory } from '@/services/environment';
import type { Locale } from '@/config';
import type { Food } from '@/types/nutrition';

/**
 * 一覧の表示・絞り込み用の食材カテゴリー。日本食品標準成分表の食品群を
 * もとにした粗い区分で、環境負荷用の {@link EnvCategoryId}（Poore & Nemecek
 * 対応の細かい18分類）とは目的が別。値は導出のみで、食材データには保存しない。
 */
export type DisplayCategory =
  | 'grains'
  | 'potatoes'
  | 'pulses'
  | 'nutsAndSeeds'
  | 'vegetables'
  | 'fruits'
  | 'mushrooms'
  | 'seaweed'
  | 'oils'
  | 'other';

/**
 * チップやセルの並び順。おおむね食品標準成分表の食品群の順。
 */
export const DISPLAY_CATEGORY_ORDER: readonly DisplayCategory[] = [
  'grains',
  'potatoes',
  'pulses',
  'nutsAndSeeds',
  'vegetables',
  'fruits',
  'mushrooms',
  'seaweed',
  'oils',
  'other',
];

/**
 * カテゴリーの表示メタ。アイコンは1フィールドの絵文字（lucide に藻類・きのこ・
 * いもの線アイコンが無いため。差し替えはここだけで済む）。ラベルは
 * 参照データとして併記し、UI 側の文言 JSON には散らさない。
 */
export const displayCategoryMeta: Record<
  DisplayCategory,
  { icon: string; label: Record<Locale, string> }
> = {
  grains: { icon: '🌾', label: { 'ja-JP': '穀類', 'en-US': 'Grains' } },
  potatoes: { icon: '🥔', label: { 'ja-JP': 'いも類', 'en-US': 'Potatoes' } },
  pulses: { icon: '🫘', label: { 'ja-JP': '豆類', 'en-US': 'Legumes' } },
  nutsAndSeeds: {
    icon: '🥜',
    label: { 'ja-JP': '種実類', 'en-US': 'Nuts & seeds' },
  },
  vegetables: {
    icon: '🥬',
    label: { 'ja-JP': '野菜', 'en-US': 'Vegetables' },
  },
  fruits: { icon: '🍎', label: { 'ja-JP': '果実', 'en-US': 'Fruits' } },
  mushrooms: {
    icon: '🍄',
    label: { 'ja-JP': 'きのこ', 'en-US': 'Mushrooms' },
  },
  seaweed: { icon: '🌿', label: { 'ja-JP': '藻類', 'en-US': 'Seaweed' } },
  oils: { icon: '🫒', label: { 'ja-JP': '油脂', 'en-US': 'Oils' } },
  other: { icon: '🍽️', label: { 'ja-JP': 'その他', 'en-US': 'Other' } },
};

// 食品番号（shokuhinbangou）の先頭2桁 = 食品標準成分表の食品群 → 表示カテゴリー。
// これが最も権威ある区分なので第一に用いる。米も豆も食品群で正しく分かれる。
const displayByFoodGroup: Record<string, DisplayCategory> = {
  '01': 'grains', // 穀類
  '02': 'potatoes', // いも及びでん粉類
  '03': 'other', // 砂糖及び甘味類
  '04': 'pulses', // 豆類
  '05': 'nutsAndSeeds', // 種実類
  '06': 'vegetables', // 野菜類
  '07': 'fruits', // 果実類
  '08': 'mushrooms', // きのこ類
  '09': 'seaweed', // 藻類
  '14': 'oils', // 油脂類
  '16': 'other', // し好飲料類
  '17': 'other', // 調味料及び香辛料類
  '18': 'other', // 調理済み流通食品類
};

// フォールバック用。食品番号を持たない manual 食材や、上表に無い食品群を、
// 既存のキーワード分類器（classifyEnvCategory）の結果から表示カテゴリーへ畳む。
const displayByEnvCategory: Record<EnvCategoryId, DisplayCategory> = {
  rice: 'grains',
  wheatAndRye: 'grains',
  potatoes: 'potatoes',
  otherPulses: 'pulses',
  soyProducts: 'pulses',
  nutsAndSeeds: 'nutsAndSeeds',
  brassicas: 'vegetables',
  onionsAndLeeks: 'vegetables',
  rootVegetables: 'vegetables',
  tomatoes: 'vegetables',
  otherVegetables: 'vegetables',
  bananas: 'fruits',
  apples: 'fruits',
  citrusFruit: 'fruits',
  otherFruits: 'fruits',
  mushrooms: 'mushrooms',
  seaweed: 'seaweed',
  vegetableOils: 'oils',
  otherCrops: 'other',
};

/**
 * 食材を表示カテゴリーへ対応付ける。食品番号の食品群を第一に、無ければ
 * 既存のキーワード分類（manual 食材・未収載の食品群向け）へフォールバックする。
 */
export const displayCategoryOf = (food: Food): DisplayCategory => {
  if (food.type !== 'manual') {
    const byGroup = displayByFoodGroup[food.shokuhinbangou.slice(0, 2)];
    if (byGroup) return byGroup;
  }
  // mext は食品番号を持つので上で解決される。残りは価格あり食材のみ。
  if (food.type === 'mext') return 'other';
  return displayByEnvCategory[classifyEnvCategory(food)];
};
