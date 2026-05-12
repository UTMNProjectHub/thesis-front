import { Plus } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

interface CreateFaqCardProps {
  onClick?: () => void
  className?: string
}

function CreateFaqCard({ onClick, className }: CreateFaqCardProps) {
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
        <span className="text-sm font-medium">Создать новый FAQ</span>
      </div>
    </Card>
  )
}

export default CreateFaqCard
