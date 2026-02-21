import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { login, refreshToken, register } from './api'
import { authKeys } from './keys'
import type { AuthResponse, LoginRequest, RegisterRequest } from './dto'
import apiClient from '@/lib/api-client'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) =>
      login(email, password),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), data)
      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error('Login error:', error)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => register(userData),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), data)
      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error('Register error:', error)
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => refreshToken(),
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
      }
    },
  })
}
