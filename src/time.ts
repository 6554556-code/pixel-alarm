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

// --- Для будильников (время телефона) ---

// День недели по ISO: 1 = понедельник … 7 = воскресенье
export const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1;

// Когда будильник зазвонит в следующий раз
export function nextRing(hour: number, minute: number, weekdays: number[], from = new Date()): Date {
  for (let i = 0; i <= 7; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, hour, minute, 0, 0);
    if (d > from && (weekdays.length === 0 || weekdays.includes(isoWeekday(d)))) return d;
  }
  return new Date(from.getTime() + 7 * 86_400_000); // сюда не попадём, но TypeScript просит
}

// «7 ч 12 мин», «2 дн. 3 ч», «15 мин»
export function formatDuration(ms: number) {
  const total = Math.max(1, Math.ceil(ms / 60_000));
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  if (d > 0) return h > 0 ? `${d} дн. ${h} ч` : `${d} дн.`;
  if (h > 0) return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  return `${m} мин`;
}
