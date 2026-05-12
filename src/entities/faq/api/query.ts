import { useQuery } from '@tanstack/react-query'
import { getFaqsByThemeId } from './api'
import { faqKeys } from './keys'
import apiClient from '@/shared/api/api-client'

export function useFaqsByTheme(themeId: number | undefined) {
  return useQuery({
    queryKey: faqKeys.byTheme(themeId!),
    queryFn: () => getFaqsByThemeId(themeId!),
    enabled: !!themeId && apiClient.isAuthenticated(),
  })
}
