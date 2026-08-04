import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { Note } from '@/types';
import { ScrollView } from 'react-native';

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { searchNotes } = useNotes();

  const [query, setQuery] = useState('');

  const results = useMemo(
    () => (query.trim() ? searchNotes(query) : []),
    [query, searchNotes],
  );

  const topPadding = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  function handleNotePress(note: Note) {
    router.push(`/note/${note.id}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.headerArea,
          {
            paddingTop: topPadding,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Search
        </Text>
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            autoFocus={false}
          />
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'web' ? 120 : 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.trim() === '' ? (
          <View style={{ flex: 1, paddingTop: 60 }}>
            <EmptyState
              icon="search"
              title="Find any note"
              subtitle="Search by title, content, or language"
            />
          </View>
        ) : results.length === 0 ? (
          <View style={{ paddingTop: 60 }}>
            <EmptyState
              icon="file-x"
              title="No results"
              subtitle={`Nothing matches "${query}"`}
            />
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.resultCount,
                { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
              ]}
            >
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
            {results.map((note) => (
              <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, marginBottom: 14 },
  searchWrap: {},
  list: { flex: 1 },
  listContent: { paddingTop: 16 },
  resultCount: { fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },
});
