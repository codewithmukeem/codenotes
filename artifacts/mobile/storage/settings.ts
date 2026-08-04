import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';

const SETTINGS_KEY = '@codenotes:settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 'medium',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...(JSON.parse(data) as AppSettings) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
