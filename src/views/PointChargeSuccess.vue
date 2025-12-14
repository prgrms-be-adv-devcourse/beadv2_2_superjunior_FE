<template>
  <main class="page">
    <div class="container">
      <div class="result-card" v-if="!loading">
        <div class="icon success-icon">✓</div>
        <h1>충전 완료!</h1>
        <p class="message">포인트 충전이 성공적으로 완료되었습니다.</p>

        <div class="info-box">
          <div class="info-row">
            <span class="label">충전 금액</span>
            <span class="value">{{ chargeAmount.toLocaleString() }}원</span>
          </div>
          <div class="info-row">
            <span class="label">충전 후 포인트</span>
            <span class="value highlight">{{ totalPoints.toLocaleString() }}P</span>
          </div>
          <div class="info-row">
            <span class="label">주문번호</span>
            <span class="value small">{{ orderId }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click="goToHome">홈으로 가기</button>
          <button class="btn btn-outline" @click="goToPointHistory">충전 내역 보기</button>
        </div>
      </div>

      <div class="result-card" v-else>
        <div class="loading">
          <div class="spinner"></div>
          <p>결제 승인 처리 중...</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const chargeAmount = ref(0)
const totalPoints = ref(0)
const orderId = ref('')

onMounted(async () => {
  try {
    // URL 쿼리 파라미터에서 결제 정보 추출
    const paymentKey = route.query.paymentKey
    const orderIdParam = route.query.orderId
    const amount = route.query.amount

    orderId.value = orderIdParam || ''
    chargeAmount.value = parseInt(amount) || 0

    // 백엔드 API 호출하여 결제 승인 (GET 요청, 쿼리 파라미터로 전달)
    const response = await api.get('/payments/confirm', {
      params: {
        paymentKey: paymentKey,
        orderId: orderIdParam,
        amount: amount
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })

    console.log('결제 승인 성공:', response.data)

    // 응답 데이터에서 총 포인트 설정
    totalPoints.value = response.data.data?.totalPoints || (50000 + chargeAmount.value)
    loading.value = false

  } catch (error) {
    console.error('결제 승인 실패:', error)
    alert(`결제 승인 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`)
    router.push('/point/charge')
  }
})

const goToHome = () => {
  router.push('/')
}

const goToPointHistory = () => {
  // TODO: 포인트 충전 내역 페이지로 이동
  router.push('/me/profile')
}
</script>

<style scoped>
.page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.container {
  max-width: 500px;
  width: 100%;
}

.result-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 24px;
}

.success-icon {
  background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
  color: white;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

.message {
  font-size: 16px;
  color: #999;
  margin-bottom: 32px;
}

.info-box {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2a2a2a;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  color: #999;
}

.value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.value.highlight {
  font-size: 24px;
  color: #51cf66;
}

.value.small {
  font-size: 14px;
  color: #999;
  word-break: break-all;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-outline {
  background: transparent;
  color: #ffffff;
  border: 1px solid #3a3a3a;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.loading {
  padding: 40px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #2a2a2a;
  border-top-color: #ffffff;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #999;
  font-size: 16px;
}

@media (max-width: 480px) {
  .result-card {
    padding: 40px 24px;
  }

  h1 {
    font-size: 28px;
  }

  .icon {
    width: 70px;
    height: 70px;
    font-size: 40px;
  }
}
</style>
