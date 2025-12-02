import { useMemo } from 'react'
import { QuestionMultichoice } from '../Question/QuestionMultichoice'
import { QuestionTrueFalse } from '../Question/QuestionTrueFalse'
import { QuestionShortAnswer } from '../Question/QuestionShortAnswer'
import { QuestionNumerical } from '../Question/QuestionNumerical'
import { QuestionEssay } from '../Question/QuestionEssay'
import { QuestionMatching } from '../Question/QuestionMatching'
import { QuestionDescription } from '../Question/QuestionDescription'
import type {
  Question,
  Session,
  SubmitAnswerResponse,
  SubmittedAnswer,
} from '@/types/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { SessionStats } from '@/components/widgets/QuizSessionStats/SessionStats'

interface IQuizResultViewProps {
  session: Session
  quizQuestions: Array<Question>
  sessionSubmits: Array<SubmittedAnswer>
}

function QuizResultView({
  quizQuestions,
  sessionSubmits,
}: IQuizResultViewProps) {
  const { questions, submittedAnswers, stats } = useMemo(() => {
    if (!quizQuestions || !sessionSubmits) {
      return {
        questions: [] as Array<Question>,
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
            const chosenIds =
              typeof submit.chosenId === 'string'
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
            const answerPairs = (
              firstSubmit.answer as {
                pairs: Array<{ key: string; value: string; isRight: boolean; explanation: string | null }>
              }
            ).pairs

            answerPairs.forEach((pair) => {
              // Находим тексты по ID
              const leftItem = question.matchingLeftItems?.find(
                (li) => li.id === pair.key,
              )
              const rightItem = question.matchingRightItems?.find(
                (ri) => ri.id === pair.value,
              )

              pairs.push({
                key: leftItem?.text || pair.key,
                value: rightItem?.text || pair.value,
                isRight: pair.isRight,
                explanation: pair.explanation,
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
        return <div>Неизвестный тип вопроса: {question.type}</div>
    }
  }

  if (!sessionSubmits || sessionSubmits.length === 0) {
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
      <SessionStats
        solvedPercent={stats.solvedPercent}
        rightPercent={stats.rightPercent}
      />
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
                  <CardTitle className="text-xl">Вопрос {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{question.type}</Badge>
                    {submittedResponse && (
                      <Badge variant={isCorrect ? 'default' : 'destructive'}>
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

export default QuizResultView
