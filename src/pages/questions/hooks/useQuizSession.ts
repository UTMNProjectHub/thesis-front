import { useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@/entities/session'
import { createNewQuizSession, useActiveSessions, useSessions } from '@/entities/session'
import { useQuiz } from '@/entities/quiz'

export type SessionStatus = 'loading' | 'has_active' | 'max_reached' | 'creating' | 'ready' | 'error'

export interface UseQuizSessionResult {
  status: SessionStatus
  selectedId: string | undefined
  activeSessions: Array<Session>
  totalSessions: number
  maxSessions: number
  error: string | undefined
  select: (id: string) => void
  createNew: () => void
}

export function useQuizSession(quizId: string): UseQuizSessionResult {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | undefined>(undefined)
  const createStartedRef = useRef(false)

  const activeQuery = useActiveSessions(quizId)
  const allQuery = useSessions(quizId, { enabled: true })
  const quizQuery = useQuiz(quizId)

  const activeSessions = activeQuery.data ?? []
  const allSessions = allQuery.data ?? []
  const quiz = quizQuery.data
  const maxSessions = quiz?.maxSessions ?? 0

  // Auto-select if exactly 1 active session
  useEffect(() => {
    if (activeSessions.length === 1 && !selectedId) {
      setSelectedId(activeSessions[0].id)
    }
  }, [activeSessions, selectedId])

  const isLoading =
    activeQuery.isLoading || allQuery.isLoading || quizQuery.isLoading

  const hasError =
    !!activeQuery.error || !!allQuery.error || !!quizQuery.error || !!createError

  const status = useMemo<SessionStatus>(() => {
    if (selectedId) return 'ready'
    if (isLoading || isCreating) return 'loading'
    if (hasError) return 'error'
    if (activeSessions.length > 0) return 'has_active'
    if (maxSessions > 0 && allSessions.length >= maxSessions) return 'max_reached'
    return 'creating' // will trigger auto-create effect
  }, [selectedId, isLoading, isCreating, hasError, activeSessions.length, maxSessions, allSessions.length])

  // Auto-create when no active sessions and under limit
  useEffect(() => {
    if (!quizId || selectedId || isCreating || createStartedRef.current) return
    if (isLoading || hasError) return
    if (activeSessions.length > 0) return
    if (maxSessions > 0 && allSessions.length >= maxSessions) return

    createStartedRef.current = true
    setIsCreating(true)
    createNewQuizSession(quizId)
      .then((session) => setSelectedId(session.id))
      .catch((err) => setCreateError(err.response?.data ?? 'Возникла неизвестная ошибка'))
      .finally(() => {
        setIsCreating(false)
        createStartedRef.current = false
      })
  }, [quizId, selectedId, isCreating, isLoading, hasError, activeSessions.length, maxSessions, allSessions.length])

  const errorMessage = createError
    ?? activeQuery.error?.message
    ?? allQuery.error?.message
    ?? quizQuery.error?.message

  const createNew = () => {
    if (isCreating || createStartedRef.current) return
    if (maxSessions > 0 && allSessions.length >= maxSessions) return

    createStartedRef.current = true
    setIsCreating(true)
    setCreateError(undefined)
    createNewQuizSession(quizId)
      .then((session) => setSelectedId(session.id))
      .catch((err) => setCreateError(err.response?.data ?? 'Возникла неизвестная ошибка'))
      .finally(() => {
        setIsCreating(false)
        createStartedRef.current = false
      })
  }

  return {
    status,
    selectedId,
    activeSessions,
    totalSessions: allSessions.length,
    maxSessions,
    error: errorMessage,
    select: setSelectedId,
    createNew,
  }
}
