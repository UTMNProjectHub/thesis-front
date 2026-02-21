import type { AuthResponse, RefreshResponse, RegisterRequest } from './dto'
import apiClient from '@/lib/api-client'

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.client.post<AuthResponse>('/login', {
    email,
    password,
  })

  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken)
  }

  return response.data
}

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.client.post<AuthResponse>('/register', userData)

  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken)
  }

  return response.data
}

export const refreshToken = async (): Promise<RefreshResponse> => {
  const response = await apiClient.client.get<RefreshResponse>('/refresh')
  return response.data
}
