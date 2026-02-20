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
import type { Subject, Theme } from '@/types/subject'
import type {
  MatchingConfig,
  Question,
  QuestionVariant,
  Quiz,
  Session,
  SessionSubmitWithDetails,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  UpdateQuestionRequest,
  UpdateQuestionVariant,
  UpdateQuizRequest,
} from '@/types/quiz'
import type { Summary } from '@/types/summary'

export class ApiClient {
  protected client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
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

        const isAuthEndpoint =
          originalRequest.url === '/login' ||
          originalRequest.url === '/register'

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
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
    password: string
    full_name: string | null
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

  async getSubjects(q?: string): Promise<Array<Subject>> {
    const response = await this.client.get<Array<Subject>>('/subject/all', {
      params: q ? { q } : undefined,
    })
    return response.data
  }

  async createSubject(data: {
    name: string
    shortName: string
    yearStart: number
    yearEnd: number
    description?: string | null
  }): Promise<void> {
    await this.client.post('/subject', data)
  }

  async getSubjectById(subjectId: number): Promise<Subject> {
    const response = await this.client.get<Subject>(`/subject/${subjectId}`)
    return response.data
  }

  async getThemeById(themeId: number): Promise<Theme> {
    const response = await this.client.get<Theme>(`/theme/${themeId}`)
    return response.data
  }

  async getThemeFiles(themeId: number): Promise<
    Array<{
      id: string
      name: string
      s3Index: string
      userId: string | null
    }>
  > {
    const response = await this.client.get<
      Array<{
        id: string
        name: string
        s3Index: string
        userId: string | null
      }>
    >(`/theme/${themeId}/files`)
    return response.data
  }

  async uploadFileToTheme(themeId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)

    await this.client.post(`/theme/${themeId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getSubjectFiles(subjectId: number): Promise<
    Array<{
      id: string
      name: string
      s3Index: string
      userId: string | null
    }>
  > {
    const response = await this.client.get<
      Array<{
        id: string
        name: string
        s3Index: string
        userId: string | null
      }>
    >(`/subject/${subjectId}/files`)
    return response.data
  }

  async uploadFileToSubject(subjectId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)

    await this.client.post(`/subject/${subjectId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getThemesBySubjectId(
    subjectId: number,
    q?: string,
  ): Promise<Array<Theme>> {
    const response = await this.client.get<Array<Theme>>(
      `/subject/${subjectId}/themes`,
      {
        params: q ? { q } : undefined,
      },
    )
    return response.data
  }

  async createTheme(
    subjectId: number,
    data: {
      name: string
      description?: string | null
    },
  ): Promise<void> {
    await this.client.post(`/subject/${subjectId}/themes`, data)
  }

  async getQuizById(quizId: string): Promise<Quiz> {
    const response = await this.client.get<Quiz>(`/quizes/${quizId}`)
    return response.data
  }

  async getQuizesByThemeId(themeId: number): Promise<Array<Quiz>> {
    const response = await this.client.get<Array<Quiz>>(
      `/theme/${themeId}/quizes`,
    )
    return response.data
  }

  async getSummariesByThemeId(themeId: number): Promise<Array<Summary>> {
    const response = await this.client.get<Array<Summary>>(
      `/theme/${themeId}/summaries`,
    )
    return response.data
  }

  async getQuizQuestions(
    quizId: string,
    sessionId?: string,
    view?: boolean,
  ): Promise<Array<Question>> {
    const headers: Record<string, string> = {}
    if (sessionId) {
      headers['X-Active-Session'] = sessionId
    }
    const response = await this.client.get<Array<Question>>(
      `/quizes/${quizId}/questions`,
      { headers, params: view ? { view: true } : undefined },
    );

    return response.data
  }

  async submitQuestionAnswer(
    questionId: string,
    data: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const response = await this.client.post<SubmitAnswerResponse>(
      `/questions/${questionId}/solve`,
      data,
    )
    return response.data
  }

  async getActiveSessions(quizId: string): Promise<Array<Session>> {
    const response = await this.client.get<Array<Session>>(
      `/quizes/${quizId}/sessions/active`,
    )
    return response.data
  }

  async getAllSessions(quizId: string): Promise<Array<Session>> {
    const response = await this.client.get<Array<Session>>(
      `/quizes/${quizId}/sessions/all`,
    )
    return response.data
  }

  async getSessionSubmits(
    quizId: string,
    sessionId: string,
  ): Promise<Array<SessionSubmitWithDetails>> {
    const response = await this.client.get<Array<SessionSubmitWithDetails>>(
      `/quizes/${quizId}/sessions/${sessionId}/submits`,
    )
    return response.data
  }

  async finishSession(quizId: string, sessionId: string): Promise<void> {
    await this.client.post(`/quizes/${quizId}/sessions/${sessionId}/finish`)
  }

  async updateQuiz(quizId: string, data: UpdateQuizRequest): Promise<Quiz> {
    const response = await this.client.put<Quiz>(`/quizes/${quizId}`, data)
    return response.data
  }

  async getQuestion(questionId: string): Promise<
    Question & {
      variants: Array<QuestionVariant>
      matchingConfig?: MatchingConfig
    }
  > {
    const response = await this.client.get<
      Question & {
        variants: Array<QuestionVariant>
        matchingConfig?: MatchingConfig
      }
    >(`/questions/${questionId}`)
    return response.data
  }

  async updateQuestion(
    questionId: string,
    data: UpdateQuestionRequest,
  ): Promise<Question> {
    const response = await this.client.put<Question>(
      `/questions/${questionId}`,
      data,
    )
    return response.data
  }

  async updateQuestionVariants(
    questionId: string,
    variants: Array<UpdateQuestionVariant>,
  ): Promise<void> {
    await this.client.put(`/questions/${questionId}/variants`, { variants })
  }

  async updateQuestionMatchingConfig(
    questionId: string,
    matchingConfig: MatchingConfig,
  ): Promise<void> {
    await this.client.put(`/questions/${questionId}/matching-config`, {
      matchingConfig,
    })
  }

  async generateQuiz(data: {
    files: Array<string>
    themeId: number
    difficulty: 'easy' | 'medium' | 'hard'
    question_count: number
    question_types: Array<
      | 'multichoice'
      | 'essay'
      | 'matching'
      | 'truefalse'
      | 'shortanswer'
      | 'numerical'
    >
    additional_requirements?: string
  }): Promise<{ success: boolean; message: string; quizId: string }> {
    const response = await this.client.post<{
      success: boolean
      message: string
      quizId: string
    }>('/generation/quiz', data)
    return response.data
  }

  async generateSummary(data: {
    files: Array<string>
    subjectId: number
    themeId: number
    additional_requirements?: string
  }): Promise<{ success: boolean; message: string; summaryId: string }> {
    const response = await this.client.post<{
      success: boolean
      message: string
      summaryId: string
    }>('/generation/summary', data)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
