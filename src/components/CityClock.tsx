// Один слот с часами: циферблат, город, время, дата, погода.
// Циферблат пока заглушка-кружок — нарисуем на следующем шаге.

import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { dayShift, dayShiftLabel, formatDate, formatTime, getZonedTime, deviceTimeZone } from '../time';

type Props = {
  name: string;
  timeZone: string;
  now: Date;
  color: string; // цвет акцента этого города
};

export function CityClock({ name, timeZone, now, color }: Props) {
  const t = getZonedTime(now, timeZone);
  const home = getZonedTime(now, deviceTimeZone);
  const shiftLabel = dayShiftLabel(dayShift(t, home));

  return (
    <View style={styles.slot}>
      <View style={[styles.dial, { borderColor: color }]} />
      <Text style={styles.city} numberOfLines={1}>{name}</Text>
      <Text style={styles.time}>{formatTime(t)}</Text>

      <View style={styles.dateRow}>
        <Text style={styles.date}>{formatDate(t)}</Text>
      </View>
      {shiftLabel && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{shiftLabel}</Text>
        </View>
      )}

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
      <View style={[styles.dial, styles.addDial]}>
        <Text style={styles.plus}>+</Text>
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
  dial: {
    width: '92%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: theme.colors.card,
    marginBottom: 14,
  },
  addDial: {
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 40, fontWeight: '200', color: theme.colors.text },
  city: { fontSize: 18, color: theme.colors.text, marginBottom: 2 },
  time: { fontSize: 32, fontWeight: '300', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  dateRow: { marginTop: 2 },
  date: { fontSize: 13, color: theme.colors.textMuted },
  badge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  badgeText: { fontSize: 11, color: 'white', fontWeight: '600' },
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
