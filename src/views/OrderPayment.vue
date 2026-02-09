<template>
  <main class="order-payment-page">
    <div class="container">
      <header class="page-header">
        <h1>결제 수단 선택</h1>
        <p class="subtitle">결제 방식을 선택하고 결제를 진행해주세요</p>
      </header>

      <section class="form-section">
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

    <!-- 포인트 부족 모달 -->
    <div v-if="showLackOfPointModal" class="modal-overlay" @click.self="showLackOfPointModal = false">
      <div class="modal-content modal-charge">
        <div class="modal-header">
          <h3>포인트 부족</h3>
          <p>보유 포인트가 부족합니다. 충전 후 결제를 진행해주세요.</p>
        </div>

        <div class="charge-section">
          <div class="current-points-info">
            <span class="label">현재 보유 포인트</span>
            <span class="value">{{ userPoints.toLocaleString() }}P</span>
          </div>
          <div class="required-amount-info">
            <span class="label">필요 포인트</span>
            <span class="value highlight">{{ amount.toLocaleString() }}P</span>
          </div>
          <div class="shortage-info">
            <span class="label">부족 포인트</span>
            <span class="value error">{{ (amount - userPoints).toLocaleString() }}P</span>
          </div>
        </div>

        <div class="charge-amount-section">
          <h4>충전 금액 선택</h4>
          <div class="amount-chips">
            <button
              v-for="presetAmount in presetAmounts"
              :key="presetAmount"
              class="amount-chip"
              :class="{ active: chargeAmount === presetAmount }"
              @click="chargeAmount = presetAmount; customChargeAmount = null"
            >
              {{ presetAmount.toLocaleString() }}원
            </button>
          </div>
          <div class="custom-amount-input">
            <input
              v-model.number="customChargeAmount"
              type="number"
              placeholder="직접 입력 (최소 1,000원)"
              min="1000"
              step="1000"
              @input="onCustomChargeAmountInput"
            />
          </div>
        </div>

        <div class="charge-info">
          <div class="info-row">
            <span class="info-label">충전 금액</span>
            <span class="info-value">{{ chargeAmount.toLocaleString() }}원</span>
          </div>
          <div class="info-row">
            <span class="info-label">충전 후 포인트</span>
            <span class="info-value highlight">{{ (userPoints + chargeAmount).toLocaleString() }}P</span>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            class="btn btn-primary" 
            :disabled="chargeAmount < 1000 || charging"
            @click="handleChargePoints"
          >
            {{ charging ? '충전 중...' : `${chargeAmount.toLocaleString()}원 충전하기` }}
          </button>
          <button class="btn btn-outline" @click="handleCancelOrder">주문 취소</button>
        </div>
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
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()

const selectedMethod = ref('')
const submitting = ref(false)
const pointIdempotencyKey = ref(generateUUID())
const showLackOfPointModal = ref(false)
const userPoints = ref(0)
const chargeAmount = ref(10000)
const customChargeAmount = ref(null)
const charging = ref(false)
const presetAmounts = [10000, 30000, 50000, 100000, 200000, 500000]
let tossPayments = null
let statusPollingInterval = null
const isCheckingStatus = ref(false)
const pendingOrderKey = 'pending_order_payment_id'

const orderId = computed(() => {
  const id = route.query.orderId || ''
  // orderId가 문자열이고 콤마가 포함된 경우 첫 번째 값만 사용
  return typeof id === 'string' && id.includes(',') ? id.split(',')[0].trim() : id
})
const orderNumber = ref('')
const amount = computed(() => {
  const value = Number(route.query.amount || 0)
  return Number.isFinite(value) ? value : 0
})
const groupPurchaseName = computed(() => {
  const fromQuery = route.query.groupPurchaseName
  if (fromQuery) {
    sessionStorage.setItem('pending_group_purchase_name', String(fromQuery))
    return String(fromQuery)
  }
  return sessionStorage.getItem('pending_group_purchase_name') || `주문 결제 ${amount.value.toLocaleString()}원`
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

    const clientKey = 'test_ck_ex6BJGQOVDke4JO2pWwR3W4w2zNb'
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
      try {
        await pointApi.deductPoints({
          idempotencyKey: pointIdempotencyKey.value,
          orderId: orderId.value,
          amount: amount.value,
          groupPurchaseName: groupPurchaseName.value,
          autoCharge: false
        })
        await startOrderStatusPolling(orderId.value)
      } catch (pointError) {
        // 포인트 부족 에러 확인
        const errorCode = pointError?.response?.data?.errorCode || pointError?.response?.data?.code || ''
        const errorMessage = pointError?.response?.data?.message || ''
        
        if (errorCode === 'LACK_OF_POINT' || errorMessage.includes('포인트가 부족') || errorMessage.includes('보유 포인트가 부족')) {
          await fetchUserPoints()
          // 부족한 금액보다 조금 더 충전하도록 기본값 설정
          const shortage = amount.value - userPoints.value
          chargeAmount.value = Math.max(10000, Math.ceil(shortage / 10000) * 10000)
          showLackOfPointModal.value = true
          submitting.value = false
          return
        }
        throw pointError
      }
    } else {
      // 인증 확인
      const memberId = localStorage.getItem('member_id')
      if (!memberId) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.')
        router.push('/login')
        submitting.value = false
        return
      }
      
      try {
        await paymentApi.createPayment({
          orderId: orderId.value,
          amount: amount.value,
          groupPurchaseName: groupPurchaseName.value
        })
      } catch (paymentCreateError) {
        // 401 에러인 경우 로그인 페이지로 리다이렉트
        if (paymentCreateError?.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.')
          router.push('/login')
          submitting.value = false
          return
        }
        throw paymentCreateError
      }
      if (!tossPayments) {
        alert('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      sessionStorage.setItem(pendingOrderKey, orderId.value)
      try {
        await tossPayments.requestPayment('카드', {
          amount: amount.value,
          orderId: orderId.value,
          orderName: groupPurchaseName.value,
          customerName: localStorage.getItem('user_name') || '사용자',
        successUrl: `${window.location.origin}/success?amount=${amount.value}`,
        failUrl: `${window.location.origin}/fail?amount=${amount.value}`
        })
      } catch (paymentError) {
        // 결제 창이 닫혔거나 취소된 경우 fail URL로 리다이렉트
        console.error('결제 취소 또는 실패:', paymentError)
        
        // 에러 메시지 추출 (다양한 형태의 에러 객체 처리)
        let errorMessage = ''
        try {
          if (paymentError?.message) {
            errorMessage = String(paymentError.message)
          } else if (typeof paymentError === 'string') {
            errorMessage = paymentError
          } else if (paymentError?.toString) {
            errorMessage = String(paymentError.toString())
          } else {
            errorMessage = JSON.stringify(paymentError)
          }
        } catch (e) {
          errorMessage = '결제에 실패했습니다.'
        }
        
        // 취소 관련 키워드 확인 (에러 메시지 전체를 소문자로 변환해서 확인)
        const errorMessageLower = errorMessage.toLowerCase()
        const isCanceled = errorMessageLower.includes('취소') || 
                          errorMessageLower.includes('cancel') ||
                          errorMessageLower.includes('취소되었습니다') ||
                          errorMessage.includes('취소되었습니다')
        
        // 결제 취소 또는 실패 시 무조건 fail URL로 이동
        const code = isCanceled ? 'USER_CANCEL' : 'PAYMENT_ERROR'
        const message = isCanceled ? '결제가 취소되었습니다.' : (errorMessage || '결제에 실패했습니다.')
        
        // 즉시 리다이렉트
        window.location.href = `/fail?orderId=${orderId.value}&amount=${amount.value}&code=${code}&message=${encodeURIComponent(message)}`
        submitting.value = false
        return
      }
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

// const goToPointCharge = () => {
//   showLackOfPointModal.value = false
//   router.push('/point/charge')
// }

const handleCancelOrder = () => {
  showLackOfPointModal.value = false
  router.back()
}

const fetchUserPoints = async () => {
  try {
    const response = await authAPI.getPoints()
    const data = response?.data || response
    if (data?.paidPoint !== undefined || data?.bonusPoint !== undefined) {
      const paidPoint = Number(data?.paidPoint ?? 0)
      const bonusPoint = Number(data?.bonusPoint ?? 0)
      userPoints.value = paidPoint + bonusPoint
    } else if (data?.pointBalance !== undefined) {
      userPoints.value = data.pointBalance || 0
    } else if (data?.point !== undefined) {
      userPoints.value = data.point || 0
    }
  } catch (error) {
    console.error('포인트 조회 실패:', error)
  }
}

const onCustomChargeAmountInput = () => {
  if (customChargeAmount.value && customChargeAmount.value >= 1000) {
    chargeAmount.value = customChargeAmount.value
  }
}

const handleChargePoints = async () => {
  if (chargeAmount.value < 1000) {
    alert('최소 충전 금액은 1,000원입니다.')
    return
  }

  charging.value = true
  try {
    const idempotencyKey = generateUUID()
    await api.post('/points/charge', {
      amount: chargeAmount.value,
      idempotencyKey
    })

    // 포인트 충전 성공 후 포인트 조회 및 모달 닫기
    await fetchUserPoints()
    alert('포인트 충전이 완료되었습니다.')
    
    // 충전 후 자동으로 포인트 결제 재시도
    showLackOfPointModal.value = false
    selectedMethod.value = 'POINT'
    handlePay()
  } catch (error) {
    console.error('포인트 충전 실패:', error)
    if (error.response) {
      alert(`포인트 충전 실패: ${error.response.data?.message || '서버 오류가 발생했습니다.'}`)
    } else {
      alert('포인트 충전 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  } finally {
    charging.value = false
  }
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
      const data = response?.data?.data || response?.data || response
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

const fetchOrderDetail = async () => {
  if (!orderId.value) return
  
  try {
    const response = await authAPI.getOrderDetail(orderId.value)
    const data = response?.data?.data || response?.data || response
    if (data?.orderNumber) {
      orderNumber.value = data.orderNumber
    }
  } catch (error) {
    console.error('주문 상세 정보 조회 실패:', error)
  }
}

onMounted(async () => {
  loadTossPayments()
  await fetchOrderDetail()
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
  background: var(--bg);
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
  color: var(--text);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--muted);
  font-size: 16px;
}

.form-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text);
  margin-bottom: 12px;
}

.summary-row strong {
  color: var(--text);
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
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option input {
  accent-color: var(--text);
}

.payment-option.active {
  border-color: var(--text);
  background: var(--surface);
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text);
}

.payment-info .desc {
  color: var(--muted);
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
  border: 1px solid var(--border-strong);
  color: var(--text);
}

.btn-outline:hover {
  background: var(--hover);
  border-color: var(--muted);
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--border);
}

.btn-primary:hover:not(:disabled) {
  background: var(--btn-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 포인트 부족 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.modal-charge {
  text-align: left;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px 0;
}

.modal-header p {
  color: var(--muted);
  font-size: 14px;
  margin: 0;
}

.charge-section {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.current-points-info,
.required-amount-info,
.shortage-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.shortage-info {
  margin-bottom: 0;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.charge-section .label {
  color: var(--muted);
  font-size: 14px;
}

.charge-section .value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.charge-section .value.highlight {
  color: var(--text);
}

.charge-section .value.error {
  color: #ff4757;
}

.charge-amount-section {
  margin-bottom: 24px;
}

.charge-amount-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.amount-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.amount-chip {
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-chip:hover {
  border-color: var(--text);
  background: var(--hover);
}

.amount-chip.active {
  border-color: var(--text);
  background: var(--surface);
  color: var(--text);
}

.custom-amount-input {
  margin-top: 8px;
}

.custom-amount-input input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.custom-amount-input input:focus {
  outline: none;
  border-color: var(--text);
}

.charge-info {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.charge-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.charge-info .info-row:last-child {
  margin-bottom: 0;
}

.charge-info .info-label {
  color: var(--muted);
  font-size: 14px;
}

.charge-info .info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.charge-info .info-value.highlight {
  color: var(--text);
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-actions .btn {
  width: 100%;
  padding: 14px;
}
</style>
