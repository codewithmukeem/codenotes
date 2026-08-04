import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Note } from '@/types';
import { formatRelativeTime, stripMarkdown, truncate } from '@/utils/noteUtils';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NoteCard({ note, onPress, onLongPress }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const preview = truncate(stripMarkdown(note.content), 100);

  return (
    <AnimatedPressable
      style={[
        styles.card,
        animStyle,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20 });
      }}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
          ]}
          numberOfLines={1}
        >
          {note.title || 'Untitled'}
        </Text>
        <View style={styles.badges}>
          {note.isPinned ? (
            <Feather name="bookmark" size={13} color={colors.mutedForeground} />
          ) : null}
          {note.isFavorite ? (
            <Feather name="star" size={13} color={colors.mutedForeground} />
          ) : null}
        </View>
      </View>
      {preview.length > 0 ? (
        <Text
          style={[
            styles.preview,
            { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
          ]}
          numberOfLines={2}
        >
          {preview}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {formatRelativeTime(note.updatedAt)}
        </Text>
        {note.language !== 'text' && note.language !== 'markdown' ? (
          <View style={[styles.langBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.langLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              {note.language}
            </Text>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 7,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
  },
  langBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  langLabel: {
    fontSize: 11,
  },
});
