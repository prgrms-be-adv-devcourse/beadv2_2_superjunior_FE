<template>
  <main class="order-payment-page">
    <div class="container">
      <header class="page-header">
        <h1>결제 수단 선택</h1>
        <p class="subtitle">결제 방식을 선택하고 결제를 진행해주세요</p>
      </header>

      <section class="form-section">
        <div class="summary-row">
          <span>주문번호</span>
          <strong>{{ orderId || '-' }}</strong>
        </div>
        <div class="summary-row">
          <span>결제 금액</span>
          <strong>₩{{ amount.toLocaleString() }}</strong>
        </div>
      </section>

      <section class="form-section">
        <h2>결제 수단 *</h2>
        <div class="payment-options">
          <label class="payment-option" :class="{ active: selectedMethod === 'PG' }">
            <input
              type="radio"
              value="PG"
              v-model="selectedMethod"
            />
            <div class="payment-info">
              <strong>PG 결제</strong>
              <span class="desc">카드/계좌이체 결제</span>
            </div>
          </label>
          <label class="payment-option" :class="{ active: selectedMethod === 'POINT' }">
            <input
              type="radio"
              value="POINT"
              v-model="selectedMethod"
            />
            <div class="payment-info">
              <strong>포인트 결제</strong>
              <span class="desc">보유 포인트 사용</span>
            </div>
          </label>
        </div>
      </section>

      <div class="form-actions">
        <button class="btn btn-outline" @click="handleCancel">취소</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handlePay">
          {{ submitting ? '결제 처리 중...' : '결제하기' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pointApi, paymentApi } from '@/api/axios'
import { generateUUID } from '@/utils/uuid'
import { authAPI } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const selectedMethod = ref('')
const submitting = ref(false)
const pointIdempotencyKey = ref(generateUUID())
let tossPayments = null
let statusPollingInterval = null
const isCheckingStatus = ref(false)
const pendingOrderKey = 'pending_order_payment_id'

const orderId = computed(() => route.query.orderId || '')
const amount = computed(() => {
  const value = Number(route.query.amount || 0)
  return Number.isFinite(value) ? value : 0
})

const loadTossPayments = async () => {
  try {
    if (!window.TossPayments) {
      const script = document.createElement('script')
      script.src = 'https://js.tosspayments.com/v1/payment'
      script.async = true
      document.head.appendChild(script)

      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
      })
    }

    const clientKey = 'test_ck_0RnYX2w532qpnn7EPAAN8NeyqApQ'
    tossPayments = window.TossPayments(clientKey)
  } catch (error) {
    console.error('토스페이먼트 SDK 로드 실패:', error)
    alert('결제 시스템을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.')
  }
}

const handlePay = async () => {
  if (!orderId.value) {
    alert('주문 정보를 찾을 수 없습니다.')
    return
  }
  if (!amount.value) {
    alert('결제 금액이 올바르지 않습니다.')
    return
  }
  if (!selectedMethod.value) {
    alert('결제 수단을 선택해주세요.')
    return
  }

  submitting.value = true
  try {
    if (selectedMethod.value === 'POINT') {
      await pointApi.deductPoints({
        idempotencyKey: pointIdempotencyKey.value,
        orderId: orderId.value,
        amount: amount.value,
        autoCharge: false
      })
      await startOrderStatusPolling(orderId.value)
    } else {
      await paymentApi.createPayment({
        orderId: orderId.value,
        amount: amount.value
      })
      if (!tossPayments) {
        alert('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      sessionStorage.setItem(pendingOrderKey, orderId.value)
      const orderName = `주문 결제 ${amount.value.toLocaleString()}원`
      await tossPayments.requestPayment('카드', {
        amount: amount.value,
        orderId: orderId.value,
        orderName: orderName,
        customerName: localStorage.getItem('user_name') || '사용자',
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`
      })
    }
  } catch (error) {
    console.error('결제 실패:', error)
    const errorMessage = error.response?.data?.message || '결제에 실패했습니다.'
    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const startOrderStatusPolling = async (orderIdValue) => {
  if (!orderIdValue) return
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
      const response = await authAPI.getOrderDetail(orderIdValue)
      const data = response?.data || response
      const status = data?.status

      if (status === 'PAYMENT_COMPLETED') {
        clearOrderStatusPolling()
    sessionStorage.removeItem(pendingOrderKey)
        router.push('/order/complete')
        return
      }

      if (failureStatuses.has(status)) {
        clearOrderStatusPolling()
    sessionStorage.removeItem(pendingOrderKey)
        alert('주문이 실패 또는 종료되었습니다. 주문 내역을 확인해주세요.')
        return
      }

      if (!status || !pendingStatuses.has(status)) {
        clearOrderStatusPolling()
        sessionStorage.removeItem(pendingOrderKey)
        alert('알 수 없는 주문 상태입니다. 주문 내역을 확인해주세요.')
        return
      }
    } catch (error) {
      console.error('주문 상태 확인 실패:', error)
    }

    if (attempts >= maxAttempts) {
      clearOrderStatusPolling()
      sessionStorage.removeItem(pendingOrderKey)
      alert('결제 상태 확인 시간이 초과되었습니다. 주문 내역에서 확인해주세요.')
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

onMounted(() => {
  loadTossPayments()
  const pendingOrderId = sessionStorage.getItem(pendingOrderKey)
  if (pendingOrderId && orderId.value && pendingOrderId === orderId.value) {
    startOrderStatusPolling(orderId.value)
  }
})

onBeforeUnmount(() => {
  clearOrderStatusPolling()
})
</script>

<style scoped>
.order-payment-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.subtitle {
  color: #999;
  font-size: 16px;
}

.form-section {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e0e0e0;
  margin-bottom: 12px;
}

.summary-row strong {
  color: #ffffff;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  background: #0f0f0f;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option input {
  accent-color: #ffffff;
}

.payment-option.active {
  border-color: #ffffff;
  background: #1a1a1a;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #ffffff;
}

.payment-info .desc {
  color: #999;
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover:not(:disabled) {
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
