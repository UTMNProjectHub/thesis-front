import ThemeSelector from '@/widgets/theme-selector/ThemeSelector'
import SubjectSelector from '@/widgets/subject-selector/SubjectSelector'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { useSubject } from '@/hooks/useSubject'
import { useTheme } from '@/hooks/useTheme'
import QuizList from '@/components/widgets/QuizList/QuizList'
import GenerationFileSelector from '@/components/widgets/GenerationFileSelector/GenerationFileSelector'
import SummaryList from '@/components/widgets/SummaryList/SummaryList'
import { useAuth } from '@/hooks/useAuth' 
import { Shield } from 'lucide-react'

function Generation() {
  const { clearCurrent: clearCurrentSubject, current: currentSubject } =
    useSubject()
  const { clearCurrent: clearCurrentTheme, current: currentTheme } = useTheme()

  const { user, isLoading } = useAuth()
  const userRole = user?.roles?.[0]?.slug

  const canAccessGeneration = (userRole === 'admin') || (userRole === 'teacher')

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }
    
  if (!canAccessGeneration) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 text-lg mb-1">
                Доступ запрещен
              </h3>
              <p className="text-red-600 mb-2">
                Страница генерации учебных материалов доступна только преподавателям и администратору.
              </p>
              <p className="text-sm text-red-500">
                Если вы преподаватель и видите это сообщение, 
                обратитесь к администратору для настройки прав.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col py-2 px-4 max-w-[30%]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <a
                onClick={() => {
                  clearCurrentSubject()
                  clearCurrentTheme()
                }}
              >
                Домой
              </a>
            </BreadcrumbItem>
            {currentSubject && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <a onClick={() => clearCurrentTheme()}>
                    {currentSubject.shortName}
                  </a>
                </BreadcrumbItem>
              </>
            )}
            {currentTheme && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>{currentTheme.name}</BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {!currentSubject && <SubjectSelector />}
        {currentSubject && !currentTheme && <ThemeSelector />}
        {currentSubject && currentTheme && <GenerationFileSelector />}
      </div>

      <Separator orientation="vertical" />
      <div className="flex flex-col w-full py-4 px-2 gap-8">
        <div>
          <h2 className="px-4 text-xl font-semibold">Тесты: </h2>
          <QuizList />
        </div>
        <div>
          <h2 className="px-4 text-xl font-semibold">Конспекты: </h2>
          <SummaryList />
        </div>
      </div>
    </div>
  )
}

export default Generation
