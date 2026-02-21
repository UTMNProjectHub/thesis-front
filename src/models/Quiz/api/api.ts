import type {
  MatchingConfig,
  Question,
  QuestionVariant,
  Quiz,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  UpdateQuestionRequest,
  UpdateQuestionVariant,
  UpdateQuizRequest,
} from './dto'
import apiClient from '@/lib/api-client'

export const getQuizById = async (quizId: string): Promise<Quiz> => {
  const response = await apiClient.client.get<Quiz>(`/quizes/${quizId}`)
  return response.data
}

export const getQuizesByThemeId = async (themeId: number): Promise<Array<Quiz>> => {
  const response = await apiClient.client.get<Array<Quiz>>(`/theme/${themeId}/quizes`)
  return response.data
}

export const getQuizQuestions = async (
  quizId: string,
  sessionId?: string,
  view?: boolean,
): Promise<Array<Question>> => {
  const headers: Record<string, string> = {}
  if (sessionId) {
    headers['X-Active-Session'] = sessionId
  }
  const response = await apiClient.client.get<Array<Question>>(
    `/quizes/${quizId}/questions`,
    { headers, params: view ? { view: true } : undefined },
  )
  return response.data
}

export const submitQuestionAnswer = async (
  questionId: string,
  data: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> => {
  const response = await apiClient.client.post<SubmitAnswerResponse>(
    `/questions/${questionId}/solve`,
    data,
  )
  return response.data
}

export const updateQuiz = async (quizId: string, data: UpdateQuizRequest): Promise<Quiz> => {
  const response = await apiClient.client.put<Quiz>(`/quizes/${quizId}`, data)
  return response.data
}

export const getQuestion = async (
  questionId: string,
): Promise<Question & { variants: Array<QuestionVariant>; matchingConfig?: MatchingConfig }> => {
  const response = await apiClient.client.get<
    Question & { variants: Array<QuestionVariant>; matchingConfig?: MatchingConfig }
  >(`/questions/${questionId}`)
  return response.data
}

export const updateQuestion = async (
  questionId: string,
  data: UpdateQuestionRequest,
): Promise<Question> => {
  const response = await apiClient.client.put<Question>(`/questions/${questionId}`, data)
  return response.data
}

export const updateQuestionVariants = async (
  questionId: string,
  variants: Array<UpdateQuestionVariant>,
): Promise<void> => {
  await apiClient.client.put(`/questions/${questionId}/variants`, { variants })
}

export const updateQuestionMatchingConfig = async (
  questionId: string,
  matchingConfig: MatchingConfig,
): Promise<void> => {
  await apiClient.client.put(`/questions/${questionId}/matching-config`, {
    matchingConfig,
  })
}

export const deleteQuiz = async (id: string): Promise<void> => {
  await apiClient.client.delete(`/quizes/${id}`)
}
