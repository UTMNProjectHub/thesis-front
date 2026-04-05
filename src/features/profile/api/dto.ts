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
