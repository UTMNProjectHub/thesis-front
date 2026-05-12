import { useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/entities/quiz'
import { Field, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

interface QuestionMultichoiceProps {
  question: Question
  variants: Array<{ id: string; text: string; variantId?: string }>
  onSubmit: (answerIds: Array<string>) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting?: boolean
}

export function QuestionMultichoice({
  question,
  variants,
  onSubmit,
  submittedResponse,
  isSubmitted,
  isSubmitting = false,
}: QuestionMultichoiceProps) {
  const isMultiAnswer = question.multiAnswer === true
  const [localSelectedIds, setLocalSelectedIds] = useState<Array<string>>([])

  const submittedSelectedIds = submittedResponse && 'submittedVariants' in submittedResponse
    ? submittedResponse.submittedVariants
        .map((v) => variants.find((variant) => variant.variantId === v.variantId || variant.id === v.variantId)?.id)
        .filter((id): id is string => id !== undefined)
    : null

  const selectedIds = submittedSelectedIds ?? localSelectedIds

  const handleChange = (variantId: string) => {
    if (isSubmitted) return

    if (isMultiAnswer) {
      setLocalSelectedIds((prev) =>
        prev.includes(variantId)
          ? prev.filter((id) => id !== variantId)
          : [...prev, variantId],
      )
    } else {
      setLocalSelectedIds([variantId])
    }
  }

  const handleSubmit = () => {
    if (selectedIds.length > 0 && !isSubmitted) {
      onSubmit(selectedIds)
    }
  }

  const response = submittedResponse as
    | { submittedVariants: Array<{ variantId: string; isRight: boolean; explanation: string }> }
    | undefined

  return (
    <div className="space-y-4">
      <FieldGroup>
        {variants.map((variant) => {
          const isSelected = selectedIds.includes(variant.id)
          const submitted = response?.submittedVariants.find(
            (v) =>
              v.variantId === variant.variantId ||
              v.variantId === variant.id
          )
          const isCorrect = submitted?.isRight ?? false

          return (
            <Field key={variant.id}>
              <FieldLabel className="flex items-center gap-2 cursor-pointer">
                {isMultiAnswer ? (
                  <Input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleChange(variant.id)}
                    disabled={isSubmitted}
                    className="w-4 h-4"
                  />
                ) : (
                  <Input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() => handleChange(variant.id)}
                    disabled={isSubmitted}
                    className="w-4 h-4"
                  />
                )}
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
          disabled={selectedIds.length === 0 || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
        </button>
      )}
    </div>
  )
}
