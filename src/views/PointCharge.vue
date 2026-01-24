<template>
  <main class="page">
    <div class="container">
      <h1>포인트 충전</h1>

      <div class="grid">
        <!-- 현재 포인트 -->
        <div class="panel">
          <h3>보유 포인트</h3>
          <div class="current-points">
            <span class="points-value">{{ userPoints.toLocaleString() }}</span>
            <span class="points-unit">P</span>
          </div>
          <p class="points-info">공동 구매 참여 시 사용할 수 있습니다</p>
        </div>

        <!-- 충전 금액 선택 -->
        <div class="panel">
          <h3>충전 금액 선택</h3>
          <div class="amount-chips">
            <button
              v-for="amount in presetAmounts"
              :key="amount"
              class="amount-chip"
              :class="{ active: selectedAmount === amount }"
              @click="selectAmount(amount)"
            >
              {{ amount.toLocaleString() }}원
            </button>
          </div>
          <div class="custom-amount-input">
            <input
              v-model.number="customAmount"
              type="number"
              placeholder="직접 입력 (최소 1,000원)"
              min="1000"
              step="1000"
              @input="onCustomAmountInput"
            />
          </div>
        </div>
      </div>

      <!-- 결제 정보 -->
      <div class="panel">
        <h3>결제 정보</h3>
        <div class="payment-info">
          <div class="info-row">
            <span class="info-label">충전 금액</span>
            <span class="info-value">{{ selectedAmount.toLocaleString() }}원</span>
          </div>
          <div class="info-row">
            <span class="info-label">결제 수단</span>
            <span class="info-value">토스페이먼츠 (카드)</span>
          </div>
          <div class="info-row">
            <span class="info-label">충전 후 포인트</span>
            <span class="info-value highlight">{{ (userPoints + selectedAmount).toLocaleString() }}P</span>
          </div>
        </div>

        <button
          class="btn btn-primary btn-large"
          :disabled="selectedAmount < 1000"
          @click="requestCharge"
        >
          {{ selectedAmount.toLocaleString() }}원 충전하기
        </button>
      </div>

      <!-- 포인트 이력 -->
      <div class="panel">
        <h3>포인트 이력</h3>
        <div v-if="historyLoading" class="empty-history">
          <p>포인트 이력을 불러오는 중...</p>
        </div>
        <div v-else-if="chargeHistory.length === 0" class="empty-history">
          <p>포인트 이력이 없습니다</p>
        </div>
        <div v-else class="history-list">
          <div v-for="item in chargeHistory" :key="item.id" class="history-item">
            <div class="history-info">
              <span class="history-date">{{ item.date }}</span>
              <span class="history-amount">{{ item.amount.toLocaleString() }}원</span>
            </div>
            <span class="history-status" :class="item.status">{{ item.statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { v4  as uuidv4 } from 'uuid';
import api from '@/api/axios'
import { authAPI } from '@/api/auth'
// import { useRouter } from 'vue-router'

// const router = useRouter()

const userPoints = ref(0)
const selectedAmount = ref(10000)
const customAmount = ref(null)

const presetAmounts = [10000, 30000, 50000, 100000, 200000, 500000]

const chargeHistory = ref([])
const historyLoading = ref(false)

let tossPayments = null

// 토스페이먼트 SDK 로드
const loadTossPayments = async () => {
  try {
    // 토스페이먼트 SDK 스크립트 로드
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

    // TODO: 실제 클라이언트 키로 교체 필요
    const clientKey = 'test_ck_0RnYX2w532qpnn7EPAAN8NeyqApQ'
    tossPayments = window.TossPayments(clientKey)
  } catch (error) {
    console.error('토스페이먼트 SDK 로드 실패:', error)
    alert('결제 시스템을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.')
  }
}

const selectAmount = (amount) => {
  selectedAmount.value = amount
  customAmount.value = null
}

const onCustomAmountInput = () => {
  if (customAmount.value && customAmount.value >= 1000) {
    selectedAmount.value = customAmount.value
  }
}

const requestCharge = async () => {
  if (selectedAmount.value < 1000) {
    alert('최소 충전 금액은 1,000원입니다.')
    return
  }

  if (!tossPayments) {
    alert('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
    return
  }

  try {
    // 1. 서버에 충전 요청 생성 (orderId와 함께)
    const orderId = uuidv4();
    const orderName = `포인트 ${selectedAmount.value.toLocaleString()}원 충전`

    // 백엔드 API 호출하여 주문 정보 저장
    const response = await api.post('/payments/create', {
      orderId: orderId,
      amount: selectedAmount.value
    })

    console.log('충전 요청 생성 성공:', response.data)

    // 2. 토스페이먼트 결제 요청 (카드 결제만 사용)
    await tossPayments.requestPayment('카드', {
      amount: selectedAmount.value,
      orderId: orderId,
      orderName: orderName,
      customerName: localStorage.getItem('user_name') || '사용자',
      successUrl: 'https://0982.store/api/payments/confirm',
      failUrl: `https://0982.store/api/payments/fail`
    })

  } catch (error) {
    console.error('결제 요청 실패:', error)
    if (error.code === 'USER_CANCEL') {
      alert('결제가 취소되었습니다.')
    } else if (error.response) {
      alert(`결제 요청 실패: ${error.response.data?.message || '서버 오류가 발생했습니다.'}`)
    } else {
      alert('결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }
}

const fetchUserPoints = async () => {
  try {
    const response = await authAPI.getPoints()
    const data = response?.data || response
    if (data?.pointBalance !== undefined) {
      userPoints.value = data.pointBalance || 0
    } else if (data?.point !== undefined) {
      // 하위 호환
      userPoints.value = data.point || 0
    }
  } catch (error) {
    console.error('포인트 조회 실패:', error)
  }
}

const formatHistoryDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getHistoryStatusText = (status) => {
  const map = {
    CHARGED: '충전',
    BONUS_EARNED: '보너스',
    TRANSFERRED: '출금',
    RETURNED: '반환',
    USED: '사용'
  }
  return map[status] || status || '-'
}

const fetchChargeHistory = async () => {
  historyLoading.value = true
  try {
    const response = await authAPI.getPointHistories({
      page: 0,
      size: 10
    })
    const pageData = response?.data || response
    const list = Array.isArray(pageData?.content) ? pageData.content : []
    chargeHistory.value = list.map(item => ({
      id: item.id || item.orderId,
      date: formatHistoryDate(item.createdAt),
      amount: (item.paidPoint || 0) + (item.bonusPoint || 0),
      status: (item.status || '').toLowerCase(),
      statusText: getHistoryStatusText(item.status)
    }))
  } catch (error) {
    console.error('포인트 이력 조회 실패:', error)
    chargeHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

onMounted(() => {
  loadTossPayments()
  fetchUserPoints()
  fetchChargeHistory()
})
</script>

<style scoped>
.page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.panel h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #ffffff;
}

.current-points {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.points-value {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
}

.points-unit {
  font-size: 24px;
  color: #999;
}

.points-info {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.amount-chips {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.amount-chip {
  padding: 16px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-chip:hover {
  border-color: #ffffff;
  background: #151515;
}

.amount-chip.active {
  background: #ffffff;
  color: #0a0a0a;
  border-color: #ffffff;
}

.custom-amount-input {
  margin-top: 12px;
}

.custom-amount-input input {
  width: 100%;
  background: #0f0f0f;
  color: #ffffff;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.custom-amount-input input::placeholder {
  color: #666;
}

.custom-amount-input input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.payment-info {
  margin-bottom: 24px;
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

.info-label {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 14px;
}

.info-value {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.info-value.highlight {
  color: #ffffff;
  font-size: 20px;
}

.btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-large {
  height: 56px;
  font-size: 18px;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-date {
  font-size: 13px;
  color: #999;
}

.history-amount {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.history-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.history-status.completed {
  background: #2a2a2a;
  color: #51cf66;
}

.history-status.failed {
  background: #2a2a2a;
  color: #ff6b6b;
}

.history-status.charged,
.history-status.bonus_earned,
.history-status.returned {
  background: #2a2a2a;
  color: #74c0fc;
}

.history-status.transferred,
.history-status.used {
  background: #2a2a2a;
  color: #ffd43b;
}

@media (max-width: 920px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .amount-chips {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container h1 {
    font-size: 24px;
  }

  .panel {
    padding: 20px;
  }

  .points-value {
    font-size: 36px;
  }

  .amount-chips {
    grid-template-columns: 1fr;
  }
}
</style>
