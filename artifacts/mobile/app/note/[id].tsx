import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Language } from '@/types';
import { LANGUAGES, getLanguageLabel } from '@/constants/languages';
import { getCharCount, getReadingTime, getWordCount } from '@/utils/noteUtils';

type ViewMode = 'edit' | 'preview';

export default function NoteEditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getNoteById,
    updateNote,
    deleteNote,
    permanentlyDeleteNote,
    archiveNote,
    pinNote,
    favoriteNote,
    duplicateNote,
  } = useNotes();

  const note = getNoteById(id as string);

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [language, setLanguage] = useState<Language>(note?.language ?? 'text');
  const [mode, setMode] = useState<ViewMode>('edit');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const isFirstRender = useRef(true);

  // Sync local state if note changes externally
  useEffect(() => {
    if (note && isFirstRender.current) {
      setTitle(note.title);
      setContent(note.content);
      setLanguage(note.language);
      isFirstRender.current = false;
    }
  }, [note]);

  // Auto-save debounced
  useEffect(() => {
    if (isFirstRender.current) return;
    if (!note) return;
    const timer = setTimeout(() => {
      updateNote(note.id, { title, content, language });
      setLastSaved(true);
      setTimeout(() => setLastSaved(false), 1500);
    }, 800);
    return () => clearTimeout(timer);
  }, [title, content, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = useCallback(() => {
    if (!note) { router.back(); return; }
    if (!title.trim() && !content.trim()) {
      permanentlyDeleteNote(note.id);
    } else {
      updateNote(note.id, { title, content, language });
    }
    router.back();
  }, [note, title, content, language, updateNote, permanentlyDeleteNote, router]);

  function handleMore() {
    if (!note) return;
    Alert.alert(note.title || 'Note', undefined, [
      {
        text: note.isArchived ? 'Unarchive' : 'Archive',
        onPress: () => { archiveNote(note.id, !note.isArchived); router.back(); },
      },
      {
        text: 'Duplicate',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const dup = duplicateNote(note.id);
          router.replace(`/note/${dup.id}`);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Note', 'Move this note to trash?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(note.id); router.back(); } },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const wordCount = getWordCount(content);
  const charCount = getCharCount(content);
  const readingTime = getReadingTime(content);

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: topPadding + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Note not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPadding + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        {/* Mode toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.secondary }]}>
          {(['edit', 'preview'] as ViewMode[]).map((m) => (
            <Pressable
              key={m}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: colors.background },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(m); }}
            >
              <Text
                style={[
                  styles.modeBtnLabel,
                  {
                    color: mode === m ? colors.foreground : colors.mutedForeground,
                    fontFamily: mode === m ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {m === 'edit' ? 'Edit' : 'Preview'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              pinNote(note.id, !note.isPinned);
            }}
            hitSlop={10}
          >
            <Feather
              name="bookmark"
              size={20}
              color={note.isPinned ? colors.foreground : colors.mutedForeground}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              favoriteNote(note.id, !note.isFavorite);
            }}
            hitSlop={10}
          >
            <Feather
              name="star"
              size={20}
              color={note.isFavorite ? colors.foreground : colors.mutedForeground}
            />
          </Pressable>
          <Pressable onPress={handleMore} hitSlop={10}>
            <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <TextInput
          style={[
            styles.titleInput,
            { color: colors.foreground, fontFamily: 'Inter_700Bold' },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title..."
          placeholderTextColor={colors.mutedForeground}
          multiline={false}
          returnKeyType="next"
          blurOnSubmit={false}
          editable={mode === 'edit'}
        />

        {/* Language badge */}
        <Pressable
          style={[styles.langBadge, { backgroundColor: colors.secondary }]}
          onPress={() => mode === 'edit' && setShowLangPicker(true)}
        >
          <Feather name="code" size={12} color={colors.mutedForeground} />
          <Text style={[styles.langLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            {getLanguageLabel(language)}
          </Text>
          {mode === 'edit' ? <Feather name="chevron-down" size={12} color={colors.mutedForeground} /> : null}
        </Pressable>

        {mode === 'edit' ? (
          <TextInput
            style={[
              styles.contentInput,
              {
                color: colors.foreground,
                fontFamily: 'Inter_400Regular',
                minHeight: 300,
              },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.preview}>
            {content.trim() ? (
              <MarkdownRenderer content={content} />
            ) : (
              <Text style={[styles.emptyPreview, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Nothing to preview yet.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom status bar */}
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8,
          },
        ]}
      >
        <Text style={[styles.statText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {wordCount} words
        </Text>
        <View style={[styles.statDot, { backgroundColor: colors.border }]} />
        <Text style={[styles.statText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {charCount} chars
        </Text>
        <View style={[styles.statDot, { backgroundColor: colors.border }]} />
        <Text style={[styles.statText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {readingTime}
        </Text>
        {lastSaved ? (
          <>
            <View style={[styles.statDot, { backgroundColor: colors.border }]} />
            <Feather name="check" size={11} color={colors.success} />
            <Text style={[styles.statText, { color: colors.success, fontFamily: 'Inter_400Regular' }]}>
              Saved
            </Text>
          </>
        ) : null}
      </View>

      {/* Language picker modal */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowLangPicker(false)}>
          <Pressable
            style={[
              styles.pickerSheet,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                paddingBottom: insets.bottom + 16,
              },
            ]}
            onPress={() => {}}
          >
            <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.pickerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Language
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.id}
                  style={[
                    styles.langOption,
                    language === lang.id && { backgroundColor: colors.secondary },
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLanguage(lang.id);
                    setShowLangPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      {
                        color: language === lang.id ? colors.foreground : colors.foreground,
                        fontFamily: language === lang.id ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {lang.label}
                  </Text>
                  <Text style={[styles.langExt, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    .{lang.extension}
                  </Text>
                  {language === lang.id ? (
                    <Feather name="check" size={16} color={colors.foreground} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 2 },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeBtnLabel: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 16, marginLeft: 'auto' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  titleInput: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 12,
    padding: 0,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    marginBottom: 16,
  },
  langLabel: { fontSize: 12 },
  contentInput: {
    fontSize: 15,
    lineHeight: 24,
    padding: 0,
  },
  preview: { paddingBottom: 24 },
  emptyPreview: { fontSize: 15, fontStyle: 'italic' },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  statText: { fontSize: 12 },
  statDot: { width: 3, height: 3, borderRadius: 1.5 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: { fontSize: 18, marginBottom: 12 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 8,
  },
  langOptionText: { flex: 1, fontSize: 15 },
  langExt: { fontSize: 13 },
});
