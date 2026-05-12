import apiClient from '@/shared/api/api-client'

export const deleteFile = async (id: string) => {
  const response = await apiClient.client.delete(`/file/${id}`)

  return response.data
}
