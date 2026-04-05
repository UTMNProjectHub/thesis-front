import { useState } from 'react'
import type { AnswerPair, Question, SubmitAnswerResponse } from '@/entities/quiz'
import { FieldGroup } from '@/shared/ui/field'
import { cn } from '@/shared/lib/utils'

interface MatchingVariants {
  leftItems: Array<{ id: string; text: string }>
  rightItems: Array<{ id: string; text: string }>
}

interface QuestionMatchingProps {
  question: Question
  matchingVariants?: MatchingVariants
  onSubmitPairs: (answerPairs: Array<AnswerPair>) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting?: boolean
}

export function QuestionMatching({
  question,
  matchingVariants,
  onSubmitPairs,
  submittedResponse,
  isSubmitted,
  isSubmitting = false,
}: QuestionMatchingProps) {
  const leftItems = matchingVariants?.leftItems ?? question.matchingLeftItems ?? []
  const rightItems = matchingVariants?.rightItems ?? question.matchingRightItems ?? []

  // Map<leftId, rightId>
  const [pairs, setPairs] = useState<Map<string, string>>(new Map())
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)

  const pairsGraded =
    submittedResponse && 'pairsGraded' in submittedResponse
      ? submittedResponse.pairsGraded
      : undefined

  const handleLeftClick = (leftId: string) => {
    if (isSubmitted) return
    if (pairs.has(leftId)) {
      setPairs((prev) => {
        const next = new Map(prev)
        next.delete(leftId)
        return next
      })
      setSelectedLeftId(null)
    } else {
      setSelectedLeftId(leftId)
    }
  }

  const handleRightClick = (rightId: string) => {
    if (isSubmitted || !selectedLeftId) return
    const existingLeft = Array.from(pairs.entries()).find(([, rId]) => rId === rightId)?.[0]
    setPairs((prev) => {
      const next = new Map(prev)
      if (existingLeft) next.delete(existingLeft)
      next.set(selectedLeftId, rightId)
      return next
    })
    setSelectedLeftId(null)
  }

  const handleSubmit = () => {
    if (pairs.size === 0 || isSubmitted) return
    const answerPairs: Array<AnswerPair> = Array.from(pairs.entries()).map(
      ([leftId, rightId]) => ({
        leftMatching: leftItems.find((li) => li.id === leftId)?.text ?? leftId,
        rightMatching: rightItems.find((ri) => ri.id === rightId)?.text ?? rightId,
      }),
    )
    onSubmitPairs(answerPairs)
  }

  return (
    <div className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Ключи</h4>
            {leftItems.map((leftItem) => {
              const isPaired = pairs.has(leftItem.id)
              const isSelected = selectedLeftId === leftItem.id
              const gradedPair = pairsGraded?.find((p) => p.leftMatching === leftItem.text)
              return (
                <div
                  key={leftItem.id}
                  onClick={() => handleLeftClick(leftItem.id)}
                  className={cn(
                    'mb-2 p-2 border rounded cursor-pointer transition-colors',
                    isSelected && 'bg-primary border-primary text-primary-foreground',
                    isPaired && !isSelected && 'bg-primary/10 border-primary',
                    !isPaired && !isSelected && !isSubmitted && 'hover:bg-muted/50',
                    isSubmitted && gradedPair?.isRight && 'bg-green-100 border-green-300',
                    isSubmitted && gradedPair && !gradedPair.isRight && 'bg-red-100 border-red-300',
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
              const gradedPair = pairsGraded?.find((p) => p.rightMatching === rightItem.text)
              return (
                <div
                  key={rightItem.id}
                  onClick={() => handleRightClick(rightItem.id)}
                  className={cn(
                    'mb-2 p-2 border rounded cursor-pointer transition-colors',
                    isPaired && 'bg-primary/10 border-primary',
                    !isPaired && !isSubmitted && selectedLeftId && 'hover:bg-primary/5 border-primary/50',
                    !isPaired && !isSubmitted && !selectedLeftId && 'hover:bg-muted/50',
                    isSubmitted && gradedPair?.isRight && 'bg-green-100 border-green-300',
                    isSubmitted && gradedPair && !gradedPair.isRight && 'bg-red-100 border-red-300',
                  )}
                >
                  {rightItem.text}
                </div>
              )
            })}
          </div>
        </div>

        {!isSubmitted && pairs.size > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Выбранные пары:</h4>
            {Array.from(pairs.entries()).map(([leftId, rightId]) => {
              const leftItem = leftItems.find((li) => li.id === leftId)
              const rightItem = rightItems.find((ri) => ri.id === rightId)
              return (
                <div key={`${leftId}-${rightId}`} className="mb-2 p-2 border rounded bg-muted/30">
                  {leftItem?.text} → {rightItem?.text}
                </div>
              )
            })}
          </div>
        )}

        {isSubmitted && pairsGraded && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold mb-2">Результат:</h4>
            {pairsGraded.map((pair, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-2 rounded-md border',
                  pair.isRight
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : 'bg-red-50 text-red-800 border-red-200',
                )}
              >
                {pair.leftMatching} → {pair.rightMatching}
                <span className="ml-2 text-sm">{pair.isRight ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
        )}
      </FieldGroup>

      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={pairs.size === 0 || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
        </button>
      )}
    </div>
  )
}
