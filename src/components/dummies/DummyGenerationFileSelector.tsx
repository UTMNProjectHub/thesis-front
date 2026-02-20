import { useState } from 'react'
import { File, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const FAKE_FILES = [
  { id: '1', name: 'Лекция_1_Введение.pdf', type: 'theme' as const },
  { id: '2', name: 'Лекция_2_Основы.pdf', type: 'theme' as const },
  { id: '3', name: 'Практика_1.docx', type: 'theme' as const },
  { id: '4', name: 'Учебник_глава_3.pdf', type: 'subject' as const },
  { id: '5', name: 'Методичка.pdf', type: 'subject' as const },
]

interface DummyGenerationFileSelectorProps {
  className?: string
}

function DummyGenerationFileSelector({ className }: DummyGenerationFileSelectorProps) {
  const [selectedFiles, setSelectedFiles] = useState<Array<string>>(
    FAKE_FILES.map((f) => f.id),
  )
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFiles = FAKE_FILES.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
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
          title="Загрузить файл"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {filteredFiles.map((file) => (
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
              <span className="ml-auto">&#10003;</span>
            )}
          </Button>
        ))}
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Выбрано файлов: {selectedFiles.length}
        </div>
      )}
    </div>
  )
}

export default DummyGenerationFileSelector
