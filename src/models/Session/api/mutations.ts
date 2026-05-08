import { useMutation } from '@tanstack/react-query'
import { createNewQuizSession, finishSession } from './api'

export function useQuizSession(_quizId: string) {
  return useMutation({
    mutationFn: ({ quizId }: { quizId: string }) =>
      createNewQuizSession(quizId),
    onError: () => {
      console.error('Error creating new session')
    },
  })
}

export function useFinishSession() {
  return useMutation({
    mutationFn: ({
      quizId,
      sessionId,
    }: {
      quizId: string
      sessionId: string
    }) => finishSession(quizId, sessionId),
    onError: (error) => {
      console.error('Finish session error:', error)
    },
  })
}
