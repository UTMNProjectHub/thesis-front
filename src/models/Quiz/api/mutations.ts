import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  submitQuestionAnswer,
  updateQuestion,
  updateQuestionMatchingConfig,
  updateQuestionVariants,
  updateQuiz,
} from './api'
import { quizKeys } from './keys'
import type {
  MatchingConfig,
  SubmitAnswerRequest,
  UpdateQuestionRequest,
  UpdateQuestionVariant,
  UpdateQuizRequest,
} from './dto'

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string
      data: SubmitAnswerRequest
    }) => submitQuestionAnswer(questionId, data),
    onError: (error) => {
      console.error('Submit answer error:', error)
    },
  })
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quizId,
      data,
    }: {
      quizId: string
      data: UpdateQuizRequest
    }) => updateQuiz(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.quiz(variables.quizId),
      })
    },
    onError: (error) => {
      console.error('Update quiz error:', error)
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string
      data: UpdateQuestionRequest
    }) => updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question error:', error)
    },
  })
}

export function useUpdateQuestionVariants() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      variants,
    }: {
      questionId: string
      variants: Array<UpdateQuestionVariant>
    }) => updateQuestionVariants(questionId, variants),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question variants error:', error)
    },
  })
}

export function useUpdateQuestionMatchingConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      matchingConfig,
    }: {
      questionId: string
      matchingConfig: MatchingConfig
    }) => updateQuestionMatchingConfig(questionId, matchingConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.all,
      })
    },
    onError: (error) => {
      console.error('Update question matching config error:', error)
    },
  })
}
