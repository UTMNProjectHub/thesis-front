import { useState } from 'react'
import ThemeSelector from '@/widgets/theme-selector/ThemeSelector'
import SubjectSelector from '@/widgets/subject-selector/SubjectSelector'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Separator } from '@/shared/ui/separator'
import { useSubject } from '@/features/subject-selection'
import { useTheme } from '@/features/theme-selection'
import QuizList from '@/widgets/quiz-list/QuizList'
import GenerationFileSelector from '@/widgets/generation-file-selector/GenerationFileSelector'
import SummaryList from '@/widgets/summary-list/SummaryList'
import FaqList from '@/widgets/faq-list/FaqList'

function Generation() {
  const [selectedFiles, setSelectedFiles] = useState<Array<string>>([])
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
        {currentSubject && currentTheme && (
          <GenerationFileSelector
            key={`${currentTheme.id}-${currentSubject.id}`}
            onSelectionChange={setSelectedFiles}
          />
        )}
      </div>

      <Separator orientation="vertical" />
      <div className="flex flex-col w-full py-4 px-2 gap-8">
        <div>
          <h2 className="px-4 text-xl font-semibold">Лекции: </h2>
          <SummaryList selectedFiles={selectedFiles} />
        </div>
        <div>
          <h2 className="px-4 text-xl font-semibold">Тесты: </h2>
          <QuizList selectedFiles={selectedFiles} />
        </div>
        <div>
          <h2 className="px-4 text-xl font-semibold">FAQ: </h2>
          <FaqList />
        </div>
      </div>
    </div>
  )
}

export default Generation
