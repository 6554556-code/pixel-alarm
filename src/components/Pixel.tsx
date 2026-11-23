// Детали пиксельной темы: рамки-«лесенки», переключатель, рисованные иконки, циферблат.

import { ReactNode, useState } from 'react';
import { Image, PixelRatio, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME_OBJECTS } from '../theme';
import { HAND_GRID, Run, fineHands } from '../pixelDial';

const P = THEME_OBJECTS.pixel.colors;

// Прямоугольник со срезанными «ступеньками» углами
function stair(x0: number, y0: number, x1: number, y1: number, s: number) {
  return (
    `M${x0 + 2 * s} ${y0}H${x1 - 2 * s}V${y0 + s}H${x1 - s}V${y0 + 2 * s}H${x1}` +
    `V${y1 - 2 * s}H${x1 - s}V${y1 - s}H${x1 - 2 * s}V${y1}H${x0 + 2 * s}V${y1 - s}H${x0 + s}` +
    `V${y1 - 2 * s}H${x0}V${y0 + 2 * s}H${x0 + s}V${y0 + s}H${x0 + 2 * s}Z`
  );
}

type BoxProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fill?: string;
  stroke?: string;
  step?: number; // размер «ступеньки» угла
  border?: number; // толщина контура
  glow?: string; // цвет свечения вокруг
};

// Пиксельная рамка: контур + заливка, внутри — что угодно
export function PixelBox({ children, style, fill = P.surface, stroke = P.outline, step = 3, border = 2, glow }: BoxProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={[style, glow ? { shadowColor: glow, shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } : null]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size.w} height={size.h} pointerEvents="none">
          <Path d={stair(0, 0, size.w, size.h, step)} fill={stroke} />
          <Path d={stair(border, border, size.w - border, size.h - border, step)} fill={fill} />
        </Svg>
      )}
      {children}
    </View>
  );
}

// Пиксельный переключатель: квадратный бегунок в «лесенке»
export function PixelSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={10}>
      <PixelBox style={styles.track} fill={value ? P.accent : P.switchOff} glow={value ? P.accent : undefined}>
        <PixelBox style={[styles.knob, value ? styles.knobOn : styles.knobOff]} fill="#FFFFFF" step={2} />
      </PixelBox>
    </Pressable>
  );
}

// Рисованные иконки (твой лист): цветные PNG
export const PIXEL_ICONS = {
  sun: require('../../assets/pixel/sun.png'),
  moon: require('../../assets/pixel/moon.png'),
  cloud: require('../../assets/pixel/cloud.png'),
  partly_day: require('../../assets/pixel/partly_day.png'),
  partly_night: require('../../assets/pixel/partly_night.png'),
  fog: require('../../assets/pixel/fog.png'),
  rain: require('../../assets/pixel/rain.png'),
  snow: require('../../assets/pixel/snow.png'),
  storm: require('../../assets/pixel/storm.png'),
  bolt: require('../../assets/pixel/bolt.png'),
  gear: require('../../assets/pixel/gear.png'),
  plus: require('../../assets/pixel/plus.png'),
  close: require('../../assets/pixel/close.png'),
  check: require('../../assets/pixel/check.png'),
  arrow_right: require('../../assets/pixel/arrow_right.png'),
  arrow_left: require('../../assets/pixel/arrow_left.png'),
  pencil: require('../../assets/pixel/pencil.png'),
  note: require('../../assets/pixel/note.png'),
  bell: require('../../assets/pixel/bell.png'),
  play: require('../../assets/pixel/play.png'),
  pause: require('../../assets/pixel/pause.png'),
  piano: require('../../assets/pixel/piano.png'),
};

export type PixelIconName = keyof typeof PIXEL_ICONS;

export function PixelIcon({ name, size = 24 }: { name: PixelIconName; size?: number }) {
  return <Image source={PIXEL_ICONS[name]} style={{ width: size, height: size }} resizeMode="contain" />;
}

// Слой квадратиков: каждая полоска — обычный View, края ложатся ровно в пиксели экрана
function Layer({ runs, cell, color, opacity = 1 }: { runs: Run[]; cell: number; color: string; opacity?: number }) {
  return (
    <>
      {runs.map((r, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: r.x * cell,
            top: r.y * cell,
            width: r.w * cell,
            height: cell,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}
    </>
  );
}

// Твои нарисованные циферблаты и неоновая обводка к каждому
const DIALS = {
  1: { image: require('../../assets/pixel/dial_1.png'), neon: '#C04DFF' },
  2: { image: require('../../assets/pixel/dial_2.png'), neon: '#22D3FF' },
  3: { image: require('../../assets/pixel/dial_3.png'), neon: '#FF2EC4' },
  add: { image: require('../../assets/pixel/dial_add.png'), neon: '#B5A8FF' },
};

// Неон без линии — только свечение: два слоя мягкой тени (ближний ярче, дальний шире).
// scale — общая сила; размытие в px крутить здесь.
function neonGlow(color: string, scale = 1) {
  const a = (o: number) =>
    color +
    Math.round(Math.min(1, o * scale) * 255)
      .toString(16)
      .padStart(2, '0');
  return `0 0 10px 2px ${a(0.6)}, 0 0 26px 8px ${a(0.3)}`;
}

// Какой циферблат взять: по цвету города (1-й, 2-й, 3-й) или «добавить»
function dialFor(color: string, empty: boolean) {
  if (empty) return DIALS.add;
  const c = THEME_OBJECTS.classic.colors;
  if (color === c.accentAlt) return DIALS[2];
  if (color === c.accent3) return DIALS[3];
  return DIALS[1];
}

// Нарисованный циферблат + неоновая обводка + чёткие пиксельные стрелки
export function PixelClockFace({
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
  const [width, setWidth] = useState(0);
  const dial = dialFor(color, empty);
  const ratio = PixelRatio.get();
  // Клетка стрелок — целое число пикселей экрана, иначе края мылятся
  const cell = Math.floor((width / HAND_GRID) * ratio) / ratio;
  const size = cell * HAND_GRID;
  const offset = PixelRatio.roundToNearestPixel((width - size) / 2);
  const hands = fineHands(hour, minute, second);

  return (
    <View style={styles.dial} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {/* Неоновое кольцо: обычное, гладкое, со свечением */}
      <View style={[styles.neon, { boxShadow: neonGlow(dial.neon) }]} />
      <Image source={dial.image} style={styles.fillImage} resizeMode="contain" />
      {!empty && cell > 0 && (
        <View style={{ position: 'absolute', left: offset, top: offset, width: size, height: size }}>
          <Layer runs={hands.hour} cell={cell} color="#111018" />
          <Layer runs={hands.minute} cell={cell} color="#111018" />
        </View>
      )}
    </View>
  );
}

// Кнопка «добавить» в виде маленького серого циферблата с плюсом (для будильников)
export function PixelAddDial({ size = 44 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.neon, { boxShadow: neonGlow(DIALS.add.neon, 0.6) }]} />
      <Image source={DIALS.add.image} style={styles.fillImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 56, height: 30, justifyContent: 'center' },
  knob: { position: 'absolute', width: 20, height: 20 },
  knobOn: { left: 56 - 5 - 20 },
  knobOff: { left: 5 },
  dial: { width: '100%', aspectRatio: 1 },
  // Размер картинки задаём явно: иначе она рисуется в свою натуральную величину
  fillImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  // Круг ровно по циферблату: свечение расходится наружу из-под картинки
  neon: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 999,
  },
});

// Пиксельный треугольник ▲/▼ из полосок (чёткий, без сглаживания)
export function PixelTriangle({ dir = 'up', cell = 3, color = P.outline }: { dir?: 'up' | 'down'; cell?: number; color?: string }) {
  const rows = [1, 3, 5, 7, 9]; // ширина каждой строки в клетках
  const ordered = dir === 'up' ? rows : [...rows].reverse();
  return (
    <View style={{ alignItems: 'center' }}>
      {ordered.map((w, i) => (
        <View key={i} style={{ width: w * cell, height: cell, backgroundColor: color }} />
      ))}
    </View>
  );
}
