import { create } from 'zustand';

export type Theme = 'light' | 'dark';

type ThemeState = {
    theme: Theme;
    toggleTheme: () => void;
};

const useThemeStore = create<ThemeState>((set) => ({
    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

export default useThemeStore;