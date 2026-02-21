import type { Question } from '@/models/Quiz'

interface QuestionDescriptionProps {
  question: Question
}

export function QuestionDescription({ question }: QuestionDescriptionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-md">
        <p className="text-muted-foreground">{question.text}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Это информационный блок. Ответа не требуется.
      </p>
    </div>
  )
}

