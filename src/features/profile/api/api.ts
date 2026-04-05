import type { ChangePasswordRequest, ChangePasswordResponse, UpdateProfileRequest } from './dto'
import type { ProfileResponse } from '@/entities/user'
import apiClient from '@/shared/api/api-client'

export const updateProfile = async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
  const response = await apiClient.client.put<ProfileResponse>('/profile', data)
  return response.data
}

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.client.put<ChangePasswordResponse>('/profile/password', data)
  return response.data
}
