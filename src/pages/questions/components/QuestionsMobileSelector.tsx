import { Check, X } from 'lucide-react'
import type { Question, SubmitAnswerResponse } from '@/entities/quiz'
import { Button } from '@/shared/ui/button'

interface QuestionsMobileSelectorProps {
  questions: Array<Question>
  currentIndex: number
  submittedAnswers: Map<string, SubmitAnswerResponse>
  answeredCount: number
  progress: number
  onSelectQuestion: (index: number) => void
}

export const QuestionsMobileSelector = ({
  questions,
  currentIndex,
  submittedAnswers,
  onSelectQuestion,
}: QuestionsMobileSelectorProps) => {
  return (
    <div className="mx-auto flex flex-row gap-0.5">
      {questions.map((question, idx) => {
        const answer = submittedAnswers.get(question.id)

        const isCorrect =
          answer &&
          (answer.isRight === true ||
            ('submittedVariants' in answer
              ? answer.submittedVariants.every((v) => v.isRight)
              : false))

        return (
          <Button
            onClick={() => onSelectQuestion(idx)}
            className="relative size-12 !p-0.5 !aspect-square"
            variant={currentIndex === idx ? 'default' : 'outline'}
            key={`select-question-${question.id}`}
          >
            {idx}
            {answer && isCorrect && (
              <Check className="absolute top-0 right-0 size-5 text-green-500" />
            )}
            {answer && !isCorrect && (
              <X className="absolute top-0 right-0 size-5 text-red-500" />
            )}
          </Button>
        )
      })}
    </div>
  )
}
