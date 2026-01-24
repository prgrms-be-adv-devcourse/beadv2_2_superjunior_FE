import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // 프록시를 통해 요청
  timeout: 10000,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const memberId = localStorage.getItem('member_id')
  if (memberId) {
    config.headers = {
      ...config.headers,
      'X-Member-Id': memberId
    }
  }
  return config
})

export default api


