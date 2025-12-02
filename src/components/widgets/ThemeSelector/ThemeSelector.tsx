import { useEffect, useState } from 'react'
import type { Theme } from '@/types/subject'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSubject } from '@/hooks/useSubject'
import { useTheme } from '@/hooks/useTheme'

function ThemeSelector() {
  const [themes, setThemes] = useState<Array<Theme>>([])
  const [themeSelected, setThemeSelected] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { current: currentSubject } = useSubject()
  const { setCurrent } = useTheme()

  useEffect(() => {
    if (currentSubject) {
      apiClient
        .getThemesBySubjectId(
          currentSubject?.id,
          searchQuery || undefined,
        )
        .then((data) => {
          setThemes(data)
        })
    }
  }, [currentSubject, searchQuery])

  return (
    <div className="flex flex-col">
      <h2 className="text-lg mb-2">Пожалуйста, выберите тему:</h2>
      <Input
        type="text"
        placeholder="Поиск темы..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-2"
      />
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
    </div>
  )
}

export default ThemeSelector
