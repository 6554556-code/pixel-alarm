// Города: список на главном экране, сохранение и поиск.
// Поиск — Open-Meteo Geocoding (тот же сервис, что и погода; бесплатно, без ключа).
// Он сразу отдаёт часовой пояс города — то, что нам и нужно.

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './theme';

export type City = {
  id: string;
  name: string;
  timeZone: string; // IANA, например 'Asia/Seoul'
  lat: number;
  lon: number;
  region?: string; // «Южная Корея» — для списка поиска
};

export const MAX_CITIES = 3;

// Цвет слота по порядку: 1-й фиолетовый, 2-й бирюзовый, 3-й розовый
export const CITY_COLORS = [theme.colors.accent, theme.colors.accentAlt, theme.colors.accent3];

const DEFAULT_CITIES: City[] = [
  { id: 'msk', name: 'Москва', timeZone: 'Europe/Moscow', lat: 55.7558, lon: 37.6173 },
  { id: 'seoul', name: 'Сеул', timeZone: 'Asia/Seoul', lat: 37.5665, lon: 126.978 },
];

const STORAGE_KEY = 'cities:v1';

// Хук: список городов + добавить/удалить. Всё сразу сохраняется в память телефона.
export function useCities() {
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setCities(JSON.parse(saved));
      })
      .catch(() => {});
  }, []);

  const save = useCallback((next: City[]) => {
    setCities(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addCity = useCallback(
    (city: City) => {
      if (cities.length >= MAX_CITIES) return;
      if (cities.some((c) => c.id === city.id)) return; // уже есть
      save([...cities, city]);
    },
    [cities, save],
  );

  const removeCity = useCallback((id: string) => save(cities.filter((c) => c.id !== id)), [cities, save]);

  return { cities, addCity, removeCity };
}

// Поиск города по названию (на русском, но понимает и латиницу)
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}` +
    `&count=12&language=ru&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding: HTTP ${res.status}`);
  const data = await res.json();
  const results: any[] = data.results ?? [];
  return results
    .filter((r) => r.timezone) // без часового пояса город нам бесполезен
    .map((r) => ({
      id: String(r.id),
      name: r.name,
      timeZone: r.timezone,
      lat: r.latitude,
      lon: r.longitude,
      // «Калифорния, США»; регион, совпадающий с названием города, не повторяем
      region: [r.admin1, r.country].filter((v) => v && v !== r.name).join(', '),
    }));
}
