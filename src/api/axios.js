import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests - MEJORADO
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - MEJORADO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Evitar redirección infinita
      if (router.currentRoute.path !== '/login') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api