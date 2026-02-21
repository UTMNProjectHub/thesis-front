import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from './dto'
import apiClient from '@/lib/api-client'

export const getUser = async (): Promise<ProfileResponse> => {
  const response = await apiClient.client.get<ProfileResponse>('/profile')
  return response.data
}

export const updateProfile = async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
  const response = await apiClient.client.put<ProfileResponse>('/profile', data)
  return response.data
}

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.client.put<ChangePasswordResponse>('/profile/password', data)
  return response.data
}
