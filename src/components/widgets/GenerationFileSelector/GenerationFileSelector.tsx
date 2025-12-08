import { useEffect, useRef, useState } from 'react'
import { BookOpen, File, FolderOpen, Upload } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/hooks/useTheme'
import { useSubject } from '@/hooks/useSubject'
import { useGenerationFiles } from '@/hooks/useGenerationFiles'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface FileItem {
  id: string
  name: string
  s3Index: string
  userId: string | null
  type: 'theme' | 'subject'
}

interface GenerationFileSelectorProps {
  className?: string
}

function GenerationFileSelector({ className }: GenerationFileSelectorProps) {
  const [files, setFiles] = useState<Array<FileItem>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedUploadTarget, setSelectedUploadTarget] = useState<'theme' | 'subject' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { current: currentTheme } = useTheme()
  const { current: currentSubject } = useSubject()
  const { selectedFiles, setSelectedFiles } = useGenerationFiles()

  useEffect(() => {
    if (currentTheme) {
      setLoading(true)
      setError(null)
      
      const loadFiles = async () => {
        try {
          // Загружаем файлы темы
          const themeFiles = await apiClient.getThemeFiles(currentTheme.id)
          const themeFilesWithType = themeFiles.map((file) => ({
            ...file,
            type: 'theme' as const,
          }))

          // Загружаем файлы предмета, если предмет выбран
          let subjectFilesWithType: Array<FileItem> = []
          if (currentSubject) {
            try {
              const subjectFiles = await apiClient.getSubjectFiles(currentSubject.id)
              subjectFilesWithType = subjectFiles.map((file) => ({
                ...file,
                type: 'subject' as const,
              }))
            } catch (err) {
              // Игнорируем ошибки загрузки файлов предмета, если они есть
              console.warn('Не удалось загрузить файлы предмета:', err)
            }
          }

          // Объединяем файлы
          const allFiles = [...themeFilesWithType, ...subjectFilesWithType]
          setFiles(allFiles)
          
          // Выбираем все файлы по умолчанию, если еще ничего не выбрано
          const allFileIds = allFiles.map((file) => file.id)
          if (selectedFiles.length === 0) {
            setSelectedFiles(allFileIds)
          }
          setLoading(false)
        } catch (err: any) {
          setError(err.message || 'Ошибка загрузки файлов')
          setLoading(false)
        }
      }

      loadFiles()
    } else {
      setFiles([])
      setSelectedFiles([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme, currentSubject])

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleFile = (fileId: string) => {
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter((id) => id !== fileId)
      : [...selectedFiles, fileId]

    setSelectedFiles(newSelection)
  }

  const handleUploadClick = () => {
    setDialogOpen(true)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedUploadTarget) {
      return
    }

    setUploading(true)
    setError(null)
    setDialogOpen(false)

    try {
      if (selectedUploadTarget === 'theme' && currentTheme) {
        await apiClient.uploadFileToTheme(currentTheme.id, file)
      } else if (selectedUploadTarget === 'subject' && currentSubject) {
        await apiClient.uploadFileToSubject(currentSubject.id, file)
      }

      // Перезагружаем все файлы после загрузки
      if (currentTheme) {
        const themeFiles = await apiClient.getThemeFiles(currentTheme.id)
        const themeFilesWithType = themeFiles.map((file) => ({
          ...file,
          type: 'theme' as const,
        }))

        let subjectFilesWithType: Array<FileItem> = []
        if (currentSubject) {
          try {
            const subjectFiles = await apiClient.getSubjectFiles(currentSubject.id)
            subjectFilesWithType = subjectFiles.map((file) => ({
              ...file,
              type: 'subject' as const,
            }))
          } catch (err) {
            console.warn('Не удалось загрузить файлы предмета:', err)
          }
        }

        const allFiles = [...themeFilesWithType, ...subjectFilesWithType]
        setFiles(allFiles)
        const allFileIds = allFiles.map((f) => f.id)
        setSelectedFiles(allFileIds)
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
      setSelectedUploadTarget(null)
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTargetSelect = (target: 'theme' | 'subject') => {
    setSelectedUploadTarget(target)
    // Небольшая задержка для закрытия диалога перед открытием файлового диалога
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

  if (loading) {
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
                Выберите, куда вы хотите загрузить файл: в текущую тему или в предмет
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              {currentTheme && (
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
              )}
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
              {!currentTheme && !currentSubject && (
                <div className="text-center text-muted-foreground py-4">
                  Выберите тему или предмет для загрузки файла
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
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
            <Button
              key={file.id}
              variant={selectedFiles.includes(file.id) ? 'default' : 'outline'}
              onClick={() => handleToggleFile(file.id)}
              className="justify-start"
            >
              <File className="h-4 w-4 mr-2" />
              <span className="truncate flex-1 text-left">{file.name}</span>
              <Badge 
                variant="secondary" 
                className="ml-2 mr-2"
              >
                {file.type === 'theme' ? 'тематический' : 'предметный'}
              </Badge>
              {selectedFiles.includes(file.id) && (
                <span className="ml-auto">✓</span>
              )}
            </Button>
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

