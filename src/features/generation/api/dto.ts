export interface GenerateQuizRequest {
  files: Array<string>
  themeId: number
  summaryId?: number
  difficulty: 'easy' | 'medium' | 'hard'
  question_count: number
  question_types: Array<
    | 'multichoice'
    | 'essay'
    | 'matching'
    | 'truefalse'
    | 'shortanswer'
    | 'numerical'
  >
  additional_requirements?: string
}

export interface GenerateQuizResponse {
  success: boolean
  message: string
  quizId: string
}

export interface GenerateSummaryRequest {
  files: Array<string>
  subjectId: number
  themeId: number
  additional_requirements?: string
}

export interface GenerateSummaryResponse {
  success: boolean
  message: string
  summaryId: string
}

export interface GenerateFaqRequest {
  summaryId: number
  title: string
  numQuestions: number
  detailLevel: 'easy' | 'medium' | 'hard'
  additionalRequirements?: string
}

export interface GenerateFaqResponse {
  success: boolean
  message: string
  faqId: string
}
