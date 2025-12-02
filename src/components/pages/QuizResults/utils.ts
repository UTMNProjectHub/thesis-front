import type {
  MatchingLeftItem,
  MatchingRightItem,
  MultichoiceAnswerResponse,
  Question,
  QuestionVariant,
  SubmitAnswerResponse,
  SubmittedAnswer,
  SubmittedVariant,
} from '@/types/quiz'

// Типы для данных из API
interface ApiQuestion {
  id: string
  type: string
  multiAnswer: boolean | null
  text: string
  questionsVariants?: Array<{
    id: string
    questionId: string
    variantId: string | null
    isRight: boolean | null
    matchingConfig: {
      leftItems: Array<{
        id: string
        text: string
        explainRight?: string
        explainWrong?: string
      }>
      rightItems: Array<{
        id: string
        text: string
        explainRight?: string
        explainWrong?: string
      }>
      correctPairs: Array<{
        leftVariantId: string
        rightVariantId: string
        explainRight?: string
        explainWrong?: string
      }>
    } | null
    variant: {
      id: string
      text: string
      explainRight: string
      explainWrong: string
    } | null
  }>
}

interface ApiSubmit {
  id: string
  quizId: string
  questionId: string
  chosenId: string | null
  answer: any | null
  isRight: boolean | null
  chosenVariant: {
    id: string
    questionId: string
    variantId: string
    isRight: boolean
    variant: {
      id: string
      text: string
      explainRight: string
      explainWrong: string
    } | null
  } | null
  question: ApiQuestion
}

/**
 * Преобразует вопрос из API в формат Question
 */
export function transformApiQuestionToQuestion(apiQuestion: ApiQuestion): Question {
  const variants: Array<QuestionVariant> = []
  let matchingLeftItems: Array<MatchingLeftItem> | undefined
  let matchingRightItems: Array<MatchingRightItem> | undefined

  if (apiQuestion.questionsVariants) {
    apiQuestion.questionsVariants.forEach((qv) => {
      // Для matching вопросов извлекаем leftItems и rightItems из matchingConfig
      if (apiQuestion.type === 'matching' && qv.matchingConfig) {
        matchingLeftItems = qv.matchingConfig.leftItems.map((item) => ({
          id: item.id,
          text: item.text,
        }))
        matchingRightItems = qv.matchingConfig.rightItems.map((item) => ({
          id: item.id,
          text: item.text,
        }))
      }

      // Создаем variants для всех типов вопросов (кроме matching, где variant может быть null)
      if (qv.variant) {
        variants.push({
          id: qv.id,
          text: qv.variant.text,
          explainRight: qv.variant.explainRight,
          explainWrong: qv.variant.explainWrong,
          isRight: qv.isRight ?? false,
          questionId: qv.questionId,
          variantId: qv.variantId || qv.variant.id,
          questionsVariantsId: qv.id,
        })
      }
    })
  }

  return {
    id: apiQuestion.id,
    type: apiQuestion.type,
    multiAnswer: apiQuestion.multiAnswer,
    text: apiQuestion.text,
    variants: variants.length > 0 ? variants : undefined,
    matchingLeftItems,
    matchingRightItems,
  }
}

/**
 * Преобразует submit из API в SubmitAnswerResponse
 */
export function transformApiSubmitToSubmitAnswerResponse(
  apiSubmit: ApiSubmit,
  question: Question,
  apiQuestion?: ApiQuestion,
): SubmitAnswerResponse | null {
  // Нормализуем answer для текстовых вопросов
  let normalizedAnswer = apiSubmit.answer
  if (
    apiSubmit.answer &&
    typeof apiSubmit.answer === 'object' &&
    'text' in apiSubmit.answer
  ) {
    // Для текстовых вопросов answer может быть объектом { text: "..." }
    normalizedAnswer = (apiSubmit.answer as { text: string }).text
  }

  const submittedAnswer: SubmittedAnswer = {
    id: apiSubmit.id,
    quizId: apiSubmit.quizId,
    questionId: apiSubmit.questionId,
    chosenId: apiSubmit.chosenId,
    answer: normalizedAnswer,
    isRight: apiSubmit.isRight,
    chosenVariant:
      apiSubmit.chosenVariant && apiSubmit.chosenVariant.variant
        ? {
            id: apiSubmit.chosenVariant.id,
            questionId: apiSubmit.chosenVariant.questionId,
            variantId: apiSubmit.chosenVariant.variantId,
            isRight: apiSubmit.chosenVariant.isRight,
            variant: apiSubmit.chosenVariant.variant,
          }
        : null,
  }

  // Обработка matching вопросов
  if (question.type === 'matching') {
    const pairs: Array<{
      key: string
      value: string
      isRight: boolean
      explanation: string | null
    }> = []

    if (
      apiSubmit.answer &&
      typeof apiSubmit.answer === 'object' &&
      'pairs' in apiSubmit.answer
    ) {
      const answerPairs = (apiSubmit.answer as {
        pairs: Array<{ key: string; value: string; isRight: boolean }>
      }).pairs

      // Находим matchingConfig для получения correctPairs
      const matchingConfig =
        apiQuestion?.questionsVariants?.[0]?.matchingConfig ||
        apiSubmit.question?.questionsVariants?.[0]?.matchingConfig

      answerPairs.forEach((pair) => {
        // Находим тексты по ID
        const leftItem = question.matchingLeftItems?.find((li) => li.id === pair.key)
        const rightItem = question.matchingRightItems?.find((ri) => ri.id === pair.value)

        // Получаем explanation из correctPairs или элементов
        let explanation: string | null = null
        if (pair.isRight) {
          // Ищем в correctPairs
          const correctPair = matchingConfig?.correctPairs.find(
            (cp) =>
              cp.leftVariantId === pair.key && cp.rightVariantId === pair.value,
          )
          explanation = correctPair?.explainRight || null
        } else {
          // Для неправильных пар находим правильную пару для этого leftItem
          const correctPairForLeft = matchingConfig?.correctPairs.find(
            (cp) => cp.leftVariantId === pair.key,
          )
          explanation = correctPairForLeft?.explainWrong || null
        }

        pairs.push({
          key: leftItem?.text || pair.key,
          value: rightItem?.text || pair.value,
          isRight: pair.isRight,
          explanation,
        })
      })
    }

    return {
      question,
      submittedAnswer,
      isRight: apiSubmit.isRight,
      pairs,
      variants: question.variants || [],
      explanation: null,
    } as SubmitAnswerResponse
  }

  // Обработка multichoice и truefalse вопросов
  if (question.type === 'multichoice' || question.type === 'truefalse') {
    const submittedVariants: Array<SubmittedVariant> = []

    if (apiSubmit.chosenVariant && question.variants) {
      const chosenVariant = apiSubmit.chosenVariant
      const variant = chosenVariant.variant

      if (variant) {
        // Находим соответствующий вариант в преобразованном вопросе
        const questionVariant = question.variants.find(
          (v) =>
            v.variantId === chosenVariant.variantId ||
            v.id === chosenVariant.variantId ||
            (v.variantId && v.variantId === variant.id) ||
            v.id === variant.id,
        )

        if (questionVariant) {
          submittedVariants.push({
            id: questionVariant.variantId || questionVariant.id,
            variantText: variant.text,
            isRight: chosenVariant.isRight,
            explanation: chosenVariant.isRight
              ? variant.explainRight
              : variant.explainWrong,
          })
        }
      }
    } else if (apiSubmit.chosenId && question.variants) {
      // Fallback для случаев, когда chosenVariant отсутствует
      const variant = question.variants.find(
        (v) => v.variantId === apiSubmit.chosenId || v.id === apiSubmit.chosenId,
      )
      if (variant) {
        submittedVariants.push({
          id: variant.variantId || variant.id,
          variantText: variant.text,
          isRight: variant.isRight,
          explanation: variant.isRight
            ? variant.explainRight
            : variant.explainWrong,
        })
      }
    }

    if (submittedVariants.length > 0) {
      return {
        question,
        submittedVariants,
        allVariants: question.variants ?? [],
      } as MultichoiceAnswerResponse
    }
  }

  // Обработка текстовых вопросов (shortanswer, essay, numerical)
  if (
    question.type === 'shortanswer' ||
    question.type === 'essay' ||
    question.type === 'numerical'
  ) {
    // Для текстовых вопросов получаем explanation из варианта, если есть
    let explanation: string | null = null
    if (question.variants && question.variants.length > 0) {
      const variant = question.variants[0]
      if (apiSubmit.isRight) {
        explanation = variant.explainRight
      } else {
        explanation = variant.explainWrong
      }
    }

    return {
      question,
      submittedAnswer,
      isRight: apiSubmit.isRight,
      explanation,
      variants: question.variants || [],
    } as SubmitAnswerResponse
  }

  return null
}

