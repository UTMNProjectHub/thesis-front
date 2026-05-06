
// ========== USERS ==========
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  date_created: string | null
  usersToRoles: Array<{
    role: {
      id: number
      title: string
      slug: string
      description: string | null
      date_created: string | null
    }
  }>
}

export interface UpdateUserRoleRequest {
  userId: string
  roleId: number
}

export interface UpdateUserRoleResponse {
  success: boolean
}

export interface DeleteUserResponse {
  success: boolean
}

// ========== ROLES ==========
export interface Role {
  id: number
  title: string
  slug: string
  description: string | null
  date_created: string | null
}

// ========== SUBJECTS ==========
export interface Subject {
  id: number
  name: string
  shortName: string
  description: string | null
  yearStart: number
  yearEnd: number
}

export interface CreateSubjectRequest {
  name: string
  shortName: string
  yearStart: number
  yearEnd: number
  description?: string
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {
  id: number
}

export interface DeleteSubjectResponse {
  success: boolean
}

// ========== THEMES ==========
export interface Theme {
  id: number
  name: string
  description: string | null
  subjectId: number
  subject?: Subject
}

export interface CreateThemeRequest {
  name: string
  description?: string
  subjectId: number
}

export interface UpdateThemeRequest extends CreateThemeRequest {
  id: number
}

export interface DeleteThemeResponse {
  success: boolean
}

// ========== STATS ==========
export interface Stats {
  users: number
  subjects: number
  themes: number
  quizes: number
  summaries: number
  recentActivity?: Array<{
    id: string
    type: string
    createdAt: string
    user: { email: string }
  }>
}

export interface ActivityPoint {
  day: string;
  активность: number;
}

export interface ContentItem {
  name: string;
  value: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface DetailedStats {
  activityByDay: ActivityPoint[];
  contentDistribution: ContentItem[];
  userGrowth: UserGrowthPoint[];
}

// ========== PERMISSIONS ==========
export interface Permission {
  id: number
  title: string
  slug: string
  description: string | null
  date_created: string | null
}

// ========== QUIZES ==========
export interface Quiz {
  id: string
  type: string
  name: string
  description: string
  maxSessions: number
  themeId: number | null
  theme?: {
    id: number
    name: string
    subject?: {
      id: number
      name: string
      shortName: string
    }
  }
  quizesQuestions: Array<{
    id: string
    questionId: string
  }>
  usersQuizes: Array<{
    id: number
    userId: string
  }>
}

// ========= SUMMARIES ============
export interface Summary {
  id: number
  subjectId: number | null
  themeId: number | null
  fileId: string
  subject?: {
    id: number
    name: string
    shortName: string
  }
  theme?: {
    id: number
    name: string
  }
  file: {
    id: string
    name: string
    s3Index: string
  }
}