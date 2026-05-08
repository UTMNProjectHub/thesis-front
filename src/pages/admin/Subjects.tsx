// управление предметами

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/models/Admin'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Subject {
  id: number
  name: string
  shortName: string
  description: string | null
  yearStart: number
  yearEnd: number
}

export default function AdminSubjects() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    yearStart: new Date().getFullYear(),
    yearEnd: new Date().getFullYear(),
    description: '',
  })

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ['admin', 'subjects'],
    queryFn: () => getSubjects(),
  })

  const createSubjectMutation = useMutation({
    mutationFn: (data: { name: string; shortName: string; yearStart: number; yearEnd: number; description?: string }) =>
    createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      resetForm()
      setIsOpen(false)
    },
    onError: (error: any) => {
      console.error('Ошибка создания:', error)
      const message = error.response?.data || error.message || 'Не удалось создать предмет'
      alert(message)
    },
  })

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; shortName: string; yearStart: number; yearEnd: number; description?: string }) =>
      updateSubject({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error('Ошибка обновления:', error);
      const message = error.response?.data?.response || 'Не удалось обновить предмет';
      alert(message);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      setDeleteDialogOpen(false)
      setSubjectToDelete(null)
    },
    onError: (error: any) => {
      console.error('Ошибка удаления:', error)
      const message = error.response?.data || 'Не удалось удалить предмет'
      alert(message)
    },
  })

  const resetForm = () => {
    setEditingSubject(null)
    setFormData({
      name: '',
      shortName: '',
      yearStart: new Date().getFullYear(),
      yearEnd: new Date().getFullYear(),
      description: '',
    })
  }

  const handleSubmit = () => {
    if (editingSubject) {
      updateSubjectMutation.mutate({
        id: editingSubject.id,
        name: formData.name,
        shortName: formData.shortName,
        yearStart: formData.yearStart,
        yearEnd: formData.yearEnd,
        description: formData.description,
      })
    } else {
      createSubjectMutation.mutate(formData)
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      shortName: subject.shortName,
      yearStart: subject.yearStart,
      yearEnd: subject.yearEnd,
      description: subject.description || '',
    })
    setIsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка предметов...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Управление предметами</h1>
          <p className="text-muted-foreground">Создание, редактирование и удаление предметов</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить предмет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Редактировать предмет' : 'Создать предмет'}</DialogTitle>
              <DialogDescription>
                {editingSubject ? 'Измените данные предмета' : 'Заполните данные для нового предмета'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Название предмета *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Базы данных"
                />
              </div>
              <div className="space-y-2">
                <Label>Краткое название *</Label>
                <Input
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="Например: БД"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Год начала</Label>
                  <Input
                    type="number"
                    value={formData.yearStart}
                    onChange={(e) => setFormData({ ...formData, yearStart: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Год окончания</Label>
                  <Input
                    type="number"
                    value={formData.yearEnd}
                    onChange={(e) => setFormData({ ...formData, yearEnd: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание предмета"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.shortName}>
                {editingSubject ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Краткое</TableHead>
              <TableHead>Годы</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects?.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.id}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.shortName}</TableCell>
                <TableCell>{subject.yearStart}–{subject.yearEnd}</TableCell>
                <TableCell className="max-w-xs truncate">{subject.description || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSubjectToDelete(subject)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {subjects?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Нет предметов. Создайте первый предмет.
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить предмет{' '}
              <span className="font-medium">{subjectToDelete?.name}</span>? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (subjectToDelete) {
                  deleteSubjectMutation.mutate(subjectToDelete.id)
                }
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}