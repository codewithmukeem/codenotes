import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  onPress?: () => void;
  selected?: boolean;
}

export function TagPill({ label, onPress, selected }: Props) {
  const colors = useColors();
  return (
    <Pressable
      style={[
        styles.pill,
        {
          backgroundColor: selected ? colors.primary : colors.secondary,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? colors.primaryForeground : colors.mutedForeground,
            fontFamily: 'Inter_500Medium',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
  },
});
