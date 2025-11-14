import { useState, useMemo } from 'react'
import { useQuizQuestions, useSessions, useSessionSubmits } from '@/hooks/useQuiz'
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
import { SessionStats } from './SessionStats'
import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { QuestionMultichoice } from '@/components/widgets/Question/QuestionMultichoice'
import { QuestionTrueFalse } from '@/components/widgets/Question/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/components/widgets/Question/QuestionShortAnswer'
import { QuestionNumerical } from '@/components/widgets/Question/QuestionNumerical'
import { QuestionEssay } from '@/components/widgets/Question/QuestionEssay'
import { QuestionMatching } from '@/components/widgets/Question/QuestionMatching'
import { QuestionDescription } from '@/components/widgets/Question/QuestionDescription'

interface IQuizResultsProps {
  quizId: string
}

function QuizResults({}: IQuizResultsProps) {
  const { id } = useParams({ strict: false })
  const { data: sessions, isLoading } = useSessions(id || '', {
    enabled: id !== undefined,
  })

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )

  // Выбираем первую сессию по умолчанию, если есть
  const selectedSession = useMemo(() => {
    if (!sessions || sessions.length === 0) return null
    if (selectedSessionId) {
      return sessions.find((s) => s.id === selectedSessionId) || sessions[0]
    }
    return sessions[0]
  }, [sessions, selectedSessionId])


  const { data: sessionSubmits, isLoading: sessionSubmitsLoading } =
    useSessionSubmits(id || '', selectedSession?.id || '')
  const { data: quizQuestions, isLoading: questionsLoading } = useQuizQuestions(
    id || '',
    selectedSession?.id || '',
  )

  // Преобразуем данные сессии в формат для отображения
  const { questions, submittedAnswers, stats } = useMemo(() => {
    if (!quizQuestions || !sessionSubmits) {
      return {
        questions: [] as Question[],
        submittedAnswers: new Map<string, SubmitAnswerResponse>(),
        stats: { solvedPercent: 0, rightPercent: 0 },
      }
    }

    const submittedAnswersMap = new Map<string, SubmitAnswerResponse>()

    // Группируем submits по questionId для обработки множественных вариантов
    const submitsByQuestion = new Map<string, typeof sessionSubmits>()
    sessionSubmits.forEach((submit) => {
      const existing = submitsByQuestion.get(submit.questionId) || []
      existing.push(submit)
      submitsByQuestion.set(submit.questionId, existing)
    })

    submitsByQuestion.forEach((submits, questionId) => {
      const question = quizQuestions.find((q) => q.id === questionId)
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
          id: string
          variantText: string
          isRight: boolean
          explanation: string
        }> = []

        submits.forEach((submit) => {
          if (submit.chosenVariant) {
            const chosenVariant = submit.chosenVariant
            const variant = chosenVariant.variant

            if (variant) {
              submittedVariants.push({
                id: chosenVariant.variantId,
                variantText: variant.text,
                isRight: chosenVariant.isRight,
                explanation: chosenVariant.isRight
                  ? variant.explainRight
                  : variant.explainWrong,
              })
            }
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
                const variantId = variant.variantId || variant.id
                submittedVariants.push({
                  id: variantId,
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

        if (question.type === 'matching') {
          // Для matching вопросов извлекаем pairs из answer
          const pairs: Array<{
            key: string
            value: string
            isRight: boolean
            explanation: string | null
          }> = []

          if (
            firstSubmit.answer &&
            typeof firstSubmit.answer === 'object' &&
            'pairs' in firstSubmit.answer
          ) {
            const answerPairs = (firstSubmit.answer as {
              pairs: Array<{ key: string; value: string; isRight: boolean }>
            }).pairs

            answerPairs.forEach((pair) => {
              // Находим тексты по ID
              const leftItem = question.matchingLeftItems?.find(
                (li) => li.id === pair.key,
              )
              const rightItem = question.matchingRightItems?.find(
                (ri) => ri.id === pair.value,
              )

              // Получаем explanation из элементов
              let explanation: string | null = null
              if (pair.isRight) {
                explanation =
                  leftItem?.explainRight || rightItem?.explainRight || null
              } else {
                explanation =
                  leftItem?.explainWrong || rightItem?.explainWrong || null
              }

              pairs.push({
                key: leftItem?.text || pair.key,
                value: rightItem?.text || pair.value,
                isRight: pair.isRight,
                explanation,
              })
            })
          }

          // Для matching вопросов создаем MatchingAnswerResponse
          submittedAnswersMap.set(questionId, {
            question,
            submittedAnswer: firstSubmit,
            isRight: firstSubmit.isRight,
            pairs,
            variants: question.variants || [],
            explanation: null,
          } as SubmitAnswerResponse)
        } else if (submittedVariants.length > 0) {
          // Для multichoice/truefalse создаем MultichoiceAnswerResponse
          submittedAnswersMap.set(questionId, {
            question,
            submittedVariants,
            allVariants: question.variants || [],
          } as SubmitAnswerResponse)
        }
      } else {
        // Для текстовых вопросов (shortanswer, essay, numerical)
        submittedAnswersMap.set(questionId, {
          question,
          submittedAnswer: firstSubmit,
          isRight: firstSubmit.isRight,
          explanation: null,
          variants: question.variants || [],
        } as SubmitAnswerResponse)
      }
    })

    // Вычисляем статистику
    const totalQuestions = quizQuestions.length
    const answeredQuestions = submittedAnswersMap.size
    const correctAnswers = Array.from(submittedAnswersMap.values()).filter(
      (response) => {
        if ('submittedVariants' in response) {
          return response.submittedVariants.every((v) => v.isRight)
        }
        return response.isRight === true
      },
    ).length

    const solvedPercent =
      totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    const rightPercent =
      answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0

    return {
      questions: quizQuestions,
      submittedAnswers: submittedAnswersMap,
      stats: {
        solvedPercent,
        rightPercent,
      },
    }
  }, [quizQuestions, sessionSubmits])

  const renderQuestionComponent = (
    question: Question,
    submittedResponse?: SubmitAnswerResponse,
  ) => {
    // На странице результатов всегда режим просмотра
    const isSubmitted = true

    // Get variants from question data first, then from submitted response
    const variants =
      question.variants && question.variants.length > 0
        ? question.variants
        : submittedResponse && 'allVariants' in submittedResponse
          ? submittedResponse.allVariants
          : submittedResponse && 'variants' in submittedResponse
            ? submittedResponse.variants
            : []

    switch (question.type) {
      case 'multichoice':
        return (
          <QuestionMultichoice
            question={question}
            variants={variants}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'truefalse':
        return (
          <QuestionTrueFalse
            question={question}
            variants={variants}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'shortanswer':
        return (
          <QuestionShortAnswer
            question={question}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'numerical':
        return (
          <QuestionNumerical
            question={question}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'essay':
        return (
          <QuestionEssay
            question={question}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'matching':
        return (
          <QuestionMatching
            question={question}
            onSubmit={() => {}}
            submittedResponse={submittedResponse}
            isSubmitted={isSubmitted}
          />
        )
      case 'description':
        return <QuestionDescription question={question} />
      default:
        return (
          <div>Неизвестный тип вопроса: {question.type}</div>
        )
    }
  }

  if (
    isLoading ||
    sessionSubmitsLoading ||
    questionsLoading ||
    !selectedSession
  ) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-muted-foreground">Загрузка результатов...</div>
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет результатов</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Для этого квиза пока нет завершенных сессий</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Результаты квиза</h1>
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium">Выберите сессию:</label>
          <Select
            value={selectedSession?.id || ''}
            onValueChange={(value) => setSelectedSessionId(value)}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Выберите сессию" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.timeStart
                    ? new Date(session.timeStart).toLocaleString('ru-RU')
                    : 'Сессия ' + session.id.slice(0, 8)}
                  {session.timeEnd && (
                    <span className="text-muted-foreground ml-2">
                      (завершена)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSession && (
          <div className="mb-8">
            <SessionStats
              solvedPercent={stats.solvedPercent}
              rightPercent={stats.rightPercent}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const submittedResponse = submittedAnswers.get(question.id)
          const isCorrect =
            submittedResponse &&
            ('submittedVariants' in submittedResponse
              ? submittedResponse.submittedVariants.every((v) => v.isRight)
              : submittedResponse.isRight === true)

          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Вопрос {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{question.type}</Badge>
                    {submittedResponse && (
                      <Badge
                        variant={isCorrect ? 'default' : 'destructive'}
                      >
                        {isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {question.text}
                  </h3>
                </div>
                {renderQuestionComponent(question, submittedResponse)}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default QuizResults
