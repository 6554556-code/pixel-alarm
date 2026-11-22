// Погода. Источник — Open-Meteo (бесплатно, без ключа).
// Если когда-нибудь поменяем источник (например, на Apple WeatherKit),
// переписать нужно только fetchWeather — остальное приложение не заметит.

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

export type Weather = {
  temp: number; // °C, округлённая
  kind: WeatherKind;
  label: string; // «Ясно», «Облачно»…
  isDay: boolean;
};

const REFRESH_MS = 15 * 60 * 1000; // раз в 15 минут

// Коды погоды WMO → наша категория и подпись (коротко, чтобы влезло в плашку)
function describe(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: 'clear', label: 'Ясно' };
  if (code === 1 || code === 2) return { kind: 'partly', label: 'Облачно' }; // иконка — солнце/луна за облаком
  if (code === 3) return { kind: 'cloudy', label: 'Облачно' };
  if (code === 45 || code === 48) return { kind: 'fog', label: 'Туман' };
  if (code >= 51 && code <= 57) return { kind: 'rain', label: 'Морось' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'rain', label: 'Дождь' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow', label: 'Снег' };
  if (code >= 95) return { kind: 'storm', label: 'Гроза' };
  return { kind: 'cloudy', label: 'Облачно' };
}

export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,is_day`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo: HTTP ${res.status}`);
  const data = await res.json();
  const c = data.current;
  return {
    temp: Math.round(c.temperature_2m),
    ...describe(c.weather_code),
    isDay: c.is_day === 1,
  };
}

// «−3°» с настоящим минусом, «18°»
export function formatTemp(t: number) {
  return `${t < 0 ? '−' : ''}${Math.abs(t)}°`;
}

// Хук: погода для города. Сразу показывает сохранённую (если есть),
// потом подтягивает свежую и обновляет каждые 15 минут.
export function useWeather(lat: number, lon: number) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const key = `weather:${lat},${lon}`;
    let alive = true;

    AsyncStorage.getItem(key)
      .then((saved) => {
        if (alive && saved) setWeather((w) => w ?? JSON.parse(saved));
      })
      .catch(() => {});

    const load = async () => {
      try {
        const w = await fetchWeather(lat, lon);
        if (!alive) return;
        setWeather(w);
        AsyncStorage.setItem(key, JSON.stringify(w)).catch(() => {});
      } catch {
        // нет интернета — молча остаёмся с последней сохранённой погодой
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [lat, lon]);

  return weather;
}
