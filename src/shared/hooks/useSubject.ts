import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject } from '@/models/Subject'

interface SubjectState {
  current: Subject | null
  setCurrent: (subject: Subject) => void
  clearCurrent: () => void
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set) => ({
      current: null,
      setCurrent: (subject: Subject) => set({ current: subject }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: 'subject-storage', // уникальное имя для localStorage
    }
  )
)

export const useSubject = () => {
  const { current, setCurrent, clearCurrent } = useSubjectStore()

  return {
    current,
    setCurrent,
    clearCurrent,
  }
}
