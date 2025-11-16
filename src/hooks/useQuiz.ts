import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type {
  SubmitAnswerRequest,
  UpdateQuizRequest,
  UpdateQuestionRequest,
  UpdateQuestionVariant,
  MatchingConfig,
} from '@/types/quiz'
import axios from 'axios'
import { useUser } from './useAuth'

// Query keys
export const quizKeys = {
  all: ['quiz'] as const,
  quiz: (id: string) => [...quizKeys.all, id] as const,
  usersSessions: (id: string) => [...quizKeys.all, id, 'usersSessions'] as const,
  questions: (id: string) => [...quizKeys.all, id, 'questions'] as const,
  activeSessions: (id: string) =>
    [...quizKeys.all, id, 'activeSessions'] as const,
  sessions: (id: string) => [...quizKeys.all, id, 'sessions'],
  sessionSubmits: (quizId: string, sessionId: string) =>
    [...quizKeys.all, quizId, 'sessions', sessionId, 'submits'] as const,
}

// Хук для получения информации о квизе
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: quizKeys.quiz(quizId),
    queryFn: () => apiClient.getQuizById(quizId),
    enabled: !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

// Хук для получения вопросов квиза
export function useQuizQuestions(quizId: string, sessionId?: string) {
  return useQuery({
    queryKey: [...quizKeys.questions(quizId), sessionId],
    queryFn: () => apiClient.getQuizQuestions(quizId, sessionId),
    enabled: !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error) => {
      // Не повторяем запрос при 409 ошибке
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return false
      }

      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false
      }

      return failureCount < 3
    },
  })
}

// Хук для получения активных сессий
export function useActiveSessions(
  quizId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: quizKeys.activeSessions(quizId),
    queryFn: () => apiClient.getActiveSessions(quizId),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!quizId && apiClient.isAuthenticated(),
    staleTime: 0, // Всегда получаем свежие данные
  })
}

export function useSessions(quizId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quizKeys.sessions(quizId),
    queryFn: () => apiClient.getAllSessions(quizId),
    enabled: options?.enabled && !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  })
}

// Хук для получения submits сессии
export function useSessionSubmits(
  quizId: string,
  sessionId: string | undefined,
) {
  return useQuery({
    queryKey: sessionId
      ? quizKeys.sessionSubmits(quizId, sessionId)
      : ['sessionSubmits', quizId, sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required')
      return apiClient.getSessionSubmits(quizId, sessionId)
    },
    enabled: !!quizId && !!sessionId && apiClient.isAuthenticated(),
    staleTime: 0, // Всегда получаем свежие данные
  })
}

export function useQuizUsersSessions(quizId: string) {
  return useQuery({
    queryKey: quizKeys.usersSessions(quizId),
    queryFn: () => apiClient.getQuizUsersSessions(quizId),
    enabled: !!quizId && apiClient.isAuthenticated() && useUser().data?.roles.some((role) => role.slug === 'teacher'),
    staleTime: 5 * 60 * 1000,
  })
}

// Хук для отправки ответа на вопрос
export function useSubmitAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string
      data: SubmitAnswerRequest
    }) => apiClient.submitQuestionAnswer(questionId, data),
    onSuccess: (_, variables) => {
      // Инвалидируем кэш вопросов для обновления состояния
      const quizId = variables.data.quizId
      queryClient.invalidateQueries({
        queryKey: quizKeys.questions(quizId),
      })
    },
    onError: (error) => {
      console.error('Submit answer error:', error)
    },
  })
}

// Хук для завершения сессии
export function useFinishSession() {
  return useMutation({
    mutationFn: ({
      quizId,
      sessionId,
    }: {
      quizId: string
      sessionId: string
    }) => apiClient.finishSession(quizId, sessionId),
    onError: (error) => {
      console.error('Finish session error:', error)
    },
  })
}

// Хук для обновления квиза
export function useUpdateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quizId,
      data,
    }: {
      quizId: string
      data: UpdateQuizRequest
    }) => apiClient.updateQuiz(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.quiz(variables.quizId),
      })
    },
    onError: (error) => {
      console.error('Update quiz error:', error)
    },
  })
}

// Хук для обновления вопроса
export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string
      data: UpdateQuestionRequest
    }) => apiClient.updateQuestion(questionId, data),
    onSuccess: () => {
      // Инвалидируем все вопросы, так как мы не знаем quizId
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question error:', error)
    },
  })
}

// Хук для обновления вариантов ответа вопроса
export function useUpdateQuestionVariants() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      variants,
    }: {
      questionId: string
      variants: Array<UpdateQuestionVariant>
    }) => apiClient.updateQuestionVariants(questionId, variants),
    onSuccess: () => {
      // Инвалидируем все вопросы
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question variants error:', error)
    },
  })
}

// Хук для обновления matching конфигурации
export function useUpdateQuestionMatchingConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      matchingConfig,
    }: {
      questionId: string
      matchingConfig: MatchingConfig
    }) => apiClient.updateQuestionMatchingConfig(questionId, matchingConfig),
    onSuccess: () => {
      // Инвалидируем все вопросы
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question matching config error:', error)
    },
  })
}
