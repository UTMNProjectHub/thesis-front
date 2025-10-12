import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'
import type { AuthResponse, RefreshResponse } from '@/types/auth'
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from '@/types/profile'

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Если уже идет процесс обновления токена, добавляем запрос в очередь
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              return this.client(originalRequest)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const response = await this.client.get<RefreshResponse>('/refresh')
            const { accessToken } = response.data

            localStorage.setItem('accessToken', accessToken)

            this.processQueue(null)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError)
            localStorage.removeItem('accessToken')
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      },
    )
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })

    this.failedQueue = []
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/login', {
      email,
      password,
    })

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }

    return response.data
  }

  async register(userData: {
    email: string
    firstName: string
    lastName: string
    middleName?: string
    password: string
  }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/register', userData)

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }

    return response.data
  }

  async refreshToken(): Promise<RefreshResponse> {
    const response = await this.client.get<RefreshResponse>('/refresh')
    return response.data
  }

  async getUser(): Promise<ProfileResponse> {
    const response = await this.client.get<ProfileResponse>('/profile')
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/logout')
    } finally {
      localStorage.removeItem('accessToken')
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Profile endpoints
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await this.client.put<ProfileResponse>('/profile', data)
    return response.data
  }

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    const response = await this.client.put<ChangePasswordResponse>(
      '/profile/password',
      data,
    )
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
