// context/ThemeContext.tsx
import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import mainTheme from '../themes/mainTheme';
import darkTheme from '../themes/darkTheme';

interface ThemeContextProps {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeObject = useMemo(
    () => (theme === 'light' ? mainTheme : darkTheme),
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, currentTheme: theme }}>
      <MUIThemeProvider theme={themeObject}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
