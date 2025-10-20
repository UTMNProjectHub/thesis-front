import { useEffect, useState } from 'react'
import type { Subject } from '@/types/subject'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { useSubject } from '@/hooks/useSubject'

function SubjectSelector() {
  const [subjects, setSubjects] = useState<Array<Subject>>([])
  const [subjectSelected, setSubjectSelected] = useState<Number>(0)
  const { setCurrent } = useSubject()

  useEffect(() => {
    apiClient.getSubjects().then((data) => {
      setSubjects(data)
    })
  }, [])

  return (
    <div className="flex flex-col">
      <h2 className="text-lg mb-2">Пожалуйста, выберите предмет:</h2>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh]">
        {subjects.map((subject) => (
          <Button
            variant="outline"
            onClick={() => {
              setSubjectSelected(subject.id)
            }}
            key={subject.id}
          >
            {subjectSelected == subject.id && <span>✅</span>}
            {subject.name}
          </Button>
        ))}
      </div>
      <Button 
          className="max-w-24 mt-2"
          onClick={() => {
            const selectedSubject = subjects.find(subject => subject.id === subjectSelected)
            if (selectedSubject) {
              setCurrent(selectedSubject)
            }
          }}
        >
          Далее
        </Button>
    </div>
  )
}

export default SubjectSelector
