<template>
  <main class="order-callback-page">
    <div class="container">
      <h1>결제 확인 중...</h1>
      <p>결제 완료 상태를 확인하고 있습니다.</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentApi } from '@/api/axios'
import { authAPI } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const pendingOrderKey = 'pending_order_payment_id'
let statusPollingInterval = null
const isCheckingStatus = ref(false)

const startOrderStatusPolling = async (orderId, amount) => {
  if (!orderId) return
  if (isCheckingStatus.value) return

  isCheckingStatus.value = true
  const maxAttempts = 120
  let attempts = 0
  const failureStatuses = new Set([
    'PAYMENT_FAILED',
    'ORDER_FAILED',
    'GROUP_PURCHASE_FAIL',
    'CANCELLED',
    'REVERSED',
    'REFUNDED'
  ])
  const pendingStatuses = new Set([
    'PENDING',
    'CANCEL_REQUESTED',
    'REVERSE_REQUESTED',
    'REFUND_REQUESTED',
    'GROUP_PURCHASE_SUCCESS',
    'PURCHASE_CONFIRMED'
  ])

  const checkStatus = async () => {
    attempts += 1
    try {
      const response = await authAPI.getOrderDetail(orderId)
      const data = response?.data?.data || response?.data || response
      const status = data?.status

      if (status === 'PAYMENT_COMPLETED') {
        clearOrderStatusPolling()
        sessionStorage.removeItem(pendingOrderKey)
        router.replace({ name: 'order-complete' })
        return
      }

      if (failureStatuses.has(status)) {
        clearOrderStatusPolling()
        sessionStorage.removeItem(pendingOrderKey)
        alert('주문이 실패 또는 종료되었습니다. 주문 내역을 확인해주세요.')
        router.replace({ name: 'order-payment', query: { orderId, amount } })
        return
      }

      if (!status || !pendingStatuses.has(status)) {
        clearOrderStatusPolling()
        sessionStorage.removeItem(pendingOrderKey)
        alert('알 수 없는 주문 상태입니다. 주문 내역을 확인해주세요.')
        router.replace({ name: 'order-payment', query: { orderId, amount } })
        return
      }
    } catch (error) {
      console.warn('주문 상태 확인 실패:', error)
    }

    if (attempts >= maxAttempts) {
      clearOrderStatusPolling()
      sessionStorage.removeItem(pendingOrderKey)
      alert('결제 상태 확인 시간이 초과되었습니다. 주문 내역에서 확인해주세요.')
      router.replace({ name: 'order-payment', query: { orderId, amount } })
    }
  }

  await checkStatus()
  statusPollingInterval = setInterval(checkStatus, 1000)
}

const clearOrderStatusPolling = () => {
  isCheckingStatus.value = false
  if (statusPollingInterval) {
    clearInterval(statusPollingInterval)
    statusPollingInterval = null
  }
}

onMounted(async () => {
  // route.query.orderId가 배열이거나 중복된 경우 첫 번째 값만 사용
  let orderId = route.query.orderId || sessionStorage.getItem(pendingOrderKey) || ''
  if (Array.isArray(orderId)) {
    orderId = orderId[0]
  } else if (typeof orderId === 'string' && orderId.includes(',')) {
    orderId = orderId.split(',')[0].trim()
  }
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
    startOrderStatusPolling(orderId, amount)
  } else {
    router.replace({ name: 'order-payment' })
  }
})

onBeforeUnmount(() => {
  clearOrderStatusPolling()
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
