// Один слот с часами: циферблат, город, время, дата, погода.

import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fontOf, theme, useTheme } from '../theme';
import { PixelBox } from './Pixel';
import { GlamBubble } from './Glam';
import { ClockFace } from './ClockFace';
import { WeatherIcon } from './WeatherIcon';
import { formatDate, formatTime, getZonedTime } from '../time';
import { formatTemp, useWeather } from '../weather';

type Props = {
  name: string;
  timeZone: string;
  now: Date;
  color: string; // цвет акцента этого города
  lat: number;
  lon: number;
  onLongPress?: () => void; // долгое нажатие — меню города (удалить)
};

// Плашка: стеклянная таблетка в классике, «лесенка» в пиксельной теме
function Chip({ children, style, night, day }: { children: ReactNode; style?: StyleProp<ViewStyle>; night?: boolean; day?: boolean }) {
  const th = useTheme();
  if (th.pixel) {
    return (
      <PixelBox
        style={[styles.chipLayout, styles.chipLayoutPx, style]}
        fill={night ? '#E4E6FF' : '#FFFFFF'}
        stroke={th.colors.outline}
        glow={night ? '#7B86F2' : undefined}
      >
        {children}
      </PixelBox>
    );
  }
  if (th.glam) {
    return (
      <GlamBubble style={[styles.chipLayout, styles.glamChip, style]} tint={night ? 'night' : 'pearl'}>
        {children}
      </GlamBubble>
    );
  }
  return <View style={[styles.chip, styles.chipLayout, style, day && styles.chipDay, night && styles.chipNight]}>{children}</View>;
}

export function CityClock({ name, timeZone, now, color, lat, lon, onLongPress }: Props) {
  const t = getZonedTime(now, timeZone);
  const weather = useWeather(lat, lon);
  const th = useTheme();

  return (
    <Pressable style={styles.slot} onLongPress={onLongPress} delayLongPress={400}>
      <View style={styles.dial}>
        <ClockFace color={color} hour={t.hour} minute={t.minute} second={t.second} />
      </View>
      <Text style={[styles.city, fontOf(th, 10.7)]} numberOfLines={1} adjustsFontSizeToFit={th.pixel}>
        {name}
      </Text>
      <Text style={[styles.time, fontOf(th, 21.3)]}>{formatTime(t)}</Text>

      <View style={styles.dateRow}>
        <Text style={[styles.date, fontOf(th, 8)]}>{formatDate(t)}</Text>
      </View>

      <Chip style={styles.weatherChip} day={weather?.isDay === true} night={weather?.isDay === false}>
        {weather ? (
          <>
            <WeatherIcon kind={weather.kind} isDay={weather.isDay} size={th.pixel ? 14 : 16} />
            <Text style={[styles.chipText, styles.weatherText, fontOf(th, 8)]} numberOfLines={1}>
              {/* в пиксельном шрифте нет длинного минуса — ставим обычный */}
              {th.pixel
                ? `${weather.label},${formatTemp(weather.temp).replace('−', '-')}` // без пробела — широкий шрифт, иначе температура не влезает
                : `${weather.label}, ${formatTemp(weather.temp)}`}
            </Text>
          </>
        ) : (
          <Text style={[styles.chipText, fontOf(th, 8)]}>…</Text>
        )}
      </Chip>
    </Pressable>
  );
}

// Третий слот: «Добавить город»
export function AddCitySlot({ onPress }: { onPress: () => void }) {
  const th = useTheme();
  return (
    <Pressable style={({ pressed }) => [styles.slot, pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={styles.dial}>
        <ClockFace color={theme.colors.cardBorder} empty />
        {/* «Плюс» поверх пустого циферблата */}
        <View style={styles.plusLayer}>
          {/* в пиксельной и гламурной темах плюс уже на циферблате */}
          {!th.pixel && !th.glam && <Text style={styles.plus}>+</Text>}
        </View>
      </View>
      <Text style={[styles.city, fontOf(th, 10.7)]}>Добавить</Text>
      <Chip style={styles.addChip}>
        <Text style={[styles.chipText, fontOf(th, 8)]} numberOfLines={1}>
          Новый город
        </Text>
      </Chip>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center' },
  dial: { width: '92%', aspectRatio: 1, marginBottom: 14 },
  plusLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 44, fontWeight: '200', color: theme.colors.text },
  city: { fontSize: 18, color: theme.colors.text, marginBottom: 2 },
  time: { fontSize: 32, fontWeight: '300', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  dateRow: { marginTop: 2 },
  date: { fontSize: 13, color: theme.colors.textMuted },
  chip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  chipLayout: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6 },
  chipLayoutPx: { paddingHorizontal: 6, paddingVertical: 7, maxWidth: '100%', gap: 3 },
  glamChip: { paddingVertical: 7 },
  weatherChip: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' },
  weatherText: { flexShrink: 1 },
  // Мягкое размытое свечение изнутри почти на всю плашку: днём белое, ночью синее.
  // inset X Y РАЗМЫТИЕ РАСТЯЖЕНИЕ цвет — крутить размытие (14px) и прозрачность (0.45)
  // День: чистый белый + чуть-чуть серого по контуру изнутри
  chipDay: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(27,27,36,0.08)',
    boxShadow: 'inset 0 0 10px 1px rgba(27,27,36,0.08)',
  },
  chipNight: {
    borderColor: 'rgba(123,134,242,0.30)',
    boxShadow: 'inset 0 0 14px 2px rgba(123,134,242,0.45)',
  },
  addChip: { marginTop: 'auto' },
  chipText: { fontSize: 12, color: theme.colors.text },
});
