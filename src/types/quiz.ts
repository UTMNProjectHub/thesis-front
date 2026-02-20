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
}

export interface MatchingRightItem {
  id: string
  text: string
}

export interface MatchingConfig {
  leftItems: Array<MatchingLeftItem>
  rightItems: Array<MatchingRightItem>
  correctPairs: Array<{
    leftVariantId: string
    rightVariantId: string
    explainRight?: string
    explainWrong?: string
  }>
}

export interface Question {
  id: string
  type: string
  multiAnswer: boolean | null
  text: string
  variants?: Array<QuestionVariant>
  matchingLeftItems?: Array<MatchingLeftItem>
  matchingRightItems?: Array<MatchingRightItem>
  matchingConfig?: MatchingConfig
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
  variantId: string
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
  answerIds?: Array<string>
  answerText?: string
}

// Response for multichoice questions
export interface MultichoiceAnswerResponse {
  question: Question
  submittedVariants: Array<SubmittedVariant>
  allVariants: Array<QuestionVariant>
}

// Response for matching questions
export interface MatchingAnswerResponse {
  question: Question
  submittedAnswer: SubmittedAnswer
  isRight: boolean | null
  pairs: Array<MatchingPair>
  variants: Array<QuestionVariant>
  explanation?: string | null
}

// Response for shortanswer/essay/numerical questions
export interface ShortAnswerResponse {
  question: Question
  submittedAnswer: SubmittedAnswer
  isRight: boolean | null
  explanation: string | null
  variants: Array<QuestionVariant>
  pairs?: Array<MatchingPair>
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
  sessionSubmits?: Array<any>
}

export interface QuizUserSessionItem {
  id: string;
  timeStart: Date;
  timeEnd: Date | null;
  percentSolved: number;
  percentRight: number;
}

export interface QuizUserSession {
  userId: string;
  fullName: string;
  email: string;
  sessions: Array<QuizUserSessionItem>;
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

