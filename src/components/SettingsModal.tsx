// Экран настроек (за шестерёнкой): выбор темы.

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontOf, theme, useTheme } from '../theme';
import { THEMES, ThemeId, useSettings } from '../settings';
import { ClockFace } from './ClockFace';
import { CloseIcon } from './Icons';
import { PixelBox, PixelClockFace, PixelIcon } from './Pixel';

type Props = { visible: boolean; onClose: () => void };

// Мини-превью темы: циферблат в её стиле
function ThemePreview({ id }: { id: ThemeId }) {
  const th = useTheme();
  if (id === 'classic' || id === 'pixel') {
    return (
      <View style={styles.previewDial}>
        {id === 'classic' ? (
          <ClockFace color={theme.colors.accent} hour={10} minute={10} variant="classic" />
        ) : (
          <PixelClockFace color={theme.colors.accent} hour={10} minute={10} />
        )}
      </View>
    );
  }
  return (
    <View style={[styles.previewDial, styles.previewSoon]}>
      <Text style={[styles.soonText, fontOf(th, 8)]}>скоро</Text>
    </View>
  );
}

export function SettingsModal({ visible, onClose }: Props) {
  const { themeId, setThemeId } = useSettings();
  const th = useTheme();
  const px = th.pixel;
  const f = (size: number) => fontOf(th, size);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: th.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, f(16)]}>Настройки</Text>
          {px ? (
            <Pressable onPress={onClose} hitSlop={8}>
              <PixelBox style={styles.pxBtn}>
                <PixelIcon name="close" size={24} />
              </PixelBox>
            </Pressable>
          ) : (
            <Pressable style={styles.circleBtn} onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, f(10.7)]}>Тема</Text>
          <View style={styles.themes}>
            {THEMES.map((t) => {
              const active = themeId === t.id;
              if (px) {
                return (
                  <Pressable key={t.id} disabled={!t.ready} onPress={() => setThemeId(t.id)} style={[styles.pxCardWrap, !t.ready && { opacity: 0.55 }]}>
                    <PixelBox
                      style={styles.pxCard}
                      stroke={active ? theme.colors.accent : th.colors.outline}
                      fill={active ? '#F4EEFF' : '#FFFFFF'}
                      glow={active ? theme.colors.accent : undefined}
                    >
                      <ThemePreview id={t.id} />
                      <Text style={[styles.themeName, f(8), active && styles.themeNameOn]}>{t.name}</Text>
                    </PixelBox>
                  </Pressable>
                );
              }
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

          <Text style={[styles.credit, f(8)]}>Погода: Open-Meteo.com</Text>
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
  pxBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  pxCardWrap: { flex: 1 },
  pxCard: { alignItems: 'center', paddingVertical: 14 },
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


  credit: { textAlign: 'center', fontSize: 12, color: theme.colors.textMuted, marginTop: 32 },
});
