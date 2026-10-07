import {
  createContext,
  createElement,
  useContext,
  type PropsWithChildren,
} from "react";

export type ThemeMode = "light" | "dark";

const shared = {
  radius: { small: 8, medium: 12, large: 16 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    caption: { fontSize: 12, lineHeight: 16 },
    body: { fontSize: 16, lineHeight: 24 },
    title: { fontSize: 22, lineHeight: 28 },
    display: { fontSize: 32, lineHeight: 40 },
  },
  breakpoints: { desktopNavigation: 768 },
} as const;

export const themes = {
  light: {
    ...shared,
    dark: false,
    colors: {
      background: "#F7F7F4",
      surface: "#FFFFFF",
      surfaceMuted: "#F0F0EC",
      text: "#20211F",
      muted: "#73766F",
      border: "#E3E4DE",
      accent: "#A33A2B",
      accentSoft: "#F7E7E3",
      onAccent: "#FFFFFF",
      overlay: "rgba(0, 0, 0, 0.42)",
    },
  },
  dark: {
    ...shared,
    dark: true,
    colors: {
      background: "#151614",
      surface: "#1E201D",
      surfaceMuted: "#292B27",
      text: "#F1F2ED",
      muted: "#A4A79F",
      border: "#363933",
      accent: "#E0705F",
      accentSoft: "#422721",
      onAccent: "#1B100E",
      overlay: "rgba(0, 0, 0, 0.62)",
    },
  },
} as const;

export type AppTheme = (typeof themes)[ThemeMode];

/** Light tokens kept for static spacing/typography styles. */
export const theme = themes.light;
const ThemeContext = createContext<AppTheme>(themes.light);

export function ThemeProvider({
  children,
  mode,
}: PropsWithChildren<{ mode: ThemeMode }>) {
  return createElement(
    ThemeContext.Provider,
    { value: themes[mode] },
    children,
  );
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
