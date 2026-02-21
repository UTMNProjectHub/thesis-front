import type { Subject, SubjectFile, Theme } from './dto'
import apiClient from '@/lib/api-client'

export const getSubjects = async (q?: string): Promise<Array<Subject>> => {
  const response = await apiClient.client.get<Array<Subject>>('/subject/all', {
    params: q ? { q } : undefined,
  })
  return response.data
}

export const createSubject = async (data: {
  name: string
  shortName: string
  yearStart: number
  yearEnd: number
  description?: string | null
}): Promise<void> => {
  await apiClient.client.post('/subject', data)
}

export const getSubjectById = async (subjectId: number): Promise<Subject> => {
  const response = await apiClient.client.get<Subject>(`/subject/${subjectId}`)
  return response.data
}

export const getSubjectFiles = async (subjectId: number): Promise<Array<SubjectFile>> => {
  const response = await apiClient.client.get<Array<SubjectFile>>(`/subject/${subjectId}/files`)
  return response.data
}

export const uploadFileToSubject = async (subjectId: number, file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)

  await apiClient.client.post(`/subject/${subjectId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getThemesBySubjectId = async (
  subjectId: number,
  q?: string,
): Promise<Array<Theme>> => {
  const response = await apiClient.client.get<Array<Theme>>(
    `/subject/${subjectId}/themes`,
    {
      params: q ? { q } : undefined,
    },
  )
  return response.data
}

export const createTheme = async (
  subjectId: number,
  data: {
    name: string
    description?: string | null
  },
): Promise<void> => {
  await apiClient.client.post(`/subject/${subjectId}/themes`, data)
}
