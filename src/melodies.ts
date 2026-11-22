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

export type Melody = {
  id: string;
  name: string;
  category: CategoryId;
  file: number; // результат require(...)
};

// Новая мелодия: файл в assets/sounds + строчка здесь (раздел — один из CATEGORIES)
export const MELODIES: Melody[] = [
  { id: 'sunrise', name: 'Sunrise', category: 'chiptune', file: require('../assets/sounds/chip_sunrise.caf') },
  { id: 'pixel', name: 'Pixel', category: 'chiptune', file: require('../assets/sounds/chip_pixel.caf') },
];

// Мелодии раздела по алфавиту
export function melodiesIn(category: CategoryId) {
  return MELODIES.filter((m) => m.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
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
