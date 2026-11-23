// Переключатель-«ползунок» на несколько вариантов (М · Ж · Общие).
// Стеклянная капсула, под выбранным вариантом едет фиолетовая «таблетка».

import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import { theme } from '../theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  textStyle?: TextStyle; // например, пиксельный шрифт
};

const PAD = 4;

export function SegmentedSwitch<T extends string>({ options, value, onChange, textStyle }: Props<T>) {
  const [width, setWidth] = useState(0);
  const segW = width > 0 ? (width - PAD * 2) / options.length : 0;
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(x, { toValue: index * segW, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  }, [index, segW, x]);

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segW > 0 && <Animated.View style={[styles.thumb, { width: segW, transform: [{ translateX: x }] }]} />}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} style={styles.seg} onPress={() => onChange(o.value)} hitSlop={4}>
            <Text style={[styles.label, textStyle, on && styles.labelOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(27,27,36,0.08)',
    boxShadow: 'inset 0 0 10px 1px rgba(27,27,36,0.06)',
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    boxShadow: '0 3px 12px rgba(139,108,240,0.45)',
  },
  seg: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '500', color: theme.colors.text },
  labelOn: { color: '#FFFFFF', fontWeight: '600' },
});
