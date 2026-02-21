import type {
  Question,
  SubmitAnswerResponse,
} from '@/models/Quiz'
import type { SessionSubmitWithDetails } from '@/models/Session'

/**
 * SessionSubmitWithDetails[], Question[] -> Map<questionId, SubmitAnswerResponse>
 * Группирует submits по questionId и формирует ответ подходящего типа
 * в зависимости от типа вопроса (multichoice, matching, shortanswer и т.д.).
 */
export function buildSubmittedAnswers(
  sessionSubmits: Array<SessionSubmitWithDetails>,
  questions: Array<Question>,
): Map<string, SubmitAnswerResponse> {
  const result = new Map<string, SubmitAnswerResponse>()

  // Группируем submits по questionId
  const submitsByQuestion = new Map<string, Array<SessionSubmitWithDetails>>()
  sessionSubmits.forEach((submit) => {
    const existing = submitsByQuestion.get(submit.questionId) || []
    existing.push(submit)
    submitsByQuestion.set(submit.questionId, existing)
  })

  submitsByQuestion.forEach((submits, questionId) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const firstSubmit = submits[0]

    if (
      question.type === 'multichoice' ||
      question.type === 'truefalse' ||
      question.type === 'matching'
    ) {
      const submittedVariants = buildSubmittedVariants(submits, question)

      if (question.type === 'matching') {
        const pairs = buildMatchingPairs(firstSubmit, question)

        result.set(questionId, {
          question,
          submittedAnswer: firstSubmit,
          isRight: firstSubmit.isRight,
          pairs,
          variants: question.variants || [],
          explanation: null,
        } as SubmitAnswerResponse)
      } else if (submittedVariants.length > 0) {
        result.set(questionId, {
          question,
          submittedVariants,
          allVariants: question.variants || [],
        } as SubmitAnswerResponse)
      }
    } else {
      // Для текстовых вопросов (shortanswer, essay, numerical)
      result.set(questionId, {
        question,
        submittedAnswer: firstSubmit,
        isRight: firstSubmit.isRight,
        explanation: null,
        variants: question.variants || [],
      } as SubmitAnswerResponse)
    }
  })

  return result
}

function buildSubmittedVariants(
  submits: Array<SessionSubmitWithDetails>,
  question: Question,
) {
  const submittedVariants: Array<{
    variantId: string
    variantText: string
    isRight: boolean
    explanation: string
  }> = []

  submits.forEach((submit) => {
    if (submit.chosenVariant) {
      const { chosenVariant } = submit
      const { variant } = chosenVariant

      submittedVariants.push({
        variantId: chosenVariant.variantId,
        variantText: variant.text,
        isRight: chosenVariant.isRight,
        explanation: chosenVariant.isRight
          ? variant.explainRight
          : variant.explainWrong,
      })
    } else if (submit.chosenId) {
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
          const varId = variant.variantId || variant.id
          submittedVariants.push({
            variantId: varId,
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

  return submittedVariants
}

function buildMatchingPairs(
  submit: SessionSubmitWithDetails,
  question: Question,
) {
  const pairs: Array<{
    key: string
    value: string
    isRight: boolean
    explanation: string | null
  }> = []

  if (
    submit.answer &&
    typeof submit.answer === 'object' &&
    'pairs' in submit.answer
  ) {
    const answerPairs = (
      submit.answer as {
        pairs: Array<{
          key: string
          value: string
          isRight: boolean
          explanation: string | null
        }>
      }
    ).pairs

    answerPairs.forEach((pair) => {
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

  return pairs
}
