import type { User } from "@/models/User"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  full_name: string
  password: string
}

export interface AuthResponse extends User {
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}

export interface ApiError {
  message: string
  statusCode: number
}
