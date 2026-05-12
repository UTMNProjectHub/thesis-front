export const summaryKeys = {
  all: ['summary'] as const,
  byTheme: (themeId: number) => [...summaryKeys.all, 'theme', themeId] as const,
}
