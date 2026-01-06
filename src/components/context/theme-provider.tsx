import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system" | "forest" | "ocean";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark", "forest", "ocean");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      root.style.setProperty(
        "--primary",
        systemTheme === "dark" ? "hsl(210 40% 60%)" : "hsl(210 40% 40%)"
      );
      return;
    }

    root.classList.add(theme);

    // Set primary color based on theme
    if (theme === "forest") {
      root.style.setProperty("--primary", "hsl(142 76% 36%)"); // Green
    } else if (theme === "ocean") {
      root.style.setProperty("--primary", "hsl(199 89% 48%)"); // Blue
    } else if (theme === "light") {
      root.style.setProperty("--primary", "hsl(210 40% 40%)");
    } else if (theme === "dark") {
      root.style.setProperty("--primary", "hsl(210 40% 60%)");
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
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
