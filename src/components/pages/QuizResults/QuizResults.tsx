import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import type { Session } from '@/types/quiz'
import {
  useQuizQuestions,
  useSessionSubmits,
  useSessions,
} from '@/hooks/useQuiz'
import QuizResultView from '@/components/widgets/QuizResultView/QuizResultView'
import QuizResultSessionSelector from '@/components/widgets/QuizResultSessionSelector/QuizResultSessionSelector'

function QuizResults() {
  const { id } = useParams({ strict: false })
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const { data: sessions } = useSessions(id || '', {
    enabled: id !== undefined
  })

  const { data: sessionSubmits } =
    useSessionSubmits(id || '', selectedSession?.id || '')
  const { data: quizQuestions } = useQuizQuestions(
    id || '',
    selectedSession?.id || '',
  )

  if (!sessions) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 justify-center max-w-5xl">
      <div className="flex items-center mb-2 justify-center gap-4">
        <span>Сессия: </span><QuizResultSessionSelector sessions={sessions} selected={selectedSession} setSelected={setSelectedSession} />
      </div>
      {!selectedSession || !quizQuestions || !sessionSubmits ? (
        <div>No session selected</div>
      ) : (
        <QuizResultView
          session={selectedSession}
          quizQuestions={quizQuestions}
          sessionSubmits={sessionSubmits}
        />
      )}
    </div>
  )
}

export default QuizResults
