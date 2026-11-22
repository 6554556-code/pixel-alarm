// Цветные иконки погоды с лёгким свечением (как у циферблатов).
// Свечение = под каждой линией лежит её копия: толще и полупрозрачная.

import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { WeatherKind } from '../weather';
import { useTheme } from '../theme';
import { PixelIcon, PixelIconName } from './Pixel';

// В пиксельной теме — твои рисованные иконки
function pixelName(kind: WeatherKind, isDay: boolean): PixelIconName {
  if (kind === 'clear') return isDay ? 'sun' : 'moon';
  if (kind === 'partly') return isDay ? 'partly_day' : 'partly_night';
  return kind === 'cloudy' ? 'cloud' : kind;
}

// ===== Палитра иконок — подкручивать здесь =====
export const ICON_COLORS = {
  sun: '#F5B83D', // тёплый жёлтый
  moon: '#7B86F2', // сине-фиолетовый
  cloud: '#7C9CD6', // мягкий голубой
  cloudFill: '#F3F6FF',
  fog: '#9AA6C2',
  rain: '#3FB6DA',
  snow: '#7FD3F0',
  bolt: '#F5B83D',
};
const W = 1.6; // толщина линий (в координатах 24×24)
const HALO = { extra: 2.2, opacity: 0.28 }; // свечение вокруг линий

// --- «Светящиеся» примитивы: ореол + сама линия ---

type Stroke = { color: string; fill?: string };

function GPath({ d, color, fill = 'none' }: Stroke & { d: string }) {
  return (
    <>
      <Path d={d} fill="none" stroke={color} strokeOpacity={HALO.opacity} strokeWidth={W + HALO.extra} strokeLinejoin="round" strokeLinecap="round" />
      <Path d={d} fill={fill} stroke={color} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
}

function GLine({ x1, y1, x2, y2, color }: Stroke & { x1: number; y1: number; x2: number; y2: number }) {
  const p = { x1, y1, x2, y2 };
  return (
    <>
      <Line {...p} stroke={color} strokeOpacity={HALO.opacity} strokeWidth={W + HALO.extra} strokeLinecap="round" />
      <Line {...p} stroke={color} strokeWidth={W} strokeLinecap="round" />
    </>
  );
}

function GCircle({ cx, cy, r, color, fill = 'none' }: Stroke & { cx: number; cy: number; r: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeOpacity={HALO.opacity} strokeWidth={W + HALO.extra} />
      <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={color} strokeWidth={W} />
    </>
  );
}

// --- Детали ---

// Облако: контур с плоским низом
const CLOUD = 'M7 18h10.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 7.3 10.2 4 4 0 0 0 7 18z';
// Облако поменьше и повыше — над ним солнце/под ним осадки
const CLOUD_LOW = 'M7.5 15.5h9a3 3 0 0 0 .35-5.98A4.75 4.75 0 0 0 7.8 8.2 3.65 3.65 0 0 0 7.5 15.5z';
const MOON = 'M15.5 4.5a7.5 7.5 0 1 0 4 13.6A6 6 0 0 1 15.5 4.5z';

function Sun({ cx = 12, cy = 12, r = 4 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <>
      <GCircle cx={cx} cy={cy} r={r} color={ICON_COLORS.sun} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <GLine
            key={i}
            x1={cx + Math.cos(a) * (r + 2)}
            y1={cy + Math.sin(a) * (r + 2)}
            x2={cx + Math.cos(a) * (r + 4)}
            y2={cy + Math.sin(a) * (r + 4)}
            color={ICON_COLORS.sun}
          />
        );
      })}
    </>
  );
}

const Cloud = ({ d = CLOUD, filled = false }: { d?: string; filled?: boolean }) => (
  <GPath d={d} color={ICON_COLORS.cloud} fill={filled ? ICON_COLORS.cloudFill : 'none'} />
);

export function WeatherIcon({ kind, isDay = true, size = 16 }: { kind: WeatherKind; isDay?: boolean; size?: number }) {
  const t = useTheme();
  if (t.pixel) return <PixelIcon name={pixelName(kind, isDay)} size={size + 4} />;
  let content;
  switch (kind) {
    case 'clear':
      content = isDay ? <Sun /> : <GPath d={MOON} color={ICON_COLORS.moon} />;
      break;
    case 'partly':
      content = (
        <>
          {isDay ? (
            <Sun cx={8.5} cy={8} r={3} />
          ) : (
            <GPath d="M10 3.2a5 5 0 1 0 2.7 9.1A4 4 0 0 1 10 3.2z" color={ICON_COLORS.moon} />
          )}
          <Cloud filled />
        </>
      );
      break;
    case 'cloudy':
      content = <Cloud />;
      break;
    case 'fog':
      content = (
        <>
          {[8, 12, 16].map((y, i) => (
            <GLine key={y} x1={4 + i} y1={y} x2={20 - i} y2={y} color={ICON_COLORS.fog} />
          ))}
        </>
      );
      break;
    case 'rain':
      content = (
        <>
          <Cloud d={CLOUD_LOW} />
          {[8.5, 12, 15.5].map((x) => (
            <GLine key={x} x1={x} y1={18} x2={x - 1} y2={21} color={ICON_COLORS.rain} />
          ))}
        </>
      );
      break;
    case 'snow':
      content = (
        <>
          <Cloud d={CLOUD_LOW} />
          {[8.5, 12, 15.5].map((x, i) => (
            <Circle key={x} cx={x} cy={i % 2 ? 20.5 : 19} r={1} fill={ICON_COLORS.snow} />
          ))}
        </>
      );
      break;
    case 'storm':
      content = (
        <>
          <Cloud d={CLOUD_LOW} />
          <GPath d="M12.5 16l-2 3h3l-2 3" color={ICON_COLORS.bolt} />
        </>
      );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content}
    </Svg>
  );
}
