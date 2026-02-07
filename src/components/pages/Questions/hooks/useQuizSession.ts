import { useEffect, useRef, useState } from 'react'
import { useActiveSessions } from '@/hooks/useQuiz'
import sessionApi from '@/models/Session/api'

export function useQuizSession(quizId: string) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string>()
  const { data: activeSessions, isLoading } = useActiveSessions(quizId)
  const createStartedRef = useRef(false)

  useEffect(() => {
    if (!quizId || selectedId) return
    if (activeSessions !== undefined) return
    if (createStartedRef.current) return // locking

    createStartedRef.current = true
    sessionApi
      .createNewQuizSession(quizId)
      .then((session) => setSelectedId(session.id))
      .catch((err) =>
        setError(err.response.data ?? 'Возникла неизвестная ошибка'),
      )
      .finally(() => {
        createStartedRef.current = false
      })
  }, [quizId, activeSessions, selectedId])

  return {
    selectedId,
    select: setSelectedId,
    activeSessions: activeSessions || [],
    isLoadingSessions: isLoading,
    error,
  }
}
