import { useQuery } from '@tanstack/react-query'
import { authKeys } from './keys'
import type { ProfileResponse } from '@/models/Profile'
import { getUser } from '@/models/Profile'
import apiClient from '@/lib/api-client'

export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => getUser(),
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error: any) => {
      // Не повторяем запрос при 401 ошибке
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    select: (data: ProfileResponse) => data,
  })
}
