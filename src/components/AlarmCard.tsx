// Карточка «Будильник»: список, переключатели и режим удаления.
// Пока на фиктивных данных — настоящие будильники подключим на этапе Б.
//
// «Удалить все» не удаляет сразу, а включает режим выбора:
// все будильники помечены красными корзинками, ненужное можно «спасти» тапом,
// и только кнопка «Удалить (N)» внизу удаляет помеченные.

import { useState } from 'react';
import { Alert, LayoutAnimation, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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

// Плавная анимация, когда кружки появляются/исчезают и строки сдвигаются
const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

// Маленькая корзинка (белая — на красном кружке)
function TrashIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 12a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12M10 11v6M14 11v6"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AlarmCard() {
  const [alarms, setAlarms] = useState<AlarmItem[]>(DEMO);
  // null — обычный режим; Set — режим удаления, внутри id помеченных на удаление
  const [marked, setMarked] = useState<Set<string> | null>(null);
  const deleting = marked !== null;

  const toggleEnabled = (id: string) =>
    setAlarms((list) => list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  // «Удалить все» → помечаем всё
  const startDeleting = () => {
    if (alarms.length === 0) return;
    animate();
    setMarked(new Set(alarms.map((a) => a.id)));
  };

  const cancelDeleting = () => {
    animate();
    setMarked(null);
  };

  // Тап по строке в режиме удаления: снять/поставить пометку
  const toggleMark = (id: string) =>
    setMarked((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirmDelete = () => {
    if (!marked || marked.size === 0) return;
    animate();
    setAlarms((list) => list.filter((a) => !marked.has(a.id)));
    setMarked(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Будильник</Text>
        {!deleting && (
          <Pressable style={styles.roundBtn} onPress={() => Alert.alert('Скоро', 'Экран нового будильника — на этапе Б')}>
            <Text style={styles.roundBtnText}>+</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        <Pressable style={styles.pill} onPress={deleting ? cancelDeleting : startDeleting}>
          <Text style={styles.pillText}>{deleting ? 'Отмена' : 'Удалить все'}</Text>
        </Pressable>
      </View>

      {deleting && <Text style={styles.hint}>Тапни будильник, чтобы оставить его</Text>}

      {alarms.length === 0 && <Text style={styles.empty}>Будильников нет. Нажми «+», чтобы добавить.</Text>}

      {alarms.map((a, i) => {
        const isMarked = !!marked?.has(a.id);
        const highlighted = a.enabled && !deleting;
        return (
          <Pressable
            key={a.id}
            disabled={!deleting}
            onPress={() => toggleMark(a.id)}
            style={[
              styles.row,
              highlighted && styles.rowActive,
              i > 0 && !highlighted && styles.rowDivider,
              deleting && !isMarked && styles.rowKept,
            ]}
          >
            {/* Кружок выбора: красный с корзинкой = удалить, пустой = оставить */}
            {deleting && (
              <View style={[styles.mark, isMarked ? styles.markOn : styles.markOff]}>
                {isMarked && <TrashIcon />}
              </View>
            )}
            {highlighted && <View style={styles.activeBar} />}

            <View style={{ flex: 1 }}>
              <Text style={[styles.time, isMarked && styles.timeMarked]}>{a.time}</Text>
              {a.note && <Text style={[styles.note, isMarked && styles.textMarked]}>{a.note}</Text>}
              {a.melody && <Text style={styles.melody}>Мелодия: {a.melody}</Text>}
            </View>

            {!deleting && (
              <Switch
                value={a.enabled}
                onValueChange={() => toggleEnabled(a.id)}
                trackColor={{ false: theme.colors.switchOff, true: theme.colors.accent }}
              />
            )}
          </Pressable>
        );
      })}

      {/* Кнопка подтверждения — только в режиме удаления */}
      {deleting && (
        <Pressable
          disabled={marked.size === 0}
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteBtn,
            marked.size === 0 && styles.deleteBtnDisabled,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
          ]}
        >
          <TrashIcon color={theme.colors.danger} size={18} />
          <Text style={styles.deleteBtnText}>
            {marked.size === 0 ? 'Ничего не выбрано' : `Удалить (${marked.size})`}
          </Text>
        </Pressable>
      )}
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
  hint: { fontSize: 13, color: theme.colors.textMuted, paddingHorizontal: 4, marginBottom: 6 },
  empty: { textAlign: 'center', color: theme.colors.textMuted, paddingVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  rowActive: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.12)' },
  rowKept: { opacity: 0.55 }, // «спасённый» будильник чуть бледнее — он не участвует в удалении
  activeBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    marginRight: 12,
  },
  // Кружок выбора
  mark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  markOn: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
    boxShadow: '0 0 10px rgba(229,87,91,0.45)',
  },
  markOff: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(27,27,36,0.2)',
  },
  time: { fontSize: 44, fontWeight: '300', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  timeMarked: { color: theme.colors.danger },
  textMarked: { color: theme.colors.danger },
  note: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  melody: { fontSize: 14, color: theme.colors.textMuted },
  // Кнопка «Удалить (N)» — как красная кнопка в окне подтверждения
  deleteBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(229,87,91,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229,87,91,0.35)',
    boxShadow: 'inset 0 0 16px 3px rgba(229,87,91,0.30)',
  },
  deleteBtnDisabled: { opacity: 0.45 },
  deleteBtnText: { fontSize: 17, fontWeight: '600', color: theme.colors.danger },
});
