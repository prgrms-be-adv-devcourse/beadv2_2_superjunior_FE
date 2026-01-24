<template>
  <main class="page">
    <div class="container">
      <header class="page-header">
        <h1>포인트</h1>
        <p class="subtitle">포인트 충전 및 이력을 확인할 수 있습니다</p>
      </header>

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
        <div class="panel-header">
          <h3>충전 정보</h3>
        </div>
        <div class="payment-info">
          <div class="info-row">
            <span class="info-label">충전 금액</span>
            <span class="info-value">{{ selectedAmount.toLocaleString() }}원</span>
          </div>
          <div class="info-row">
            <span class="info-label">충전 방식</span>
            <span class="info-value">포인트 충전 요청</span>
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

      <!-- 충전 내역 -->
      <div class="panel">
        <div class="panel-header">
          <h3>충전 / 차감 이력</h3>
        </div>
        <div v-if="loadingHistories" class="loading-state">
          <p>이력을 불러오는 중...</p>
        </div>
        <div v-else-if="pointHistories.length === 0" class="empty-history">
          <p>이력이 없습니다</p>
        </div>
        <div v-else class="history-list">
          <div v-for="item in pointHistories" :key="item.id" class="history-item">
            <div class="history-info">
              <span class="history-date">{{ item.date }}</span>
              <span class="history-amount" :class="item.type">
                {{ item.type === 'credit' ? '+' : '-' }}{{ item.amount.toLocaleString() }}원
              </span>
            </div>
            <span class="history-status" :class="item.type">{{ item.statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import api, { pointApi } from '@/api/axios'
import { authAPI } from '@/api/auth'
// import { useRouter } from 'vue-router'

// const router = useRouter()

const userPoints = ref(0)
const selectedAmount = ref(10000)
const customAmount = ref(null)

const presetAmounts = [10000, 30000, 50000, 100000, 200000, 500000]

const pointHistories = ref([])
const loadingHistories = ref(false)

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

  try {
    const idempotencyKey = uuidv4()
    const response = await api.post('/points/charge', {
      amount: selectedAmount.value,
      idempotencyKey
    })

    console.log('포인트 충전 성공:', response.data)
    alert('포인트 충전이 완료되었습니다.')
    await fetchUserPoints()
    await fetchPointHistories()
  } catch (error) {
    console.error('포인트 충전 실패:', error)
    if (error.response) {
      alert(`포인트 충전 실패: ${error.response.data?.message || '서버 오류가 발생했습니다.'}`)
    } else {
      alert('포인트 충전 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }
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
      // 하위 호환
      userPoints.value = data.point || 0
    }
  } catch (error) {
    console.error('포인트 조회 실패:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

const normalizeHistories = (response) => {
  const data = response?.data?.data || response?.data || response
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data)) return data
  return []
}

const mapHistoryItem = (item, index) => {
  const status = (item.status || '').toString().toUpperCase()
  const paidPoint = Number(item.paidPoint ?? 0)
  const bonusPoint = Number(item.bonusPoint ?? 0)
  const rawAmount = Number(
    item.amount ??
    item.changeAmount ??
    item.pointAmount ??
    item.point ??
    (paidPoint + bonusPoint)
  )
  const isCredit = status === 'CHARGED' || status === 'BONUS' || rawAmount > 0
  const amount = Math.abs(rawAmount)

  const statusTextMap = {
    CHARGED: '충전',
    BONUS: '보너스',
    DEDUCTED: '차감',
    REFUNDED: '환불',
    CANCELLED: '취소'
  }

  return {
    id: item.id || item.historyId || item.pointHistoryId || item.transactionId || `${item.createdAt || 'history'}-${index}`,
    date: formatDate(item.createdAt || item.date || item.updatedAt),
    amount,
    type: isCredit ? 'credit' : 'debit',
    statusText: statusTextMap[status] || (isCredit ? '충전' : '차감')
  }
}

const fetchPointHistories = async () => {
  loadingHistories.value = true
  try {
    const response = await pointApi.getPointHistories({
      page: 0,
      size: 20,
      sort: 'createdAt,desc'
    })
    const list = normalizeHistories(response)
    pointHistories.value = list.map(mapHistoryItem)
  } catch (error) {
    console.error('포인트 이력 조회 실패:', error)
    pointHistories.value = []
  } finally {
    loadingHistories.value = false
  }
}

onMounted(() => {
  fetchUserPoints()
  fetchPointHistories()
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #ffffff;
}

.subtitle {
  color: #999;
  font-size: 16px;
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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;
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

.history-amount.credit {
  color: #51cf66;
}

.history-amount.debit {
  color: #ff6b6b;
}

.history-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.history-status.credit {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.history-status.debit {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
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
  .page-header h1 {
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
