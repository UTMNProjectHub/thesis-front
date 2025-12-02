import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile'
import apiClient from '@/lib/api-client'

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'data'] as const,
}

// Хук для получения профиля пользователя
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => apiClient.getUser(),
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

// Хук для обновления профиля
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => apiClient.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Обновляем кэш профиля
      queryClient.setQueryData(profileKeys.profile(), updatedProfile)
    },
    onError: (error) => {
      console.error('Update profile error:', error)
    },
  })
}

// Хук для смены пароля
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => apiClient.changePassword(data),
    onError: (error) => {
      console.error('Change password error:', error)
    },
  })
}
