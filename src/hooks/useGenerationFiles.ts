import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GenerationFilesState {
  selectedFiles: Array<string>
  setSelectedFiles: (files: Array<string>) => void
  addFile: (fileId: string) => void
  removeFile: (fileId: string) => void
  clearSelectedFiles: () => void
}

export const useGenerationFilesStore = create<GenerationFilesState>()(
  persist(
    (set) => ({
      selectedFiles: [],
      setSelectedFiles: (files) => set({ selectedFiles: files }),
      addFile: (fileId) =>
        set((state) => {
          if (state.selectedFiles.includes(fileId)) {
            return state
          }
          return { selectedFiles: [...state.selectedFiles, fileId] }
        }),
      removeFile: (fileId) =>
        set((state) => ({
          selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
        })),
      clearSelectedFiles: () => set({ selectedFiles: [] }),
    }),
    {
      name: 'generation-files-storage',
    },
  ),
)

export const useGenerationFiles = () => {
  const {
    selectedFiles,
    setSelectedFiles,
    addFile,
    removeFile,
    clearSelectedFiles,
  } = useGenerationFilesStore()

  return {
    selectedFiles,
    setSelectedFiles,
    addFile,
    removeFile,
    clearSelectedFiles,
  }
}

