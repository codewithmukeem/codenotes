import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';
import { NoteCard } from '@/components/NoteCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Note } from '@/types';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createNote, getPinnedNotes, getFavoriteNotes, getActiveNotes, searchNotes, isLoaded } =
    useNotes();

  const [query, setQuery] = useState('');

  const pinnedNotes = useMemo(() => getPinnedNotes(), [getPinnedNotes]);
  const favoriteNotes = useMemo(() => getFavoriteNotes().filter((n) => !n.isPinned), [getFavoriteNotes]);
  const recentNotes = useMemo(
    () => getActiveNotes().filter((n) => !n.isPinned).slice(0, 30),
    [getActiveNotes],
  );
  const searchResults = useMemo(
    () => (query.trim() ? searchNotes(query) : []),
    [query, searchNotes],
  );

  const topPadding = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  function handleNotePress(note: Note) {
    router.push(`/note/${note.id}`);
  }

  function handleNewNote() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const note = createNote({});
    router.push(`/note/${note.id}`);
  }

  const isEmpty = !isLoaded || (pinnedNotes.length === 0 && recentNotes.length === 0 && favoriteNotes.length === 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding, paddingBottom: Platform.OS === 'web' ? 120 : 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              CodeNotes
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Write Better Code. Save Better Ideas.
            </Text>
          </View>
          <Pressable
            style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
            onPress={handleNewNote}
            hitSlop={8}
          >
            <Feather name="edit-2" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
        </View>

        {query.trim() ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.length === 0 ? (
              <View style={{ height: 200 }}>
                <EmptyState icon="search" title="No results" subtitle={`Nothing matches "${query}"`} />
              </View>
            ) : (
              searchResults.map((note) => (
                <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
              ))
            )}
          </>
        ) : (
          <>
            {/* Pinned */}
            {pinnedNotes.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="bookmark" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                    Pinned
                  </Text>
                </View>
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
                ))}
              </View>
            ) : null}

            {/* Favorites */}
            {favoriteNotes.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="star" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                    Favorites
                  </Text>
                </View>
                {favoriteNotes.slice(0, 5).map((note) => (
                  <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
                ))}
              </View>
            ) : null}

            {/* Recent */}
            <View style={styles.section}>
              {(pinnedNotes.length > 0 || favoriteNotes.length > 0) ? (
                <View style={styles.sectionHeader}>
                  <Feather name="clock" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                    Recent
                  </Text>
                </View>
              ) : null}
              {recentNotes.length === 0 ? (
                <View style={{ height: 260 }}>
                  <EmptyState
                    icon="file-text"
                    title="No notes yet"
                    subtitle="Tap the + button to create your first note"
                  />
                </View>
              ) : (
                recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <FAB onPress={handleNewNote} bottom={Platform.OS === 'web' ? 100 : 90} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appName: { fontSize: 26, lineHeight: 32 },
  tagline: { fontSize: 12, marginTop: 2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: 16, marginBottom: 20 },
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
});
