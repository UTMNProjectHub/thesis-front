import { useQuery } from '@tanstack/react-query'
import { getUser } from './api'
import { profileKeys } from './keys'
import apiClient from '@/lib/api-client'

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => getUser(),
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}
