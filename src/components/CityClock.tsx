// Один слот с часами: циферблат, город, время, дата, погода.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
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

export function CityClock({ name, timeZone, now, color, lat, lon, onLongPress }: Props) {
  const t = getZonedTime(now, timeZone);
  const weather = useWeather(lat, lon);

  return (
    <Pressable style={styles.slot} onLongPress={onLongPress} delayLongPress={400}>
      <View style={styles.dial}>
        <ClockFace color={color} hour={t.hour} minute={t.minute} second={t.second} />
      </View>
      <Text style={styles.city} numberOfLines={1}>{name}</Text>
      <Text style={styles.time}>{formatTime(t)}</Text>

      <View style={styles.dateRow}>
        <Text style={styles.date}>{formatDate(t)}</Text>
      </View>

      <View style={[styles.chip, styles.weatherChip, weather && (weather.isDay ? styles.chipDay : styles.chipNight)]}>
        {weather ? (
          <>
            <WeatherIcon kind={weather.kind} isDay={weather.isDay} />
            <Text style={[styles.chipText, styles.weatherText]} numberOfLines={1}>
              {weather.label}, {formatTemp(weather.temp)}
            </Text>
          </>
        ) : (
          <Text style={styles.chipText}>…</Text>
        )}
      </View>
    </Pressable>
  );
}

// Третий слот: «Добавить город»
export function AddCitySlot({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.slot, pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={styles.dial}>
        <ClockFace color={theme.colors.cardBorder} empty />
        {/* «Плюс» поверх пустого циферблата */}
        <View style={styles.plusLayer}>
          <Text style={styles.plus}>+</Text>
        </View>
      </View>
      <Text style={styles.city}>Добавить</Text>
      <View style={[styles.chip, styles.addChip]}>
        <Text style={styles.chipText}>Новый город</Text>
      </View>
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
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
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
