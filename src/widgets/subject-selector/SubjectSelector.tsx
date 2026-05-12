import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import CreateSubjectDialog from './CreateSubjectDialog'
import EditSubjectDialog from './EditSubjectDialog'
import type { Subject } from '@/entities/subject'
import { deleteSubject, useSubjects } from '@/entities/subject'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useSubject } from '@/features/subject-selection'
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

function SubjectSelector() {
  const [subjectSelected, setSubjectSelected] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { setCurrent } = useSubject()

  const { data: subjects = [], refetch } = useSubjects(searchQuery || undefined)

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteSubject(subjectToDelete.id)
      if (subjectSelected === subjectToDelete.id) {
        setSubjectSelected(0)
      }
      setIsDeleteDialogOpen(false)
      setSubjectToDelete(null)
      refetch()
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Не удалось удалить предмет.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-lg mb-2">Пожалуйста, выберите предмет:</h2>
      <div className="flex flex-row gap-1.5">
        <Input
          type="text"
          placeholder="Поиск предмета..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Button
          className='!border-gray-200'
          variant={'outline'}
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
        >
          <PlusCircle/>
        </Button>
      </div>
      <div className="flex flex-col gap-2 overflow-x-scroll max-h-[30vh]">
        {subjects.map((subject: Subject) => (
          <ContextMenu key={subject.id}>
            <ContextMenuTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setSubjectSelected(subject.id)}
              >
                {subjectSelected === subject.id && <span>✅</span>}
                <span className="truncate">{subject.name}</span>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setSubjectToEdit(subject)
                  setIsEditDialogOpen(true)
                }}
              >
                Редактировать
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => {
                  setSubjectToDelete(subject)
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
          const selectedSubject = subjects.find(
            (subject: Subject) => subject.id === subjectSelected,
          )
          if (selectedSubject) {
            setCurrent(selectedSubject)
          }
        }}
      >
        Далее
      </Button>

      <CreateSubjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => refetch()}
      />

      {subjectToEdit && (
        <EditSubjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          subject={subjectToEdit}
          onSuccess={() => refetch()}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) { setIsDeleteDialogOpen(open) } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Удалить предмет</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить предмет «{subjectToDelete?.name}»? Все темы этого предмета будут удалены. Это действие нельзя отменить.
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

export default SubjectSelector
