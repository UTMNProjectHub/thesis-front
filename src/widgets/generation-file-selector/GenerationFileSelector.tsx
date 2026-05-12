import { useEffect, useRef, useState } from 'react'
import { BookOpen, File, FolderOpen, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadFileToTheme } from '@/entities/theme'
import {
  subjectKeys,
  uploadFileToSubject,
  useSubjectFiles,
  useThemeFiles,
} from '@/entities/subject'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useTheme } from '@/features/theme-selection'
import { useSubject } from '@/features/subject-selection'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ui/context-menu'
import { deleteFile } from '@/entities/file/api/api'

interface FileItem {
  id: string
  name: string
  s3Index: string
  userId: string | null
  type: 'theme' | 'subject'
}

interface GenerationFileSelectorProps {
  className?: string
  onSelectionChange?: (files: Array<string>) => void
}

function GenerationFileSelector({ className, onSelectionChange }: GenerationFileSelectorProps) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedUploadTarget, setSelectedUploadTarget] = useState<
    'theme' | 'subject' | null
  >(null)
  const [selectedFiles, setSelectedFiles] = useState<Array<string>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { current: currentTheme } = useTheme()
  const { current: currentSubject } = useSubject()
  const queryClient = useQueryClient()

  const { data: themeFilesRaw = [], isLoading: themeLoading } = useThemeFiles(
    currentTheme?.id,
  )
  const { data: subjectFilesRaw = [] } = useSubjectFiles(currentSubject?.id)

  const files: Array<FileItem> = [
    ...themeFilesRaw.map((f) => ({ ...f, type: 'theme' as const })),
    ...subjectFilesRaw.map((f) => ({ ...f, type: 'subject' as const })),
  ]

  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current && files.length > 0) {
      initializedRef.current = true
      const all = files.map((f) => f.id)
      setSelectedFiles(all)
      onSelectionChange?.(all)
    }
  }, [files.length])

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleFile = (fileId: string) => {
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter((id) => id !== fileId)
      : [...selectedFiles, fileId]

    setSelectedFiles(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleUploadClick = () => {
    setDialogOpen(true)
  }

  const handleFileDeletion = (file: FileItem) => {
    deleteFile(file.id)
      .then(() => {
        toast.success('Файл успешно удалён!')
        const newSelection = selectedFiles.filter((id) => id !== file.id)
        setSelectedFiles(newSelection)
        onSelectionChange?.(newSelection)
        if (file.type === 'theme' && currentTheme) {
          queryClient.invalidateQueries({
            queryKey: subjectKeys.themeFiles(currentTheme.id),
          })
        } else if (file.type === 'subject' && currentSubject) {
          queryClient.invalidateQueries({
            queryKey: subjectKeys.files(currentSubject.id),
          })
        }
      })
      .catch(() => {
        toast.error('Возникла ошибка при удалении файла. Пичалько :(')
      })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file || !selectedUploadTarget) {
      return
    }

    setUploading(true)
    setError(null)
    setDialogOpen(false)

    try {
      if (selectedUploadTarget === 'theme' && currentTheme) {
        await uploadFileToTheme(currentTheme.id, file)
        queryClient.invalidateQueries({
          queryKey: subjectKeys.themeFiles(currentTheme.id),
        })
      } else if (selectedUploadTarget === 'subject' && currentSubject) {
        await uploadFileToSubject(currentSubject.id, file)
        queryClient.invalidateQueries({
          queryKey: subjectKeys.files(currentSubject.id),
        })
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
      setSelectedUploadTarget(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTargetSelect = (target: 'theme' | 'subject') => {
    setSelectedUploadTarget(target)
    setTimeout(() => {
      setDialogOpen(false)
      fileInputRef.current?.click()
    }, 100)
  }

  if (!currentTheme) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-muted-foreground',
          className,
        )}
      >
        Выберите тему для отображения файлов
      </div>
    )
  }

  if (themeLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка файлов...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-destructive',
          className,
        )}
      >
        {error}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col py-2', className)}>
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder="Поиск файла..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUploadClick}
          disabled={uploading}
          title="Загрузить файл"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="*/*"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выберите место загрузки файла</DialogTitle>
              <DialogDescription>
                Выберите, куда вы хотите загрузить файл: в текущую тему или в
                предмет
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleTargetSelect('theme')}
              >
                <div className="flex items-center gap-3 w-full">
                  <FolderOpen className="h-5 w-5" />
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">Тема</span>
                    <span className="text-sm text-muted-foreground">
                      {currentTheme.name}
                    </span>
                  </div>
                </div>
              </Button>
              {currentSubject && (
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => handleTargetSelect('subject')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5" />
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium">Предмет</span>
                      <span className="text-sm text-muted-foreground">
                        {currentSubject.name}
                      </span>
                    </div>
                  </div>
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground py-8">
            Файлы не найдены
          </div>
        ) : (
          filteredFiles.map((file) => (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger>
                <Button
                  variant={
                    selectedFiles.includes(file.id) ? 'default' : 'outline'
                  }
                  onClick={() => handleToggleFile(file.id)}
                  className="justify-start w-full overflow-hidden"
                >
                  <File className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate flex-1 text-left min-w-0">
                    {file.name}
                  </span>
                  <Badge variant="secondary" className="ml-2 mr-2">
                    {file.type === 'theme' ? 'тематический' : 'предметный'}
                  </Badge>
                  {selectedFiles.includes(file.id) && (
                    <span className="ml-auto">✓</span>
                  )}
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleFileDeletion(file)}>
                  Удалить
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Выбрано файлов: {selectedFiles.length}
        </div>
      )}
    </div>
  )
}

export default GenerationFileSelector
