import { useEffect, useState } from 'react'
import type { Subject } from '@/types/subject'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSubject } from '@/hooks/useSubject'
import { PlusCircle } from 'lucide-react'
import CreateSubjectDialog from './CreateSubjectDialog'

function SubjectSelector() {
  const [subjects, setSubjects] = useState<Array<Subject>>([])
  const [subjectSelected, setSubjectSelected] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { setCurrent } = useSubject()

  const loadSubjects = () => {
    apiClient.getSubjects(searchQuery || undefined).then((data) => {
      setSubjects(data)
    })
  }

  useEffect(() => {
    loadSubjects()
  }, [searchQuery])

  return (
    <div className="flex flex-col">
      <h2 className="text-lg mb-2">Пожалуйста, выберите предмет:</h2>
      <div className="flex flex-row gap-1.5">
        <Input
          type="text"
          placeholder="Поиск предмета..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Button
          className='!border-gray-200'
          variant={'outline'}
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
        >
          <PlusCircle/>
        </Button>
      </div>
      <div className="flex flex-col gap-2 overflow-x-scroll max-h-[30vh]">
        {subjects.map((subject) => (
          <Button
            variant="outline"
            onClick={() => {
              setSubjectSelected(subject.id)
            }}
            key={subject.id}
          >
            {subjectSelected == subject.id && <span>✅</span>}
            <span className="truncate">{subject.name}</span>
          </Button>
        ))}
      </div>
      <Button
        className="max-w-24 mt-2"
        onClick={() => {
          const selectedSubject = subjects.find(
            (subject) => subject.id === subjectSelected,
          )
          if (selectedSubject) {
            setCurrent(selectedSubject)
          }
        }}
      >
        Далее
      </Button>

      <CreateSubjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadSubjects}
      />
    </div>
  )
}

export default SubjectSelector
