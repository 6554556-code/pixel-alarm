// Главный экран «Часы и будильники»

import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';
import { AddCitySlot, CityClock } from './src/components/CityClock';
import { AlarmCard } from './src/components/AlarmCard';
import { CitySearchModal } from './src/components/CitySearchModal';
import { CITY_COLORS, City, MAX_CITIES, useCities } from './src/cities';

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
  const { cities, addCity, removeCity } = useCities();
  const [searchOpen, setSearchOpen] = useState(false);

  const pickCity = (city: City) => {
    addCity(city);
    setSearchOpen(false);
  };

  // Долгое нажатие на город → спросить, удалить ли
  const askRemove = (city: City) =>
    Alert.alert(city.name, 'Убрать этот город с экрана?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => removeCity(city.id) },
    ]);

  // Пустые слоты до трёх — в каждом кнопка «Добавить»
  const emptySlots = Math.max(0, MAX_CITIES - cities.length);

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
          {cities.map((c, i) => (
            <CityClock
              key={c.id}
              name={c.name}
              timeZone={c.timeZone}
              now={now}
              color={CITY_COLORS[i % CITY_COLORS.length]}
              lat={c.lat}
              lon={c.lon}
              onLongPress={() => askRemove(c)}
            />
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <AddCitySlot key={`add-${i}`} onPress={() => setSearchOpen(true)} />
          ))}
        </View>

        <AlarmCard />
      </ScrollView>

      <CitySearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} onPick={pickCity} />
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
