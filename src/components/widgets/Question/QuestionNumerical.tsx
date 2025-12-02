import { useEffect, useState } from 'react'
import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface QuestionNumericalProps {
  question: Question
  onSubmit: (answerText: string) => void
  submittedResponse?: SubmitAnswerResponse
  isSubmitted: boolean
}

export function QuestionNumerical({
  // @ts-ignore bro shut up
  question,
  onSubmit,
  submittedResponse,
  isSubmitted,
}: QuestionNumericalProps) {
  const [answer, setAnswer] = useState('')

  console.log(submittedResponse);

  // Инициализируем ответ на основе submittedResponse
  useEffect(() => {
    if (
      submittedResponse &&
      'submittedAnswer' in submittedResponse &&
      submittedResponse.submittedAnswer.answer
    ) {
      setAnswer(String(submittedResponse.submittedAnswer.answer.text))
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
        <Input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
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
      'explanation' in submittedResponse.submittedAnswer.answer && (
            <p className="mt-2 text-sm">{submittedResponse.submittedAnswer.answer.explanation}</p>
          )}
        </div>
      )}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить ответ
        </button>
      )}
    </div>
  )
}

