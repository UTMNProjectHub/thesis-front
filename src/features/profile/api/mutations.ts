import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changePassword, updateProfile } from './api'
import type { ChangePasswordRequest, UpdateProfileRequest } from './dto'
import { userKeys } from '@/entities/user'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.profile(), updatedProfile)
    },
    onError: (error) => {
      console.error('Update profile error:', error)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onError: (error) => {
      console.error('Change password error:', error)
    },
  })
}
