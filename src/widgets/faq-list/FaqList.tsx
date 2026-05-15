import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Faq } from '@/entities/faq'
import {
  CreateFaqCard,
  FaqSmallCard,
  deleteFaq,
  faqKeys,
  getFaqLink,
  useFaqsByTheme,
} from '@/entities/faq'
import GenerationFaqDialog from '@/widgets/generation-faq-dialog/GenerationFaqDialog'
import { useTheme } from '@/features/theme-selection'
import { cn } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'

interface FaqListProps {
  className?: string
}

function FaqList({ className }: FaqListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null)
  const { current: currentTheme } = useTheme()
  const queryClient = useQueryClient()

  const {
    data: faqs = [],
    isLoading,
    isError,
    refetch,
  } = useFaqsByTheme(currentTheme?.id)

  const handleOpenFaq = (f: Faq) => {
    getFaqLink(f.id)
      .then((link) => window.open(link, '_blank'))
      .catch(() => toast.error('Произошла ошибка при получении ссылки на FAQ'))
  }

  const handleDeleteFaq = (f: Faq) => {
    setFaqToDelete(f)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!faqToDelete) return
    deleteFaq(faqToDelete.id)
      .then(() => {
        setDeleteDialogOpen(false)
        setFaqToDelete(null)
        if (currentTheme) {
          queryClient.invalidateQueries({
            queryKey: faqKeys.byTheme(currentTheme.id),
          })
        }
      })
      .catch(() => {
        toast.error('Ошибка удаления FAQ')
        setDeleteDialogOpen(false)
        setFaqToDelete(null)
      })
  }

  if (!currentTheme) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-muted-foreground',
          className,
        )}
      >
        Выберите тему для отображения FAQ
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка FAQ...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-destructive',
          className,
        )}
      >
        Ошибка загрузки FAQ
      </div>
    )
  }

  return (
    <>
      <div className={cn('w-full flex flex-col', className)}>
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GenerationFaqDialog onSuccess={() => refetch()}>
              <CreateFaqCard />
            </GenerationFaqDialog>
            {faqs.map((f) => (
              <FaqSmallCard
                key={f.id}
                faq={f}
                onOpen={() => handleOpenFaq(f)}
                onDelete={() => handleDeleteFaq(f)}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот FAQ? Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setFaqToDelete(null)
              }}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FaqList
