// Карточка «Будильник»: список, переключатели, «Удалить все».
// Пока на фиктивных данных — настоящие будильники подключим на этапе Б.

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../theme';

type AlarmItem = {
  id: string;
  time: string;
  note?: string;
  melody?: string;
  enabled: boolean;
};

const DEMO: AlarmItem[] = [
  { id: '1', time: '13:50', note: 'Почта', melody: 'Sunrise', enabled: true },
  { id: '2', time: '14:05', enabled: false },
  { id: '3', time: '14:24', enabled: false },
];

export function AlarmCard() {
  const [alarms, setAlarms] = useState<AlarmItem[]>(DEMO);

  const toggle = (id: string) =>
    setAlarms((list) => list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  // Спрашиваем подтверждение — чтобы не снести всё случайным тапом
  const deleteAll = () => {
    if (alarms.length === 0) return;
    Alert.alert('Удалить все будильники?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => setAlarms([]) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Будильник</Text>
        <Pressable style={styles.roundBtn} onPress={() => Alert.alert('Скоро', 'Экран нового будильника — на этапе Б')}>
          <Text style={styles.roundBtnText}>+</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.pill} onPress={deleteAll}>
          <Text style={styles.pillText}>Удалить все</Text>
        </Pressable>
      </View>

      {alarms.length === 0 && <Text style={styles.empty}>Будильников нет. Нажми «+», чтобы добавить.</Text>}

      {alarms.map((a, i) => (
        <View key={a.id} style={[styles.row, a.enabled && styles.rowActive, i > 0 && !a.enabled && styles.rowDivider]}>
          {a.enabled && <View style={styles.activeBar} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.time}>{a.time}</Text>
            {a.note && <Text style={styles.note}>{a.note}</Text>}
            {a.melody && <Text style={styles.melody}>Мелодия: {a.melody}</Text>}
          </View>
          <Switch
            value={a.enabled}
            onValueChange={() => toggle(a.id)}
            trackColor={{ false: theme.colors.switchOff, true: theme.colors.accent }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 28,
    padding: 16,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text, marginRight: 14 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  roundBtnText: { fontSize: 28, fontWeight: '300', color: theme.colors.text, marginTop: -2 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  pillText: { fontSize: 15, color: theme.colors.text },
  empty: { textAlign: 'center', color: theme.colors.textMuted, paddingVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  rowActive: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.12)' },
  activeBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    marginRight: 12,
  },
  time: { fontSize: 44, fontWeight: '300', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  note: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  melody: { fontSize: 14, color: theme.colors.textMuted },
});
