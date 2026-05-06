import { useUser } from '@/entities/user'

export { login, register, refreshToken } from './api/api'
export type { AuthResponse, LoginRequest, RegisterRequest, RefreshResponse, ApiError } from './api/dto'
export { useLogin, useRegister, useLogout, useRefreshToken } from './api/mutations'

// Re-export user query for convenience
export { useUser } from '@/entities/user'

// Utility hook for checking authentication state
export function useAuth() {
  const { data: user, isLoading, error } = useUser()
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  }
}
