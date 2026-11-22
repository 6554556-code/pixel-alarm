// Библиотека мелодий.
// Новая мелодия = положить файл в assets/sounds и добавить строчку сюда. Пересборка не нужна:
// звук отдаётся будильнику «на лету» (проверено разведкой — работает и в беззвучном режиме).

import { Asset } from 'expo-asset';

// Разделы библиотеки звуков. Порядок здесь = порядок на экране.
// Иконки — твои рисунки (assets/categories), белые на прозрачном → красятся в любой цвет темы.
export const CATEGORIES = [
  { id: 'chiptune', name: 'Чиптюн', icon: require('../assets/categories/chiptune.png') },
  { id: 'sleep', name: 'Сон', icon: require('../assets/categories/sleep.png') },
  { id: 'baby', name: 'Ребёнок', icon: require('../assets/categories/baby.png') },
  { id: 'pets', name: 'Животные', icon: require('../assets/categories/pets.png') },
  { id: 'meds', name: 'Лекарства', icon: require('../assets/categories/meds.png') },
  { id: 'car', name: 'Машина', icon: require('../assets/categories/car.png') },
  { id: 'food', name: 'Еда', icon: require('../assets/categories/food.png') },
  { id: 'home', name: 'Дом', icon: require('../assets/categories/home.png') },
  { id: 'sport', name: 'Спорт', icon: require('../assets/categories/sport.png') },
  { id: 'study', name: 'Учёба', icon: require('../assets/categories/study.png') },
  { id: 'tv', name: 'ТВ', icon: require('../assets/categories/tv.png') },
  { id: 'games', name: 'Игры', icon: require('../assets/categories/games.png') },
  { id: 'travel', name: 'Путешествия', icon: require('../assets/categories/travel.png') },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

// Подразделы. Пока нигде не показываем — заготовка, вдруг дорисуем иконки.
export const SUBCATEGORIES: Partial<Record<CategoryId, { id: string; name: string }[]>> = {
  sleep: [{ id: 'wakeup', name: 'Будильник' }],
  food: [{ id: 'oven', name: 'Печка' }],
  home: [{ id: 'laundry', name: 'Стирка' }],
};

// Кому адресована запись: м — мужчине, ж — женщине, any — общая (мелодии, звуки без обращения)
export type Voice = 'm' | 'f' | 'any';

export type Melody = {
  id: string;
  name: string;
  category: CategoryId;
  sub?: string; // id подраздела из SUBCATEGORIES
  voice: Voice;
  file: number; // результат require(...)
};

// Новая мелодия: файл в assets/sounds (до 30 сек) + строчка здесь
export const MELODIES: Melody[] = [
  // Чиптюн
  { id: 'sunrise', name: 'Sunrise', category: 'chiptune', voice: 'any', file: require('../assets/sounds/chip_sunrise.caf') },
  { id: 'pixel', name: 'Pixel', category: 'chiptune', voice: 'any', file: require('../assets/sounds/chip_pixel.caf') },

  // Сон
  { id: 'wakeup_little_rascal', name: 'Просыпайся, маленький паршивец', category: 'sleep', sub: 'wakeup', voice: 'm', file: require('../assets/sounds/sleep_wakeup_little_rascal.mp3') },

  // Еда
  { id: 'oven_hot_thing_ready', name: 'Твоя горячая штучка готова', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_hot_thing_ready.mp3') },
  { id: 'oven_damn_hot', name: 'Чертовски горячее', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_damn_hot.mp3') },

  // Дом
  { id: 'laundry_hang_wet_guys', name: 'Развесить мокрых парней', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_hang_wet_guys.mp3') },
  { id: 'laundry_dirty_clean', name: 'Грязные ублюдки чисты', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_dirty_clean.mp3') },
];

// Подходит ли запись под переключатель М/Ж/Общие: общие видны везде
export function fitsVoice(m: Melody, voice: Voice) {
  return m.voice === 'any' || m.voice === voice;
}

// Мелодии раздела по алфавиту (с учётом переключателя М/Ж/Общие)
export function melodiesIn(category: CategoryId, voice: Voice = 'any') {
  return MELODIES.filter((m) => m.category === category && fitsVoice(m, voice)).sort((a, b) =>
    a.name.localeCompare(b.name, 'ru'),
  );
}

export const DEFAULT_MELODY = 'sunrise';

export function getMelody(id: string): Melody {
  return MELODIES.find((m) => m.id === id) ?? MELODIES[0];
}

// Путь к файлу мелодии на телефоне (file://...) — его и отдаём будильнику
export async function melodyFileUri(id: string): Promise<string> {
  const asset = Asset.fromModule(getMelody(id).file);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error(`Не нашёлся файл мелодии «${id}»`);
  return asset.localUri;
}
