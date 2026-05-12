import type {
  GenerateFaqRequest,
  GenerateFaqResponse,
  GenerateQuizRequest,
  GenerateQuizResponse,
  GenerateSummaryRequest,
  GenerateSummaryResponse,
} from './dto'
import apiClient from '@/shared/api/api-client'

export const generateQuiz = async (data: GenerateQuizRequest): Promise<GenerateQuizResponse> => {
  const response = await apiClient.client.post<GenerateQuizResponse>('/generation/quiz', data)
  return response.data
}

export const generateSummary = async (data: GenerateSummaryRequest): Promise<GenerateSummaryResponse> => {
  const response = await apiClient.client.post<GenerateSummaryResponse>('/generation/summary', data)
  return response.data
}

export const generateFaq = async (data: GenerateFaqRequest): Promise<GenerateFaqResponse> => {
  const response = await apiClient.client.post<GenerateFaqResponse>('/generation/faq', data)
  return response.data
}
