import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Collection } from '@/types';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  collection: Collection;
  noteCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CollectionCard({ collection, noteCount, onPress, onLongPress }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.card,
        animStyle,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20 });
      }}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.iconBg, { backgroundColor: colors.secondary }]}>
        <Feather name={collection.icon as never} size={20} color={colors.foreground} />
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
          numberOfLines={1}
        >
          {collection.name}
        </Text>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
  },
  count: {
    fontSize: 13,
  },
});
