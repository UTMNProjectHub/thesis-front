import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  useQuizQuestions,
  useSubmitAnswer,
  useActiveSessions,
  useSessionSubmits,
  useFinishSession,
  quizKeys,
} from '@/hooks/useQuiz'
import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { QuestionMultichoice } from '@/components/widgets/Question/QuestionMultichoice'
import { QuestionTrueFalse } from '@/components/widgets/Question/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/components/widgets/Question/QuestionShortAnswer'
import { QuestionNumerical } from '@/components/widgets/Question/QuestionNumerical'
import { QuestionEssay } from '@/components/widgets/Question/QuestionEssay'
import { QuestionMatching } from '@/components/widgets/Question/QuestionMatching'
import { QuestionDescription } from '@/components/widgets/Question/QuestionDescription'
import { SessionSelector } from '@/components/pages/SessionSelector/SessionSelector'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import axios from 'axios'

function Questions() {
  const { id } = useParams({ strict: false })
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    undefined,
  )
  const {
    data: questions,
    isLoading,
    error,
  } = useQuizQuestions(id || '', selectedSessionId)
  const submitAnswerMutation = useSubmitAnswer()
  const finishSessionMutation = useFinishSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  // Проверяем, является ли ошибка 409
  const is409Error = Boolean(
    error &&
      axios.isAxiosError(error) &&
      error.response?.status === 409,
  )

  const is403Error = Boolean(
    error &&
      axios.isAxiosError(error) &&
      error.response?.status === 403,
  )

  // Загружаем активные сессии только если есть 409 ошибка
  const {
    data: activeSessions,
    isLoading: isLoadingSessions,
  } = useActiveSessions(id || '', {
    enabled: !!id && is409Error,
  })

  // Загружаем submits выбранной сессии
  const { data: sessionSubmits } = useSessionSubmits(
    id || '',
    selectedSessionId,
  )

  const handleSelectSession = async (sessionId: string) => {
    // Сохраняем выбранный sessionId и повторяем запрос на получение вопросов
    setSelectedSessionId(sessionId)
    // Запрос автоматически повторится благодаря изменению queryKey в useQuizQuestions
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Map<string, SubmitAnswerResponse>
  >(new Map())

  // Заполняем submittedAnswers на основе sessionSubmits выбранной сессии
  useEffect(() => {
    if (!selectedSessionId || !sessionSubmits || !questions) return

    const newSubmittedAnswers = new Map<string, SubmitAnswerResponse>()

    // Группируем submits по questionId для обработки множественных вариантов
    const submitsByQuestion = new Map<string, typeof sessionSubmits>()
    sessionSubmits.forEach((submit) => {
      const existing = submitsByQuestion.get(submit.questionId) || []
      existing.push(submit)
      submitsByQuestion.set(submit.questionId, existing)
    })

    submitsByQuestion.forEach((submits, questionId) => {
      const question = questions.find((q) => q.id === questionId)
      if (!question) return

      // Берем первый submit как основной (для текстовых вопросов)
      const firstSubmit = submits[0]

      // Определяем тип ответа на основе типа вопроса
      if (
        question.type === 'multichoice' ||
        question.type === 'truefalse' ||
        question.type === 'matching'
      ) {
        // Для вопросов с вариантами собираем все chosenVariants
        const submittedVariants: Array<{
          variantId: string
          variantText: string
          isRight: boolean
          explanation: string
        }> = []

        submits.forEach((submit) => {
          if (submit.chosenVariant) {
            const chosenVariant = submit.chosenVariant

            console.log(chosenVariant)
            const variant = chosenVariant.variant

            submittedVariants.push({
              variantId: chosenVariant.variantId,
              variantText: variant.text,
              isRight: chosenVariant.isRight,
              explanation: chosenVariant.isRight
                ? variant.explainRight
                : variant.explainWrong,
            })
          } else if (submit.chosenId) {
            // Fallback для случаев, когда chosenVariant отсутствует
            const chosenIds = typeof submit.chosenId === 'string'
              ? [submit.chosenId]
              : Array.isArray(submit.chosenId)
                ? submit.chosenId
                : []

            chosenIds.forEach((chosenId) => {
              const variant = question.variants?.find(
                (v) => v.variantId === chosenId || v.id === chosenId,
              )
              if (variant) {
                submittedVariants.push({
                  variantId: variant.variantId || variant.id,
                  variantText: variant.text,
                  isRight: variant.isRight,
                  explanation: variant.isRight
                    ? variant.explainRight
                    : variant.explainWrong,
                })
              }
            })
          }
        })

        if (submittedVariants.length > 0) {
          if (question.type === 'matching') {
            // Для matching вопросов создаем MatchingAnswerResponse
            newSubmittedAnswers.set(questionId, {
              question,
              submittedAnswer: firstSubmit,
              isRight: firstSubmit.isRight,
              pairs: [],
              variants: question.variants || [],
              explanation: null,
            } as SubmitAnswerResponse)
          } else {
            // Для multichoice/truefalse создаем MultichoiceAnswerResponse
            newSubmittedAnswers.set(questionId, {
              question,
              submittedVariants,
              allVariants: question.variants || [],
            } as SubmitAnswerResponse)
          }
        }
      } else {
        // Для текстовых вопросов (shortanswer, essay, numerical)
        newSubmittedAnswers.set(questionId, {
          question,
          submittedAnswer: firstSubmit,
          isRight: firstSubmit.isRight,
          explanation: null,
          variants: question.variants || [],
        } as SubmitAnswerResponse)
      }
    })

    setSubmittedAnswers(newSubmittedAnswers)
  }, [selectedSessionId, sessionSubmits, questions])

  const currentQuestion = questions?.[currentIndex]
  const submittedResponse = currentQuestion
    ? submittedAnswers.get(currentQuestion.id)
    : undefined

  const answeredCount = useMemo(() => {
    return submittedAnswers.size
  }, [submittedAnswers])

  const progress = questions ? (answeredCount / questions.length) * 100 : 0
  const allQuestionsAnswered = questions
    ? answeredCount === questions.length
    : false
  const isLastQuestion = questions
    ? currentIndex === questions.length - 1
    : false

  const handleFinishQuiz = async () => {
    if (!id || !selectedSessionId) return

    if (!allQuestionsAnswered) {
      setShowFinishDialog(true)
      return
    }

    // Если все вопросы отвечены, сразу завершаем
    await finishSessionMutation.mutateAsync({
      quizId: id,
      sessionId: selectedSessionId,
    })
  }

  const handleConfirmFinish = async () => {
    if (!id || !selectedSessionId) return

    setShowFinishDialog(false)
    await finishSessionMutation.mutateAsync({
      quizId: id,
      sessionId: selectedSessionId,
    })
  }

  const handleAnswerSubmit = async (
    question: Question,
    answerIds?: string[],
    answerText?: string,
  ) => {
    if (!id || !questions) return

    try {
      const response = await submitAnswerMutation.mutateAsync({
        questionId: question.id,
        data: {
          quizId: id,
          answerIds,
          answerText,
        },
      })

      // Update question with variants from response if available
      if (questions) {
        const updatedQuestions = questions.map((q) => {
          if (q.id === question.id) {
            if ('allVariants' in response && response.allVariants.length > 0) {
              return { ...q, variants: response.allVariants }
            } else if ('variants' in response && response.variants.length > 0) {
              return { ...q, variants: response.variants }
            }
          }
          return q
        })
        // Update React Query cache
        queryClient.setQueryData(quizKeys.questions(id || ''), updatedQuestions)
      }

      setSubmittedAnswers((prev) => {
        const newMap = new Map(prev)
        newMap.set(question.id, response)
        return newMap
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const renderQuestionComponent = () => {
    if (!currentQuestion) return null

    const isSubmitted = submittedAnswers.has(currentQuestion.id)

    // Get variants from question data first, then from submitted response
    const variants =
      currentQuestion.variants && currentQuestion.variants.length > 0
        ? currentQuestion.variants
        : submittedResponse && 'allVariants' in submittedResponse
          ? submittedResponse.allVariants
          : submittedResponse && 'variants' in submittedResponse
            ? submittedResponse.variants
            : []

    switch (currentQuestion.type) {
      case 'multichoice':
        return (
          <QuestionMultichoice
            question={currentQuestion}
            variants={variants}
            onSubmit={(answerIds) =>
              handleAnswerSubmit(currentQuestion, answerIds)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'truefalse':
        return (
          <QuestionTrueFalse
            question={currentQuestion}
            variants={variants}
            onSubmit={(answerIds) =>
              handleAnswerSubmit(currentQuestion, answerIds)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'shortanswer':
        return (
          <QuestionShortAnswer
            question={currentQuestion}
            onSubmit={(answerText) =>
              handleAnswerSubmit(currentQuestion, undefined, answerText)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'numerical':
        return (
          <QuestionNumerical
            question={currentQuestion}
            onSubmit={(answerText) =>
              handleAnswerSubmit(currentQuestion, undefined, answerText)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'essay':
        return (
          <QuestionEssay
            question={currentQuestion}
            onSubmit={(answerText) =>
              handleAnswerSubmit(currentQuestion, undefined, answerText)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'matching':
        return (
          <QuestionMatching
            question={currentQuestion}
            onSubmit={(answerText) =>
              handleAnswerSubmit(currentQuestion, undefined, answerText)
            }
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'description':
        return <QuestionDescription question={currentQuestion} />
      default:
        return <div>Неизвестный тип вопроса: {currentQuestion.type}</div>
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка вопросов...</div>
      </div>
    )
  }

  // Если ошибка 409, показываем выбор сессии
  if (is409Error) {
    return (
      <SessionSelector
        sessions={activeSessions || []}
        onSelectSession={handleSelectSession}
        isLoading={isLoadingSessions}
      />
    )
  }

  if (is403Error) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>
              Вы достигли максимального количества попыток для этого квиза
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate({ to: `/quiz/${id}` })}>
              Вернуться к квизу
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Ошибка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Не удалось загрузить вопросы</p>
          </CardContent>
        </Card>
      </div>
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
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Вопросы</h3>
          <div className="text-sm text-muted-foreground mb-2">
            {answeredCount} из {questions.length} отвечено
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          {questions.map((question, index) => {
            const isCurrent = index === currentIndex
            const isAnswered = submittedAnswers.has(question.id)
            const response = submittedAnswers.get(question.id)

            const isCorrect = response && ('submittedVariants' in response ? response.submittedVariants.every((v) => v.isRight) : false)

            return (
              <button
                key={question.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-full p-3 rounded-md text-left transition-colors ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isAnswered
                      ? isCorrect
                        ? 'bg-green-100 text-green-900 border border-green-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-background hover:bg-muted border border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Вопрос {index + 1}</span>
                  {isAnswered && (
                    <Badge
                      variant={isCorrect ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {isCorrect ? '✓' : '✗'}
                    </Badge>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Center Content */}
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
                {renderQuestionComponent()}
                <Separator />
                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    variant="outline"
                  >
                    ← Предыдущий
                  </Button>
                  {isLastQuestion ? (
                    <Button
                      onClick={handleFinishQuiz}
                      disabled={finishSessionMutation.isPending}
                      variant="default"
                    >
                      {finishSessionMutation.isPending
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

      {/* Диалог подтверждения завершения */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить тестирование?</DialogTitle>
            <DialogDescription>
              Вы не ответили на все вопросы. Вы уверены, что хотите завершить
              тестирование? Неотвеченные вопросы будут засчитаны как неправильные.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
            >
              Отмена
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmFinish}
              disabled={finishSessionMutation.isPending}
            >
              {finishSessionMutation.isPending
                ? 'Завершение...'
                : 'Завершить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Questions

