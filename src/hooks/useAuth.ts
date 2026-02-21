import { useUser } from '@/models/Auth'

export { useUser, useLogin, useRegister, useLogout, useRefreshToken } from '@/models/Auth'

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
