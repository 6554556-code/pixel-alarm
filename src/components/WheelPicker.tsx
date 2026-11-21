// Барабан выбора (как у iOS), но свой — чтобы выглядел ровно как в макете.
// Список прокручивается и «защёлкивается» на значениях; ближние к центру цифры крупнее и ярче.
// Подложку-«таблетку» под центральной строкой рисует экран, где стоят барабаны.

import { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

export const WHEEL_ITEM_H = 48; // высота одной строки
export const WHEEL_VISIBLE = 5; // сколько строк видно (центральная + по 2 сверху/снизу)

type Props = {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  width?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

export function WheelPicker({ values, value, onChange, format = pad, width = 90 }: Props) {
  const startIndex = Math.max(0, values.indexOf(value));
  const scrollY = useRef(new Animated.Value(startIndex * WHEEL_ITEM_H)).current;

  const settle = (y: number) => {
    const i = Math.min(values.length - 1, Math.max(0, Math.round(y / WHEEL_ITEM_H)));
    if (values[i] !== value) onChange(values[i]);
  };

  return (
    <View style={{ width, height: WHEEL_ITEM_H * WHEEL_VISIBLE }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: startIndex * WHEEL_ITEM_H }}
        contentContainerStyle={{ paddingVertical: WHEEL_ITEM_H * 2 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
      >
        {values.map((v, i) => {
          const center = i * WHEEL_ITEM_H;
          const range = [center - 2 * WHEEL_ITEM_H, center - WHEEL_ITEM_H, center, center + WHEEL_ITEM_H, center + 2 * WHEEL_ITEM_H];
          const opacity = scrollY.interpolate({ inputRange: range, outputRange: [0.2, 0.45, 1, 0.45, 0.2], extrapolate: 'clamp' });
          const scale = scrollY.interpolate({ inputRange: range, outputRange: [0.75, 0.85, 1, 0.85, 0.75], extrapolate: 'clamp' });
          return (
            <Animated.Text key={v} style={[styles.item, { opacity, transform: [{ scale }] }]}>
              {format(v)}
            </Animated.Text>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    height: WHEEL_ITEM_H,
    lineHeight: WHEEL_ITEM_H,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '400',
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
});
