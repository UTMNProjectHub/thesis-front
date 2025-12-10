import ThemeSelector from '@/components/widgets/ThemeSelector/ThemeSelector'
import SubjectSelector from '@/components/widgets/SubjectSelector/SubjectSelector'
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

function Generation() {
  const { clearCurrent: clearCurrentSubject, current: currentSubject } =
    useSubject()
  const { clearCurrent: clearCurrentTheme, current: currentTheme } = useTheme()

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
