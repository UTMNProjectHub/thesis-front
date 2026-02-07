import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FinishQuizDialogProps {
  open: boolean
  isFinishing: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function FinishQuizDialog({
  open,
  isFinishing,
  onOpenChange,
  onConfirm,
}: FinishQuizDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Завершить тестирование?</DialogTitle>
          <DialogDescription>
            Вы не ответили на все вопросы. Вы уверены, что хотите завершить
            тестирование? Неотвеченные вопросы будут засчитаны как
            неправильные.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isFinishing}
          >
            {isFinishing ? 'Завершение...' : 'Завершить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
