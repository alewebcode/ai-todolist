import axios from 'axios'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ocorreu um erro inesperado. Tente novamente.'

    if (typeof window !== 'undefined') {
      toast.error(message)
    }
    return Promise.reject(error)
  }
)
