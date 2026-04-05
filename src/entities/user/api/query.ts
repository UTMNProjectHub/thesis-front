import { useQuery } from '@tanstack/react-query'
import { userKeys } from './keys'
import { getUser } from './api'
import type { ProfileResponse } from './dto'
import apiClient from '@/shared/api/api-client'

export function useUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => getUser(),
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    select: (data: ProfileResponse) => data,
  })
}
