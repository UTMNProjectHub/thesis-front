export const subjectKeys = {
  all: ['subject'] as const,
  list: (q?: string) => [...subjectKeys.all, 'list', q] as const,
  themes: (subjectId: number, q?: string) =>
    [...subjectKeys.all, subjectId, 'themes', q] as const,
  files: (subjectId: number) =>
    [...subjectKeys.all, subjectId, 'files'] as const,
  themeFiles: (themeId: number) =>
    ['theme', themeId, 'files'] as const,
}
