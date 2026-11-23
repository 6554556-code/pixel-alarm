// Темы оформления.
// classic — стеклянная светлая (как было), pixel — пиксельная (шрифт Press Start 2P, «лесенки», рисованные иконки).
// Старые компоненты пока импортируют `theme` напрямую — это классика.
// Компоненты, которые уже умеют в темы, берут текущую через useTheme().

import { PixelRatio, TextStyle } from 'react-native';
import { useSettings } from './settings';

const classic = {
  id: 'classic' as const,
  pixel: false,
  glam: false,
  colors: {
    background: '#EEEAF8', // лавандовый фон экрана
    card: 'rgba(255,255,255,0.55)', // полупрозрачное «стекло»
    cardBorder: 'rgba(255,255,255,0.9)',
    text: '#1B1B24',
    textMuted: '#6E6A80',
    accent: '#8B6CF0', // фиолетовый: активные элементы, 1-й город
    accentAlt: '#4CC3DE', // бирюзовый: 2-й город
    accent3: '#EE8CC0', // розовый: 3-й город
    danger: '#E5575B',
    switchOff: '#D9D6E3',
    outline: '#3B2A6E', // тёмный контур (используется в пиксельной теме)
    surface: '#FFFFFF',
  },
  radius: {
    card: 28,
    pill: 999,
  },
  font: undefined as string | undefined,
};

export type Theme = Omit<typeof classic, 'id'> & { id: 'classic' | 'pixel' | 'glam' };

const pixel: Theme = {
  ...classic,
  id: 'pixel',
  pixel: true,
  colors: {
    ...classic.colors,
    background: '#ECE7FB',
    text: '#1E1633',
    textMuted: '#6B6385',
    outline: '#3B2A6E',
    surface: '#FBFAFF',
    switchOff: '#DCD7EA',
  },
  radius: { card: 0, pill: 0 },
  font: 'PressStart2P',
};

// Гламур: стекло как в классике + перламутровый фон, хромированные циферблаты и стрелки
const glam: Theme = {
  ...classic,
  id: 'glam',
  glam: true,
  colors: { ...classic.colors, background: '#E6E2F8' },
  font: 'Forum',
};

export const theme: Theme = classic;
export const THEME_OBJECTS = { classic, pixel, glam };

export function useTheme(): Theme {
  const { themeId } = useSettings();
  return THEME_OBJECTS[themeId] ?? classic;
}

// Press Start 2P нарисован на сетке 8×8: буква чёткая, только если её «пиксель»
// равен целому числу пикселей экрана. Подгоняем размер к ближайшему такому.
export function crispSize(size: number) {
  const unit = 8 / PixelRatio.get(); // размер шрифта, при котором 1 пиксель буквы = 1 пиксель экрана
  return Math.max(2, Math.round(size / unit)) * unit;
}

// Текст под тему. pixelSize — размер в пиксельной теме (там буквы широкие, нужен свой размер).
// Жирность у пиксельного шрифта не нужна — она его портит.
export function fontOf(t: Theme, pixelSize?: number): TextStyle {
  if (!t.font) return {};
  // размеры «под пиксель» нужны только пиксельной теме; гламур просто меняет шрифт
  if (!t.pixel || !pixelSize) return { fontFamily: t.font, fontWeight: 'normal' };
  const fontSize = crispSize(pixelSize);
  return { fontFamily: t.font, fontWeight: 'normal', fontSize, lineHeight: Math.round(fontSize * 1.5) };
}
