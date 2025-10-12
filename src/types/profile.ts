export interface ProfileResponse {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  date_created: string | null
}

export interface UpdateProfileRequest {
  email: string
  full_name: string
}

export interface ChangePasswordRequest {
  password: string
  new_password: string
}

export interface ChangePasswordResponse {
  message: string
}
