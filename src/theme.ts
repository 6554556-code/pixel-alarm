// Темы оформления.
// classic — стеклянная светлая (как было), pixel — пиксельная (шрифт Tiny5, «лесенки», рисованные иконки).
// Старые компоненты пока импортируют `theme` напрямую — это классика.
// Компоненты, которые уже умеют в темы, берут текущую через useTheme().

import { TextStyle } from 'react-native';
import { useSettings } from './settings';

const classic = {
  id: 'classic' as const,
  pixel: false,
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

export type Theme = Omit<typeof classic, 'id'> & { id: 'classic' | 'pixel' };

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
  font: 'Tiny5',
};

export const theme: Theme = classic;
export const THEME_OBJECTS = { classic, pixel };

export function useTheme(): Theme {
  const { themeId } = useSettings();
  return themeId === 'pixel' ? pixel : classic;
}

// Текст в пиксельном шрифте: жирность у пиксельного шрифта не нужна — она его портит
export function fontOf(t: Theme): TextStyle {
  return t.font ? { fontFamily: t.font, fontWeight: 'normal' } : {};
}
