// Иконки погоды тонкими линиями, в стиле циферблатов.
// Солнце цветное (как на макете), остальное — линейное в цвет текста.

import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { theme } from '../theme';
import type { WeatherKind } from '../weather';

const SUN = '#F5B83D';
const INK = theme.colors.text;
const W = 1.6; // толщина линий (в координатах 24×24)

// Облако: контур с плоским низом
const CLOUD = 'M7 18h10.5a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 7.3 10.2 4 4 0 0 0 7 18z';
// Облако поменьше и пониже — для «солнце за облаком» и осадков
const CLOUD_LOW = 'M7.5 15.5h9a3 3 0 0 0 .35-5.98A4.75 4.75 0 0 0 7.8 8.2 3.65 3.65 0 0 0 7.5 15.5z';

function Sun({ cx = 12, cy = 12, r = 4 }: { cx?: number; cy?: number; r?: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return (
      <Line
        key={i}
        x1={cx + Math.cos(a) * (r + 2)}
        y1={cy + Math.sin(a) * (r + 2)}
        x2={cx + Math.cos(a) * (r + 4)}
        y2={cy + Math.sin(a) * (r + 4)}
        stroke={SUN}
        strokeWidth={W}
        strokeLinecap="round"
      />
    );
  });
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={SUN} strokeWidth={W} />
      {rays}
    </G>
  );
}

function Moon() {
  return <Path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.6A6 6 0 0 1 15.5 4.5z" fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />;
}

export function WeatherIcon({ kind, isDay = true, size = 16 }: { kind: WeatherKind; isDay?: boolean; size?: number }) {
  let content;
  switch (kind) {
    case 'clear':
      content = isDay ? <Sun /> : <Moon />;
      break;
    case 'partly':
      content = (
        <>
          {isDay ? <Sun cx={8.5} cy={8} r={3} /> : null}
          <Path d={CLOUD} fill="#FFFFFF" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        </>
      );
      break;
    case 'cloudy':
      content = <Path d={CLOUD} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />;
      break;
    case 'fog':
      content = (
        <>
          {[8, 12, 16].map((y, i) => (
            <Line key={y} x1={4 + i} y1={y} x2={20 - i} y2={y} stroke={INK} strokeWidth={W} strokeLinecap="round" />
          ))}
        </>
      );
      break;
    case 'rain':
      content = (
        <>
          <Path d={CLOUD_LOW} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          {[8.5, 12, 15.5].map((x) => (
            <Line key={x} x1={x} y1={18} x2={x - 1} y2={21} stroke={theme.colors.accentAlt} strokeWidth={W} strokeLinecap="round" />
          ))}
        </>
      );
      break;
    case 'snow':
      content = (
        <>
          <Path d={CLOUD_LOW} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          {[8.5, 12, 15.5].map((x, i) => (
            <Circle key={x} cx={x} cy={i % 2 ? 20.5 : 19} r={0.9} fill={theme.colors.accentAlt} />
          ))}
        </>
      );
      break;
    case 'storm':
      content = (
        <>
          <Path d={CLOUD_LOW} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M12.5 16l-2 3h3l-2 3" fill="none" stroke={SUN} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
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
