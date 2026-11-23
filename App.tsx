// Главный экран «Часы и будильники»

import { ReactNode, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { fontOf, theme, useTheme } from './src/theme';
import { PixelBox, PixelIcon } from './src/components/Pixel';
import { AddCitySlot, CityClock } from './src/components/CityClock';
import { AlarmCard } from './src/components/AlarmCard';
import { CitySearchModal } from './src/components/CitySearchModal';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { CITY_COLORS, City, MAX_CITIES, useCities } from './src/cities';
import { Alarm, useAlarms } from './src/alarms';
import { AlarmEditor } from './src/components/AlarmEditor';
import { SettingsModal } from './src/components/SettingsModal';
import { SettingsProvider } from './src/settings';

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
  // Пиксельный шрифт (OFL, assets/fonts). Пока грузится — текст системным шрифтом.
  useFonts({ PressStart2P: require('./assets/fonts/PressStart2P-Regular.ttf') });
  return (
    <SettingsProvider>
      <MainScreen />
    </SettingsProvider>
  );
}

// Круглая кнопка в шапке: стекло в классике, «лесенка» в пиксельной теме
function HeaderButton({ onPress, children }: { onPress?: () => void; children: ReactNode }) {
  const th = useTheme();
  if (th.pixel) {
    return (
      <Pressable onPress={onPress} style={styles.headerBtnGap}>
        <PixelBox style={styles.pixelBtn}>{children}</PixelBox>
      </Pressable>
    );
  }
  return (
    <Pressable style={[styles.iconBtn, styles.headerBtnGap]} onPress={onPress}>
      {children}
    </Pressable>
  );
}

function MainScreen() {
  const th = useTheme();
  const now = useNow();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { cities, addCity, removeCity } = useCities();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cityToRemove, setCityToRemove] = useState<City | null>(null);
  const { alarms, addAlarm, updateAlarm, toggleAlarm, removeAlarms } = useAlarms();

  // Экран будильника: editing = null → новый, иначе редактируем этот
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);

  const openNewAlarm = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEditAlarm = (a: Alarm) => {
    setEditing(a);
    setEditorOpen(true);
  };
  const saveAlarm = (a: Alarm) => {
    if (alarms.some((x) => x.id === a.id)) updateAlarm(a.id, a);
    else addAlarm(a);
    setEditorOpen(false);
  };
  const deleteAlarm = (id: string) => {
    removeAlarms([id]);
    setEditorOpen(false);
  };

  const pickCity = (city: City) => {
    addCity(city);
    setSearchOpen(false);
  };

  const confirmRemove = () => {
    if (cityToRemove) removeCity(cityToRemove.id);
    setCityToRemove(null);
  };

  // Пустые слоты до трёх — в каждом кнопка «Добавить»
  const emptySlots = Math.max(0, MAX_CITIES - cities.length);

  return (
    <View style={[styles.screen, { backgroundColor: th.colors.background }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Шапка */}
        <View style={styles.header}>
          {/* В пиксельной теме заголовок по центру между левым краем и шестерёнкой */}
          <Text style={[styles.title, fontOf(th, 13.3), th.pixel && { textAlign: 'center' }]} numberOfLines={1}>
            Часы и будильники
          </Text>
          <HeaderButton onPress={() => setSettingsOpen(true)}>
            {th.pixel ? <PixelIcon name="gear" size={26} /> : <Text style={styles.iconText}>⚙︎</Text>}
          </HeaderButton>
          <HeaderButton>
            <Text style={[styles.langText, fontOf(th, 10.7)]}>RU</Text>
          </HeaderButton>
        </View>

        {/* Три слота с часами */}
        <View style={styles.clocks}>
          {/* Долгое нажатие на город → окно «Убрать город?» */}
          {cities.map((c, i) => (
            <CityClock
              key={c.id}
              name={c.name}
              timeZone={c.timeZone}
              now={now}
              color={CITY_COLORS[i % CITY_COLORS.length]}
              lat={c.lat}
              lon={c.lon}
              onLongPress={() => setCityToRemove(c)}
            />
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <AddCitySlot key={`add-${i}`} onPress={() => setSearchOpen(true)} />
          ))}
        </View>

        <AlarmCard
          alarms={alarms}
          onAdd={openNewAlarm}
          onEdit={openEditAlarm}
          onToggle={toggleAlarm}
          onDelete={removeAlarms}
        />
      </ScrollView>

      <CitySearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} onPick={pickCity} />

      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <AlarmEditor
        visible={editorOpen}
        alarm={editing}
        onSave={saveAlarm}
        onDelete={deleteAlarm}
        onClose={() => setEditorOpen(false)}
      />

      <ConfirmDialog
        visible={!!cityToRemove}
        title={cityToRemove?.name ?? ''}
        message="Убрать этот город с экрана?"
        onConfirm={confirmRemove}
        onCancel={() => setCityToRemove(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 64, paddingHorizontal: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  title: { flex: 1, fontSize: 28, fontWeight: '700', color: theme.colors.text },
  headerBtnGap: { marginLeft: 8 },
  pixelBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
