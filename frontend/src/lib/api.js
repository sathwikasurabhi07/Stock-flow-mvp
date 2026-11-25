import axios from 'axios'

export const TOKEN_KEY = 'stockflow_token'
export const EMAIL_KEY = 'stockflow_email'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://stock-flow-mvp.onrender.com',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMAIL_KEY)
      window.dispatchEvent(new Event('stockflow:session-expired'))
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join('. ') || fallback
  }
  return error.message === 'Network Error'
    ? 'Could not reach StockFlow. Check that the API is running.'
    : fallback
}

export default api
