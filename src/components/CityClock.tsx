// Один слот с часами: циферблат, город, время, дата, погода.

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { ClockFace } from './ClockFace';
import { formatDate, formatTime, getZonedTime } from '../time';

type Props = {
  name: string;
  timeZone: string;
  now: Date;
  color: string; // цвет акцента этого города
};

export function CityClock({ name, timeZone, now, color }: Props) {
  const t = getZonedTime(now, timeZone);

  return (
    <View style={styles.slot}>
      <View style={styles.dial}>
        <ClockFace color={color} hour={t.hour} minute={t.minute} second={t.second} />
      </View>
      <Text style={styles.city} numberOfLines={1}>{name}</Text>
      <Text style={styles.time}>{formatTime(t)}</Text>

      <View style={styles.dateRow}>
        <Text style={styles.date}>{formatDate(t)}</Text>
      </View>

      <View style={styles.chip}>
        <Text style={styles.chipText}>погода…</Text>
      </View>
    </View>
  );
}

// Третий слот: «Добавить город»
export function AddCitySlot() {
  return (
    <View style={styles.slot}>
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
    </View>
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
  addChip: { marginTop: 'auto' },
  chipText: { fontSize: 12, color: theme.colors.text },
});
