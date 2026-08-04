import React, { useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';
import { CollectionCard } from '@/components/CollectionCard';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Collection, Note } from '@/types';

const ICONS = ['folder', 'code', 'file-text', 'book', 'briefcase', 'star', 'zap', 'archive'] as const;

export default function CollectionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collections, createCollection, deleteCollection, getNotesByCollection } = useNotes();

  const [selectedCol, setSelectedCol] = useState<Collection | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string>('folder');

  const topPadding = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  const colNotes = useMemo(
    () => (selectedCol ? getNotesByCollection(selectedCol.id) : []),
    [selectedCol, getNotesByCollection],
  );

  function handleCreate() {
    if (!newName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createCollection(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('folder');
    setShowModal(false);
  }

  function handleDeleteCol(col: Collection) {
    Alert.alert(
      'Delete Collection',
      `Delete "${col.name}"? Notes will be kept but unassigned.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCollection(col.id);
            if (selectedCol?.id === col.id) setSelectedCol(null);
          },
        },
      ],
    );
  }

  function handleNotePress(note: Note) {
    router.push(`/note/${note.id}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        {selectedCol ? (
          <View style={styles.headerRow}>
            <Pressable onPress={() => setSelectedCol(null)} hitSlop={8}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>
            <Text
              style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
              numberOfLines={1}
            >
              {selectedCol.name}
            </Text>
            <Pressable onPress={() => handleDeleteCol(selectedCol)} hitSlop={8}>
              <Feather name="trash-2" size={20} color={colors.destructive} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Collections
            </Text>
            <Pressable
              style={[styles.newBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setShowModal(true)}
              hitSlop={8}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'web' ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {selectedCol ? (
          colNotes.length === 0 ? (
            <View style={{ paddingTop: 60 }}>
              <EmptyState
                icon="file-text"
                title="No notes"
                subtitle="Notes added to this collection will appear here"
              />
            </View>
          ) : (
            colNotes.map((note) => (
              <NoteCard key={note.id} note={note} onPress={() => handleNotePress(note)} />
            ))
          )
        ) : collections.length === 0 ? (
          <View style={{ paddingTop: 60 }}>
            <EmptyState
              icon="folder"
              title="No collections"
              subtitle="Organise your notes into collections"
            />
          </View>
        ) : (
          collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              noteCount={getNotesByCollection(col.id).length}
              onPress={() => setSelectedCol(col)}
              onLongPress={() => handleDeleteCol(col)}
            />
          ))
        )}
      </ScrollView>

      {!selectedCol ? <FAB onPress={() => setShowModal(true)} bottom={Platform.OS === 'web' ? 100 : 90} /> : null}

      {/* New Collection Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              New Collection
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                  fontFamily: 'Inter_400Regular',
                },
              ]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Collection name..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <Text style={[styles.iconLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <Pressable
                  key={ic}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: newIcon === ic ? colors.primary : colors.secondary,
                      borderColor: newIcon === ic ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setNewIcon(ic)}
                >
                  <Feather
                    name={ic as never}
                    size={20}
                    color={newIcon === ic ? colors.primaryForeground : colors.foreground}
                  />
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.secondary }]}
                onPress={() => { setShowModal(false); setNewName(''); setNewIcon('folder'); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: newName.trim() ? colors.primary : colors.secondary },
                ]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text
                  style={[
                    styles.modalBtnText,
                    {
                      color: newName.trim() ? colors.primaryForeground : colors.mutedForeground,
                      fontFamily: 'Inter_600SemiBold',
                    },
                  ]}
                >
                  Create
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, flex: 1 },
  newBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  modalTitle: { fontSize: 20 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  iconLabel: { fontSize: 13 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 15 },
});
