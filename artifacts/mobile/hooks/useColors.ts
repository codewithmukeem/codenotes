import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { useSettings } from '@/context/SettingsContext';

type ThemeTokens = typeof colors.light & { radius: number; isDark: boolean };

export function useColors(): ThemeTokens {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();

  let isDark: boolean;
  if (settings.theme === 'dark') {
    isDark = true;
  } else if (settings.theme === 'light') {
    isDark = false;
  } else {
    isDark = systemScheme === 'dark';
  }

  const themeColors = isDark ? colors.dark : colors.light;
  return { ...themeColors, radius: colors.radius, isDark };
}
