<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="application-card">
      <div class="application-header">
        <div>
          <h1>판매자 신청</h1>
          <p>0982 공구팔이에서 판매자로 활동하시려면 아래 정보를 입력해주세요</p>
        </div>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
        <form @submit.prevent="handleSubmit" class="application-form">
          <div class="form-section">
            <h3>사업자 정보</h3>
            <div class="form-group">
              <label for="businessRegistrationNumber">사업자 등록번호 *</label>
              <input
                id="businessRegistrationNumber"
                v-model="form.businessRegistrationNumber"
                type="text"
                placeholder="000-00-00000"
                required
                maxlength="12"
                @input="formatBusinessNumber"
              />
              <p v-if="businessNumberError" class="form-error">{{ businessNumberError }}</p>
              <p class="form-hint">XXX-XX-XXXXX 형식으로 입력해주세요</p>
            </div>
          </div>

          <div class="form-section">
            <h3>계좌 정보</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="bankCode">은행 *</label>
                <select
                  id="bankCode"
                  v-model="form.bankCode"
                  required
                  @change="validateBankCode"
                >
                  <option value="">은행을 선택하세요</option>
                  <option v-for="bank in bankList" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </select>
                <p v-if="bankCodeError" class="form-error">{{ bankCodeError }}</p>
              </div>
              <div class="form-group">
                <label for="accountNumber">계좌번호 *</label>
                <input
                  id="accountNumber"
                  v-model="form.accountNumber"
                  type="text"
                  placeholder="계좌번호를 입력하세요"
                  required
                  maxlength="20"
                  @input="validateAccountNumber"
                />
                <p v-if="accountNumberError" class="form-error">{{ accountNumberError }}</p>
                <p class="form-hint">숫자만 입력 가능합니다 (1-20자)</p>
              </div>
            </div>
            <div class="form-group">
              <label for="accountHolder">예금주 *</label>
              <input
                id="accountHolder"
                v-model="form.accountHolder"
                type="text"
                placeholder="예금주명을 입력하세요"
                required
                maxlength="50"
                @input="validateAccountHolder"
              />
              <p v-if="accountHolderError" class="form-error">{{ accountHolderError }}</p>
              <p class="form-hint">한글과 영어만 입력 가능합니다 (1-50자)</p>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
            {{ loading ? '신청 중...' : '판매자 신청하기' }}
          </button>
        </form>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/auth'

const router = useRouter()

// 은행 코드 리스트
const bankList = [
  { code: '002', name: 'KDB산업은행' },
  { code: '003', name: 'IBK기업은행' },
  { code: '004', name: 'KB국민은행' },
  { code: '005', name: 'KEB하나은행' },
  { code: '007', name: '수협은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '020', name: '우리은행' },
  { code: '023', name: 'SC은행' },
  { code: '027', name: '씨티은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '045', name: 'MG새마을금고' },
  { code: '048', name: '신협' },
  { code: '050', name: '저축은행' },
  { code: '064', name: '산림조합' },
  { code: '071', name: '우체국' },
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
  { code: '103', name: 'SBI저축은행' },
  { code: '218', name: 'KB증권' },
  { code: '230', name: '미래에셋증권' },
  { code: '238', name: '미래에셋증권' },
  { code: '240', name: '삼성증권' },
  { code: '243', name: '한국투자증권' },
  { code: '247', name: 'NH투자증권' },
  { code: '261', name: '교보증권' },
  { code: '262', name: '하이투자증권' },
  { code: '263', name: '현대차투자증권' },
  { code: '264', name: '키움증권' },
  { code: '265', name: '이베스트증권' },
  { code: '266', name: 'SK증권' },
  { code: '267', name: '대신증권' },
  { code: '269', name: '한화투자증권' },
  { code: '270', name: '하나증권' },
  { code: '271', name: '토스증권' },
  { code: '278', name: '신한투자증권' },
  { code: '279', name: 'DB금융투자' },
  { code: '280', name: '유진투자' },
  { code: '287', name: '메리츠증권' },
  { code: '888', name: '토스머니' },
  { code: '889', name: '토스포인트' }
]

const form = ref({
  accountNumber: '',
  bankCode: '',
  accountHolder: '',
  businessRegistrationNumber: ''
})

const loading = ref(false)
const accountNumberError = ref('')
const bankCodeError = ref('')
const accountHolderError = ref('')
const businessNumberError = ref('')

// 계좌번호 유효성 검사 (숫자만, 1-20자)
const validateAccountNumber = () => {
  const value = form.value.accountNumber
  if (!value) {
    accountNumberError.value = ''
    return
  }
  if (!/^[0-9]+$/.test(value)) {
    accountNumberError.value = '계좌번호는 숫자만 입력 가능합니다.'
  } else if (value.length < 1 || value.length > 20) {
    accountNumberError.value = '계좌번호는 1-20자로 입력해주세요.'
  } else {
    accountNumberError.value = ''
  }
}

// 은행 코드 유효성 검사
const validateBankCode = () => {
  const value = form.value.bankCode
  if (!value) {
    bankCodeError.value = '은행을 선택해주세요.'
  } else {
    bankCodeError.value = ''
  }
}

// 예금주 유효성 검사 (한글/영어만, 1-50자)
const validateAccountHolder = () => {
  const value = form.value.accountHolder
  if (!value) {
    accountHolderError.value = ''
    return
  }
  if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
    accountHolderError.value = '예금주는 한글과 영어만 입력 가능합니다.'
  } else if (value.length < 1 || value.length > 50) {
    accountHolderError.value = '예금주는 1-50자로 입력해주세요.'
  } else {
    accountHolderError.value = ''
  }
}

// 사업자 등록번호 포맷팅 (XXX-XX-XXXXX)
const formatBusinessNumber = () => {
  let value = form.value.businessRegistrationNumber.replace(/[^0-9]/g, '')
  
  if (value.length > 10) {
    value = value.substring(0, 10)
  }
  
  if (value.length > 5) {
    value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5)
  } else if (value.length > 3) {
    value = value.substring(0, 3) + '-' + value.substring(3)
  }
  
  form.value.businessRegistrationNumber = value
  
  // 유효성 검사
  if (!value) {
    businessNumberError.value = ''
    return
  }
  if (!/^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(value)) {
    businessNumberError.value = '사업자 등록번호는 XXX-XX-XXXXX 형식으로 입력해야 합니다.'
  } else {
    businessNumberError.value = ''
  }
}

const isFormValid = computed(() => {
  return (
    form.value.accountNumber &&
    form.value.bankCode &&
    form.value.accountHolder &&
    form.value.businessRegistrationNumber &&
    !accountNumberError.value &&
    !bankCodeError.value &&
    !accountHolderError.value &&
    !businessNumberError.value &&
    /^[0-9]+$/.test(form.value.accountNumber) &&
    form.value.accountNumber.length >= 1 &&
    form.value.accountNumber.length <= 20 &&
    form.value.bankCode.length > 0 &&
    /^[가-힣a-zA-Z\s]+$/.test(form.value.accountHolder) &&
    form.value.accountHolder.length >= 1 &&
    form.value.accountHolder.length <= 50 &&
    /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(form.value.businessRegistrationNumber)
  )
})

const closeModal = () => {
  router.push('/me/profile')
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 올바르게 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const response = await authAPI.sellerRegister({
      accountNumber: form.value.accountNumber,
      bankCode: form.value.bankCode,
      accountHolder: form.value.accountHolder,
      businessRegistrationNumber: form.value.businessRegistrationNumber
    })
    
    alert(response.message || '판매자 신청이 완료되었습니다. 검토 후 연락드리겠습니다.')
    
    // 사용자 역할 업데이트 (백엔드에서 처리할 수도 있음)
    // localStorage.setItem('user_role', 'seller')
    
    router.push('/me/profile')
  } catch (error) {
    console.error('Application error:', error)
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error
      alert(message || '신청에 실패했습니다. 다시 시도해주세요.')
    } else {
      alert('신청에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 로그인 체크 (쿠키 기반)
  let memberId = localStorage.getItem('member_id')
  if (!memberId) {
    try {
      const profile = await authAPI.getProfile()
      const rawData = profile?.data || profile
      const profileData = rawData?.data || rawData
      if (!profileData?.memberId) {
        throw new Error('로그인 정보가 없습니다.')
      }
      memberId = profileData.memberId
      localStorage.setItem('member_id', memberId)
      localStorage.setItem('user_data', JSON.stringify(profileData))
      if (profileData.email) localStorage.setItem('user_email', profileData.email)
      if (profileData.role) localStorage.setItem('user_role', profileData.role)
      if (profileData.name) localStorage.setItem('user_name', profileData.name)
    } catch (error) {
      alert('로그인이 필요합니다.')
      router.push('/login')
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.application-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 800px;
  position: relative;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a2a;
}

.application-header > div {
  flex: 1;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 16px;
}

.close-btn:hover {
  background: #2a2a2a;
}

.application-header h1 {
  text-align: left;
}

.application-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.application-header p {
  color: #a0a0a0;
  font-size: 15px;
  margin: 0;
  text-align: left;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a2a;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 14px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #666;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.form-group select {
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

.form-error {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 4px;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .application-card {
    padding: 32px 24px;
  }

  .application-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .application-header h1 {
    font-size: 28px;
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    margin-left: 0;
  }
}
</style>




