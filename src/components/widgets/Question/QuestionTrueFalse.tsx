import { useEffect, useState } from 'react'
import type { Question, QuestionVariant, SubmitAnswerResponse } from '@/types/quiz'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface QuestionTrueFalseProps {
  question: Question
  variants: Array<QuestionVariant>
  onSubmit: (answerIds: Array<string>) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
}

export function QuestionTrueFalse({
  question,
  variants,
  onSubmit,
  submittedResponse,
  isSubmitted,
}: QuestionTrueFalseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Инициализируем выбранный вариант на основе submittedResponse
  useEffect(() => {
    if (submittedResponse && 'submittedVariants' in submittedResponse) {
      const firstVariant = submittedResponse.submittedVariants[0]
      if (firstVariant) {
        // Находим вариант по variantId
        const variant = variants.find(
          (variant) =>
            variant.variantId === firstVariant.variantId ||
            variant.id === firstVariant.variantId,
        )
        if (variant) {
          setSelectedId(variant.id)
        }
      }
    }
  }, [submittedResponse, variants])

  const handleChange = (variantId: string) => {
    if (isSubmitted) return
    setSelectedId(variantId)
  }

  const handleSubmit = () => {
    if (selectedId && !isSubmitted) {
      onSubmit([selectedId])
    }
  }

  const response = submittedResponse as
    | { submittedVariants: Array<{ variantId: string; isRight: boolean; explanation: string }> }
    | undefined

  return (
    <div className="space-y-4">
      <FieldGroup>
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id
          const submitted = response?.submittedVariants.find(
            (v) => 
              v.variantId === variant.variantId ||
              v.variantId === variant.id,
          )
          const isCorrect = submitted?.isRight ?? false

          return (
            <Field key={variant.id}>
              <FieldLabel className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={isSelected}
                  onChange={() => handleChange(variant.id)}
                  disabled={isSubmitted}
                  className="w-4 h-4"
                />
                <span
                  className={
                    isSubmitted
                      ? isCorrect
                        ? 'text-green-600 font-semibold'
                        : submitted
                          ? 'text-red-600'
                          : ''
                      : ''
                  }
                >
                  {variant.text}
                </span>
                {isSubmitted && submitted && (
                  <span className="text-sm text-muted-foreground">
                    {submitted.explanation}
                  </span>
                )}
              </FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!selectedId}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить ответ
        </button>
      )}
    </div>
  )
}

