import { useQuery } from '@tanstack/react-query'
import { getSubjectFiles, getSubjects, getThemesBySubjectId } from './api'
import { subjectKeys } from './keys'
import { getThemeFiles } from '@/entities/theme'
import apiClient from '@/shared/api/api-client'

export function useSubjects(q?: string) {
  return useQuery({
    queryKey: subjectKeys.list(q),
    queryFn: () => getSubjects(q),
    enabled: apiClient.isAuthenticated(),
  })
}

export function useThemesBySubject(subjectId: number | undefined, q?: string) {
  return useQuery({
    queryKey: subjectKeys.themes(subjectId!, q),
    queryFn: () => getThemesBySubjectId(subjectId!, q),
    enabled: !!subjectId && apiClient.isAuthenticated(),
  })
}

export function useSubjectFiles(subjectId: number | undefined) {
  return useQuery({
    queryKey: subjectKeys.files(subjectId!),
    queryFn: () => getSubjectFiles(subjectId!),
    enabled: !!subjectId && apiClient.isAuthenticated(),
  })
}

export function useThemeFiles(themeId: number | undefined) {
  return useQuery({
    queryKey: subjectKeys.themeFiles(themeId!),
    queryFn: () => getThemeFiles(themeId!),
    enabled: !!themeId && apiClient.isAuthenticated(),
  })
}
