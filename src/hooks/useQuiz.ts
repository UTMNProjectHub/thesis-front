import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { SubmitAnswerRequest } from '@/types/quiz'
import axios from 'axios'

// Query keys
export const quizKeys = {
  all: ['quiz'] as const,
  quiz: (id: string) => [...quizKeys.all, id] as const,
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
