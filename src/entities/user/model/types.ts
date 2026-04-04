export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string
  date_created: string | null
}

export interface ProfileResponse {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  date_created: string | null
  roles: Array<{
    id: number
    title: string
    slug: string
    description: string | null
    date_created: string | null
  }>
}
