export interface Quiz {
  id: string
  type: string
  name: string
  description: string
  themeId: number | null
  questionCount: number
  maxSessions: number
}

export interface MatchingLeftItem {
  id: string
  text: string
  explainRight?: string
  explainWrong?: string
}

export interface MatchingRightItem {
  id: string
  text: string
  explainRight?: string
  explainWrong?: string
}

export interface Question {
  id: string
  type: string
  multiAnswer: boolean | null
  text: string
  variants?: QuestionVariant[]
  matchingLeftItems?: MatchingLeftItem[]
  matchingRightItems?: MatchingRightItem[]
}

export interface QuestionVariant {
  id: string
  text: string
  explainRight: string
  explainWrong: string
  isRight: boolean
  questionId: string
  variantId: string
  questionsVariantsId: string
}

export interface SubmittedVariant {
  id: string
  variantText: string
  isRight: boolean
  explanation: string
}

export interface MatchingPair {
  key: string
  value: string
  isRight: boolean
  explanation: string | null
}

export interface Variant {
  id: string
  text: string
  explainRight: string
  explainWrong: string
}

export interface ChosenVariant {
  id: string
  questionId: string
  variantId: string
  isRight: boolean
  variant: Variant
}

export interface SubmittedAnswer {
  id: string
  userId?: string
  quizId: string
  questionId: string
  chosenId: string | null
  answer: any | null
  isRight: boolean | null
  chosenVariant?: ChosenVariant | null
}

export interface SubmitAnswerRequest {
  quizId: string
  answerIds?: string[]
  answerText?: string
}

// Response for multichoice questions
export interface MultichoiceAnswerResponse {
  question: Question
  submittedVariants: SubmittedVariant[]
  allVariants: QuestionVariant[]
}

// Response for matching questions
export interface MatchingAnswerResponse {
  question: Question
  submittedAnswer: SubmittedAnswer
  isRight: boolean | null
  pairs: MatchingPair[]
  variants: QuestionVariant[]
  explanation?: string | null
}

// Response for shortanswer/essay/numerical questions
export interface ShortAnswerResponse {
  question: Question
  submittedAnswer: SubmittedAnswer
  isRight: boolean | null
  explanation: string | null
  variants: QuestionVariant[]
  pairs?: MatchingPair[]
}

export type SubmitAnswerResponse =
  | MultichoiceAnswerResponse
  | MatchingAnswerResponse
  | ShortAnswerResponse

export interface SessionSubmit {
  id: string
  sessionId: string
  submitId: string
  submit: SubmittedAnswer
}

// Тип для submit из эндпоинта /sessions/:sessionId/submits
export type SessionSubmitWithDetails = SubmittedAnswer

export interface Session {
  id: string
  quizId: string
  userId: string
  timeStart: string | Date | null
  timeEnd: string | Date | null
  quiz?: Quiz
  sessionSubmits?: any[]
}

export interface QuizUserSession {
  userId: string;
  fullName: string;
  email: string;
  sessions: Array<{
    id: string;
    timeStart: Date;
    timeEnd: Date | null;
    percentSolved: number;
    percentRight: number;
  }>;
}

export interface UpdateQuizRequest {
  name?: string
  description?: string
  type?: string
  maxSessions?: number
  themeId?: number | null
}

export interface UpdateQuestionRequest {
  text?: string
  type?: string
  multiAnswer?: boolean | null
}

export interface UpdateQuestionVariant {
  text: string
  explainRight: string
  explainWrong: string
  isRight: boolean
}

