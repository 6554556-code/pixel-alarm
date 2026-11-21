// Всё про время в разных часовых поясах.
// Названия дней и месяцев держим сами (а не берём у системы),
// чтобы потом легко переключать язык RU / EN.

const WEEKDAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_RU = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export type ZonedTime = {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0 = воскресенье
};

// Часовой пояс самого телефона, например 'Europe/Moscow'
export const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Форматтеры дорогие — создаём по одному на часовой пояс и переиспользуем
const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'short',
      hour12: false,
    });
    formatters.set(timeZone, f);
  }
  return f;
}

// Какое сейчас время и дата в нужном городе
export function getZonedTime(date: Date, timeZone: string): ZonedTime {
  const parts = getFormatter(timeZone).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')) % 24, // некоторые движки пишут полночь как «24»
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: WEEKDAY_INDEX[get('weekday')] ?? 0,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

// «21:17»
export function formatTime(t: ZonedTime) {
  return `${pad(t.hour)}:${pad(t.minute)}`;
}

// «Сб, 21 нояб.»
export function formatDate(t: ZonedTime) {
  return `${WEEKDAYS_RU[t.weekday]}, ${t.day} ${MONTHS_RU[t.month - 1]}`;
}

// На сколько дней дата в городе отличается от даты у нас: -1, 0, +1
export function dayShift(city: ZonedTime, home: ZonedTime) {
  const cityDay = Date.UTC(city.year, city.month - 1, city.day);
  const homeDay = Date.UTC(home.year, home.month - 1, home.day);
  return Math.round((cityDay - homeDay) / 86_400_000);
}

export function dayShiftLabel(shift: number) {
  if (shift === 1) return 'завтра';
  if (shift === -1) return 'вчера';
  return null;
}
