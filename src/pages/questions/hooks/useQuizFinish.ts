import { useState } from 'react'
import { useFinishSession } from '@/entities/session'

export function useQuizFinish(
  quizId: string,
  sessionId: string | undefined,
  allAnswered: boolean,
  onFinished?: () => void,
) {
  const finishMutation = useFinishSession()
  const [showDialog, setShowDialog] = useState(false)

  const start = async () => {
    if (!quizId || !sessionId) return

    if (!allAnswered) {
      setShowDialog(true)
      return
    }

    await finishMutation.mutateAsync({ quizId, sessionId })
    onFinished?.()
  }

  const confirm = async () => {
    if (!quizId || !sessionId) return

    setShowDialog(false)
    await finishMutation.mutateAsync({ quizId, sessionId })
    onFinished?.()
  }

  return {
    showDialog,
    setShowDialog,
    start,
    confirm,
    isPending: finishMutation.isPending,
  }
}
