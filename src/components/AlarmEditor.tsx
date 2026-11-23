// Экран «Новый будильник» / редактирование будильника (выезжает снизу).
// Внутри две «страницы»: основная и выбор мелодии.

import { ReactNode, useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { fontOf, theme, useTheme } from '../theme';
import { PixelBox, PixelIcon, PixelRadio, PixelSwitch } from './Pixel';
import { PixelTimePicker } from './PixelTimePicker';
import { GlamBubble, GlamSwitch } from './Glam';
import { Alarm, Weekday, newAlarm } from '../alarms';
import { CATEGORIES, CategoryId, Voice, getMelody, melodiesIn } from '../melodies';
import { SegmentedSwitch } from './SegmentedSwitch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryIcon } from './CategoryIcon';
import { formatDuration, nextRing } from '../time';
import { WHEEL_ITEM_H, WHEEL_VISIBLE, WheelPicker } from './WheelPicker';
import { Slider } from './Slider';
import {
  BellIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  NoteIcon,
  PauseIcon,
  PencilIcon,
  PianoIcon,
  PlayIcon,
  RadioDot,
} from './Icons';

type Props = {
  visible: boolean;
  alarm: Alarm | null; // null = новый будильник
  onSave: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const DAYS: { d: Weekday; label: string }[] = [
  { d: 1, label: 'Пн' },
  { d: 2, label: 'Вт' },
  { d: 3, label: 'Ср' },
  { d: 4, label: 'Чт' },
  { d: 5, label: 'Пт' },
  { d: 6, label: 'Сб' },
  { d: 7, label: 'Вс' },
];
const SNOOZE_MIN = 1;
const SNOOZE_MAX = 30;

// Карточка настроек: стекло в классике, рамка-«лесенка» в пиксельной теме
function SettingsCard({ pixel, children }: { pixel: boolean; children: ReactNode }) {
  if (pixel) return <PixelBox style={styles.cardLayout}>{children}</PixelBox>;
  return <View style={[styles.card, styles.cardLayout]}>{children}</View>;
}

export function AlarmEditor({ visible, alarm, onSave, onDelete, onClose }: Props) {
  // Черновик: всё, что меняем на экране, до нажатия ✓
  const [draft, setDraft] = useState<Alarm>(() => newAlarm(7, 0));
  const [page, setPage] = useState<'main' | 'melody'>('main');
  const th = useTheme();
  const px = th.pixel;
  const f = (size: number) => fontOf(th, size); // пиксельный шрифт нужного размера (в классике — ничего)
  // Фильтр на странице мелодий: null = все разделы
  const [filter, setFilter] = useState<CategoryId | null>(null);
  // Переключатель М / Ж / Общие (общие видны всегда); последний выбор запоминаем
  const [voice, setVoice] = useState<Voice>('any');
  useEffect(() => {
    AsyncStorage.getItem('melodyVoice:v1')
      .then((v) => {
        if (v === 'm' || v === 'f' || v === 'any') setVoice(v);
      })
      .catch(() => {});
  }, []);
  const changeVoice = (v: Voice) => {
    setVoice(v);
    AsyncStorage.setItem('melodyVoice:v1', v).catch(() => {});
  };
  const [now, setNow] = useState(() => new Date());
  // Номер «сеанса» открытия: барабаны пересоздаются и встают на время нового черновика
  const [session, setSession] = useState(0);

  // Звук для кнопки ▶ «послушать»
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    // Чтобы прослушивание было слышно и в беззвучном режиме
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // При открытии: берём существующий будильник или создаём новый на текущее время
  useEffect(() => {
    if (!visible) return;
    const d = new Date();
    setDraft(alarm ? { ...alarm } : newAlarm(d.getHours(), d.getMinutes()));
    setPage('main');
    setNow(d);
    setSession((n) => n + 1);
  }, [visible, alarm]);

  // Подсказка «Зазвонит через…» обновляется раз в 30 секунд
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [visible]);

  // Мелодия доиграла — кнопка снова ▶
  useEffect(() => {
    if (status.didJustFinish) setPreviewing(null);
  }, [status.didJustFinish]);

  const stopPreview = () => {
    player.pause();
    setPreviewing(null);
  };

  const togglePreview = (id: string) => {
    if (previewing === id) return stopPreview();
    player.replace(getMelody(id).file);
    player.seekTo(0).catch(() => {});
    player.play();
    setPreviewing(id);
  };

  const close = () => {
    stopPreview();
    onClose();
  };

  const set = (patch: Partial<Alarm>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleDay = (d: Weekday) =>
    set({ weekdays: draft.weekdays.includes(d) ? draft.weekdays.filter((x) => x !== d) : [...draft.weekdays, d].sort() });

  const save = () => {
    stopPreview();
    onSave({ ...draft, note: draft.note.trim(), enabled: true });
  };

  const inText = formatDuration(nextRing(draft.hour, draft.minute, draft.weekdays, now).getTime() - now.getTime());

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.sheet, { backgroundColor: th.colors.background }]}>
        {th.glam && <Image source={require('../../assets/glam/background.jpg')} style={styles.bgImage} resizeMode="cover" />}
        {page === 'main' ? (
          <>
            {/* Шапка: ✕ (в пиксельной — ←)  Новый будильник  ✓ */}
            <View style={styles.header}>
              {px ? (
                <Pressable onPress={close} hitSlop={8}>
                  <PixelBox style={styles.pxHeaderBtn}>
                    <ChevronLeft width={2.6} />
                  </PixelBox>
                </Pressable>
              ) : th.glam ? (
                <Pressable onPress={close} hitSlop={8}>
                  <GlamBubble style={styles.glamBtn} round>
                    <CloseIcon />
                  </GlamBubble>
                </Pressable>
              ) : (
                <Pressable style={styles.circleBtn} onPress={close} hitSlop={8}>
                  <CloseIcon />
                </Pressable>
              )}
              <Text style={[styles.title, f(13.3)]}>{alarm ? 'Будильник' : 'Новый будильник'}</Text>
              {px ? (
                <Pressable onPress={save} hitSlop={8}>
                  <PixelBox style={styles.pxHeaderBtn} fill={theme.colors.accent} glow={theme.colors.accent}>
                    <CheckIcon color="#FFFFFF" width={2.8} />
                  </PixelBox>
                </Pressable>
              ) : th.glam ? (
                <Pressable onPress={save} hitSlop={8}>
                  <GlamBubble style={styles.glamBtn} tint="accent" round>
                    <CheckIcon color="#FFFFFF" width={2.4} />
                  </GlamBubble>
                </Pressable>
              ) : (
                <Pressable style={[styles.circleBtn, styles.circleBtnAccent]} onPress={save} hitSlop={8}>
                  <CheckIcon color="#FFFFFF" width={2.2} />
                </Pressable>
              )}
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
            >
              {/* Барабан времени со стеклянной «таблеткой» */}
              {px ? (
                <PixelTimePicker key={session} hour={draft.hour} minute={draft.minute} onChange={set} />
              ) : (
                <View style={styles.wheels} key={session}>
                  {th.glam ? (
                    <View style={styles.glamWheelPill} pointerEvents="none">
                      <GlamBubble style={StyleSheet.absoluteFill} />
                    </View>
                  ) : (
                    <View style={styles.wheelPill} pointerEvents="none" />
                  )}
                  <WheelPicker values={HOURS} value={draft.hour} onChange={(hour) => set({ hour })} align="right" />
                  <WheelPicker values={MINUTES} value={draft.minute} onChange={(minute) => set({ minute })} align="left" />
                </View>
              )}
              <Text style={[styles.inText, f(8)]}>Зазвонит через {inText}</Text>

              {/* Дни недели */}
              <View style={styles.days}>
                {DAYS.map(({ d, label }) => {
                  const on = draft.weekdays.includes(d);
                  if (px) {
                    return (
                      <Pressable key={d} onPress={() => toggleDay(d)}>
                        <PixelBox
                          style={styles.pxDay}
                          fill={on ? theme.colors.accent : '#FFFFFF'}
                          stroke={on ? '#5B3FC4' : th.colors.outline}
                          glow={on ? theme.colors.accent : undefined}
                        >
                          <Text style={[styles.dayText, f(8), on && styles.dayTextOn]}>{label}</Text>
                        </PixelBox>
                      </Pressable>
                    );
                  }
                  if (th.glam) {
                    return (
                      <Pressable key={d} onPress={() => toggleDay(d)}>
                        <GlamBubble style={styles.glamDay} tint={on ? "accent" : "pearl"} round>
                          <Text style={[styles.dayText, fontOf(th), on && styles.dayTextOn]}>{label}</Text>
                        </GlamBubble>
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable key={d} onPress={() => toggleDay(d)} style={[styles.day, on && styles.dayOn]}>
                      <Text style={[styles.dayText, fontOf(th), on && styles.dayTextOn]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Настройки */}
              <SettingsCard pixel={px}>
                <View style={styles.row}>
                  <PencilIcon />
                  <TextInput
                    style={[styles.noteInput, f(10.7)]}
                    placeholder="Заметка"
                    placeholderTextColor={theme.colors.textMuted}
                    value={draft.note}
                    onChangeText={(note) => set({ note })}
                    multiline
                    maxLength={80}
                  />
                </View>

                <View style={[styles.divider, px && styles.pxDivider]} />

                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setFilter(null);
                    // Если у будильника запись «мужская»/«женская» — открываем на ней
                    const v = getMelody(draft.melody).voice;
                    if (v !== 'any') setVoice(v);
                    setPage('melody');
                  }}
                >
                  <NoteIcon />
                  <Text style={[styles.rowLabel, f(10.7)]}>Звук</Text>
                  <CategoryIcon id={getMelody(draft.melody).category} size={18} />
                  <Text style={[styles.rowValue, f(8), px && styles.pxRowValue]} numberOfLines={1}>
                    {getMelody(draft.melody).name}
                  </Text>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </Pressable>

                <View style={[styles.divider, px && styles.pxDivider]} />

                <View style={styles.row}>
                  <BellIcon />
                  <Text style={[styles.rowLabel, f(10.7)]}>Повтор</Text>
                  {px ? (
                    <PixelSwitch value={draft.snooze} onValueChange={(snooze) => set({ snooze })} />
                  ) : th.glam ? (
                    <GlamSwitch value={draft.snooze} onValueChange={(snooze) => set({ snooze })} />
                  ) : (
                    <Switch
                      value={draft.snooze}
                      onValueChange={(snooze) => set({ snooze })}
                      trackColor={{ false: theme.colors.switchOff, true: theme.colors.accent }}
                    />
                  )}
                </View>

                {draft.snooze && (
                  <View style={styles.snooze}>
                    <View style={styles.snoozeHead}>
                      <Text style={[styles.snoozeLabel, f(8)]}>Каждые</Text>
                      <Text style={[styles.snoozeValue, f(10.7)]}>{draft.snoozeMinutes} мин</Text>
                    </View>
                    <Slider
                      value={draft.snoozeMinutes}
                      min={SNOOZE_MIN}
                      max={SNOOZE_MAX}
                      onChange={(snoozeMinutes) => set({ snoozeMinutes })}
                      pixel={px}
                      glam={th.glam}
                    />
                  </View>
                )}
              </SettingsCard>

              {/* Удаление — только у существующего будильника */}
              {alarm &&
                (px ? (
                  <Pressable
                    onPress={() => {
                      stopPreview();
                      onDelete(alarm.id);
                    }}
                  >
                    <PixelBox style={styles.pxDelete} fill="#FDE3E4" stroke={theme.colors.danger}>
                      <Text style={[styles.deleteText, f(10.7)]}>Удалить будильник</Text>
                    </PixelBox>
                  </Pressable>
                ) : th.glam ? (
                  <Pressable
                    onPress={() => {
                      stopPreview();
                      onDelete(alarm.id);
                    }}
                  >
                    <GlamBubble style={styles.glamDelete} tint="danger">
                      <Text style={[styles.deleteText, fontOf(th)]}>Удалить будильник</Text>
                    </GlamBubble>
                  </Pressable>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      stopPreview();
                      onDelete(alarm.id);
                    }}
                  >
                    <Text style={[styles.deleteText, fontOf(th)]}>Удалить будильник</Text>
                  </Pressable>
                ))}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Страница выбора мелодии */}
            <View style={styles.header}>
              {px ? (
                <Pressable
                  onPress={() => {
                    stopPreview();
                    setPage('main');
                  }}
                  hitSlop={8}
                >
                  <PixelBox style={styles.pxHeaderBtn}>
                    <ChevronLeft width={2.6} />
                  </PixelBox>
                </Pressable>
              ) : th.glam ? (
                <Pressable
                  onPress={() => {
                    stopPreview();
                    setPage('main');
                  }}
                  hitSlop={8}
                >
                  <GlamBubble style={styles.glamBtn} round>
                    <ChevronLeft />
                  </GlamBubble>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.circleBtn}
                  onPress={() => {
                    stopPreview();
                    setPage('main');
                  }}
                  hitSlop={8}
                >
                  <ChevronLeft />
                </Pressable>
              )}
              <Text style={[styles.title, f(13.3)]} numberOfLines={1}>
                Мелодии и голоса
              </Text>
              <View style={{ width: 48 }} />
            </View>

            {/* М · Ж · Общие */}
            <View style={styles.voiceBar}>
              <SegmentedSwitch
                options={[
                  { value: 'm', label: 'М' },
                  { value: 'f', label: 'Ж' },
                  { value: 'any', label: 'Общие' },
                ]}
                value={voice}
                textStyle={f(10.7)}
                onChange={(v) => {
                  changeVoice(v);
                  if (filter && filter !== 'chiptune' && melodiesIn(filter, v).length === 0) setFilter(null);
                }}
              />
            </View>

            {/* Иконки разделов: тап — показать только этот раздел, повторный тап — снова все */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterBar}
              contentContainerStyle={styles.filterContent}
            >
              {CATEGORIES.map((c) => {
                const active = filter === c.id;
                const empty = c.id !== 'chiptune' && melodiesIn(c.id, voice).length === 0;
                if (th.glam) {
                  return (
                    <Pressable
                      key={c.id}
                      disabled={empty}
                      onPress={() => setFilter(active ? null : c.id)}
                      style={empty && { opacity: 0.35 }}
                    >
                      <GlamBubble style={styles.glamFilter} tint={active ? 'accent' : 'pearl'} round>
                        <CategoryIcon id={c.id} size={26} color={active ? '#FFFFFF' : theme.colors.accent} />
                      </GlamBubble>
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={c.id}
                    disabled={empty}
                    onPress={() => setFilter(active ? null : c.id)}
                    style={[styles.filterBtn, active && styles.filterBtnOn, empty && { opacity: 0.35 }]}
                  >
                    <CategoryIcon id={c.id} size={26} color={active ? '#FFFFFF' : theme.colors.accent} />
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Разделы с мелодиями (пустые не показываем) */}
            <ScrollView contentContainerStyle={styles.content}>
              {CATEGORIES.filter((c) => !filter || c.id === filter).map((c) => {
                const list = melodiesIn(c.id, voice);
                const isChiptune = c.id === 'chiptune';
                if (list.length === 0 && !isChiptune) return null;
                return (
                  <View key={c.id} style={styles.section}>
                    <View style={styles.sectionHead}>
                      <CategoryIcon id={c.id} size={22} />
                      <Text style={[styles.sectionTitle, f(10.7)]}>{c.name}</Text>
                    </View>
                    <View style={[styles.card, styles.cardLayout]}>
                      {/* Первая строка Чиптюна — вход в синтезатор */}
                      {isChiptune && (
                        <Pressable
                          style={styles.row}
                          onPress={() => Alert.alert('Синтезатор', 'Скоро здесь можно будет сочинить свою мелодию 🎹')}
                        >
                          <PianoIcon color={theme.colors.accent} />
                          <Text style={[styles.rowLabel, { color: theme.colors.accent, fontWeight: '600' }, f(10.7)]}>
                            Создать свою
                          </Text>
                          <ChevronRight size={18} color={theme.colors.textMuted} />
                        </Pressable>
                      )}
                      {list.map((m, i) => {
                        const selected = draft.melody === m.id;
                        const playing = previewing === m.id;
                        return (
                          <View key={m.id}>
                            {(i > 0 || isChiptune) && <View style={styles.divider} />}
                            <Pressable style={styles.row} onPress={() => set({ melody: m.id })}>
                              {px ? <PixelRadio on={selected} /> : <RadioDot on={selected} />}
                              <Text style={[styles.rowLabel, selected && { fontWeight: '600' }, f(10.7)]}>{m.name}</Text>
                              {px ? (
                                <Pressable onPress={() => togglePreview(m.id)} hitSlop={8}>
                                  <PixelBox style={styles.pxPlay} fill="#F1ECFF" stroke={th.colors.outline} step={2}>
                                    <PixelIcon name={playing ? 'pause' : 'play'} size={18} />
                                  </PixelBox>
                                </Pressable>
                              ) : th.glam ? (
                                <Pressable onPress={() => togglePreview(m.id)} hitSlop={8}>
                                  <GlamBubble style={styles.glamPlay} tint={playing ? 'accent' : 'pearl'} round>
                                    {playing ? <PauseIcon color="#FFFFFF" /> : <PlayIcon />}
                                  </GlamBubble>
                                </Pressable>
                              ) : (
                                <Pressable style={styles.playBtn} onPress={() => togglePreview(m.id)} hitSlop={8}>
                                  {playing ? <PauseIcon /> : <PlayIcon />}
                                </Pressable>
                              )}
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const glass = {
  backgroundColor: theme.colors.card,
  borderWidth: 1,
  borderColor: theme.colors.cardBorder,
};

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: theme.colors.text },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...glass,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  circleBtnAccent: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    boxShadow: '0 4px 14px rgba(139,108,240,0.45)',
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },

  wheels: {
    flexDirection: 'row',
    gap: 16, // зазор между часами и минутами
    height: WHEEL_ITEM_H * WHEEL_VISIBLE,
    marginTop: 8,
  },
  wheelPill: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: WHEEL_ITEM_H * 2 - 4,
    height: WHEEL_ITEM_H + 8,
    borderRadius: 999,
    ...glass,
    backgroundColor: 'rgba(255,255,255,0.7)',
    boxShadow: 'inset 0 0 12px 1px rgba(139,108,240,0.12)',
  },
  inText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 14, marginTop: 6 },

  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    ...glass,
  },
  dayOn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    boxShadow: '0 2px 10px rgba(139,108,240,0.4)',
  },
  dayText: { fontSize: 14, color: theme.colors.text },
  dayTextOn: { color: '#FFFFFF', fontWeight: '600' },

  card: { borderRadius: theme.radius.card, ...glass },
  cardLayout: { paddingHorizontal: 16 },
  glamBtn: { width: 50, height: 50 },
  bgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  glamDay: { width: 44, height: 44 },
  glamFilter: { width: 54, height: 54 },
  glamPlay: { width: 40, height: 40 },
  glamWheelPill: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: WHEEL_ITEM_H * 2 - 6,
    height: WHEEL_ITEM_H + 12,
  },
  glamDelete: { marginTop: 20, height: 54 },
  pxHeaderBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  pxDay: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pxDivider: { height: 2, backgroundColor: theme.colors.outline, marginLeft: 0 },
  pxRowValue: { flexShrink: 1 },
  pxPlay: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pxDelete: { marginTop: 20, height: 54, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  rowLabel: { flex: 1, fontSize: 17, color: theme.colors.text },
  rowValue: { fontSize: 16, color: theme.colors.accent },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 34 },
  noteInput: { flex: 1, fontSize: 17, color: theme.colors.text, paddingTop: 0, paddingBottom: 0, maxHeight: 80 },

  snooze: { paddingLeft: 34, paddingBottom: 10 },
  snoozeHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  snoozeLabel: { fontSize: 15, color: theme.colors.textMuted },
  snoozeValue: { fontSize: 15, fontWeight: '600', color: theme.colors.accent, fontVariant: ['tabular-nums'] },

  voiceBar: { paddingHorizontal: 16, marginTop: 8 },
  filterBar: { flexGrow: 0, marginTop: 12, marginBottom: 4 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 10 },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...glass,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  filterBtnOn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    boxShadow: '0 3px 12px rgba(139,108,240,0.45)',
  },
  section: { marginTop: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },

  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,108,240,0.10)',
  },

  deleteBtn: {
    marginTop: 20,
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,87,91,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229,87,91,0.35)',
    boxShadow: 'inset 0 0 16px 3px rgba(229,87,91,0.30)',
  },
  deleteText: { fontSize: 17, fontWeight: '600', color: theme.colors.danger },
});
