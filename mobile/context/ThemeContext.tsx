import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme_dark';

export const darkTheme = {
  isDark: true,
  bg: '#000000',
  surface: '#111111',
  surface2: '#1a1a1a',
  surface3: '#222222',
  border: '#1a1a1a',
  border2: '#262626',
  text: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#555555',
  primary: '#3b82f6',
  primaryBg: '#0c1a3d',
  primaryBorder: '#1a2a5a',
  green: '#10b981',
  orange: '#f97316',
  purple: '#a855f7',
  red: '#f87171',
  yellow: '#f59e0b',
};

export const lightTheme = {
  isDark: false,
  bg: '#f2f2f7',
  surface: '#ffffff',
  surface2: '#f8f8f8',
  surface3: '#efefef',
  border: '#e5e7eb',
  border2: '#d1d5db',
  text: '#111111',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  primary: '#3b82f6',
  primaryBg: '#eff6ff',
  primaryBorder: '#bfdbfe',
  green: '#10b981',
  orange: '#f97316',
  purple: '#a855f7',
  red: '#ef4444',
  yellow: '#f59e0b',
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val !== null) setIsDark(val === 'true');
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, String(next));
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
