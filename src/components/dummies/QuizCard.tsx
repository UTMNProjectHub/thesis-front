import type { Quiz } from '@/types/quiz'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Edit, Trash2 } from 'lucide-react'

interface QuizCardProps {
  quiz: Quiz
  onOpen?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function QuizCard({ quiz, onOpen, onEdit, onDelete }: QuizCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{quiz.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {quiz.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
      <CardAction>
          <div className="flex gap-2">
            {onOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpen}
                title="Открыть квиз"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                title="Редактировать"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardAction>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div>Тип: {quiz.type}</div>
          <div>Вопросов: {quiz.questionCount}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizCard

