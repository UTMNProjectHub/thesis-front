import { useState } from 'react'
import type { Question, QuestionVariant, SubmitAnswerResponse } from '@/types/quiz'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

interface QuestionMatchingProps {
  question: Question
  variants: QuestionVariant[]
  onSubmit: (answerIds: string[]) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
}

export function QuestionMatching({
  question,
  variants,
  onSubmit,
  submittedResponse,
  isSubmitted,
}: QuestionMatchingProps) {
  // Separate keys and values for matching
  const keys = variants.filter((v) => v.text.includes('->') === false)
  const values = variants.filter((v) => v.text.includes('->') === false)

  const [pairs, setPairs] = useState<Map<string, string>>(new Map())

  const handlePair = (keyId: string, valueId: string) => {
    if (isSubmitted) return
    setPairs((prev) => {
      const newPairs = new Map(prev)
      newPairs.set(keyId, valueId)
      return newPairs
    })
  }

  const handleSubmit = () => {
    if (pairs.size > 0 && !isSubmitted) {
      onSubmit(Array.from(pairs.values()))
    }
  }

  const response = submittedResponse as
    | { pairs: Array<{ key: string; value: string; isRight: boolean; explanation: string | null }> }
    | undefined

  return (
    <div className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Ключи</h4>
            {keys.map((key) => (
              <div key={key.id} className="mb-2 p-2 border rounded">
                {key.text}
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Значения</h4>
            {values.map((value) => (
              <div
                key={value.id}
                className={cn(
                  'mb-2 p-2 border rounded cursor-pointer',
                  pairs.has(value.variantId) && 'bg-primary/10',
                  isSubmitted &&
                    response?.pairs.find(
                      (p) => p.value === value.text && p.isRight,
                    ) &&
                    'bg-green-100 border-green-300',
                )}
                onClick={() => {
                  // Simplified matching - in real implementation would need better UI
                  if (!isSubmitted) {
                    handlePair(value.variantId, value.variantId)
                  }
                }}
              >
                {value.text}
              </div>
            ))}
          </div>
        </div>
        {isSubmitted &&
          response?.pairs.map((pair, idx) => (
            <div
              key={idx}
              className={cn(
                'p-2 rounded-md mt-2',
                pair.isRight
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200',
              )}
            >
              <p>
                {pair.key} → {pair.value}
              </p>
              {pair.explanation && (
                <p className="text-sm mt-1">{pair.explanation}</p>
              )}
            </div>
          ))}
      </FieldGroup>
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={pairs.size === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить ответ
        </button>
      )}
    </div>
  )
}

