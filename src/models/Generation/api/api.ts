import type {
  GenerateQuizRequest,
  GenerateQuizResponse,
  GenerateSummaryRequest,
  GenerateSummaryResponse,
} from './dto'
import apiClient from '@/lib/api-client'

export const generateQuiz = async (data: GenerateQuizRequest): Promise<GenerateQuizResponse> => {
  const response = await apiClient.client.post<GenerateQuizResponse>('/generation/quiz', data)
  return response.data
}

export const generateSummary = async (data: GenerateSummaryRequest): Promise<GenerateSummaryResponse> => {
  const response = await apiClient.client.post<GenerateSummaryResponse>('/generation/summary', data)
  return response.data
}
