// Библиотека мелодий.
// Новая мелодия = положить файл в assets/sounds и добавить строчку сюда. Пересборка не нужна:
// звук отдаётся будильнику «на лету» (проверено разведкой — работает и в беззвучном режиме).

import { Asset } from 'expo-asset';

export type Melody = {
  id: string;
  name: string;
  file: number; // результат require(...)
};

export const MELODIES: Melody[] = [
  { id: 'sunrise', name: 'Sunrise', file: require('../assets/sounds/chip_sunrise.caf') },
  { id: 'pixel', name: 'Pixel', file: require('../assets/sounds/chip_pixel.caf') },
];

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
