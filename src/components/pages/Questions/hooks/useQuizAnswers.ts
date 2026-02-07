import { useEffect, useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { useSessionSubmits, useSubmitAnswer } from '@/hooks/useQuiz'
import { buildSubmittedAnswers } from '../utils/buildSubmittedAnswers'

export function useQuizAnswers(
  quizId: string,
  sessionId?: string,
  questions?: Question[],
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
