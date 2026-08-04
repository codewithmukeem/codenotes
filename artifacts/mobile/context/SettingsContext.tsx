import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '@/types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/storage/settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setIsLoaded(true);
    });
  }, []);

  async function updateSettings(updates: Partial<AppSettings>) {
    const next: AppSettings = { ...settings, ...updates };
    setSettings(next);
    await saveSettings(next);
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  // Safe fallback so ErrorFallback (outside provider) still works
  if (!ctx) {
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: async () => {},
      isLoaded: false,
    };
  }
  return ctx;
}
