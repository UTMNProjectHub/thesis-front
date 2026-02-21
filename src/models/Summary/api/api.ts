import type { Summary } from './dto'
import apiClient from '@/lib/api-client'

export const getSummariesByThemeId = async (themeId: number): Promise<Array<Summary>> => {
  const response = await apiClient.client.get<Array<Summary>>(
    `/theme/${themeId}/summaries`,
  )
  return response.data
}

export const deleteSummary = async (id: string): Promise<void> => {
  await apiClient.client.delete(`/summaries/${id}`)
}
