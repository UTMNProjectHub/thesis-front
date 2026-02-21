import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/models/Subject'

interface ThemeState {
  current: Theme | null
  setCurrent: (theme: Theme) => void
  clearCurrent: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      current: null,
      setCurrent: (theme: Theme) => set({ current: theme }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: 'theme-storage', // уникальное имя для localStorage
    }
  )
)

export const useTheme = () => {
  const { current, setCurrent, clearCurrent } = useThemeStore()

  return {
    current,
    setCurrent,
    clearCurrent,
  }
}
