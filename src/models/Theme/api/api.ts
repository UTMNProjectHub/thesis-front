import type { SubjectFile, Theme } from './dto'
import apiClient from '@/lib/api-client'

export const getThemeById = async (themeId: number): Promise<Theme> => {
  const response = await apiClient.client.get<Theme>(`/theme/${themeId}`)
  return response.data
}

export const getThemeFiles = async (themeId: number): Promise<Array<SubjectFile>> => {
  const response = await apiClient.client.get<Array<SubjectFile>>(`/theme/${themeId}/files`)
  return response.data
}

export const uploadFileToTheme = async (themeId: number, file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)

  await apiClient.client.post(`/theme/${themeId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
