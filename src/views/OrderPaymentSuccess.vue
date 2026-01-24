<template>
  <main class="order-callback-page">
    <div class="container">
      <h1>결제 확인 중...</h1>
      <p>결제 완료 상태를 확인하고 있습니다.</p>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentApi } from '@/api/axios'
import { authAPI } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const pendingOrderKey = 'pending_order_payment_id'

onMounted(async () => {
  const orderId = route.query.orderId || sessionStorage.getItem(pendingOrderKey) || ''
  const paymentKey = route.query.paymentKey || ''
  const amount = Number(route.query.amount || 0)

  if (orderId && paymentKey && amount) {
    try {
      await paymentApi.confirmPayment({
        orderId,
        paymentKey,
        amount
      })
    } catch (error) {
      console.error('결제 승인 실패:', error)
    }
  }

  if (orderId) {
    sessionStorage.setItem(pendingOrderKey, orderId)
    try {
      const response = await authAPI.getOrderDetail(orderId)
      const rawData = response?.data || response
      const data = rawData?.data || rawData
      const status = data?.status
      const failureStatuses = new Set([
        'PAYMENT_FAILED',
        'ORDER_FAILED',
        'GROUP_PURCHASE_FAIL',
        'CANCELLED',
        'REVERSED',
        'REFUNDED'
      ])

      if (status === 'PAYMENT_COMPLETED') {
        router.replace({ name: 'order-complete' })
        return
      }
      if (failureStatuses.has(status)) {
        alert('주문이 실패 또는 종료되었습니다. 주문 내역을 확인해주세요.')
        router.replace({ name: 'order-payment', query: { orderId, amount } })
        return
      }
    } catch (error) {
      console.warn('주문 상태 확인 실패:', error)
    }
    router.replace({ name: 'order-payment', query: { orderId, amount } })
  } else {
    router.replace({ name: 'order-payment' })
  }
})
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
</style>
