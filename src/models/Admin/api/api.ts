
import type {
  User,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
  DeleteUserResponse,
  Role,
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  DeleteSubjectResponse,
  Theme,
  CreateThemeRequest,
  UpdateThemeRequest,
  DeleteThemeResponse,
  Stats,
  Permission,
  Quiz,
  Summary,
  DetailedStats,
} from './dto'
import apiClient from '@/shared/lib/api-client'

// ========== USERS ==========
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.client.get<User[]>('/admin/users')
  return response.data
}

export const updateUserRole = async (data: UpdateUserRoleRequest): Promise<UpdateUserRoleResponse> => {
  const response = await apiClient.client.put<UpdateUserRoleResponse>(
    `/admin/users/${data.userId}/role`,
    { roleId: data.roleId }
  )
  return response.data
}

export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
  const response = await apiClient.client.delete<DeleteUserResponse>(`/admin/users/${userId}`)
  return response.data
}

// ========== ROLES ==========
export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.client.get<Role[]>('/roles')
  return response.data
}

// ========== SUBJECTS ==========
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.client.get<Subject[]>('/admin/subjects')
  return response.data
}

export const createSubject = async (data: CreateSubjectRequest): Promise<Subject> => {
  const response = await apiClient.client.post<Subject>('/admin/subjects', data)
  return response.data
}

export const updateSubject = async (data: { id: number; name: string; shortName: string; yearStart: number; yearEnd: number; description?: string }): Promise<Subject> => {
  const { id, ...body } = data;
  const response = await apiClient.client.put<Subject>(`/admin/subjects/${id}`, body);
  return response.data;
};

export const deleteSubject = async (id: number): Promise<DeleteSubjectResponse> => {
  const response = await apiClient.client.delete<DeleteSubjectResponse>(`/admin/subjects/${id}`)
  return response.data
}

// ========== THEMES ==========
export const getThemes = async (): Promise<Theme[]> => {
  const response = await apiClient.client.get<Theme[]>('/admin/themes')
  return response.data
}

export const createTheme = async (data: CreateThemeRequest): Promise<Theme> => {
  const response = await apiClient.client.post<Theme>('/admin/themes', data)
  return response.data
}

export const updateTheme = async (data: { id: number; name: string; description?: string; subjectId: number }) => {
  const { id, ...body } = data;
  const response = await apiClient.client.put(`/admin/themes/${id}`, body);
  return response.data;
};

export const deleteTheme = async (id: number): Promise<DeleteThemeResponse> => {
  const response = await apiClient.client.delete<DeleteThemeResponse>(`/admin/themes/${id}`)
  return response.data
}

// ========== STATS ==========
export const getStats = async (): Promise<Stats> => {
  const response = await apiClient.client.get<Stats>('/admin/stats')
  return response.data
}

export const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await apiClient.client.get('/admin/statistics/details');
  return response.data;
};

// ========== PERMISSIONS ==========
export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.client.get<Permission[]>('/permissions')
  return response.data
}

// ========= QUIZES ============
export const getAllQuizes = async (): Promise<Quiz[]> => {
  const response = await apiClient.client.get<Quiz[]>('/admin/quizes')
  return response.data
}

// =============== SUMMARIES ===========

export const getAllSummaries = async (): Promise<Summary[]> => {
  const response = await apiClient.client.get<Summary[]>('/admin/summaries')
  return response.data
}