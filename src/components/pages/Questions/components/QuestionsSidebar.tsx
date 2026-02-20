import type { Question, SubmitAnswerResponse } from '@/types/quiz'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface QuestionsSidebarProps {
  questions: Array<Question>
  currentIndex: number
  submittedAnswers: Map<string, SubmitAnswerResponse>
  answeredCount: number
  progress: number
  onSelectQuestion: (index: number) => void
}

export function QuestionsSidebar({
  questions,
  currentIndex,
  submittedAnswers,
  answeredCount,
  progress,
  onSelectQuestion,
}: QuestionsSidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Вопросы</h3>
        <div className="text-sm text-muted-foreground mb-2">
          {answeredCount} из {questions.length} отвечено
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        {questions.map((question, index) => {
          const isCurrent = index === currentIndex
          const isAnswered = submittedAnswers.has(question.id)
          const response = submittedAnswers.get(question.id)

          const isCorrect =
            response &&
            ('submittedVariants' in response
              ? response.submittedVariants.every((v) => v.isRight)
              : false)

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={`w-full p-3 rounded-md text-left transition-colors ${
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isAnswered
                    ? isCorrect
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                    : 'bg-background hover:bg-muted border border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Вопрос {index + 1}</span>
                {isAnswered && (
                  <Badge
                    variant={isCorrect ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {isCorrect ? '✓' : '✗'}
                  </Badge>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
