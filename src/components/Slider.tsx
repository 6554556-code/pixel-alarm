// Шкала с бегунком (своя, без нативных библиотек).
// Тянешь бегунок или тапаешь по шкале — значение меняется сразу.

import { useRef, useState } from 'react';
import { Image, PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME_OBJECTS, theme } from '../theme';
import { PixelBox } from './Pixel';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  pixel?: boolean; // пиксельная тема: квадратная дорожка-«полоска здоровья» и бегунок-лесенка
  glam?: boolean; // гламур: бегунок — стеклянный пузырь
};

const THUMB = 28;
const GLAM_THUMB = 34; // пузырь чуть крупнее: у картинки прозрачные поля
const BUBBLE = require('../../assets/glam/bubble_circle.png');

export function Slider({ value, min, max, onChange, pixel = false, glam = false }: Props) {
  // Где шкала на экране: левый край (pageX) и ширина — нужны, чтобы перевести палец в значение
  const track = useRef({ pageX: 0, width: 1 });
  const [width, setWidth] = useState(0);

  // Свежие значения для обработчика жестов (он создаётся один раз)
  const latest = useRef({ value, min, max, onChange });
  latest.current = { value, min, max, onChange };

  const valueAt = (pageX: number) => {
    const { min: lo, max: hi } = latest.current;
    // Центр бегунка ходит от THUMB/2 до (ширина − THUMB/2) — под пальцем всегда середина бегунка
    const usable = Math.max(1, track.current.width - THUMB);
    const ratio = Math.min(1, Math.max(0, (pageX - track.current.pageX - THUMB / 2) / usable));
    return Math.round(lo + ratio * (hi - lo));
  };

  const update = (pageX: number) => {
    const v = valueAt(pageX);
    if (v !== latest.current.value) latest.current.onChange(v);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // не отдаём жест прокрутке экрана
      onPanResponderGrant: (e) => {
        // locationX — точка касания относительно шкалы, pageX — относительно экрана.
        // Их разница = левый край шкалы на экране.
        track.current.pageX = e.nativeEvent.pageX - e.nativeEvent.locationX;
        update(e.nativeEvent.pageX);
      },
      onPanResponderMove: (e) => update(e.nativeEvent.pageX),
    }),
  ).current;

  const ratio = (value - min) / (max - min || 1);
  const thumbLeft = ratio * Math.max(0, width - THUMB);

  if (pixel) {
    const PX = THEME_OBJECTS.pixel.colors;
    return (
      <View style={styles.hit} {...pan.panHandlers}>
        <View
          style={styles.pxTrack}
          pointerEvents="none"
          onLayout={(e) => {
            setWidth(e.nativeEvent.layout.width);
            track.current.width = Math.max(1, e.nativeEvent.layout.width);
          }}
        >
          <View style={[styles.pxFill, { width: thumbLeft + THUMB / 2, backgroundColor: PX.accent }]} />
        </View>
        <View pointerEvents="none" style={[styles.pxThumbWrap, { left: thumbLeft }]}>
          <PixelBox style={styles.pxThumb} fill="#FFFFFF" glow={PX.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.hit} {...pan.panHandlers}>
      <View
        style={styles.track}
        pointerEvents="none"
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          track.current.width = Math.max(1, e.nativeEvent.layout.width);
        }}
      >
        <LinearGradient
          colors={[theme.colors.accentAlt, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: thumbLeft + THUMB / 2 }]}
        />
      </View>
      {glam ? (
        <Image source={BUBBLE} pointerEvents="none" style={[styles.glamThumb, { left: thumbLeft - (GLAM_THUMB - THUMB) / 2 }]} />
      ) : (
        <View pointerEvents="none" style={[styles.thumb, { left: thumbLeft }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pxTrack: {
    height: 14,
    borderWidth: 2,
    borderColor: THEME_OBJECTS.pixel.colors.outline,
    backgroundColor: '#E6E1F3',
    overflow: 'hidden',
  },
  pxFill: { height: '100%' },
  pxThumbWrap: { position: 'absolute', top: 8 },
  pxThumb: { width: THUMB, height: THUMB },
  hit: { height: 44, justifyContent: 'center' }, // зона касания больше самой шкалы
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(27,27,36,0.08)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  glamThumb: { position: 'absolute', width: GLAM_THUMB, height: GLAM_THUMB },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27,27,36,0.08)',
    boxShadow: '0 2px 10px rgba(139,108,240,0.45)',
  },
});
