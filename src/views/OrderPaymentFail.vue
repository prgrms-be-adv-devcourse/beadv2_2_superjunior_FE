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
  const orderId = route.query.orderId || sessionStorage.getItem('pending_order_payment_id') || ''
  const code = route.query.code || route.query.errorCode || ''
  const message = route.query.message || route.query.errorMessage || ''

  if (!orderId) return

  try {
    await paymentApi.failPayment({
      orderId,
      code,
      message
    })
  } catch (error) {
    console.error('결제 실패 처리 요청 실패:', error)
  }
})

const goBack = () => {
  const orderId = route.query.orderId || ''
  const amount = route.query.amount || 0
  router.replace({ name: 'order-payment', query: { orderId, amount } })
}
</script>

<style scoped>
.order-callback-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
  color: #ffffff;
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
