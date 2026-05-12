export const faqKeys = {
  all: ['faq'] as const,
  byTheme: (themeId: number) => [...faqKeys.all, 'theme', themeId] as const,
}
