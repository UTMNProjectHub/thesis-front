export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string
  date_created: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  full_name: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}

export interface ApiError {
  message: string
  statusCode: number
}
