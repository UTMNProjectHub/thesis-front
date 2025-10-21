import ThemeSelector from './left/ThemeSelector'
import GenerationSkeleton from './right/GenerationSkeleton'
import SubjectSelector from './left/SubjectSelector'
import GenerationButtons from './right/GenerationButtons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { useSubject } from '@/hooks/useSubject'
import { useTheme } from '@/hooks/useTheme'

function Generation() {
  const { clearCurrent: clearCurrentSubject, current: currentSubject } =
    useSubject()
  const { clearCurrent: clearCurrentTheme, current: currentTheme } = useTheme()

  return (
    <div className="flex h-full">
      <div className="flex flex-col py-2 px-4">
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
      </div>

      <Separator orientation="vertical" />
      <div className="flex flex-col w-full py-4 px-2">
        <GenerationSkeleton />
        <GenerationButtons />
      </div>
    </div>
  )
}

export default Generation
