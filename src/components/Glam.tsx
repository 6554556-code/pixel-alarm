// Гламурная тема: твои хромированные циферблаты + хромированные стрелки кодом.
// Стрелки рисуются в координатах картинки (1024×1024), камушек в центре кладём ПОВЕРХ стрелок,
// чтобы стрелки «выходили» из-под него, как у настоящих часов.

import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Image as SvgImage, Line, LinearGradient, Polygon, Stop } from 'react-native-svg';
import { THEME_OBJECTS } from '../theme';

const C = 512; // центр циферблата в координатах картинки

const DIALS = {
  1: { image: require('../../assets/glam/dial_1.png'), gem: require('../../assets/glam/gem_1.png') },
  2: { image: require('../../assets/glam/dial_2.png'), gem: require('../../assets/glam/gem_2.png') },
  3: { image: require('../../assets/glam/dial_3.png'), gem: require('../../assets/glam/gem_3.png') },
  add: { image: require('../../assets/glam/dial_add.png'), gem: null },
};

// Камушек на картинке чуть смещён от центра — кладём его копию ровно туда же
const GEM = { x: 516 - 50, y: 501 - 50, size: 100 };

function dialFor(color: string, empty: boolean) {
  if (empty) return DIALS.add;
  const c = THEME_OBJECTS.classic.colors;
  if (color === c.accentAlt) return DIALS[2];
  if (color === c.accent3) return DIALS[3];
  return DIALS[1];
}

// Сужающаяся стрелка, нарисованная «вверх» (на 12); поворачиваем целиком
function handPoints(length: number, base: number, tip: number, tail: number) {
  return `${C - base / 2},${C + tail} ${C + base / 2},${C + tail} ${C + tip / 2},${C - length} ${C - tip / 2},${C - length}`;
}

function ChromeHand({ angle, length, base, tip, id }: { angle: number; length: number; base: number; tip: number; id: string }) {
  const pts = handPoints(length, base, tip, 46);
  return (
    <G rotation={angle} origin={`${C}, ${C}`}>
      {/* мягкая тень под стрелкой */}
      <Polygon points={pts} fill="#2A2340" fillOpacity={0.18} transform="translate(5 8)" />
      {/* хром: светлый край — тёмная середина — блик — тень */}
      <Polygon points={pts} fill={`url(#${id})`} stroke="#2E2A3C" strokeOpacity={0.7} strokeWidth={2.5} />
      {/* тонкий блик по центру стрелки */}
      <Line x1={C} y1={C + 30} x2={C} y2={C - length + 16} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={2.5} />
    </G>
  );
}

export function GlamClockFace({
  color,
  hour = 0,
  minute = 0,
  second = 0,
  empty = false,
}: {
  color: string;
  hour?: number;
  minute?: number;
  second?: number;
  empty?: boolean;
}) {
  const dial = dialFor(color, empty);
  const minuteAngle = (minute + second / 60) * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;

  return (
    <View style={styles.wrap}>
      <Image source={dial.image} style={styles.fill} resizeMode="contain" />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1024 1024">
        <Defs>
          {/* градиент поперёк стрелки — даёт объём хрома */}
          {['h', 'm'].map((id) => (
            <LinearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ECEAF4" />
              <Stop offset="0.3" stopColor="#4A4560" />
              <Stop offset="0.5" stopColor="#F4F2FA" />
              <Stop offset="0.72" stopColor="#3A354C" />
              <Stop offset="1" stopColor="#9C97AE" />
            </LinearGradient>
          ))}
          <LinearGradient id="rose" x1={C - 110} y1={C - 110} x2={C + 110} y2={C + 110} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#F3D3B8" />
            <Stop offset="0.5" stopColor="#C8977A" />
            <Stop offset="1" stopColor="#F6DCC6" />
          </LinearGradient>
        </Defs>

        {empty ? (
          // «Добавить»: тонкий плюс в розовом золоте, под цвет ободка
          <G>
            <Line x1={C} y1={C - 110} x2={C} y2={C + 110} stroke="url(#rose)" strokeWidth={26} strokeLinecap="round" />
            <Line x1={C - 110} y1={C} x2={C + 110} y2={C} stroke="url(#rose)" strokeWidth={26} strokeLinecap="round" />
          </G>
        ) : (
          <>
            <ChromeHand id="h" angle={hourAngle} length={215} base={46} tip={16} />
            <ChromeHand id="m" angle={minuteAngle} length={345} base={30} tip={9} />
            {dial.gem && <SvgImage href={dial.gem} x={GEM.x} y={GEM.y} width={GEM.size} height={GEM.size} />}
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 1 },
  // размер картинки задаём явно — иначе она рисуется в натуральную величину
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
