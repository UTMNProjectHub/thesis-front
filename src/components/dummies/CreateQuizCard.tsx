import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateQuizCardProps {
  onClick?: () => void
  className?: string
}

function CreateQuizCard({ onClick, className }: CreateQuizCardProps) {
  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer border-dashed flex items-center justify-center min-h-[200px]',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Plus className="h-12 w-12" />
        <span className="text-sm font-medium">Создать новый квиз</span>
      </div>
    </Card>
  )
}

export default CreateQuizCard

