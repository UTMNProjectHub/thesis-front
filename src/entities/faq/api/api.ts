import type { Faq } from './dto'
import apiClient from '@/shared/api/api-client'

export const getFaqsByThemeId = async (themeId: number): Promise<Array<Faq>> => {
  const response = await apiClient.client.get<Array<Faq>>(`/theme/${themeId}/faqs`)
  return response.data
}

export const getFaqLink = async (id: string): Promise<string> => {
  const response = await apiClient.client.get<string>(`/faqs/${id}`)
  return response.data
}

export const deleteFaq = async (id: string): Promise<void> => {
  await apiClient.client.delete(`/faqs/${id}`)
}
