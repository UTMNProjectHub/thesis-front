import type { Question, SubmitAnswerResponse } from '@/models/Quiz'
import { QuestionMultichoice } from '@/components/widgets/Question/QuestionMultichoice'
import { QuestionTrueFalse } from '@/components/widgets/Question/QuestionTrueFalse'
import { QuestionShortAnswer } from '@/components/widgets/Question/QuestionShortAnswer'
import { QuestionNumerical } from '@/components/widgets/Question/QuestionNumerical'
import { QuestionEssay } from '@/components/widgets/Question/QuestionEssay'
import { QuestionMatching } from '@/components/widgets/Question/QuestionMatching'
import { QuestionDescription } from '@/components/widgets/Question/QuestionDescription'

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
