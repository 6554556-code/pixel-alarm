// Рисованный циферблат (react-native-svg).
// Рисуем в «виртуальном» квадрате 100×100, а SVG растягивает его под любой размер слота.
//
// Свечение сделано «ореолами»: под контуром лежат копии того же контура,
// чуть толще и почти прозрачные. Это легче для телефона, чем SVG-фильтры размытия.

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';
import { theme, useTheme } from '../theme';
import { PixelClockFace } from './Pixel';
import { GlamClockFace } from './Glam';

type Props = {
  color: string; // цвет обводки, свечения и центра
  hour?: number;
  minute?: number;
  second?: number;
  empty?: boolean; // без стрелок — для слота «Добавить»
  variant?: 'classic' | 'pixel' | 'glam'; // принудительно (для превью в настройках); по умолчанию — текущая тема
};

const C = 50; // центр
const R = 46; // радиус циферблата (по краям место для внешнего свечения)

// ===== Ручки внешнего вида — подкручивать здесь =====
const RING = { width: 1.1, opacity: 0.55 }; // обводка: тонкая и светлая
const GLOW = {
  outer: [
    { dr: 1.2, width: 2.0, opacity: 0.14 },
    { dr: 2.6, width: 2.0, opacity: 0.06 },
  ],
  inner: [
    { dr: -1.2, width: 1.8, opacity: 0.1 },
    { dr: -2.5, width: 1.8, opacity: 0.04 },
  ],
  hand: { extraWidth: 2.0, opacity: 0.16 },
};
const TICKS = {
  outerR: 41, // внешний край всех делений
  hourLen: 5, // длина часовых
  hourWidth: 1.3,
  minuteLen: 1.6, // длина минутных
  minuteWidth: 0.6,
  minuteOpacity: 0.35,
};
const HANDS = {
  hour: { length: 23, width: 3.6 },
  minute: { length: 39, width: 2.0 }, // дотягивается до делений
};

// Точка на окружности: угол в градусах от «12 часов» по часовой стрелке
function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

type HandProps = { angle: number; length: number; width: number; color: string; glowColor: string };

function Hand({ angle, length, width, color, glowColor }: HandProps) {
  const tip = point(angle, length);
  const coords = { x1: C, y1: C, x2: tip.x, y2: tip.y };
  return (
    <>
      {/* ореол */}
      <Line
        {...coords}
        stroke={glowColor}
        strokeOpacity={GLOW.hand.opacity}
        strokeWidth={width + GLOW.hand.extraWidth}
        strokeLinecap="round"
      />
      {/* сама стрелка */}
      <Line {...coords} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

export function ClockFace(props: Props) {
  const t = useTheme();
  const variant = props.variant ?? (t.pixel ? 'pixel' : t.glam ? 'glam' : 'classic');
  if (variant === 'pixel') return <PixelClockFace {...props} />;
  if (variant === 'glam') return <GlamClockFace {...props} />;
  return <GlassClockFace {...props} />;
}

function GlassClockFace({ color, hour = 0, minute = 0, second = 0, empty = false }: Props) {
  // Минутная ползёт плавно каждую секунду, часовая — каждую минуту
  const minuteAngle = (minute + second / 60) * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;

  // 60 делений: каждое 5-е — часовое (крупное), остальные — минутные (мелкие и бледные)
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0;
    const len = isHour ? TICKS.hourLen : TICKS.minuteLen;
    const outer = point(i * 6, TICKS.outerR);
    const inner = point(i * 6, TICKS.outerR - len);
    const opacity = isHour ? (empty ? 0.35 : 0.85) : TICKS.minuteOpacity * (empty ? 0.5 : 1);
    return (
      <Line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={theme.colors.text}
        strokeOpacity={opacity}
        strokeWidth={isHour ? TICKS.hourWidth : TICKS.minuteWidth}
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={styles.wrap}>
      {/* Белый диск под циферблатом — даёт мягкую цветную тень вокруг */}
      <View style={[styles.glowDisk, { shadowColor: color }]} />

      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Мягкий «стеклянный» перелив: белый центр → лёгкая лаванда к краю */}
          <RadialGradient id="glass" cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#EEEBF8" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        <Circle cx={C} cy={C} r={R} fill="url(#glass)" />

        {/* Внешнее и внутреннее свечение контура */}
        {[...GLOW.outer, ...GLOW.inner].map((g, i) => (
          <Circle
            key={i}
            cx={C}
            cy={C}
            r={R + g.dr}
            fill="none"
            stroke={color}
            strokeOpacity={g.opacity}
            strokeWidth={g.width}
          />
        ))}

        {/* Контур: светлый цветной + белый блик по внутреннему краю, как у стекла */}
        <Circle cx={C} cy={C} r={R} fill="none" stroke={color} strokeOpacity={RING.opacity} strokeWidth={RING.width} />
        <Circle cx={C} cy={C} r={R - 0.9} fill="none" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={0.7} />

        {ticks}

        {!empty && (
          <>
            <Hand angle={hourAngle} length={HANDS.hour.length} width={HANDS.hour.width} color={theme.colors.text} glowColor={color} />
            <Hand angle={minuteAngle} length={HANDS.minute.length} width={HANDS.minute.width} color={theme.colors.text} glowColor={color} />
            {/* Центр: тёмная точка в цветном колечке */}
            <Circle cx={C} cy={C} r={5.4} fill={color} fillOpacity={0.18} />
            <Circle cx={C} cy={C} r={3.4} fill={theme.colors.text} stroke={color} strokeWidth={1.6} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 1 },
  glowDisk: {
    position: 'absolute',
    top: '4%',
    left: '4%',
    width: '92%', // = 2 × R / 100
    height: '92%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});
