export { updateProfile, changePassword } from './api/api'
export type { UpdateProfileRequest, ChangePasswordRequest, ChangePasswordResponse } from './api/dto'
export { useUpdateProfile, useChangePassword } from './api/mutations'

// Re-export useUser as useProfile for backwards compatibility
export { useUser as useProfile } from '@/entities/user'
