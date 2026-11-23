// Карточка «Будильник»: список, переключатели и режим удаления.
// Сами будильники живут в src/alarms.ts — карточка только показывает их и передаёт команды.
//
// «Удалить все» не удаляет сразу, а включает режим выбора:
// все будильники помечены красными кружками, нужное можно «спасти» тапом,
// и только кнопка «Удалить (N)» внизу удаляет помеченные.

import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontOf, theme, useTheme } from '../theme';
import { PixelBox, PixelIcon, PixelSwitch } from './Pixel';
import { Alarm, formatAlarmTime, formatRepeat } from '../alarms';
import { getMelody } from '../melodies';
import { formatCountdownShort, nextRing } from '../time';

type Props = {
  alarms: Alarm[];
  onAdd: () => void;
  onEdit: (alarm: Alarm) => void;
  onToggle: (id: string) => void;
  onDelete: (ids: string[]) => void;
};

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

export function AlarmCard({ alarms, onAdd, onEdit, onToggle, onDelete }: Props) {
  // null — обычный режим; Set — режим удаления, внутри id помеченных на удаление
  const [marked, setMarked] = useState<Set<string> | null>(null);
  const deleting = marked !== null;
  const th = useTheme();
  const px = th.pixel;
  // Каркас под тему: в пиксельной — рамки-«лесенки», в классике — стекло
  const Card = px ? PixelBox : View;

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
    onDelete([...marked]);
    setMarked(null);
  };

  return (
    <Card style={[styles.cardLayout, !px && styles.card]}>
      <View style={styles.header}>
        <Text style={[styles.title, fontOf(th, 16)]}>Будильник</Text>
        {!deleting &&
          (px ? (
            <Pressable onPress={onAdd} hitSlop={6}>
              <View style={styles.pxPlus}>
                <PixelIcon name="plus" size={28} />
              </View>
            </Pressable>
          ) : (
            <Pressable style={styles.roundBtn} onPress={onAdd}>
              <Text style={styles.roundBtnText}>+</Text>
            </Pressable>
          ))}
        <View style={{ flex: 1 }} />
        {alarms.length > 0 &&
          (px ? (
            <Pressable onPress={deleting ? cancelDeleting : startDeleting} hitSlop={6}>
              <PixelBox style={styles.pillLayout}>
                <Text style={[styles.pillText, fontOf(th, 8)]}>{deleting ? 'Отмена' : 'Удалить все'}</Text>
              </PixelBox>
            </Pressable>
          ) : (
            <Pressable style={[styles.pill, styles.pillLayout]} onPress={deleting ? cancelDeleting : startDeleting}>
              <Text style={styles.pillText}>{deleting ? 'Отмена' : 'Удалить все'}</Text>
            </Pressable>
          ))}
      </View>

      {alarms.map((a, i) => {
        const isMarked = !!marked?.has(a.id);
        const highlighted = a.enabled && !deleting;
        return (
          <Pressable
            key={a.id}
            onPress={() => (deleting ? toggleMark(a.id) : onEdit(a))}
            style={[
              styles.row,
              highlighted && (px ? styles.rowActivePx : styles.rowActive),
              i > 0 && !highlighted && styles.rowDivider,
              deleting && !isMarked && styles.rowKept,
            ]}
          >
            {/* Пиксельная подложка активного будильника */}
            {highlighted && px && <PixelBox style={StyleSheet.absoluteFill} />}
            {/* Кружок выбора: красный = удалить, пустой = оставить */}
            {deleting && <View style={[styles.mark, isMarked ? styles.markOn : styles.markOff, px && styles.square]} />}
            {highlighted && <View style={[styles.activeBar, px && styles.square]} />}

            <View style={{ flex: 1 }}>
              <Text style={[styles.time, fontOf(th, 26.7), isMarked && styles.timeMarked]}>{formatAlarmTime(a)}</Text>
              {!!a.note && <Text style={[styles.note, fontOf(th, 10.7), isMarked && styles.textMarked]}>{a.note}</Text>}
              <Text style={[styles.melody, fontOf(th, 8)]}>
                {formatRepeat(a.weekdays)} · {getMelody(a.melody).name}
                {a.enabled && ` · через ${formatCountdownShort(nextRing(a.hour, a.minute, a.weekdays).getTime() - Date.now())}`}
              </Text>
            </View>

            {!deleting &&
              (px ? (
                <PixelSwitch value={a.enabled} onValueChange={() => onToggle(a.id)} />
              ) : (
                <Switch
                  value={a.enabled}
                  onValueChange={() => onToggle(a.id)}
                  trackColor={{ false: theme.colors.switchOff, true: theme.colors.accent }}
                />
              ))}
          </Pressable>
        );
      })}

      {/* Кнопка подтверждения — только в режиме удаления */}
      {deleting &&
        (px ? (
          <Pressable disabled={marked.size === 0} onPress={confirmDelete} style={marked.size === 0 && styles.deleteBtnDisabled}>
            <PixelBox style={styles.deleteBtnLayout} fill="#FDE3E4" stroke={theme.colors.danger}>
              <Text style={[styles.deleteBtnText, fontOf(th, 10.7)]}>
                {marked.size === 0 ? 'Ничего не выбрано' : `Удалить (${marked.size})`}
              </Text>
            </PixelBox>
          </Pressable>
        ) : (
          <Pressable
            disabled={marked.size === 0}
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteBtn,
              styles.deleteBtnLayout,
              marked.size === 0 && styles.deleteBtnDisabled,
              pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
            ]}
          >
            <TrashIcon color={theme.colors.danger} size={18} />
            <Text style={styles.deleteBtnText}>
              {marked.size === 0 ? 'Ничего не выбрано' : `Удалить (${marked.size})`}
            </Text>
          </Pressable>
        ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cardLayout: { marginTop: 28, padding: 16 },
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  pillLayout: { paddingHorizontal: 16, paddingVertical: 10 },
  pxRoundBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pxPlus: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 15, color: theme.colors.text },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  rowActive: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.12)' },
  rowActivePx: { marginBottom: 4 },
  square: { borderRadius: 0 },
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
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1.5,
  },
  markOn: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
    boxShadow: '0 0 6px rgba(229,87,91,0.5)',
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
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(229,87,91,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229,87,91,0.35)',
    boxShadow: 'inset 0 0 16px 3px rgba(229,87,91,0.30)',
  },
  deleteBtnLayout: {
    marginTop: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtnDisabled: { opacity: 0.45 },
  deleteBtnText: { fontSize: 17, fontWeight: '600', color: theme.colors.danger },
});
