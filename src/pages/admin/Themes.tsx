// управление темами

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { getThemes, createTheme, updateTheme, deleteTheme, getSubjects } from '@/models/Admin'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Subject {
  id: number
  name: string
  shortName: string
}

interface Theme {
  id: number
  name: string
  description: string | null
  subjectId: number
  subject?: Subject
}

export default function AdminThemes() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: 0,
  })

  const { data: themes, isLoading } = useQuery<Theme[]>({
    queryKey: ['admin', 'themes'],
    queryFn: () => getThemes(),
  })

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['subjects', 'all'],
    queryFn: () => getSubjects(),
  })

  const createThemeMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; subjectId: number }) => createTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'themes'] })
      resetForm()
      setIsOpen(false)
    },
    onError: (error: any) => {
      console.error('Ошибка создания:', error)
      const message = error.response?.data || error.response?.data?.message || 'Не удалось создать тему'
      alert(message)
    },
  })

  const updateThemeMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description?: string; subjectId: number }) =>
      updateTheme({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'themes'] })
      resetForm()
      setIsOpen(false)
    },
    onError: (error: any) => {
      console.error('Ошибка обновления:', error)
      const message = error.response?.data || 'Не удалось обновить тему'
      alert(message)
    },
  })

  const deleteThemeMutation = useMutation({
    mutationFn: (id: number) => deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'themes'] })
      setDeleteDialogOpen(false)
      setThemeToDelete(null)
    },
    onError: (error: any) => {
      console.error('Ошибка удаления:', error)
      const message = error.response?.data || 'Не удалось удалить тему';
      alert(message);
    },
  })

  const resetForm = () => {
    setEditingTheme(null)
    setFormData({
      name: '',
      description: '',
      subjectId: 0,
    })
  }

  const handleSubmit = () => {
    if (!formData.subjectId) {
      alert('Выберите предмет')
      return
    }
    if (editingTheme) {
      updateThemeMutation.mutate({
        id: editingTheme.id,
        name: formData.name,
        description: formData.description,
        subjectId: formData.subjectId,
      })
    } else {
      createThemeMutation.mutate(formData)
    }
  }

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme)
    setFormData({
      name: theme.name,
      description: theme.description || '',
      subjectId: theme.subjectId,
    })
    setIsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка тем...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Управление темами</h1>
          <p className="text-muted-foreground">Создание, редактирование и удаление тем</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить тему
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTheme ? 'Редактировать тему' : 'Создать тему'}</DialogTitle>
              <DialogDescription>
                {editingTheme ? 'Измените данные темы' : 'Заполните данные для новой темы'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Предмет *</Label>
                <Select
                  value={String(formData.subjectId)}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={String(subject.id)}>
                        {subject.name} ({subject.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Название темы *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Реляционные базы данных"
                />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание темы"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.subjectId}>
                {editingTheme ? 'Сохранить' : 'Создать'}
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
              <TableHead>Название темы</TableHead>
              <TableHead>Предмет</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {themes?.map((theme) => (
              <TableRow key={theme.id}>
                <TableCell>{theme.id}</TableCell>
                <TableCell className="font-medium">{theme.name}</TableCell>
                <TableCell>{theme.subject?.name || theme.subjectId}</TableCell>
                <TableCell className="max-w-xs truncate">{theme.description || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(theme)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setThemeToDelete(theme)
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

      {themes?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Нет тем. Создайте первую тему.
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить тему{' '}
              <span className="font-medium">{themeToDelete?.name}</span>? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (themeToDelete) {
                  deleteThemeMutation.mutate(themeToDelete.id)
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