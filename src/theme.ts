// Стеклянная светлая тема.
// Потом рядом появятся dark.ts, neon.ts, pixel.ts с теми же полями,
// и переключение темы = подмена этого объекта.

export const theme = {
  colors: {
    background: '#EEEAF8', // лавандовый фон экрана
    card: 'rgba(255,255,255,0.55)', // полупрозрачное «стекло»
    cardBorder: 'rgba(255,255,255,0.9)',
    text: '#1B1B24',
    textMuted: '#6E6A80',
    accent: '#8B6CF0', // фиолетовый: активные элементы, Москва
    accentAlt: '#4CC3DE', // бирюзовый: второй город
    accent3: '#EE8CC0', // розовый: третий город
    danger: '#E5575B',
    switchOff: '#D9D6E3',
  },
  radius: {
    card: 28,
    pill: 999,
  },
};

export type Theme = typeof theme;
