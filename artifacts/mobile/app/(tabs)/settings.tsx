import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/context/SettingsContext';
import { useNotes } from '@/context/NotesContext';
import { AppSettings } from '@/types';
import * as Haptics from 'expo-haptics';

type ThemeOpt = AppSettings['theme'];
type SizeOpt = AppSettings['fontSize'];

interface SettingRowProps {
  label: string;
  value: string;
  onPress: () => void;
  icon?: string;
  danger?: boolean;
}

function SettingRow({ label, value, onPress, icon, danger }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
          <Feather name={icon as never} size={16} color={danger ? colors.destructive : colors.foreground} />
        </View>
      ) : null}
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.destructive : colors.foreground, fontFamily: 'Inter_400Regular' },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {value}
      </Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { notes, collections } = useNotes();

  const topPadding = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  const noteCount = useMemo(() => notes.filter((n) => !n.isDeleted).length, [notes]);
  const deletedCount = useMemo(() => notes.filter((n) => n.isDeleted).length, [notes]);

  const THEME_OPTS: { id: ThemeOpt; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const SIZE_OPTS: { id: SizeOpt; label: string }[] = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
  ];

  function cycleTheme() {
    const idx = THEME_OPTS.findIndex((o) => o.id === settings.theme);
    const next = THEME_OPTS[(idx + 1) % THEME_OPTS.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ theme: next.id });
  }

  function cycleSize() {
    const idx = SIZE_OPTS.findIndex((o) => o.id === settings.fontSize);
    const next = SIZE_OPTS[(idx + 1) % SIZE_OPTS.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ fontSize: next.id });
  }

  function openGitHub() {
    Linking.openURL('https://github.com/codewithmukeem');
  }

  const themeLabel = THEME_OPTS.find((o) => o.id === settings.theme)?.label ?? 'System';
  const sizeLabel = SIZE_OPTS.find((o) => o.id === settings.fontSize)?.label ?? 'Medium';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'web' ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.themeRow} onPress={cycleTheme}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={settings.theme === 'dark' ? 'moon' : 'sun'} size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              Theme
            </Text>
            <View style={[styles.themePills, { backgroundColor: colors.secondary }]}>
              {THEME_OPTS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.themePill,
                    settings.theme === opt.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ theme: opt.id }); }}
                >
                  <Text
                    style={[
                      styles.themePillLabel,
                      {
                        color: settings.theme === opt.id ? colors.foreground : colors.mutedForeground,
                        fontFamily: settings.theme === opt.id ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.themeRow} onPress={cycleSize}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="type" size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              Font Size
            </Text>
            <View style={[styles.themePills, { backgroundColor: colors.secondary }]}>
              {SIZE_OPTS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.themePill,
                    settings.fontSize === opt.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ fontSize: opt.id }); }}
                >
                  <Text
                    style={[
                      styles.themePillLabel,
                      {
                        color: settings.fontSize === opt.id ? colors.foreground : colors.mutedForeground,
                        fontFamily: settings.fontSize === opt.id ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </View>

        {/* Storage */}
        <SectionHeader title="Storage" />
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: 'Notes', value: noteCount, icon: 'file-text' },
            { label: 'Collections', value: collections.length, icon: 'folder' },
            { label: 'In Trash', value: deletedCount, icon: 'trash-2' },
          ].map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Feather name={stat.icon as never} size={18} color={colors.mutedForeground} />
              <Text style={[styles.statNum, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.aboutBlock}>
            <View style={[styles.appIcon, { backgroundColor: colors.foreground }]}>
              <Text style={[styles.appIconText, { color: colors.background, fontFamily: 'Inter_700Bold' }]}>C</Text>
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                CodeNotes
              </Text>
              <Text style={[styles.appVersion, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                v1.0.0 — Code With Mukeem
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.linkRow} onPress={openGitHub}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="github" size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              @codewithmukeem
            </Text>
            <Feather name="external-link" size={14} color={colors.mutedForeground} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.linkRow}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="shield" size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No data collected
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.linkRow}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="lock" size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              License
            </Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              MIT
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Built by Mukeem Javaid — Code With Mukeem
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 26 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 28, overflow: 'hidden' },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  divider: { height: 1, marginHorizontal: 16 },
  themePills: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  themePillLabel: { fontSize: 12 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
    padding: 20,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  aboutBlock: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  appIcon: { width: 52, height: 52, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  appIconText: { fontSize: 28 },
  appName: { fontSize: 17 },
  appVersion: { fontSize: 13, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 8, marginBottom: 20 },
});
