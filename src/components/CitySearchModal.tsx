// Экран поиска города (выезжает снизу).
// Печатаешь название → через долю секунды появляется список → тап по городу добавляет его.

import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';
import { City, searchCities } from '../cities';
import { formatTime, getZonedTime } from '../time';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (city: City) => void;
};

const DEBOUNCE_MS = 350; // ждём, пока человек допечатает, а не ищем на каждую букву

export function CitySearchModal({ visible, onClose, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Сбрасываем всё при открытии
  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
      setError(false);
    }
  }, [visible]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        setResults(await searchCities(q, controller.signal));
      } catch (e) {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort(); // отменяем устаревший запрос, если человек печатает дальше
    };
  }, [query]);

  const localTime = (tz: string) => {
    try {
      return formatTime(getZonedTime(new Date(), tz));
    } catch {
      return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Новый город</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>Отмена</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Например, Токио"
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {loading && <ActivityIndicator style={styles.status} color={theme.colors.accent} />}
        {error && <Text style={styles.status}>Не получилось найти — проверь интернет</Text>}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <Text style={styles.status}>Ничего не нашлось 🤔</Text>
        )}

        <FlatList
          data={results}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => onPick(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cityName}>{item.name}</Text>
                {!!item.region && <Text style={styles.region}>{item.region}</Text>}
              </View>
              <Text style={styles.time}>{localTime(item.timeZone)}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 16, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { flex: 1, fontSize: 24, fontWeight: '700', color: theme.colors.text },
  cancel: { fontSize: 17, color: theme.colors.accent },
  input: {
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    color: theme.colors.text,
    marginBottom: 8,
  },
  status: { textAlign: 'center', color: theme.colors.textMuted, marginVertical: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  rowPressed: { backgroundColor: 'rgba(139,108,240,0.08)' },
  cityName: { fontSize: 18, color: theme.colors.text },
  region: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  time: { fontSize: 18, fontWeight: '300', color: theme.colors.text, fontVariant: ['tabular-nums'] },
});
