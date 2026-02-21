export {
  getQuizById,
  getQuizesByThemeId,
  getQuizQuestions,
  submitQuestionAnswer,
  updateQuiz,
  getQuestion,
  updateQuestion,
  updateQuestionVariants,
  updateQuestionMatchingConfig,
  deleteQuiz,
} from './api/api'
export type {
  Quiz,
  Question,
  QuestionVariant,
  MatchingConfig,
  MatchingLeftItem,
  MatchingRightItem,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  MultichoiceAnswerResponse,
  MatchingAnswerResponse,
  ShortAnswerResponse,
  SubmittedVariant,
  MatchingPair,
  Variant,
  ChosenVariant,
  SubmittedAnswer,
  SessionSubmit,
  UpdateQuizRequest,
  UpdateQuestionRequest,
  UpdateQuestionVariant,
} from './api/dto'
export { quizKeys } from './api/keys'
export { useQuiz, useQuizQuestions } from './api/query'
export {
  useSubmitAnswer,
  useUpdateQuiz,
  useUpdateQuestion,
  useUpdateQuestionVariants,
  useUpdateQuestionMatchingConfig,
} from './api/mutations'
export { QuizType } from './const'
