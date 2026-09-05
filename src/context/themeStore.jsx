import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'buildtwin360-theme';

export const THEMES = [
  {
    id: 'navy',
    label: 'Navy',
    gradient: 'linear-gradient(180deg, #071a33 0%, #0a1f3a 58%, #061427 100%)',
    vars: {
      brand950: '#0a1f3a',
      brand900: '#0f2a4a',
      brand800: '#173a63',
      brand500: '#0d1a35',
      brand300: '#8fb0f5',
      brand50: '#ffffff',
      glow: '#dbeafe',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    gradient: 'linear-gradient(135deg, #123b35, #168a72 58%, #7dd3a8)',
    vars: {
      brand950: '#092923',
      brand900: '#123b35',
      brand800: '#18594d',
      brand500: '#168a72',
      brand300: '#8ad8bd',
      brand50: '#effbf6',
      glow: '#7dd3a8',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    gradient: 'linear-gradient(135deg, #4a2430, #d35d5d 58%, #f6bd73)',
    vars: {
      brand950: '#321924',
      brand900: '#4a2430',
      brand800: '#733744',
      brand500: '#d35d5d',
      brand300: '#f2a39a',
      brand50: '#fff5f1',
      glow: '#f6bd73',
    },
  },
  {
    id: 'violet',
    label: 'Violet',
    gradient: 'linear-gradient(135deg, #28204d, #7656d6 58%, #c4b5fd)',
    vars: {
      brand950: '#1d1739',
      brand900: '#28204d',
      brand800: '#403274',
      brand500: '#7656d6',
      brand300: '#b9a8f4',
      brand50: '#f7f5ff',
      glow: '#c4b5fd',
    },
  },
  {
    id: 'slate',
    label: 'Slate',
    gradient: 'linear-gradient(135deg, #172b3d, #477b9d 58%, #a8d5e5)',
    vars: {
      brand950: '#10202e',
      brand900: '#172b3d',
      brand800: '#27475d',
      brand500: '#477b9d',
      brand300: '#9cc5d6',
      brand50: '#f2f8fb',
      glow: '#a8d5e5',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    gradient: 'linear-gradient(135deg, #4b2d12, #c27b18 58%, #f8d477)',
    vars: {
      brand950: '#33200d',
      brand900: '#4b2d12',
      brand800: '#704515',
      brand500: '#c27b18',
      brand300: '#e8b85d',
      brand50: '#fffaf0',
      glow: '#f8d477',
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    gradient: 'linear-gradient(135deg, #4b1f36, #c34d78 58%, #f3a6bd)',
    vars: {
      brand950: '#351426',
      brand900: '#4b1f36',
      brand800: '#742d50',
      brand500: '#c34d78',
      brand300: '#e999b1',
      brand50: '#fff4f7',
      glow: '#f3a6bd',
    },
  },
  {
    id: 'teal',
    label: 'Teal',
    gradient: 'linear-gradient(135deg, #103b45, #149ca6 58%, #8de3d7)',
    vars: {
      brand950: '#092a32',
      brand900: '#103b45',
      brand800: '#155c66',
      brand500: '#149ca6',
      brand300: '#7ed5d1',
      brand50: '#effcfb',
      glow: '#8de3d7',
    },
  },
  {
    id: 'indigo',
    label: 'Indigo',
    gradient: 'linear-gradient(135deg, #1e2452, #4057c9 58%, #a5b4fc)',
    vars: {
      brand950: '#151a3c',
      brand900: '#1e2452',
      brand800: '#2d397a',
      brand500: '#4057c9',
      brand300: '#9aa8f3',
      brand50: '#f3f5ff',
      glow: '#a5b4fc',
    },
  },
  {
    id: 'lime',
    label: 'Lime',
    gradient: 'linear-gradient(135deg, #243b19, #6b9f28 58%, #c8e889)',
    vars: {
      brand950: '#182a12',
      brand900: '#243b19',
      brand800: '#3d6020',
      brand500: '#6b9f28',
      brand300: '#b4d66d',
      brand50: '#f7fced',
      glow: '#c8e889',
    },
  },
];

const ThemeContext = createContext(null);

function loadThemeId() {
  try {
    const savedThemeId = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((theme) => theme.id === savedThemeId) ? savedThemeId : 'navy';
  } catch {
    return 'navy';
  }
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(loadThemeId);
  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.style.setProperty('--theme-brand-950', theme.vars.brand950);
    root.style.setProperty('--theme-brand-900', theme.vars.brand900);
    root.style.setProperty('--theme-brand-800', theme.vars.brand800);
    root.style.setProperty('--theme-brand-500', theme.vars.brand500);
    root.style.setProperty('--theme-brand-300', theme.vars.brand300);
    root.style.setProperty('--theme-brand-50', theme.vars.brand50);
    root.style.setProperty('--theme-glow', theme.vars.glow);

    try {
      localStorage.setItem(STORAGE_KEY, theme.id);
    } catch {
      // The theme remains active for this session when storage is unavailable.
    }
  }, [theme]);

  function setThemeId(nextThemeId) {
    if (THEMES.some((item) => item.id === nextThemeId)) setThemeIdState(nextThemeId);
  }

  const value = useMemo(() => ({ themeId, setThemeId, theme }), [themeId, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
