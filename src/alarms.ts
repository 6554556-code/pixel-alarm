// Будильники: модель, сохранение в памяти телефона и связь с системными будильниками (AlarmKit).
//
// Главное правило: «правда» о будильниках — в нашем списке (AsyncStorage).
// Каждый раз, когда будильник меняется, мы пересинхронизируем его с системой:
// снимаем старый и, если он включён, ставим заново.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlarmScheduler from 'react-native-alarm-scheduler';
import { DEFAULT_MELODY, melodyFileUri } from './melodies';

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = понедельник … 7 = воскресенье

export type Alarm = {
  id: string; // UUID — AlarmKit требует именно такой формат
  hour: number;
  minute: number;
  weekdays: Weekday[]; // пусто = однократно
  note: string; // заметка, показывается на экране звонка
  melody: string; // id мелодии из melodies.ts
  enabled: boolean;
  snooze: boolean; // кнопка «Отложить» (подключим на шаге с экраном будильника)
  snoozeMinutes: number;
  kind: 'alarm' | 'reminder'; // будильник (AlarmKit) или мягкое напоминание — этап В
  theme?: string; // тема-аватарка: кухня, сон, встреча… — этап В
};

const STORAGE_KEY = 'alarms:v1';

// --- Помощники ---

// UUID v4 без внешних библиотек
export function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function newAlarm(hour: number, minute: number, patch: Partial<Alarm> = {}): Alarm {
  return {
    id: newId(),
    hour,
    minute,
    weekdays: [],
    note: '',
    melody: DEFAULT_MELODY,
    enabled: true,
    snooze: true,
    snoozeMinutes: 9,
    kind: 'alarm',
    ...patch,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');
export const formatAlarmTime = (a: Pick<Alarm, 'hour' | 'minute'>) => `${pad(a.hour)}:${pad(a.minute)}`;

const WEEKDAY_SHORT: Record<Weekday, string> = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };

// «Однократно», «Каждый день», «Будни», «Выходные» или «Пн Ср Пт»
export function formatRepeat(weekdays: Weekday[]) {
  const set = new Set(weekdays);
  if (set.size === 0) return 'Однократно';
  if (set.size === 7) return 'Каждый день';
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d as Weekday))) return 'Будни';
  if (set.size === 2 && set.has(6) && set.has(7)) return 'Выходные';
  return [...set].sort().map((d) => WEEKDAY_SHORT[d]).join(' ');
}

// --- Связь с системой ---

let permissionAsked = false;

async function ensurePermission() {
  const p = permissionAsked ? await AlarmScheduler.getPermissionsAsync() : await AlarmScheduler.requestPermissionsAsync();
  permissionAsked = true;
  if (p.status !== 'authorized') {
    throw new Error('Нет разрешения на будильники. Включи его в Настройках → Pixel Alarm.');
  }
}

// Снять будильник из системы (если его там нет — не страшно)
async function unschedule(id: string) {
  try {
    await AlarmScheduler.cancelAlarmAsync(id);
  } catch {
    // уже снят
  }
}

// Привести систему в соответствие с нашим будильником
async function sync(alarm: Alarm) {
  await unschedule(alarm.id);
  if (!alarm.enabled) return;
  await ensurePermission();
  await AlarmScheduler.scheduleAlarmAsync({
    id: alarm.id,
    hour: alarm.hour,
    minute: alarm.minute,
    weekdays: alarm.weekdays,
    title: alarm.note || 'Будильник',
    ios: { soundUri: await melodyFileUri(alarm.melody) },
  });
}

// --- Хук для экранов ---

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const alarmsRef = useRef<Alarm[]>([]); // всегда свежий список для async-функций

  const commit = useCallback((next: Alarm[]) => {
    alarmsRef.current = next;
    setAlarms(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  // Загрузка при старте
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const list: Alarm[] = JSON.parse(saved);
          alarmsRef.current = list;
          setAlarms(list);
        }
      })
      .catch(() => {});
  }, []);

  // Синхронизация с понятной ошибкой на экране, если что-то пошло не так
  const syncWithReport = useCallback(
    async (alarm: Alarm) => {
      try {
        await sync(alarm);
      } catch (e) {
        // Не удалось поставить — показываем будильник выключенным, чтобы не врать
        commit(alarmsRef.current.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a)));
        Alert.alert('Будильник не поставлен', String(e instanceof Error ? e.message : e));
      }
    },
    [commit],
  );

  const addAlarm = useCallback(
    (alarm: Alarm) => {
      const next = [...alarmsRef.current, alarm].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
      commit(next);
      syncWithReport(alarm);
    },
    [commit, syncWithReport],
  );

  const updateAlarm = useCallback(
    (id: string, patch: Partial<Alarm>) => {
      let updated: Alarm | undefined;
      const next = alarmsRef.current.map((a) => (a.id === id ? (updated = { ...a, ...patch }) : a));
      commit(next);
      if (updated) syncWithReport(updated);
    },
    [commit, syncWithReport],
  );

  const toggleAlarm = useCallback(
    (id: string) => {
      const a = alarmsRef.current.find((x) => x.id === id);
      if (a) updateAlarm(id, { enabled: !a.enabled });
    },
    [updateAlarm],
  );

  const removeAlarms = useCallback(
    (ids: string[]) => {
      const drop = new Set(ids);
      commit(alarmsRef.current.filter((a) => !drop.has(a.id)));
      ids.forEach(unschedule);
    },
    [commit],
  );

  return { alarms, addAlarm, updateAlarm, toggleAlarm, removeAlarms };
}
