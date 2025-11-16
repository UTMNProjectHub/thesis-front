import { useState, useMemo } from 'react'
import {
  useQuizQuestions,
  useSessions,
  useSessionSubmits,
} from '@/hooks/useQuiz'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SessionStats } from '../../widgets/QuizSessionStats/SessionStats'
import type { Question, Session, SubmitAnswerResponse } from '@/types/quiz'
import { QuestionMultichoice } from '@/components/widgets/Question/QuestionMultichoice'
import { QuestionTrueFalse } from '@/components/widgets/Question/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/components/widgets/Question/QuestionShortAnswer'
import { QuestionNumerical } from '@/components/widgets/Question/QuestionNumerical'
import { QuestionEssay } from '@/components/widgets/Question/QuestionEssay'
import { QuestionMatching } from '@/components/widgets/Question/QuestionMatching'
import { QuestionDescription } from '@/components/widgets/Question/QuestionDescription'
import QuizResultView from '@/components/widgets/QuizResultView/QuizResultView'
import QuizResultSessionSelector from '@/components/widgets/QuizResultSessionSelector/QuizResultSessionSelector'

function QuizResults() {
  const { id } = useParams({ strict: false })
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const { data: sessions, isLoading } = useSessions(id || '', {
    enabled: id !== undefined
  })

  const { data: sessionSubmits, isLoading: sessionSubmitsLoading } =
    useSessionSubmits(id || '', selectedSession?.id || '')
  const { data: quizQuestions, isLoading: questionsLoading } = useQuizQuestions(
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
