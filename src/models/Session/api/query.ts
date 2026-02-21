import { useQuery } from '@tanstack/react-query'
import {
  getActiveSessions,
  getQuizSessions,
  getQuizUsersSessions,
  getSessionSubmits,
} from './api'
import apiClient from '@/lib/api-client'
import { useUser } from '@/models/Auth/api/query'
import { quizKeys } from '@/models/Quiz/api/keys'

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

export function useQuizUsersSessions(quizId: string) {
  return useQuery({
    queryKey: quizKeys.usersSessions(quizId),
    queryFn: () => getQuizUsersSessions(quizId),
    enabled:
      !!quizId &&
      apiClient.isAuthenticated() &&
      useUser().data?.roles &&
      useUser().data?.roles.some((role) => role.slug === 'teacher'),
    staleTime: 5 * 60 * 1000,
  })
}
