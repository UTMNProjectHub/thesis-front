import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changePassword, updateProfile } from './api'
import { profileKeys } from './keys'
import type { ChangePasswordRequest, UpdateProfileRequest } from './dto'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.profile(), updatedProfile)
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
