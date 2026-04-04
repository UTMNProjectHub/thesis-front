import { useQuery } from '@tanstack/react-query'
import {
  getActiveSessions,
  getQuizSessions,
  getQuizUsersSessions,
  getSessionSubmits,
} from './api'
import apiClient from '@/shared/api/api-client'
import { quizKeys } from '@/entities/quiz/api/keys'

export function useActiveSessions(
  quizId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: quizKeys.activeSessions(quizId),
    queryFn: () => getActiveSessions(quizId),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!quizId && apiClient.isAuthenticated(),
    staleTime: 0,
  })
}

export function useSessions(quizId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quizKeys.sessions(quizId),
    queryFn: () => getQuizSessions(quizId),
    enabled: options?.enabled && !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  })
}

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
      return getSessionSubmits(quizId, sessionId)
    },
    enabled: !!quizId && !!sessionId && apiClient.isAuthenticated(),
    staleTime: 0,
  })
}

export function useQuizUsersSessions(
  quizId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: quizKeys.usersSessions(quizId),
    queryFn: () => getQuizUsersSessions(quizId),
    enabled:
      options?.enabled !== undefined
        ? options.enabled && !!quizId && apiClient.isAuthenticated()
        : !!quizId && apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  })
}
