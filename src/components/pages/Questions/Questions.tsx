import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import axios from 'axios'
import { useQuizSession } from './hooks/useQuizSession'
import { useQuizAnswers } from './hooks/useQuizAnswers'
import { useQuizFinish } from './hooks/useQuizFinish'
import { QuestionsSidebar } from './components/QuestionsSidebar'
import { QuestionRenderer } from './components/QuestionRenderer'
import { FinishQuizDialog } from './components/FinishQuizDialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuizQuestions } from '@/hooks/useQuiz'
import { SessionSelector } from '@/components/pages/SessionSelector/SessionSelector'

function Questions() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()

  const session = useQuizSession(id || '')
  const { data: questions, isLoading, error } = useQuizQuestions(id || '', session.selectedId || '')
  const answers = useQuizAnswers(id || '', session.selectedId, questions)
  const finish = useQuizFinish(id || '', session.selectedId, answers.allAnswered, () => {
    navigate({ to: `/quiz/${id}/results` })
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentQuestion = questions?.[currentIndex]
  const isLastQuestion = questions ? currentIndex === questions.length - 1 : false

  const is403Error = Boolean(
    error && axios.isAxiosError(error) && error.response?.status === 403,
  )

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка вопросов...</div>
      </div>
    )
  }

  if (error || session.error) {
    const errorText = session.error ?? error?.message;

    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{errorText}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (is403Error) {
    return (
      <SessionSelector
        sessions={session.activeSessions}
        onSelectSession={session.select}
        isLoading={session.isLoadingSessions}
      />
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет вопросов</CardTitle>
          </CardHeader>
          <CardContent>
            <p>В этом квизе пока нет вопросов</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <QuestionsSidebar
        questions={questions}
        currentIndex={currentIndex}
        submittedAnswers={answers.submitted}
        answeredCount={answers.count}
        progress={answers.progress}
        onSelectQuestion={setCurrentIndex}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    Вопрос {currentIndex + 1} из {questions.length}
                  </CardTitle>
                  <Badge variant="secondary">{currentQuestion.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {currentQuestion.text}
                  </h3>
                </div>
                <QuestionRenderer
                  question={currentQuestion}
                  submittedResponse={answers.submitted.get(currentQuestion.id)}
                  isSubmitted={answers.submitted.has(currentQuestion.id)}
                  isSubmitting={answers.isSubmitting}
                  onSubmit={answers.submit}
                />
                <Separator />
                <div className="flex justify-between">
                  <Button
                    onClick={() =>
                      setCurrentIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentIndex === 0}
                    variant="outline"
                  >
                    ← Предыдущий
                  </Button>
                  {isLastQuestion ? (
                    <Button
                      onClick={finish.start}
                      disabled={finish.isPending}
                      variant="default"
                    >
                      {finish.isPending
                        ? 'Завершение...'
                        : 'Закончить тестирование'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(questions.length - 1, prev + 1),
                        )
                      }
                      variant="outline"
                    >
                      Следующий →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <FinishQuizDialog
        open={finish.showDialog}
        isFinishing={finish.isPending}
        onOpenChange={finish.setShowDialog}
        onConfirm={finish.confirm}
      />
    </div>
  )
}

export default Questions
