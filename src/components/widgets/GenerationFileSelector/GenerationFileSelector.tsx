import { useEffect, useRef, useState } from 'react'
import { BookOpen, File, FolderOpen, Upload, Shield, AlertCircle, Info } from 'lucide-react'
import { getThemeFiles, uploadFileToTheme } from '@/models/Theme'
import { getSubjectFiles, uploadFileToSubject } from '@/models/Subject'
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
import { useAuth } from '@/hooks/useAuth'
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
  
  // Проверка прав
  const { user, isLoading: authLoading } = useAuth()
  const permissions = user?.permissions || []
  const userRole = user?.roles?.[0]?.slug
  
  const canUploadFiles = permissions.includes('upload_files') || userRole === 'admin' || userRole === 'teacher'
  const canGenerateQuiz = permissions.includes('create_quiz') || userRole === 'admin' || userRole === 'teacher'
  const canGenerateSummary = permissions.includes('create_summary') || userRole === 'admin' || userRole === 'teacher'
  
  const isStudent = userRole === 'student'
  const isTeacher = userRole === 'teacher' || userRole === 'admin' // админ тоже считается учителем для интерфейса

  // Загружаем файлы только при изменении темы/предмета
  useEffect(() => {
    let isMounted = true

    const loadFiles = async () => {
      if (!currentTheme) {
        setFiles([])
        setSelectedFiles([])
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        // Загружаем файлы темы
        const themeFiles = await getThemeFiles(currentTheme.id)
        if (!isMounted) return
        
        const themeFilesWithType = themeFiles.map((file) => ({
          ...file,
          type: 'theme' as const,
        }))

        // Загружаем файлы предмета, если предмет выбран
        let subjectFilesWithType: Array<FileItem> = []
        if (currentSubject) {
          try {
            const subjectFiles = await getSubjectFiles(currentSubject.id)
            if (!isMounted) return
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
        
        // Не выбираем файлы автоматически для учителей/админов
        if (selectedFiles.length === 0 && isStudent) {
          setSelectedFiles(allFileIds)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Ошибка загрузки файлов')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFiles()

    return () => {
      isMounted = false
    }
  }, [currentTheme?.id, currentSubject?.id]) // Зависимости только от ID

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleFile = (fileId: string) => {
    // Только учителя и админы могут выбирать файлы
    if (!isTeacher) return
    
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter((id) => id !== fileId)
      : [...selectedFiles, fileId]

    setSelectedFiles(newSelection)
  }

  const handleUploadClick = () => {
    if (!canUploadFiles) {
      return
    }
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
        await uploadFileToTheme(currentTheme.id, file)
      } else if (selectedUploadTarget === 'subject' && currentSubject) {
        await uploadFileToSubject(currentSubject.id, file)
      }

      // Перезагружаем файлы после загрузки
      if (currentTheme) {
        const themeFiles = await getThemeFiles(currentTheme.id)
        const themeFilesWithType = themeFiles.map((file) => ({
          ...file,
          type: 'theme' as const,
        }))

        let subjectFilesWithType: Array<FileItem> = []
        if (currentSubject) {
          try {
            const subjectFiles = await getSubjectFiles(currentSubject.id)
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

  // Показываем загрузку только если действительно грузим
  if (authLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка профиля...</div>
      </div>
    )
  }

  if (!currentTheme) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)}>
        Выберите тему для отображения файлов
      </div>
    )
  }

  if (loading && files.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-muted-foreground">Загрузка файлов...</div>
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
    <div className={cn('flex flex-col py-2', className)}>
      
      {/* ===== ИНФОРМАЦИОННЫЙ БЛОК ДЛЯ СТУДЕНТОВ ===== */}
      {isStudent && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Режим просмотра</p>
              <p className="text-sm text-blue-600 mt-1">
                Вы студент. Вы можете просматривать файлы, но не загружать новые 
                и не генерировать тесты/конспекты.
              </p>
              <p className="text-xs text-blue-500 mt-2">
                Для получения доступа к генерации обратитесь к преподавателю.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== ИНФОРМАЦИОННЫЙ БЛОК ДЛЯ УЧИТЕЛЕЙ И АДМИНОВ ===== */}
      {isTeacher && !isStudent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">
                {userRole === 'admin' ? 'Режим администратора' : 'Режим преподавателя'}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Вы можете загружать файлы и генерировать учебные материалы.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== СТРОКА ПОИСКА И КНОПКА ЗАГРУЗКИ ===== */}
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder="Поиск файла..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        {/* Кнопка загрузки - доступна учителям и админам */}
        <div className="relative group">
          <Button
            type="button"
            variant={canUploadFiles ? "outline" : "secondary"}
            size="icon"
            onClick={handleUploadClick}
            disabled={!canUploadFiles || uploading}
            className={!canUploadFiles ? 'opacity-50 cursor-not-allowed' : ''}
            title={canUploadFiles ? 'Загрузить файл' : 'Только преподаватели могут загружать файлы'}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== СПИСОК ФАЙЛОВ ===== */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {loading && files.length > 0 && (
          <div className="text-center text-muted-foreground py-2">
            Обновление списка файлов...
          </div>
        )}
        
        {filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground py-8">
            {searchQuery ? 'Файлы не найдены' : 'Файлы не загружены'}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <Button
              key={file.id}
              variant={selectedFiles.includes(file.id) ? 'default' : 'outline'}
              onClick={() => handleToggleFile(file.id)}
              className="justify-start"
              disabled={isStudent} // Студенты не могут выбирать файлы
            >
              <File className="h-4 w-4 mr-2" />
              <span className="truncate flex-1 text-left">{file.name}</span>
              <Badge variant="secondary" className="ml-2 mr-2">
                {file.type === 'theme' ? 'тема' : 'предмет'}
              </Badge>
              {selectedFiles.includes(file.id) && (
                <span className="ml-auto">✓</span>
              )}
            </Button>
          ))
        )}
      </div>
      
      {/* ===== СЧЕТЧИК ВЫБРАННЫХ ФАЙЛОВ ===== */}
      {selectedFiles.length > 0 && isTeacher && (
        <div className="mt-2 text-sm text-muted-foreground">
          Выбрано файлов: {selectedFiles.length}
        </div>
      )}
    </div>
  )
}

export default GenerationFileSelector