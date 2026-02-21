import { Edit, Eye, Trash2 } from 'lucide-react'
import type { Summary } from '@/models/Summary'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SummaryCardProps {
  summary: Summary
  onOpen?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function SummarySmallCard({ summary, onOpen, onEdit, onDelete }: SummaryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{summary.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {summary.description}
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
                title="Открыть конспект"
              >
                <Eye className="h-4 w-4" />
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
      </CardContent>
    </Card>
  )
}

export default SummarySmallCard
