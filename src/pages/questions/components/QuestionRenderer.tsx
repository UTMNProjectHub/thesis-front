import type { Question, SubmitAnswerResponse } from '@/entities/quiz'
import { QuestionMultichoice } from '@/entities/quiz/ui/QuestionMultichoice'
import { QuestionTrueFalse } from '@/entities/quiz/ui/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/entities/quiz/ui/QuestionShortAnswer'
import { QuestionNumerical } from '@/entities/quiz/ui/QuestionNumerical'
import { QuestionEssay } from '@/entities/quiz/ui/QuestionEssay'
import { QuestionMatching } from '@/entities/quiz/ui/QuestionMatching'
import { QuestionDescription } from '@/entities/quiz/ui/QuestionDescription'

interface QuestionRendererProps {
  question: Question
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting: boolean
  onSubmit: (
    question: Question,
    answerIds?: Array<string>,
    answerText?: string,
  ) => void
}

export function QuestionRenderer({
  question,
  submittedResponse,
  isSubmitted,
  isSubmitting,
  onSubmit,
}: QuestionRendererProps) {
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
          onSubmit={(answerText) => onSubmit(question, undefined, answerText)}
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
