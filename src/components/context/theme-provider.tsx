import { createContext, useContext, useEffect, useState } from "react";

type Theme =
  | "dark"
  | "light"
  | "system"
  | "forest"
  | "ocean"
  | "catppuccin-latte"
  | "catppuccin-mocha"
  | "tokyo-night-light"
  | "tokyo-night-dark";

type AccentColor =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "orange"
  | "pink"
  | "indigo"
  | "teal";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccentColor?: AccentColor;
  storageKey?: string;
  accentStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "blue",
  setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccentColor = "blue",
  storageKey = "vite-ui-theme",
  accentStorageKey = "vite-ui-accent",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [accentColor, setAccentColor] = useState<AccentColor>(
    () =>
      (localStorage.getItem(accentStorageKey) as AccentColor) ||
      defaultAccentColor
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(
      "light",
      "dark",
      "forest",
      "ocean",
      "catppuccin-latte",
      "catppuccin-mocha",
      "tokyo-night-light",
      "tokyo-night-dark"
    );

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    const root = window.document.documentElement;
    const accentColors = {
      blue: "hsl(210, 40%, 70%)",
      green: "hsl(120, 30%, 70%)",
      purple: "hsl(270, 40%, 75%)",
      red: "hsl(0, 50%, 75%)",
      orange: "hsl(30, 50%, 70%)",
      pink: "hsl(330, 50%, 75%)",
      indigo: "hsl(240, 40%, 70%)",
      teal: "hsl(180, 40%, 70%)",
    };

    root.style.setProperty("--primary", accentColors[accentColor]);
  }, [accentColor]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    accentColor,
    setAccentColor: (color: AccentColor) => {
      localStorage.setItem(accentStorageKey, color);
      setAccentColor(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
