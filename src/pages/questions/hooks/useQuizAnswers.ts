import { useMemo, useRef, useState } from 'react'
import { buildSubmittedAnswers } from '../utils/buildSubmittedAnswers'
import type { AnswerPair, Question, SubmitAnswerResponse } from '@/entities/quiz'
import { useSessionSubmits } from '@/entities/session'
import { useSubmitAnswer } from '@/entities/quiz'

export function useQuizAnswers(
  quizId: string,
  sessionId?: string,
  questions?: Array<Question>,
) {
  const { data: sessionSubmits } = useSessionSubmits(quizId, sessionId)
  const submitMutation = useSubmitAnswer()

  const serverSubmitted = useMemo(() => {
    if (!sessionId || !sessionSubmits || !questions) return new Map<string, SubmitAnswerResponse>()
    return buildSubmittedAnswers(sessionSubmits, questions)
  }, [sessionId, sessionSubmits, questions])

  const [submitted, setSubmitted] = useState<Map<string, SubmitAnswerResponse>>(serverSubmitted)

  // Sync state when server data changes without using useEffect
  const serverRef = useRef(serverSubmitted)
  if (serverRef.current !== serverSubmitted) {
    serverRef.current = serverSubmitted
    setSubmitted(serverSubmitted)
  }

  const submit = async (
    question: Question,
    answerIds?: Array<string>,
    answerText?: string,
    answerPairs?: Array<AnswerPair>,
  ) => {
    if (!quizId || !questions) return

    try {
      const response = await submitMutation.mutateAsync({
        questionId: question.id,
        data: { quizId, answerIds, answerText, answerPairs },
      })

      setSubmitted((prev) => {
        const next = new Map(prev)
        next.set(question.id, response)
        return next
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const count = submitted.size
  const total = questions?.length ?? 0

  return {
    submitted,
    submit,
    isSubmitting: submitMutation.isPending,
    count,
    progress: total > 0 ? (count / total) * 100 : 0,
    allAnswered: total > 0 && count === total,
  }
}
