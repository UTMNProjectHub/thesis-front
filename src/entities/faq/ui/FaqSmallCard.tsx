import { Eye, Trash2 } from 'lucide-react'
import type { Faq } from '@/entities/faq'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
}

interface FaqCardProps {
  faq: Faq
  onOpen?: () => void
  onDelete?: () => void
}

function FaqSmallCard({ faq, onOpen, onDelete }: FaqCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">FAQ</CardTitle>
        <CardDescription>
          {DIFFICULTY_LABELS[faq.difficultyLevel] ?? faq.difficultyLevel} ·{' '}
          {faq.num_questions} вопросов ·
          {` сгенерирован ${new Date(faq.createdAt).toLocaleDateString(
            'ru-RU',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            },
          )}`}
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
                title="Открыть FAQ"
              >
                <Eye className="h-4 w-4" />
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
      </CardContent>
    </Card>
  )
}

export default FaqSmallCard
