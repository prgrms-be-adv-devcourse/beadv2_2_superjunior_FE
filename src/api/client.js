import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // 프록시를 통해 요청
  timeout: 10000,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // 토큰 만료 처리 (목업)
      // 실제 구현 시 refresh 토큰 로직 고려
      localStorage.removeItem('access_token')
    }
    return Promise.reject(err)
  }
)

export default api


