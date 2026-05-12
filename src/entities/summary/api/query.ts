import { useQuery } from '@tanstack/react-query'
import { getSummariesByThemeId } from './api'
import { summaryKeys } from './keys'
import apiClient from '@/shared/api/api-client'

export function useSummariesByTheme(themeId: number | undefined) {
  return useQuery({
    queryKey: summaryKeys.byTheme(themeId!),
    queryFn: () => getSummariesByThemeId(themeId!),
    enabled: !!themeId && apiClient.isAuthenticated(),
  })
}
