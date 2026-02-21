import { useEffect, useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/models/Quiz'
import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

interface QuestionEssayProps {
  question: Question
  onSubmit: (answerText: string) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
  isSubmitting?: boolean
}

export function QuestionEssay({
  question: _question,
  onSubmit,
  submittedResponse,
  isSubmitted,
  isSubmitting = false,
}: QuestionEssayProps) {
  const [answer, setAnswer] = useState('')

  // Инициализируем ответ на основе submittedResponse
  useEffect(() => {
    if (
      submittedResponse &&
      'submittedAnswer' in submittedResponse &&
      submittedResponse.submittedAnswer.answer
    ) {
      setAnswer(String(submittedResponse.submittedAnswer.answer))
    }
  }, [submittedResponse])

  const handleSubmit = () => {
    if (answer.trim() && !isSubmitted) {
      onSubmit(answer.trim())
    }
  }

  const response = submittedResponse as
    | { isRight: boolean | null; explanation: string | null }
    | undefined

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>Ваш ответ</FieldLabel>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitted}
          placeholder="Введите развернутый ответ"
          rows={6}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          )}
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
        </div>
      )}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
        </button>
      )}
    </div>
  )
}

