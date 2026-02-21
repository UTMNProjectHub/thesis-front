import { useEffect, useState } from 'react'
import { buildSubmittedAnswers } from '../utils/buildSubmittedAnswers'
import type { Question, SubmitAnswerResponse } from '@/models/Quiz'
import { useSessionSubmits, useSubmitAnswer } from '@/hooks/useQuiz'

export function useQuizAnswers(
  quizId: string,
  sessionId?: string,
  questions?: Array<Question>,
) {
  const { data: sessionSubmits } = useSessionSubmits(quizId, sessionId)
  const submitMutation = useSubmitAnswer()
  const [submitted, setSubmitted] = useState<Map<string, SubmitAnswerResponse>>(
    new Map(),
  )

  useEffect(() => {
    if (!sessionId || !sessionSubmits || !questions) return
    setSubmitted(buildSubmittedAnswers(sessionSubmits, questions))
  }, [sessionId, sessionSubmits, questions])

  const submit = async (
    question: Question,
    answerIds?: Array<string>,
    answerText?: string,
  ) => {
    if (!quizId || !questions) return

    try {
      const response = await submitMutation.mutateAsync({
        questionId: question.id,
        data: { quizId, answerIds, answerText },
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
