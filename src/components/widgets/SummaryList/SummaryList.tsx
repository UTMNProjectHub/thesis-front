import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import GenerationSummaryDialog from '../GenerationSummaryDialog/GenerationSummaryDialog'
import type { Summary } from '@/models/Summary'
import { deleteSummary, getSummariesByThemeId  } from '@/models/Summary'
import { useTheme } from '@/hooks/useTheme'
import SummarySmallCard from '@/components/dummies/SummarySmallCard'
import CreateSummaryCard from '@/components/dummies/СreateSummaryCard'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SummaryListProps {
  className?: string
}

function SummaryList({ className }: SummaryListProps) {
  const [summaries, setSummaries] = useState<Array<Summary>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [summaryToDelete, setSummaryToDelete] = useState<Summary | null>(null)
  const { current: currentTheme } = useTheme()

  const navigate = useNavigate()

  const loadSummaries = useCallback(() => {
    if (currentTheme) {
      setLoading(true)
      setError(null)
      getSummariesByThemeId(currentTheme.id)
        .then((data) => {
          setSummaries(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Ошибка загрузки конспектов')
          setLoading(false)
        })
    } else {
      setSummaries([])
    }
  }, [currentTheme])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  const handleCreateSummary = () => {
    // Заглушка для будущей функциональности
  }

  const handleOpenSummary = (summary: Summary) => {
    navigate({
      to: `/summary/${summary.id}`,
    })
  }

  const handleEditSummary = (summary: Summary) => {
    navigate({
      to: `/summary/${summary.id}/edit`,
    })
  }

  const handleDeleteSummary = (summary: Summary) => {
    setSummaryToDelete(summary)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSummary = () => {
    if (!summaryToDelete) return

    deleteSummary(summaryToDelete.id).then(() => {
      setSummaries(summaries.filter((s) => s.id !== summaryToDelete.id))
      setDeleteDialogOpen(false)
      setSummaryToDelete(null)
    }).catch((err: any) => {
      setError(err.message || 'Ошибка удаления конспекта')
      setDeleteDialogOpen(false)
      setSummaryToDelete(null)
    })
  }

  if (!currentTheme) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)}>
        Выберите тему для отображения конспектов
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка конспектов...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center text-destructive', className)}>
        {error}
      </div>
    )
  }

  return (
    <>
      <div className={cn('w-full flex flex-col', className)}>
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTheme && (
              <GenerationSummaryDialog onSuccess={loadSummaries}>
                <CreateSummaryCard onClick={handleCreateSummary} />
              </GenerationSummaryDialog>
            )}
            {summaries.map((summary) => (
              <SummarySmallCard
                key={summary.id}
                summary={summary}
                onOpen={() => handleOpenSummary(summary)}
                onEdit={() => handleEditSummary(summary)}
                onDelete={() => handleDeleteSummary(summary)}
              />
            ))}
          </div>
          {summaries.length === 0 && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Конспекты не найдены
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить конспект "{summaryToDelete?.name}"? Это действие нельзя отменить.
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
            <Button
              variant="destructive"
              onClick={confirmDeleteSummary}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SummaryList
