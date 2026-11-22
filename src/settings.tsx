// Настройки приложения: тема и «18+». Доступны из любого экрана через useSettings().
// Всё сразу сохраняется в память телефона.

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeId = 'classic' | 'pixel' | 'glam';

export const THEMES: { id: ThemeId; name: string; ready: boolean }[] = [
  { id: 'classic', name: 'Классика', ready: true },
  { id: 'pixel', name: 'Пиксель', ready: false }, // делаем сейчас
  { id: 'glam', name: 'Гламур', ready: false }, // позже
];

type Settings = {
  themeId: ThemeId;
  adult: boolean; // показывать записи 18+
};

const DEFAULTS: Settings = { themeId: 'classic', adult: false };
const STORAGE_KEY = 'settings:v1';

type Ctx = Settings & {
  setThemeId: (id: ThemeId) => void;
  setAdult: (on: boolean) => void;
};

const SettingsContext = createContext<Ctx>({ ...DEFAULTS, setThemeId: () => {}, setAdult: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
      })
      .catch(() => {});
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value: Ctx = {
    ...settings,
    setThemeId: (themeId) => update({ themeId }),
    setAdult: (adult) => update({ adult }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
