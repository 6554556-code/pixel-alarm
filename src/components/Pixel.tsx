// Детали пиксельной темы: рамки-«лесенки», переключатель, рисованные иконки, циферблат.

import { ReactNode, useState } from 'react';
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME_OBJECTS } from '../theme';
import { DIAL, GRID, handsPath } from '../pixelDial';

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

// Пиксельный циферблат на сетке 31×31
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
  const hands = handsPath(hour, minute, second);
  const ring = empty ? '#C9C2DE' : color;
  return (
    <View style={[styles.dial, { shadowColor: ring }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${GRID} ${GRID}`}>
        <Path d={DIAL.glowOuter} fill={ring} fillOpacity={0.22} />
        <Path d={DIAL.fill} fill="#FFFFFF" />
        <Path d={DIAL.glowInner} fill={ring} fillOpacity={0.18} />
        <Path d={DIAL.ring} fill={ring} />
        <Path d={DIAL.ticks} fill={P.text} fillOpacity={empty ? 0.3 : 1} />
        {!empty && (
          <>
            <Path d={hands.hour} fill={P.text} />
            <Path d={hands.minute} fill={P.text} />
            <Path d={DIAL.center} fill={color} />
            <Path d={DIAL.centerDot} fill={P.text} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 56, height: 30, justifyContent: 'center' },
  knob: { position: 'absolute', width: 20, height: 20 },
  knobOn: { left: 56 - 5 - 20 },
  knobOff: { left: 5 },
  dial: { width: '100%', aspectRatio: 1, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
});
