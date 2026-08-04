import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search notes...',
  autoFocus,
  onFocus,
  onBlur,
}: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      <Feather name="search" size={17} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
        returnKeyType="search"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value.length > 0 && Platform.OS !== 'ios' && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Feather name="x" size={17} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
