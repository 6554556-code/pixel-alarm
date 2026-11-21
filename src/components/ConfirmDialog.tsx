// Красивое окно подтверждения вместо системного Alert:
// размытый фон, стеклянная карточка, кнопки-«таблетки» со свечением.

import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean; // красная кнопка подтверждения
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  destructive = true,
  onConfirm,
  onCancel,
}: Props) {
  // Карточка мягко «вырастает» при появлении
  const scale = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    if (visible) {
      scale.setValue(0.92);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
    }
  }, [visible, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Размытый фон; тап мимо карточки = отмена */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel}>
        <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.dim} />
      </Pressable>

      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttons}>
            <Pressable style={({ pressed }) => [styles.btn, styles.cancel, pressed && styles.pressed]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btn, destructive ? styles.danger : styles.primary, pressed && styles.pressed]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: destructive ? theme.colors.danger : theme.colors.accent }]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(40,30,80,0.12)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 22,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    boxShadow: '0 12px 40px rgba(110,90,200,0.25)',
  },
  title: { fontSize: 21, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  message: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // «Отмена»: белая с лёгкой серой дымкой по контуру изнутри
  cancel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(27,27,36,0.10)',
    boxShadow: 'inset 0 0 12px 1px rgba(27,27,36,0.10)',
  },
  // Красная кнопка: мягкая розово-красная заливка + размытое свечение изнутри
  danger: {
    backgroundColor: 'rgba(229,87,91,0.08)',
    borderColor: 'rgba(229,87,91,0.35)',
    boxShadow: 'inset 0 0 16px 3px rgba(229,87,91,0.30)',
  },
  primary: {
    backgroundColor: 'rgba(139,108,240,0.08)',
    borderColor: 'rgba(139,108,240,0.35)',
    boxShadow: 'inset 0 0 16px 3px rgba(139,108,240,0.30)',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  cancelText: { fontSize: 17, fontWeight: '500', color: theme.colors.text },
  confirmText: { fontSize: 17, fontWeight: '600' },
});
