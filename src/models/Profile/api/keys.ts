export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'data'] as const,
}
