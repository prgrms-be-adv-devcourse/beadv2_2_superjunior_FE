<template>
  <main class="order-callback-page">
    <div class="container">
      <h1>결제 실패</h1>
      <p>결제가 취소되었거나 실패했습니다. 다시 시도해주세요.</p>
      <button class="btn btn-primary" @click="goBack">결제 화면으로 돌아가기</button>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentApi } from '@/api/axios'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // route.query.orderId가 배열이거나 중복된 경우 첫 번째 값만 사용
  let orderId = route.query.orderId || sessionStorage.getItem('pending_order_payment_id') || ''
  if (Array.isArray(orderId)) {
    orderId = orderId[0]
  } else if (typeof orderId === 'string' && orderId.includes(',')) {
    orderId = orderId.split(',')[0].trim()
  }
  const amount = Number(route.query.amount) || 0
  const paymentKey = route.query.paymentKey || route.query.payment_key || ''
  const errorCode = route.query.code || route.query.errorCode || route.query.error_code || ''
  const errorMessage = route.query.message || route.query.errorMessage || route.query.error_message || '결제가 취소되었습니다.'
  
  // 토스페이먼츠에서 전달하는 rawPayload (쿼리 파라미터 전체를 JSON으로 변환)
  const rawPayload = JSON.stringify(route.query)

  if (!orderId) return

  try {
    await paymentApi.failPayment({
      orderId,
      paymentKey: paymentKey || 'USER_CANCEL', // X 버튼 클릭 시 paymentKey가 없을 수 있음
      errorCode: errorCode || 'USER_CANCEL',
      errorMessage,
      amount,
      rawPayload
    })
  } catch (error) {
    console.error('결제 실패 처리 요청 실패:', error)
  }
})

const goBack = () => {
  // route.query.orderId가 배열이거나 중복된 경우 첫 번째 값만 사용
  let orderId = route.query.orderId || ''
  if (Array.isArray(orderId)) {
    orderId = orderId[0]
  } else if (typeof orderId === 'string' && orderId.includes(',')) {
    orderId = orderId.split(',')[0].trim()
  }
  const amount = route.query.amount || 0
  router.replace({ name: 'order-payment', query: { orderId, amount } })
}
</script>

<style scoped>
.order-callback-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 32px 0 60px;
  color: var(--text);
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.btn {
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}
</style>
