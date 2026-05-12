import { useState } from 'react'
import { CirclePlus } from 'lucide-react'
import CreateThemeDialog from './CreateThemeDialog'
import EditThemeDialog from './EditThemeDialog'
import type { Theme } from '@/entities/subject'
import { deleteTheme, useThemesBySubject } from '@/entities/subject'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useSubject } from '@/features/subject-selection'
import { useTheme } from '@/features/theme-selection'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

function ThemeSelector() {
  const [themeSelected, setThemeSelected] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { current: currentSubject } = useSubject()
  const { setCurrent } = useTheme()

  const { data: themes = [], refetch } = useThemesBySubject(currentSubject?.id, searchQuery || undefined)

  const handleConfirmDelete = async () => {
    if (!themeToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteTheme(themeToDelete.id)
      if (themeSelected === themeToDelete.id) {
        setThemeSelected(0)
      }
      setIsDeleteDialogOpen(false)
      setThemeToDelete(null)
      refetch()
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Не удалось удалить тему.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-lg mb-2">Пожалуйста, выберите тему:</h2>
      <div className='flex flex-row gap-1.5'>
        <Input
          type="text"
          placeholder="Поиск темы..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Button
          variant={'outline'}
          className="!border-gray-200"
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
          disabled={!currentSubject}
        >
          <CirclePlus />
        </Button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh]">
        {themes.map((theme: Theme) => (
          <ContextMenu key={theme.id}>
            <ContextMenuTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setThemeSelected(theme.id)}
              >
                {themeSelected === theme.id && <span>✅</span>}
                <span className="truncate">{theme.name}</span>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setThemeToEdit(theme)
                  setIsEditDialogOpen(true)
                }}
              >
                Редактировать
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => {
                  setThemeToDelete(theme)
                  setDeleteError(null)
                  setIsDeleteDialogOpen(true)
                }}
              >
                Удалить
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
      <Button
        className="max-w-24 mt-2"
        onClick={() => {
          const selectedTheme = themes.find((theme: Theme) => theme.id === themeSelected)
          if (selectedTheme) {
            setCurrent(selectedTheme)
          }
        }}
      >
        Далее
      </Button>

      {currentSubject && (
        <CreateThemeDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          subjectId={currentSubject.id}
          onSuccess={() => refetch()}
        />
      )}

      {themeToEdit && (
        <EditThemeDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          theme={themeToEdit}
          onSuccess={() => refetch()}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) { setIsDeleteDialogOpen(open) } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Удалить тему</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить тему «{themeToDelete?.name}»? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ThemeSelector
