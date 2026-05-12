import { useEffect, useState } from 'react'
import type { Subject } from '@/entities/subject'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { updateSubject } from '@/entities/subject'

interface EditSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject
  onSuccess?: () => void
}

function EditSubjectDialog({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectDialogProps) {
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [yearStart, setYearStart] = useState('')
  const [yearEnd, setYearEnd] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(subject.name)
      setShortName(subject.shortName)
      setYearStart(String(subject.yearStart))
      setYearEnd(String(subject.yearEnd))
      setDescription(subject.description)
      setError(null)
    }
  }, [open, subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !shortName.trim() || !yearStart || !yearEnd) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    const startYear = parseInt(yearStart, 10)
    const endYear = parseInt(yearEnd, 10)

    if (isNaN(startYear) || isNaN(endYear)) {
      setError('Годы должны быть числами')
      return
    }

    if (startYear > endYear) {
      setError('Год начала не может быть больше года окончания')
      return
    }

    setIsLoading(true)

    try {
      await updateSubject(subject.id, {
        name: name.trim(),
        shortName: shortName.trim(),
        yearStart: startYear,
        yearEnd: endYear,
        description: description.trim() || null,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Не удалось обновить предмет. Попробуйте еще раз.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать предмет</DialogTitle>
          <DialogDescription>Измените данные предмета</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-shortName">
                Короткое название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-shortName"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-yearStart">
                  Год начала <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-yearStart"
                  type="number"
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  placeholder={currentYear.toString()}
                  min="2000"
                  max="2100"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-yearEnd">
                  Год окончания <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-yearEnd"
                  type="number"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  placeholder={(currentYear + 1).toString()}
                  min="2000"
                  max="2100"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание предмета (необязательно)"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSubjectDialog
