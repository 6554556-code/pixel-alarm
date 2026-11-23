// Пиксельный выбор времени (по макету): два барабана в рамках-«лесенках»,
// стрелки ▲▼ над и под каждым, светящаяся рамка выбора и мигающее двоеточие.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME_OBJECTS, crispSize } from '../theme';
import { PixelBox, PixelTriangle } from './Pixel';
import { WHEEL_ITEM_H, WHEEL_VISIBLE, WheelPicker } from './WheelPicker';

const PX = THEME_OBJECTS.pixel;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const COL_W = 128;
const WHEEL_H = WHEEL_ITEM_H * WHEEL_VISIBLE;

type Props = {
  hour: number;
  minute: number;
  onChange: (patch: { hour?: number; minute?: number }) => void;
};

function Column({ values, value, onChange }: { values: number[]; value: number; onChange: (v: number) => void }) {
  const step = (d: number) => onChange((value + d + values.length) % values.length);
  return (
    <View style={styles.column}>
      <Pressable onPress={() => step(-1)} hitSlop={12} style={styles.arrow}>
        <PixelTriangle dir="up" />
      </Pressable>

      <View style={styles.wheelBox}>
        {/* рамка барабана */}
        <PixelBox style={StyleSheet.absoluteFill} fill="#FBFAFF" />
        {/* светящаяся рамка выбранной строки — чуть шире барабана */}
        <PixelBox
          style={styles.selection}
          fill="#EFE7FF"
          stroke={PX.colors.accent}
          glow={PX.colors.accent}
        />
        <View style={styles.wheelInner}>
          <WheelPicker values={values} value={value} onChange={onChange} pixel />
        </View>
      </View>

      <Pressable onPress={() => step(1)} hitSlop={12} style={styles.arrow}>
        <PixelTriangle dir="down" />
      </Pressable>
    </View>
  );
}

export function PixelTimePicker({ hour, minute, onChange }: Props) {
  // Двоеточие мигает раз в секунду, как на электронных часах
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap}>
      <Column values={HOURS} value={hour} onChange={(h) => onChange({ hour: h })} />
      <Text style={[styles.colon, { opacity: blink ? 1 : 0.15 }]}>:</Text>
      <Column values={MINUTES} value={minute} onChange={(m) => onChange({ minute: m })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 },
  column: { alignItems: 'center' },
  arrow: { paddingVertical: 8 },
  wheelBox: { width: COL_W, height: WHEEL_H + 8 },
  wheelInner: { position: 'absolute', top: 4, left: 4, right: 4, bottom: 4 },
  selection: {
    position: 'absolute',
    left: -6,
    right: -6,
    top: 4 + WHEEL_ITEM_H * 2 - 4,
    height: WHEEL_ITEM_H + 8,
  },
  colon: {
    fontFamily: PX.font,
    fontSize: crispSize(26.7),
    color: PX.colors.text,
    marginTop: 0,
  },
});
