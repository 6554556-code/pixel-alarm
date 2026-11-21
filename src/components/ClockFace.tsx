// Рисованный циферблат (react-native-svg).
// Рисуем в «виртуальном» квадрате 100×100, а SVG растягивает его под любой размер слота.
//
// Свечение сделано «ореолами»: под каждым контуром лежат 1–2 копии того же контура,
// чуть толще и почти прозрачные. Это легче для телефона, чем SVG-фильтры размытия.

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '../theme';

type Props = {
  color: string; // цвет обводки, свечения и центра
  hour?: number;
  minute?: number;
  second?: number;
  empty?: boolean; // без стрелок — для слота «Добавить»
};

const C = 50; // центр
const R = 46; // радиус циферблата (оставляем по краям место для внешнего свечения)

// Ручки силы свечения — подкручивать здесь
const GLOW = {
  outer: [
    { dr: 1.3, width: 2.2, opacity: 0.18 },
    { dr: 2.7, width: 2.0, opacity: 0.07 },
  ],
  inner: [
    { dr: -1.3, width: 2.0, opacity: 0.14 },
    { dr: -2.7, width: 2.0, opacity: 0.05 },
  ],
  hand: { extraWidth: 2.4, opacity: 0.22 },
};

// Точка на окружности: угол в градусах от «12 часов» по часовой стрелке
function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

type HandProps = { angle: number; length: number; width: number; color: string; glowColor: string };

function Hand({ angle, length, width, color, glowColor }: HandProps) {
  const tip = point(angle, length);
  const tail = point(angle + 180, 5); // короткий «хвостик» за центром
  const coords = { x1: tail.x, y1: tail.y, x2: tip.x, y2: tip.y };
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

export function ClockFace({ color, hour = 0, minute = 0, second = 0, empty = false }: Props) {
  // Минутная ползёт плавно каждую секунду, часовая — каждую минуту
  const minuteAngle = (minute + second / 60) * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const isQuarter = i % 3 === 0; // 12, 3, 6, 9 — чуть длиннее
    const outer = point(i * 30, 40);
    const inner = point(i * 30, isQuarter ? 34 : 36);
    return (
      <Line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={theme.colors.text}
        strokeOpacity={empty ? 0.35 : 0.8}
        strokeWidth={isQuarter ? 1.8 : 1.2}
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
            <Stop offset="1" stopColor="#ECE8F7" stopOpacity="1" />
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

        {/* Сам контур */}
        <Circle cx={C} cy={C} r={R} fill="none" stroke={color} strokeWidth={1.6} />

        {ticks}

        {!empty && (
          <>
            <Hand angle={hourAngle} length={21} width={4} color={theme.colors.text} glowColor={color} />
            <Hand angle={minuteAngle} length={32} width={2.4} color={theme.colors.text} glowColor={color} />
            <Circle cx={C} cy={C} r={5.2} fill={color} fillOpacity={0.2} />
            <Circle cx={C} cy={C} r={3.4} fill="#FFFFFF" stroke={color} strokeWidth={1.8} />
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
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});
