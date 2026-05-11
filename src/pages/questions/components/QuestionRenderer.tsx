import type {
  AnswerPair,
  Question,
  SubmitAnswerResponse,
} from '@/entities/quiz'
import { useQuestionVariants } from '@/entities/quiz'
import { QuestionMultichoice } from '@/entities/quiz/ui/QuestionMultichoice'
import { QuestionTrueFalse } from '@/entities/quiz/ui/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/entities/quiz/ui/QuestionShortAnswer'
import { QuestionNumerical } from '@/entities/quiz/ui/QuestionNumerical'
import { QuestionEssay } from '@/entities/quiz/ui/QuestionEssay'
import { QuestionMatching } from '@/entities/quiz/ui/QuestionMatching'
import { QuestionDescription } from '@/entities/quiz/ui/QuestionDescription'

interface QuestionRendererProps {
  question: Question
  sessionId?: string
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting: boolean
  onSubmit: (
    question: Question,
    answerIds?: Array<string>,
    answerText?: string,
    answerPairs?: Array<AnswerPair>,
  ) => void
}

export function QuestionRenderer({
  question,
  sessionId,
  submittedResponse,
  isSubmitted,
  isSubmitting,
  onSubmit,
}: QuestionRendererProps) {
  const { data: fetchedVariants } = useQuestionVariants(question.id, sessionId)

  const isMatchingVariants = fetchedVariants && !Array.isArray(fetchedVariants)

  const variants = Array.isArray(fetchedVariants)
    ? fetchedVariants
    : submittedResponse && 'allVariants' in submittedResponse
      ? submittedResponse.allVariants
      : submittedResponse && 'variants' in submittedResponse
        ? submittedResponse.variants
        : (question.variants ?? [])

  const matchingVariants = isMatchingVariants
    ? (fetchedVariants as {
        leftItems: Array<{ id: string; text: string }>
        rightItems: Array<{ id: string; text: string }>
      })
    : undefined

  switch (question.type) {
    case 'multichoice':
      return (
        <QuestionMultichoice
          question={question}
          variants={variants}
          onSubmit={(answerIds) => onSubmit(question, answerIds)}
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'truefalse':
      return (
        <QuestionTrueFalse
          question={question}
          variants={variants}
          onSubmit={(answerIds) => onSubmit(question, answerIds)}
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'shortanswer':
      return (
        <QuestionShortAnswer
          question={question}
          onSubmit={(answerText) => onSubmit(question, undefined, answerText)}
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'numerical':
      return (
        <QuestionNumerical
          question={question}
          onSubmit={(answerText) => onSubmit(question, undefined, answerText)}
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'essay':
      return (
        <QuestionEssay
          question={question}
          onSubmit={(answerText) => onSubmit(question, undefined, answerText)}
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'matching':
      return (
        <QuestionMatching
          question={question}
          matchingVariants={matchingVariants}
          onSubmitPairs={(answerPairs) =>
            onSubmit(question, undefined, undefined, answerPairs)
          }
          submittedResponse={submittedResponse}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
        />
      )
    case 'description':
      return <QuestionDescription question={question} />
    default:
      return <div>Неизвестный тип вопроса: {question.type}</div>
  }
}
