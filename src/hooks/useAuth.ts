import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'
import type { ProfileResponse } from '@/types/profile'
import apiClient from '@/lib/api-client'

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) =>
      apiClient.login(email, password),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), { data: data.user })
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
    mutationFn: (userData: RegisterRequest) => apiClient.register(userData),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), { data: data.user })
      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error('Register error:', error)
    },
  })
}

export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiClient.getUser(),
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error: any) => {
      // Не повторяем запрос при 401 ошибке
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    select: (data: ProfileResponse) => data, // Возвращаем только данные пользователя
  })
}

// Хук для выхода
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Очищаем все данные из кэша
      queryClient.clear()
      // Редиректим на страницу входа
      navigate({ to: '/auth/login' })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Даже если запрос не удался, очищаем локальные данные
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => apiClient.refreshToken(),
    onSuccess: (data) => {
      // Обновляем токен в localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
      }
    },
  })
}

// Утилитарный хук для проверки аутентификации
export function useAuth() {
  const { data: user, isLoading, error } = useUser()

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  }
}
