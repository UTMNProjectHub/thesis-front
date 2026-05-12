import { useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/entities/quiz'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

interface QuestionNumericalProps {
  question: Question
  onSubmit: (answerText: string) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting?: boolean
}

export function QuestionNumerical({
  // @ts-ignore bro shut up
  question,
  onSubmit,
  submittedResponse,
  isSubmitted,
  isSubmitting = false,
}: QuestionNumericalProps) {
  const [localAnswer, setLocalAnswer] = useState('')

  const displayAnswer =
    submittedResponse && 'submittedAnswer' in submittedResponse && submittedResponse.submittedAnswer.answer
      ? String(submittedResponse.submittedAnswer.answer.text)
      : localAnswer

  const handleSubmit = () => {
    if (localAnswer.trim() && !isSubmitted) {
      onSubmit(localAnswer.trim())
    }
  }

  const response = submittedResponse as
    | { isRight: boolean | null; explanation: string | null }
    | undefined

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>Ваш ответ</FieldLabel>
        <Input
          type="number"
          value={displayAnswer}
          onChange={(e) => setLocalAnswer(e.target.value)}
          disabled={isSubmitted}
          placeholder="Введите число"
          className="w-full"
        />
      </Field>
      {isSubmitted && response && (
        <div
          className={`p-3 rounded-md ${
            response.isRight
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="font-semibold">
            {response.isRight ? 'Правильно!' : 'Неправильно'}
          </p>
          {response.explanation && (
            <p className="mt-2 text-sm">{response.explanation}</p>
          )}
          {submittedResponse &&
            'submittedAnswer' in submittedResponse &&
            submittedResponse.submittedAnswer.answer &&
            'explanation' in submittedResponse.submittedAnswer && (
              <p className="mt-2 text-sm">{submittedResponse.submittedAnswer.explanation}</p>
            )}
        </div>
      )}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!localAnswer.trim() || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
        </button>
      )}
    </div>
  )
}
