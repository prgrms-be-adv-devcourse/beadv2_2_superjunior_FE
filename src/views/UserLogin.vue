<template>
  <main class="login-page">
    <div class="container">
      <div class="login-card">
        <div class="login-header">
          <div class="brand">
            <img src="/favicon-design2.svg" alt="공구공구" class="brand-icon" />
            <span class="brand-text">0909</span>
          </div>
        </div>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">이메일</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>로그인 상태 유지</span>
            </label>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
          <div class="divider">
            <span>또는</span>
          </div>
          <button type="button" class="btn btn-social btn-google" @click="handleGoogleLogin">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
              <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
              <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54756 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
              <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
            </svg>
            <span>Google로 간편 로그인</span>
          </button>
          <div class="signup-link">
            <span>계정이 없으신가요?</span>
            <router-link to="/register">회원가입</router-link>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api/axios'
import { authAPI } from '@/api/auth'

const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleGoogleLogin = () => {
  window.location.href = 'https://0982.store/oauth2/authorization/google'
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    // 🔥 Cookie 기반 인증이면 토큰 저장 불필요
    const response = await authApi.post('/auth/login', {
      email: form.value.email,
      password: form.value.password,
    })
    
    console.log('로그인 성공:', response.data)
    
    // 쿠키 확인 (디버깅용)
    console.log('현재 쿠키:', document.cookie)
    console.log('응답 헤더:', response.headers)
    
    // set-cookie 헤더 확인 (HttpOnly 쿠키는 document.cookie에서 보이지 않음)
    const setCookieHeader = response.headers['set-cookie']
    if (setCookieHeader) {
      console.log('✅ Set-Cookie 헤더:', setCookieHeader)
    } else {
      console.warn('⚠️ Set-Cookie 헤더가 없습니다!')
    }
    
    // AxiosHeaders의 getSetCookie 메서드 사용
    try {
      const cookies = response.headers.getSetCookie?.() || response.headers['set-cookie']
      console.log('쿠키 배열:', cookies)
    } catch (e) {
      console.log('쿠키 확인 오류:', e)
    }
    
    // 사용자 정보 저장 (로그인 응답에 없을 수 있어 프로필 API로 보강)
    if (response.data.email) {
      localStorage.setItem('user_email', response.data.email)
    }
    if (response.data.role) {
      localStorage.setItem('user_role', response.data.role)
    }
    if (response.data.memberId) {
      localStorage.setItem('member_id', response.data.memberId)
    }

    try {
      const profile = await authAPI.getProfile()
      const rawData = profile?.data || profile
      const profileData = rawData?.data || rawData
      if (profileData?.memberId) {
        localStorage.setItem('member_id', profileData.memberId)
      }
      if (profileData?.email) {
        localStorage.setItem('user_email', profileData.email)
      }
      if (profileData?.role) {
        localStorage.setItem('user_role', profileData.role)
      }
      if (profileData?.name) {
        localStorage.setItem('user_name', profileData.name)
      }
      if (profileData) {
        localStorage.setItem('user_data', JSON.stringify(profileData))
      }
    } catch (profileError) {
      console.warn('프로필 조회 실패:', profileError)
    }
    
    // 로그인 상태 변경 이벤트 발생 (SiteHeader가 즉시 반영하도록)
    window.dispatchEvent(new CustomEvent('auth-changed'))
    
    // 이전 페이지로 리다이렉트 또는 홈으로
    const redirect = route.query.redirect || '/'
    router.push(redirect)
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error
      
      if (status === 401) {
        errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
      } else if (status === 404) {
        errorMessage.value = '존재하지 않는 사용자입니다.'
      } else if (message) {
        errorMessage.value = message
      } else {
        errorMessage.value = '로그인에 실패했습니다. 다시 시도해주세요.'
      }
    } else if (error.request) {
      errorMessage.value = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.login-page {
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header .brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: default;
}

.login-header .brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.login-header .brand-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.form-group input {
  padding: 14px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  transition: border-color 0.2s;
}

.form-group input::placeholder {
  color: var(--muted);
}

.form-group input:focus {
  outline: none;
  border-color: var(--text);
  background: var(--surface);
}

.form-options {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
  border: 1px solid #d0d0d0;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  position: relative;
  text-align: center;
  margin: 16px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}

.divider span {
  position: relative;
  background: var(--surface);
  padding: 0 16px;
  color: var(--muted);
  font-size: 14px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  color: #0a0a0a;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-social svg {
  flex-shrink: 0;
}

.btn-google:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.signup-link {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: var(--muted);
}

.signup-link a {
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.signup-link a:hover {
  text-decoration: underline;
}

.error-message {
  padding: 12px 16px;
  background: #2a1a1a;
  border: 1px solid #ff4444;
  border-radius: 8px;
  color: #ff6666;
  font-size: 14px;
  text-align: center;
}

/* 라이트 모드: 연한 그림자 */
:global(body.theme-light) .login-card {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

:global(body.theme-light) .error-message {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #e11d48;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 28px;
  }
}
</style>

