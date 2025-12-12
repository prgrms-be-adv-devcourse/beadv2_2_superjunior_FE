<template>
  <main class="page">
    <div class="container">
      <div class="result-card">
        <div class="icon fail-icon">✕</div>
        <h1>충전 실패</h1>
        <p class="message">포인트 충전에 실패했습니다.</p>

        <div class="error-box">
          <div class="error-title">실패 사유</div>
          <div class="error-message">{{ errorMessage }}</div>
        </div>

        <div class="info-box" v-if="orderId">
          <div class="info-row">
            <span class="label">주문번호</span>
            <span class="value small">{{ orderId }}</span>
          </div>
          <div class="info-row" v-if="amount">
            <span class="label">요청 금액</span>
            <span class="value">{{ parseInt(amount).toLocaleString() }}원</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click="retryCharge">다시 시도</button>
          <button class="btn btn-outline" @click="goToHome">홈으로 가기</button>
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

const errorMessage = ref('결제 처리 중 오류가 발생했습니다.')
const orderId = ref('')
const amount = ref('')

onMounted(async () => {
  // URL 쿼리 파라미터에서 실패 정보 추출
  const code = route.query.code
  const message = route.query.message
  orderId.value = route.query.orderId || ''
  amount.value = route.query.amount || ''

  // 에러 메시지 설정
  if (message) {
    errorMessage.value = message
  } else if (code) {
    errorMessage.value = getErrorMessage(code)
  }

  // 백엔드에 실패 로그 전송 (GET 요청, 쿼리 파라미터로 전달)
  try {
    await api.get('/api/points/fail', {
      params: {
        code: code,
        message: message,
        orderId: orderId.value
      }
    })
    console.log('결제 실패 로그 전송 성공')
  } catch (error) {
    console.error('결제 실패 로그 전송 실패:', error)
  }
})

const getErrorMessage = (code) => {
  const errorMessages = {
    'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
    'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
    'REJECT_CARD_COMPANY': '카드사에서 승인을 거부했습니다.',
    'INVALID_CARD_NUMBER': '올바르지 않은 카드번호입니다.',
    'NOT_AVAILABLE_PAYMENT': '현재 사용할 수 없는 결제 수단입니다.',
    'EXCEED_MAX_CARD_INSTALLMENT_PLAN': '할부 개월 수가 초과되었습니다.',
    'COMMON_ERROR': '일시적인 오류가 발생했습니다.',
  }
  return errorMessages[code] || '알 수 없는 오류가 발생했습니다.'
}

const retryCharge = () => {
  router.push('/point/charge')
}

const goToHome = () => {
  router.push('/')
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

.fail-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
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
  margin-bottom: 24px;
}

.error-box {
  background: #2a1a1a;
  border: 1px solid #ff4444;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 14px;
  color: #ff6666;
  font-weight: 600;
  margin-bottom: 8px;
}

.error-message {
  font-size: 15px;
  color: #ff9999;
  line-height: 1.5;
}

.info-box {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
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
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.value.small {
  font-size: 12px;
  color: #999;
  word-break: break-all;
  max-width: 60%;
  text-align: right;
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
