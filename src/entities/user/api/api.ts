import type { ProfileResponse } from './dto'
import apiClient from '@/shared/api/api-client'

export const getUser = async (): Promise<ProfileResponse> => {
  const response = await apiClient.client.get<ProfileResponse>('/profile')
  return response.data
}
