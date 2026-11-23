// Барабан выбора (как у iOS), но свой — чтобы выглядел ровно как в макете.
// Список прокручивается и «защёлкивается» на значениях; ближние к центру цифры крупнее и ярче.
// Подложку под центральной строкой рисует экран, где стоят барабаны.
//
// Режим pixel: цифры пиксельным шрифтом, размер меняется ступенями (плавное масштабирование
// мылит пиксельный шрифт), дальние цифры серые.
// На каждом шаге — лёгкий «тик» вибрацией.

import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME_OBJECTS, crispSize, fontOf, theme, useTheme } from '../theme';

export const WHEEL_ITEM_H = 48; // высота одной строки
export const WHEEL_VISIBLE = 5; // сколько строк видно (центральная + по 2 сверху/снизу)

type Props = {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  // Классика: барабан на всю половину экрана, цифры прижаты к центру (часы — вправо, минуты — влево)
  align?: 'left' | 'right' | 'center';
  pixel?: boolean;
};

const DIGITS_W = 90; // ширина колонки с цифрами
const PX = THEME_OBJECTS.pixel;
// Пиксельные ступени: центр / соседние / дальние
const PX_SIZES = [crispSize(26.7), crispSize(21.3), crispSize(16)];
const PX_COLORS = [PX.colors.text, '#8E87A3', '#B9B3CB'];

const pad = (n: number) => String(n).padStart(2, '0');
const clampIndex = (i: number, n: number) => Math.min(n - 1, Math.max(0, i));

export function WheelPicker({ values, value, onChange, format = pad, align = 'center', pixel = false }: Props) {
  const font = fontOf(useTheme()); // гламур — Forum; классика — системный
  const startIndex = Math.max(0, values.indexOf(value));
  const scrollY = useRef(new Animated.Value(startIndex * WHEEL_ITEM_H)).current;
  const scrollRef = useRef<any>(null);
  // Какая строка сейчас по центру (пока крутишь) — для «тика» и пиксельных ступеней
  const [centerIndex, setCenterIndex] = useState(startIndex);
  const centerRef = useRef(startIndex);

  // Значение поменяли снаружи (стрелки ▲▼) — докручиваем барабан
  useEffect(() => {
    const i = values.indexOf(value);
    if (i >= 0 && i !== centerRef.current) {
      centerRef.current = i;
      setCenterIndex(i);
      scrollRef.current?.scrollTo({ y: i * WHEEL_ITEM_H, animated: true });
    }
  }, [value, values]);

  const onScrollJS = (y: number) => {
    const i = clampIndex(Math.round(y / WHEEL_ITEM_H), values.length);
    if (i !== centerRef.current) {
      centerRef.current = i;
      setCenterIndex(i);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const settle = (y: number) => {
    const i = clampIndex(Math.round(y / WHEEL_ITEM_H), values.length);
    if (values[i] !== value) onChange(values[i]);
  };

  return (
    <View style={{ flex: 1, height: WHEEL_ITEM_H * WHEEL_VISIBLE }}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="normal" // крутанул — и он ещё катится, как у iPhone
        contentOffset={{ x: 0, y: startIndex * WHEEL_ITEM_H }}
        contentContainerStyle={{ paddingVertical: WHEEL_ITEM_H * 2 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: any) => onScrollJS(e.nativeEvent.contentOffset.y),
        })}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => {
          // отпустили палец без инерции — momentum-события может не быть
          const v = e.nativeEvent.velocity;
          if (!v || Math.abs(v.y) < 0.05) settle(e.nativeEvent.contentOffset.y);
        }}
      >
        {values.map((v, i) => {
          if (pixel) {
            const step = Math.min(2, Math.abs(i - centerIndex));
            return (
              <View key={v} style={styles.row}>
                <Animated.Text style={[styles.pxItem, { fontSize: PX_SIZES[step], color: PX_COLORS[step] }]}>
                  {format(v)}
                </Animated.Text>
              </View>
            );
          }
          const center = i * WHEEL_ITEM_H;
          const range = [center - 2 * WHEEL_ITEM_H, center - WHEEL_ITEM_H, center, center + WHEEL_ITEM_H, center + 2 * WHEEL_ITEM_H];
          const opacity = scrollY.interpolate({ inputRange: range, outputRange: [0.2, 0.45, 1, 0.45, 0.2], extrapolate: 'clamp' });
          const scale = scrollY.interpolate({ inputRange: range, outputRange: [0.75, 0.85, 1, 0.85, 0.75], extrapolate: 'clamp' });
          return (
            <View key={v} style={[styles.row, { alignItems: ALIGN[align] }]}>
              <Animated.Text style={[styles.item, font, { opacity, transform: [{ scale }] }]}>{format(v)}</Animated.Text>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const ALIGN = { left: 'flex-start', right: 'flex-end', center: 'center' } as const;

const styles = StyleSheet.create({
  row: { height: WHEEL_ITEM_H, alignItems: 'center', justifyContent: 'center' },
  item: {
    width: DIGITS_W,
    height: WHEEL_ITEM_H,
    lineHeight: WHEEL_ITEM_H,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '400',
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  pxItem: { textAlign: 'center', fontFamily: PX.font, fontWeight: 'normal' },
});
