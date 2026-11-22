// Библиотека мелодий.
// Новая мелодия = положить файл в assets/sounds и добавить строчку сюда. Пересборка не нужна:
// звук отдаётся будильнику «на лету» (проверено разведкой — работает и в беззвучном режиме).

import { Asset } from 'expo-asset';

// Разделы библиотеки звуков. Порядок здесь = порядок на экране.
// Иконки — твои рисунки (assets/categories), белые на прозрачном → красятся в любой цвет темы.
export const CATEGORIES = [
  { id: 'chiptune', name: 'Чиптюн', icon: require('../assets/categories/chiptune.png') },
  { id: 'sleep', name: 'Сон', icon: require('../assets/categories/sleep.png') },
  { id: 'food', name: 'Еда', icon: require('../assets/categories/food.png') },
  { id: 'home', name: 'Дом', icon: require('../assets/categories/home.png') },
  { id: 'tv', name: 'ТВ', icon: require('../assets/categories/tv.png') },
  { id: 'meds', name: 'Лекарства', icon: require('../assets/categories/meds.png') },
  { id: 'sport', name: 'Спорт', icon: require('../assets/categories/sport.png') },
  { id: 'games', name: 'Игры', icon: require('../assets/categories/games.png') },
  { id: 'study', name: 'Учёба', icon: require('../assets/categories/study.png') },
  { id: 'car', name: 'Машина', icon: require('../assets/categories/car.png') },
  { id: 'travel', name: 'Путешествия', icon: require('../assets/categories/travel.png') },
  { id: 'baby', name: 'Ребёнок', icon: require('../assets/categories/baby.png') },
  { id: 'pets', name: 'Животные', icon: require('../assets/categories/pets.png') },
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
  { id: 'wakeup_coffee', name: 'Кофе', category: 'sleep', sub: 'wakeup', voice: 'f', file: require('../assets/sounds/sleep_wakeup_coffee.mp3') },
  { id: 'wakeup_little_rascal', name: 'Просыпайся, маленький паршивец', category: 'sleep', sub: 'wakeup', voice: 'm', file: require('../assets/sounds/sleep_wakeup_little_rascal.mp3') },

  // Еда
  { id: 'oven_hot_thing_ready', name: 'Твоя горячая штучка готова', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_hot_thing_ready.mp3') },
  { id: 'oven_damn_hot', name: 'Чертовски горячее', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_damn_hot.mp3') },
  { id: 'food_brew_tea', name: 'Завари чай', category: 'food', voice: 'f', file: require('../assets/sounds/food_brew_tea.mp3') },
  { id: 'food_earned_espresso', name: 'Ты заслужила эспрессо', category: 'food', voice: 'f', file: require('../assets/sounds/food_earned_espresso.mp3') },
  { id: 'food_drink_coffee', name: 'Выпить кофе', category: 'food', voice: 'f', file: require('../assets/sounds/food_drink_coffee.mp3') },
  { id: 'food_only_salads', name: 'Только салаты', category: 'food', voice: 'f', file: require('../assets/sounds/food_only_salads.mp3') },
  { id: 'food_oven_time_to_take_out', name: 'Пора вынимать', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_time_to_take_out.mp3') },
  { id: 'food_oven_take_out_pie', name: 'Доставай пирог', category: 'food', sub: 'oven', voice: 'f', file: require('../assets/sounds/food_oven_take_out_pie.mp3') },
  { id: 'food_order_pizza', name: 'Закажи пиццу', category: 'food', voice: 'f', file: require('../assets/sounds/food_order_pizza.mp3') },
  { id: 'food_restaurant', name: 'Ресторан', category: 'food', voice: 'f', file: require('../assets/sounds/food_restaurant.mp3') },
  { id: 'food_time_to_feast', name: 'Пора красиво пожрать', category: 'food', voice: 'f', file: require('../assets/sounds/food_time_to_feast.mp3') },
  { id: 'food_breakfast', name: 'Завтрак', category: 'food', voice: 'f', file: require('../assets/sounds/food_breakfast.mp3') },
  { id: 'food_turn_on_stove', name: 'Включай плиту', category: 'food', voice: 'f', file: require('../assets/sounds/food_turn_on_stove.mp3') },
  { id: 'food_dinner_waits', name: 'Ужин ждёт', category: 'food', voice: 'f', file: require('../assets/sounds/food_dinner_waits.mp3') },
  { id: 'food_march_to_lunch', name: 'Марш на обед', category: 'food', voice: 'f', file: require('../assets/sounds/food_march_to_lunch.mp3') },
  { id: 'food_no_lunch_yet', name: 'Ты же не обедала', category: 'food', voice: 'f', file: require('../assets/sounds/food_no_lunch_yet.mp3') },

  // Дом
  { id: 'laundry_hang_wet_guys', name: 'Развесить мокрых парней', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_hang_wet_guys.mp3') },
  { id: 'laundry_your_laundry', name: 'Твоя стирка', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_your_laundry.mp3') },
  { id: 'laundry_dirty_clean', name: 'Грязные ублюдки чисты', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_dirty_clean.mp3') },
  { id: 'home_trash_bag', name: 'Мусорный пакет', category: 'home', voice: 'f', file: require('../assets/sounds/home_trash_bag.mp3') },
  { id: 'home_cleaning', name: 'Уборка', category: 'home', voice: 'f', file: require('../assets/sounds/home_cleaning.mp3') },
  { id: 'home_dishwasher', name: 'Посудомойка', category: 'home', voice: 'f', file: require('../assets/sounds/home_dishwasher.mp3') },
  { id: 'home_dishes', name: 'Посуда', category: 'home', voice: 'f', file: require('../assets/sounds/home_dishes.mp3') },
  { id: 'home_laundry_washing_machine', name: 'Стиральная машина', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_washing_machine.mp3') },
  { id: 'home_water_flowers', name: 'Полить цветы', category: 'home', voice: 'f', file: require('../assets/sounds/home_water_flowers.mp3') },
  { id: 'home_too_dirty', name: 'Слишком грязно', category: 'home', voice: 'f', file: require('../assets/sounds/home_too_dirty.mp3') },
  { id: 'home_vacuum', name: 'Пылесос', category: 'home', voice: 'f', file: require('../assets/sounds/home_vacuum.mp3') },
  { id: 'home_pay_bills', name: 'Оплата счетов', category: 'home', voice: 'f', file: require('../assets/sounds/home_pay_bills.mp3') },
  { id: 'home_pay_internet', name: 'Оплата интернета', category: 'home', voice: 'f', file: require('../assets/sounds/home_pay_internet.mp3') },
  { id: 'home_sort_wardrobe', name: 'Разбери шкаф', category: 'home', voice: 'f', file: require('../assets/sounds/home_sort_wardrobe.mp3') },
  { id: 'home_laundry_ironing', name: 'Погладить бельё', category: 'home', sub: 'laundry', voice: 'f', file: require('../assets/sounds/home_laundry_ironing.mp3') },
  { id: 'home_bed_linen', name: 'Постельное бельё', category: 'home', voice: 'f', file: require('../assets/sounds/home_bed_linen.mp3') },
  { id: 'home_change_bedding', name: 'Сменить постельное', category: 'home', voice: 'f', file: require('../assets/sounds/home_change_bedding.mp3') },

  // Ребёнок
  { id: 'baby_club', name: 'Кружок', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_club.mp3') },
  { id: 'baby_vitamins', name: 'Витамины', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_vitamins.mp3') },
  { id: 'baby_pickup_kindergarten', name: 'Забрать из садика', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_pickup_kindergarten.mp3') },
  { id: 'baby_little_messy', name: 'Маленький грязнуля', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_little_messy.mp3') },
  { id: 'baby_to_bed', name: 'В постель', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_to_bed.mp3') },
  { id: 'baby_time_to_feed', name: 'Пора накормить', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_time_to_feed.mp3') },
  { id: 'baby_soup', name: 'Суп', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_soup.mp3') },
  { id: 'baby_puree', name: 'Пюре', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_puree.mp3') },
  { id: 'baby_nanny_or_kindergarten', name: 'Няня или садик', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_nanny_or_kindergarten.mp3') },
  { id: 'baby_kindergarten', name: 'Садик', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_kindergarten.mp3') },
  { id: 'baby_wake_up', name: 'Разбудить', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_wake_up.mp3') },
  { id: 'baby_wake_up_2', name: 'Разбудить 2', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_wake_up_2.mp3') },
  { id: 'baby_take_phone', name: 'Забери телефон', category: 'baby', voice: 'f', file: require('../assets/sounds/baby_take_phone.mp3') },

  // Лекарства
  { id: 'meds_on_schedule', name: 'Лекарства по расписанию', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_on_schedule.mp3') },
  { id: 'meds_evening_ritual', name: 'Вечерний ритуал', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_evening_ritual.mp3') },
  { id: 'meds_magnesium', name: 'Магний', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_magnesium.mp3') },
  { id: 'meds_on_tongue', name: 'Положи на язык', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_on_tongue.mp3') },
  { id: 'meds_vitamin_party', name: 'Витаминная вечеринка', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_vitamin_party.mp3') },
  { id: 'meds_vitamin', name: 'Витамин', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_vitamin.mp3') },
  { id: 'meds_take_your_pill', name: 'Возьми свою таблеточку', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_take_your_pill.mp3') },
  { id: 'meds_swallow_baby', name: 'Глотай, детка', category: 'meds', voice: 'f', file: require('../assets/sounds/meds_swallow_baby.mp3') },

  // ТВ
  { id: 'tv_dont_miss_baby', name: 'Не пропусти, крошка', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_dont_miss_baby.mp3') },
  { id: 'tv_gonna_be_hot', name: 'Будет жарко', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_gonna_be_hot.mp3') },
  { id: 'tv_wanted_sequel', name: 'Хотела продолжения?', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_wanted_sequel.mp3') },
  { id: 'tv_series', name: 'Сериал', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_series.mp3') },
  { id: 'tv_get_comfy', name: 'Устраивайся поудобнее', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_get_comfy.mp3') },
  { id: 'tv_family_comedy', name: 'Семейный просмотр комедии', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_family_comedy.mp3') },
  { id: 'tv_talk_show', name: 'Ток-шоу', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_talk_show.mp3') },
  { id: 'tv_reality_show', name: 'Реалити-шоу', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_reality_show.mp3') },
  { id: 'tv_horror', name: 'Ужастик', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_horror.mp3') },
  { id: 'tv_thriller', name: 'Триллер', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_thriller.mp3') },
  { id: 'tv_men_waiting', name: 'Тебя ждут несколько мужчин', category: 'tv', voice: 'f', file: require('../assets/sounds/tv_men_waiting.mp3') },
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
