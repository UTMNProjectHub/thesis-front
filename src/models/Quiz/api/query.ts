import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getQuizById, getQuizQuestions } from './api'
import { quizKeys } from './keys'
import apiClient from '@/lib/api-client'

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: quizKeys.quiz(quizId),
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

export function useQuizQuestions(
  quizId: string,
  sessionId?: string,
  view?: boolean,
) {
  return useQuery({
    queryKey: [...quizKeys.questions(quizId), sessionId, view],
    queryFn: async () => {
      const result = await getQuizQuestions(quizId, sessionId, view)
      return result
    },
    enabled:
      !!quizId &&
      apiClient.isAuthenticated() &&
      (view === undefined || view === true),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error) => {
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
