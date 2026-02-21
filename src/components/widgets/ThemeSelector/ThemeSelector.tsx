import { useEffect, useState } from 'react'
import { CirclePlus } from 'lucide-react'
import CreateThemeDialog from './CreateThemeDialog'
import type { Theme } from '@/models/Subject'
import { getThemesBySubjectId } from '@/models/Subject'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSubject } from '@/hooks/useSubject'
import { useTheme } from '@/hooks/useTheme'

function ThemeSelector() {
  const [themes, setThemes] = useState<Array<Theme>>([])
  const [themeSelected, setThemeSelected] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { current: currentSubject } = useSubject()
  const { setCurrent } = useTheme()

  const loadThemes = () => {
    if (currentSubject) {
      getThemesBySubjectId(
          currentSubject.id,
          searchQuery || undefined,
        )
        .then((data) => {
          setThemes(data)
        })
    }
  }

  useEffect(() => {
    loadThemes()
  }, [currentSubject, searchQuery])

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
        {themes.map((theme) => (
          <Button
            variant="outline"
            onClick={() => {
              setThemeSelected(theme.id)
            }}
            key={theme.id}
          >
            {themeSelected == theme.id && <span>✅</span>}
            <span className="truncate">{theme.name}</span>
          </Button>
        ))}
      </div>
      <Button 
          className="max-w-24 mt-2"
          onClick={() => {
            const selectedTheme = themes.find(theme => theme.id === themeSelected)
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
          onSuccess={loadThemes}
        />
      )}
    </div>
  )
}

export default ThemeSelector
