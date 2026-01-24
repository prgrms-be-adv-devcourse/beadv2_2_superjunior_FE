<template>
  <main class="signup-page">
    <div class="container">
      <div class="signup-card">
        <div class="signup-header">
          <h1>회원가입</h1>
          <p>0982 공구팔이와 함께 시작하세요</p>
        </div>
        <form @submit.prevent="handleSignup" class="signup-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">닉네임</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="닉네임을 입력하세요"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label for="email">이메일</label>
            <div class="email-input-group">
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                :disabled="emailVerified"
              />
              <button
                type="button"
                class="btn-verify"
                :disabled="!isEmailValid || emailVerifying || emailVerified"
                @click="sendVerificationEmail"
              >
                {{ emailVerified ? '✓ 인증완료' : emailVerifying ? '전송 중...' : '인증하기' }}
              </button>
            </div>
            <div v-if="emailSent && !emailVerified" class="verification-token-group">
              <input
                v-model="form.verificationToken"
                type="text"
                placeholder="이메일로 받은 인증 토큰을 입력하세요"
                class="token-input"
              />
              <button
                type="button"
                class="btn-verify-token"
                :disabled="!form.verificationToken || verifyingToken"
                @click="verifyEmailToken"
              >
                {{ verifyingToken ? '인증 중...' : '인증 완료' }}
              </button>
            </div>
            <p v-if="emailVerified" class="form-success">✓ 이메일 인증이 완료되었습니다</p>
            <p v-else-if="emailSent" class="form-hint">이메일로 전송된 인증 토큰을 입력해주세요</p>
          </div>
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="8자 이상 입력하세요"
              required
              minlength="8"
            />
            <p class="form-hint">영문, 숫자, 특수문자를 포함하여 8자 이상</p>
          </div>
          <div class="form-group">
            <label for="passwordConfirm">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            <p v-if="form.passwordConfirm && form.password !== form.passwordConfirm" class="form-error">
              비밀번호가 일치하지 않습니다
            </p>
          </div>
          <div class="form-group">
            <label for="phoneNumber">전화번호</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              placeholder="010-0000-0000"
              required
            />
          </div>
        
          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
            {{ loading ? '가입 중...' : '회원가입' }}
          </button>
          <div class="login-link">
            <span>이미 계정이 있으신가요?</span>
            <router-link to="/UserLogin">로그인</router-link>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/auth'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phoneNumber: '',
  verificationToken: ''
})

const loading = ref(false)
const emailSent = ref(false)
const emailVerified = ref(false)
const emailSending = ref(false)
const verifyingToken = ref(false)

const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(form.value.email)
})

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.email &&
    emailVerified.value &&
    form.value.password &&
    form.value.password === form.value.passwordConfirm &&
    form.value.phoneNumber
  )
})

// 이메일 인증 메일 전송
const sendVerificationEmail = async () => {
  if (!isEmailValid.value) {
    alert('올바른 이메일 주소를 입력해주세요.')
    return
  }

  emailSending.value = true
  try {
    const response = await authAPI.sendVerificationEmail(form.value.email)
    emailSent.value = true
    emailVerified.value = false
    form.value.verificationToken = ''
    alert(response.message || '인증 메일이 전송되었습니다. 이메일을 확인해주세요.')
  } catch (error) {
    console.error('Email send error:', error)
    const message = error.response?.data?.message || '인증 메일 전송에 실패했습니다.'
    alert(message)
  } finally {
    emailSending.value = false
  }
}

// 이메일 인증 토큰 검증
const verifyEmailToken = async () => {
  if (!form.value.verificationToken) {
    alert('인증 토큰을 입력해주세요.')
    return
  }

  verifyingToken.value = true
  try {
    const response = await authAPI.verifyEmail(form.value.verificationToken)
    emailVerified.value = true
    alert(response.message || '이메일 인증이 완료되었습니다.')
  } catch (error) {
    console.error('Email verification error:', error)
    const message = error.response?.data?.message || '인증 토큰이 유효하지 않습니다.'
    alert(message)
    emailVerified.value = false
  } finally {
    verifyingToken.value = false
  }
}

// 회원가입
const handleSignup = async () => {
  if (!isFormValid.value) {
    if (!emailVerified.value) {
      alert('이메일 인증을 완료해주세요.')
    } else {
      alert('모든 필수 항목을 입력해주세요.')
    }
    return
  }

  loading.value = true
  try {
    const response = await authAPI.signUp({
      email: form.value.email,
      password: form.value.password,
      name: form.value.name,
      phoneNumber: form.value.phoneNumber,
    })

    // 회원가입 성공 시 응답 데이터 저장
    if (response.data) {
      localStorage.setItem('member_id', response.data.memberId)
      localStorage.setItem('user_email', response.data.email)
      localStorage.setItem('user_name', response.data.name)
      localStorage.setItem('user_role', form.value.userType)
    }

    // 회원가입 후 자동 로그인 처리 (쿠키 기반)
    try {
      const loginResponse = await authAPI.login(form.value.email, form.value.password)

      // 사용자 정보 업데이트
      if (loginResponse.email) {
        localStorage.setItem('user_email', loginResponse.email)
      }
      if (loginResponse.role) {
        localStorage.setItem('user_role', loginResponse.role)
      }

      window.dispatchEvent(new CustomEvent('auth-changed'))
      alert(response.message || '회원가입이 완료되었습니다! 자동으로 로그인되었습니다.')
      router.push('/')
    } catch (loginError) {
      // 자동 로그인 실패해도 회원가입은 성공했으므로 로그인 페이지로 이동
      console.error('Auto login error:', loginError)
      alert(response.message || '회원가입이 완료되었습니다! 로그인해주세요.')
      router.push('/login')
    }
  } catch (error) {
    console.error('Signup error:', error)
    const message = error.response?.data?.message || '회원가입에 실패했습니다.'
    alert(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-page {
  background: #0a0a0a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 600px;
}

.signup-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.signup-header p {
  color: #a0a0a0;
  font-size: 15px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 14px;
}

.form-group input {
  padding: 14px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
}

.form-group input::placeholder {
  color: #666;
}

.form-group input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.email-input-group {
  display: flex;
  gap: 8px;
}

.email-input-group input {
  flex: 1;
}

.btn-verify {
  padding: 14px 20px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-verify:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-verify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verification-token-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.token-input {
  flex: 1;
  padding: 14px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
}

.token-input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.btn-verify-token {
  padding: 14px 24px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-verify-token:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-verify-token:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: -4px;
}

.form-error {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: -4px;
}

.form-success {
  font-size: 13px;
  color: #51cf66;
  margin-top: 4px;
  font-weight: 500;
}

.radio-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #e0e0e0;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #e0e0e0;
  font-size: 14px;
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

.login-link {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #a0a0a0;
}

.login-link a {
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .signup-card {
    padding: 32px 24px;
  }

  .signup-header h1 {
    font-size: 28px;
  }

  .email-input-group {
    flex-direction: column;
  }

  .btn-verify {
    width: 100%;
  }

  .verification-token-group {
    flex-direction: column;
  }

  .btn-verify-token {
    width: 100%;
  }
}
</style>
