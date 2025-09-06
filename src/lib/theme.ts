import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeColors = {
  isDark: boolean;
  bg: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  surface: string;
  overlay: string;
};

type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return React.createElement(ThemeContext.Provider, { value }, children as any);
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}

export function useThemeColors(): ThemeColors {
  const system = useColorScheme();
  const { mode } = useThemeMode();
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  if (isDark) {
    return {
      isDark,
      bg: '#0b1220',
      card: '#0f172a',
      cardBorder: 'rgba(255,255,255,0.08)',
      textPrimary: '#e5e7eb',
      textSecondary: '#94a3b8',
      accent: '#60a5fa',
      surface: 'rgba(17,24,39,0.9)',
      overlay: 'rgba(0,0,0,0.6)'
    };
  }
  return {
    isDark: false,
    bg: '#f1f5f9',
    card: '#ffffff',
    cardBorder: 'rgba(255,255,255,0.2)',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    accent: '#3b82f6',
    surface: 'rgba(255,255,255,0.95)',
    overlay: 'rgba(0,0,0,0.06)'
  };
}
