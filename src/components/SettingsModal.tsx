// Экран настроек (за шестерёнкой): темы и 18+.

import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../theme';
import { THEMES, ThemeId, useSettings } from '../settings';
import { ClockFace } from './ClockFace';
import { CloseIcon } from './Icons';

type Props = { visible: boolean; onClose: () => void };

// Мини-превью темы: циферблат в её стиле (пока у готовых тем)
function ThemePreview({ id }: { id: ThemeId }) {
  if (id === 'classic') {
    return (
      <View style={styles.previewDial}>
        <ClockFace color={theme.colors.accent} hour={10} minute={10} />
      </View>
    );
  }
  return (
    <View style={[styles.previewDial, styles.previewSoon]}>
      <Text style={styles.soonText}>скоро</Text>
    </View>
  );
}

export function SettingsModal({ visible, onClose }: Props) {
  const { themeId, setThemeId, adult, setAdult } = useSettings();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Настройки</Text>
          <Pressable style={styles.circleBtn} onPress={onClose} hitSlop={8}>
            <CloseIcon />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Тема</Text>
          <View style={styles.themes}>
            {THEMES.map((t) => {
              const active = themeId === t.id;
              return (
                <Pressable
                  key={t.id}
                  disabled={!t.ready}
                  onPress={() => setThemeId(t.id)}
                  style={[styles.themeCard, active && styles.themeCardOn, !t.ready && { opacity: 0.55 }]}
                >
                  <ThemePreview id={t.id} />
                  <Text style={[styles.themeName, active && styles.themeNameOn]}>{t.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Озвучка</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>18+</Text>
                <Text style={styles.rowHint}>Показывать записи для взрослых</Text>
              </View>
              <Switch
                value={adult}
                onValueChange={setAdult}
                trackColor={{ false: theme.colors.switchOff, true: theme.colors.accent }}
              />
            </View>
          </View>

          <Text style={styles.credit}>Погода: Open-Meteo.com</Text>
        </ScrollView>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  title: { flex: 1, fontSize: 28, fontWeight: '700', color: theme.colors.text },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...glass,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: 20, marginBottom: 10, paddingHorizontal: 4 },

  themes: { flexDirection: 'row', gap: 10 },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    ...glass,
  },
  themeCardOn: {
    borderColor: theme.colors.accent,
    borderWidth: 1.5,
    boxShadow: 'inset 0 0 14px 2px rgba(139,108,240,0.18)',
  },
  previewDial: { width: 64, height: 64, marginBottom: 10 },
  previewSoon: {
    borderRadius: 32,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(27,27,36,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonText: { fontSize: 12, color: theme.colors.textMuted },
  themeName: { fontSize: 15, color: theme.colors.text },
  themeNameOn: { fontWeight: '700', color: theme.colors.accent },

  card: { borderRadius: theme.radius.card, paddingHorizontal: 16, ...glass },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingVertical: 10 },
  rowLabel: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  rowHint: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },

  credit: { textAlign: 'center', fontSize: 12, color: theme.colors.textMuted, marginTop: 32 },
});
