import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Summary } from '@/entities/summary'
import GenerationSummaryDialog from '@/widgets/generation-summary-dialog/GenerationSummaryDialog'
import {
  deleteSummary,
  summaryKeys,
  useSummariesByTheme,
} from '@/entities/summary'
import { useTheme } from '@/features/theme-selection'
import SummarySmallCard from '@/entities/summary/ui/SummarySmallCard'
import CreateSummaryCard from '@/entities/summary/ui/CreateSummaryCard'
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
import { getSummaryLink } from '@/entities/summary/api/api'

interface SummaryListProps {
  className?: string
  selectedFiles: Array<string>
}

function SummaryList({ className, selectedFiles }: SummaryListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [summaryToDelete, setSummaryToDelete] = useState<Summary | null>(null)
  const { current: currentTheme } = useTheme()
  const queryClient = useQueryClient()

  const {
    data: summaries = [],
    isLoading,
    isError,
    refetch,
  } = useSummariesByTheme(currentTheme?.id)

  const handleCreateSummary = () => {
    // Заглушка для будущей функциональности
  }

  const handleOpenSummary = (summary: Summary) => {
    getSummaryLink(summary.id)
      .then((link) => {
        window.open(link, '_blank')
      })
      .catch(() => {
        toast.error(
          'Произошла ошибка при получении ссылки на лекцию. Пичалько :(',
        )
      })
  }

  const handleDeleteSummary = (summary: Summary) => {
    setSummaryToDelete(summary)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSummary = () => {
    if (!summaryToDelete) return

    deleteSummary(summaryToDelete.id)
      .then(() => {
        setDeleteDialogOpen(false)
        setSummaryToDelete(null)
        if (currentTheme) {
          queryClient.invalidateQueries({
            queryKey: summaryKeys.byTheme(currentTheme.id),
          })
        }
      })
      .catch((err: any) => {
        console.error(err.message || 'Ошибка удаления лекции')
        setDeleteDialogOpen(false)
        setSummaryToDelete(null)
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
        Выберите тему для отображения лекций
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка лекций...</div>
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
        Ошибка загрузки лекций
      </div>
    )
  }

  return (
    <>
      <div className={cn('w-full flex flex-col', className)}>
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.length === 0 && (
              <div className="flex items-center outline rounded-xl justify-center">
                Для начала работы с генерацией, начните с лекции
              </div>
            )}
            <GenerationSummaryDialog
              onSuccess={() => refetch()}
              selectedFiles={selectedFiles}
            >
              <CreateSummaryCard onClick={handleCreateSummary} />
            </GenerationSummaryDialog>
            {summaries.map((summary) => (
              <SummarySmallCard
                key={summary.id}
                summary={summary}
                onOpen={() => handleOpenSummary(summary)}
                onEdit={() => {
                  toast.info('Редактирование лекций еще не разработано.')
                }}
                onDelete={() => handleDeleteSummary(summary)}
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
              Вы уверены, что хотите удалить лекцию "{summaryToDelete?.name}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSummaryToDelete(null)
              }}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSummary}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SummaryList
