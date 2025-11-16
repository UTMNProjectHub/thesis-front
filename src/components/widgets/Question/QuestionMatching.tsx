import { useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { FieldGroup } from '@/components/ui/field'
import { cn } from '@/lib/utils'

interface QuestionMatchingProps {
  question: Question
  variants?: never
  onSubmit: (answerText: string) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
}

export function QuestionMatching({
  question,
  onSubmit,
  submittedResponse,
  isSubmitted,
}: QuestionMatchingProps) {
  // Get left and right items from question
  const leftItems = question.matchingLeftItems || []
  const rightItems = question.matchingRightItems || []

  const [pairs, setPairs] = useState<Map<string, string>>(new Map())
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)

  const handleLeftClick = (leftVariantId: string) => {
    if (isSubmitted) return
    // If already paired, remove the pair
    if (pairs.has(leftVariantId)) {
      setPairs((prev) => {
        const newPairs = new Map(prev)
        newPairs.delete(leftVariantId)
        return newPairs
      })
      setSelectedLeftId(null)
    } else {
      setSelectedLeftId(leftVariantId)
    }
  }

  const handleRightClick = (rightVariantId: string) => {
    if (isSubmitted || !selectedLeftId) return
    
    // Check if this right item is already paired
    const existingLeftId = Array.from(pairs.entries()).find(
      ([_, rightId]) => rightId === rightVariantId
    )?.[0]

    if (existingLeftId) {
      // Remove existing pair
      setPairs((prev) => {
        const newPairs = new Map(prev)
        newPairs.delete(existingLeftId)
        return newPairs
      })
    }

    // Create new pair
    setPairs((prev) => {
      const newPairs = new Map(prev)
      newPairs.set(selectedLeftId, rightVariantId)
      return newPairs
    })
    setSelectedLeftId(null)
  }

  const handleSubmit = () => {
    if (pairs.size > 0 && !isSubmitted) {
      // Format: "leftVariantId:rightVariantId;leftVariantId:rightVariantId"
      const answerText = Array.from(pairs.entries())
        .map(([leftId, rightId]) => `${leftId}:${rightId}`)
        .join(';')
      onSubmit(answerText)
    }
  }

  // Типизируем response для matching вопросов
  const response = submittedResponse && 'pairs' in submittedResponse
    ? submittedResponse as { pairs: Array<{ key: string; value: string; isRight: boolean; explanation: string | null }> }
    : undefined

  console.log(submittedResponse)

  return (
    <div className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Ключи</h4>
            {leftItems.map((leftItem) => {
              const selectedRightId = pairs.get(leftItem.id)
              const isPaired = selectedRightId !== undefined
              const isCurrentlySelected = selectedLeftId === leftItem.id
              return (
                <div
                  key={leftItem.id}
                  onClick={() => handleLeftClick(leftItem.id)}
                  className={cn(
                    'mb-2 p-2 border rounded cursor-pointer transition-colors',
                    isCurrentlySelected && 'bg-primary border-primary text-primary-foreground',
                    isPaired && !isCurrentlySelected && 'bg-primary/10 border-primary',
                    !isPaired && !isCurrentlySelected && !isSubmitted && 'hover:bg-gray-50',
                    isSubmitted &&
                      response?.pairs.find(
                        (p) => p.key === leftItem.text && p.isRight,
                      ) &&
                      'bg-green-100 border-green-300',
                    isSubmitted &&
                      response?.pairs.find(
                        (p) => p.key === leftItem.text && !p.isRight,
                      ) &&
                      'bg-red-100 border-red-300',
                  )}
                >
                  {leftItem.text}
                </div>
              )
            })}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Значения</h4>
            {rightItems.map((rightItem) => {
              const isPaired = Array.from(pairs.values()).includes(rightItem.id)
              return (
                <div
                  key={rightItem.id}
                  onClick={() => handleRightClick(rightItem.id)}
                  className={cn(
                    'mb-2 p-2 border rounded cursor-pointer transition-colors',
                    isPaired && 'bg-primary/10 border-primary',
                    !isPaired && !isSubmitted && selectedLeftId && 'hover:bg-primary/5 border-primary/50',
                    !isPaired && !isSubmitted && !selectedLeftId && 'hover:bg-gray-50',
                    isSubmitted &&
                      response?.pairs.find(
                        (p) => p.value === rightItem.text && p.isRight,
                      ) &&
                      'bg-green-100 border-green-300',
                    isSubmitted &&
                      response?.pairs.find(
                        (p) => p.value === rightItem.text && !p.isRight,
                      ) &&
                      'bg-red-100 border-red-300',
                  )}
                >
                  {rightItem.text}
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Выбранные пары:</h4>
          {Array.from(pairs.entries()).map(([leftId, rightId]) => {
            const leftItem = leftItems.find((li) => li.id === leftId)
            const rightItem = rightItems.find((ri) => ri.id === rightId)
            return (
              <div key={`${leftId}-${rightId}`} className="mb-2 p-2 border rounded bg-gray-50">
                {leftItem?.text} → {rightItem?.text}
              </div>
            )
          })}
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

