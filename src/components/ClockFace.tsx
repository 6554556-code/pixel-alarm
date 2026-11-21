// Рисованный циферблат (react-native-svg).
// Рисуем в «виртуальном» квадрате 100×100, а SVG растягивает его под любой размер слота.

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

// Точка на окружности: угол в градусах от «12 часов» по часовой стрелке
function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

function Hand({ angle, length, width, color }: { angle: number; length: number; width: number; color: string }) {
  const tip = point(angle, length);
  const tail = point(angle + 180, 5); // короткий «хвостик» за центром
  return (
    <Line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
}

export function ClockFace({ color, hour = 0, minute = 0, second = 0, empty = false }: Props) {
  // Минутная ползёт плавно каждую секунду, часовая — каждую минуту
  const minuteAngle = (minute + second / 60) * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const isQuarter = i % 3 === 0; // 12, 3, 6, 9 — чуть длиннее
    const outer = point(i * 30, 41);
    const inner = point(i * 30, isQuarter ? 35 : 37);
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
    <View style={[styles.wrap, { shadowColor: color }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Мягкий «стеклянный» перелив: белый центр → лёгкая лаванда к краю */}
          <RadialGradient id="glass" cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#ECE8F7" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        <Circle cx={C} cy={C} r={48} fill="url(#glass)" stroke={color} strokeWidth={1.6} />
        {ticks}

        {!empty && (
          <>
            <Hand angle={hourAngle} length={22} width={4} color={theme.colors.text} />
            <Hand angle={minuteAngle} length={34} width={2.4} color={theme.colors.text} />
            <Circle cx={C} cy={C} r={3.4} fill="#FFFFFF" stroke={color} strokeWidth={1.8} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    // Цветное свечение вокруг циферблата (как на макете)
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
