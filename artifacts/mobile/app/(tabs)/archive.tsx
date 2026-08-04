import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { Note } from '@/types';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Tab = 'archive' | 'trash';

export default function ArchiveScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    getArchivedNotes,
    getDeletedNotes,
    restoreNote,
    permanentlyDeleteNote,
    archiveNote,
    emptyTrash,
  } = useNotes();

  const [activeTab, setActiveTab] = useState<Tab>('archive');

  const archived = useMemo(() => getArchivedNotes(), [getArchivedNotes]);
  const deleted = useMemo(() => getDeletedNotes(), [getDeletedNotes]);

  const topPadding = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  function handleNotePress(note: Note) {
    router.push(`/note/${note.id}`);
  }

  function handleRestore(note: Note) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restoreNote(note.id);
  }

  function handleUnarchive(note: Note) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    archiveNote(note.id, false);
  }

  function handlePermanentDelete(note: Note) {
    Alert.alert(
      'Delete Forever',
      `Permanently delete "${note.title || 'Untitled'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => permanentlyDeleteNote(note.id),
        },
      ],
    );
  }

  function handleEmptyTrash() {
    if (deleted.length === 0) return;
    Alert.alert('Empty Trash', `Permanently delete all ${deleted.length} notes? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty Trash', style: 'destructive', onPress: emptyTrash },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {activeTab === 'archive' ? 'Archive' : 'Trash'}
          </Text>
          {activeTab === 'trash' && deleted.length > 0 ? (
            <Pressable onPress={handleEmptyTrash} hitSlop={8}>
              <Text style={[styles.emptyBtn, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>
                Empty
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.secondary }]}>
          {(['archive', 'trash'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === tab ? colors.foreground : colors.mutedForeground,
                    fontFamily: activeTab === tab ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {tab === 'archive' ? 'Archive' : 'Trash'}
                {tab === 'archive' && archived.length > 0 ? ` (${archived.length})` : ''}
                {tab === 'trash' && deleted.length > 0 ? ` (${deleted.length})` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'web' ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'archive' ? (
          archived.length === 0 ? (
            <View style={{ paddingTop: 60 }}>
              <EmptyState icon="archive" title="Nothing archived" subtitle="Archived notes appear here" />
            </View>
          ) : (
            archived.map((note) => (
              <View key={note.id}>
                <NoteCard note={note} onPress={() => handleNotePress(note)} />
                <View style={[styles.noteActions, { marginTop: -2 }]}>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
                    onPress={() => handleUnarchive(note)}
                  >
                    <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                      Unarchive
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )
        ) : (
          deleted.length === 0 ? (
            <View style={{ paddingTop: 60 }}>
              <EmptyState icon="trash-2" title="Trash is empty" subtitle="Deleted notes appear here" />
            </View>
          ) : (
            <>
              <Text style={[styles.trashNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Notes in trash can be restored or deleted forever.
              </Text>
              {deleted.map((note) => (
                <View key={note.id}>
                  <NoteCard note={note} onPress={() => {}} />
                  <View style={styles.noteActions}>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
                      onPress={() => handleRestore(note)}
                    >
                      <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                        Restore
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: colors.destructive, backgroundColor: colors.secondary }]}
                      onPress={() => handlePermanentDelete(note)}
                    >
                      <Text style={[styles.actionLabel, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26 },
  emptyBtn: { fontSize: 15 },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabLabel: { fontSize: 14 },
  list: { flex: 1 },
  listContent: { paddingTop: 16 },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: -4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionLabel: { fontSize: 13 },
  trashNote: { fontSize: 13, paddingHorizontal: 20, marginBottom: 14 },
});
