// Главный экран «Часы и будильники»

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';
import { AddCitySlot, CityClock } from './src/components/CityClock';
import { AlarmCard } from './src/components/AlarmCard';

// Пока города захардкожены. На шаге «Города» сделаем выбор и сохранение.
const CITIES = [
  { id: 'msk', name: 'Москва', timeZone: 'Europe/Moscow', color: theme.colors.accent, lat: 55.7558, lon: 37.6173 },
  { id: 'seoul', name: 'Сеул', timeZone: 'Asia/Seoul', color: theme.colors.accentAlt, lat: 37.5665, lon: 126.978 },
];

// Текущее время, обновляется раз в секунду
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function App() {
  const now = useNow();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Шапка */}
        <View style={styles.header}>
          <Text style={styles.title}>Часы и будильники</Text>
          <Pressable style={styles.iconBtn}>
            <Text style={styles.iconText}>⚙︎</Text>
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Text style={styles.langText}>RU</Text>
          </Pressable>
        </View>

        {/* Три слота с часами */}
        <View style={styles.clocks}>
          {CITIES.map((c) => (
            <CityClock
              key={c.id}
              name={c.name}
              timeZone={c.timeZone}
              now={now}
              color={c.color}
              lat={c.lat}
              lon={c.lon}
            />
          ))}
          <AddCitySlot />
        </View>

        <AlarmCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 64, paddingHorizontal: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  title: { flex: 1, fontSize: 28, fontWeight: '700', color: theme.colors.text },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  iconText: { fontSize: 24, color: theme.colors.text },
  langText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  clocks: { flexDirection: 'row', alignItems: 'stretch' },
});
