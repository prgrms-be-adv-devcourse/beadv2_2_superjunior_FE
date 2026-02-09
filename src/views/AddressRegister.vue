<template>
  <div class="address-register-page">
    <div class="container">
      <h1>배송지 추가</h1>
      
      <form @submit.prevent="handleSubmit" class="address-form">
        <!-- 수령인 이름 -->
        <div class="form-group">
          <label>수령인 이름 *</label>
          <input
            v-model="form.receiverName"
            type="text"
            placeholder="받으시는 분 이름"
            required
          />
        </div>

        <!-- 전화번호 -->
        <div class="form-group">
          <label>전화번호 *</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="010-1234-5678"
            required
          />
        </div>

        <!-- 주소 검색 컴포넌트 -->
        <div class="form-group">
          <label>주소 *</label>
          <AddressSearch v-model="addressData" />
        </div>

        <!-- 제출 버튼 -->
        <div class="form-actions">
          <button type="submit" class="submit-btn">
            배송지 추가
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AddressSearch from '@/components/AddressSearch.vue'
import api from '@/api/axios'

const router = useRouter()

const form = ref({
  receiverName: '',
  phoneNumber: ''
})

const addressData = ref({
  address: '',
  addressDetail: '',
  postalCode: ''
})

const handleSubmit = async () => {
  // 주소 입력 확인
  if (!addressData.value.address || !addressData.value.postalCode) {
    alert('주소를 입력해주세요.')
    return
  }

  try {
    const payload = {
      receiverName: form.value.receiverName,
      phoneNumber: form.value.phoneNumber,
      address: addressData.value.address,
      addressDetail: addressData.value.addressDetail,
      postalCode: addressData.value.postalCode
    }

    console.log('주소 등록 요청:', payload)

    const response = await api.post('/members/address', payload)
    
    console.log('주소 등록 성공:', response.data)
    alert('배송지가 추가되었습니다.')
    
    // 마이페이지로 이동
    router.push('/me/profile')
    
  } catch (error) {
    console.error('주소 등록 실패:', error)
    
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('배송지 추가에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.address-register-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: var(--text);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  background: #151515;
}

.form-actions {
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}
</style>
