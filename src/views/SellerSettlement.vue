<template>
  <main class="settlement-page">
    <div class="container">
      <div class="page-header">
        <h1>정산 결과</h1>
        <p>판매 정산 내역을 확인하실 수 있습니다</p>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <span class="card-label">이번 달 정산</span>
            <span class="card-value">₩{{ summary.monthlyRevenue.toLocaleString() }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">⏳</div>
          <div class="card-content">
            <span class="card-label">정산 예정 금액</span>
            <span class="card-value highlight">₩{{ summary.pendingAmount.toLocaleString() }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <span class="card-label">누적 정산</span>
            <span class="card-value">₩{{ summary.totalSettled.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-group">
          <label>기간 선택</label>
          <select v-model="selectedPeriod">
            <option value="all">전체</option>
            <option value="thisMonth">이번 달</option>
            <option value="lastMonth">지난 달</option>
            <option value="last3Months">최근 3개월</option>
            <option value="last6Months">최근 6개월</option>
          </select>
        </div>
        <div class="filter-group">
          <label>유형</label>
          <select v-model="selectedStatus">
            <option value="all">전체</option>
            <option value="credit">정산</option>
            <option value="debit">송금</option>
          </select>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>정산 내역을 불러오는 중...</p>
      </div>

      <div v-else>
        <div class="settlement-table">
          <table>
            <thead>
              <tr>
                <th>정산일</th>
                <th>정산 ID</th>
                <th>금액</th>
                <th>유형</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSettlements" :key="item.id">
                <td>{{ item.date }}</td>
                <td class="settlement-id">{{ item.settlementId?.substring(0, 8) }}...</td>
                <td class="amount">₩{{ item.amount.toLocaleString() }}</td>
                <td>
                  <span class="status-badge" :class="item.status">
                    {{ item.statusText }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredSettlements.length === 0" class="empty-state">
          <p>정산 내역이 없습니다</p>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="btn-page"
            :disabled="currentPage === 0"
            @click="fetchBalanceHistory(currentPage - 1)"
          >
            이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button
            class="btn-page"
            :disabled="currentPage >= totalPages - 1"
            @click="fetchBalanceHistory(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>

      <div class="settlement-details">
        <div class="detail-card">
          <h3>잔액 내역 안내</h3>
          <ul class="info-list">
            <li>정산: 판매 수익이 판매자 잔액에 추가되는 내역입니다</li>
            <li>송금: 판매자 계좌로 출금된 금액입니다</li>
            <li>정산 예정 금액: 누적 정산에서 전체 송금을 제외한 금액 (3만원 미만 시 송금 불가)</li>
            <li>정산은 매월 1일에 진행됩니다</li>
            <li>문의사항은 고객센터로 연락주세요</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { sellerBalanceApi } from '@/api/axios'
import { formatDateTime } from '@/utils/timeFormatter'

const selectedPeriod = ref('all')
const selectedStatus = ref('all')
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

const summary = ref({
  monthlyRevenue: 0,
  pendingAmount: 0,
  totalSettled: 0
})

const settlements = ref([])

// 정산 내역 조회
const fetchBalanceHistory = async (page = 0) => {
  try {
    loading.value = true
    const response = await sellerBalanceApi.getBalanceHistory(page, pageSize)

    console.log('정산 내역 API 응답:', response.data)

    const pageData = response.data.data

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const transformedData = pageData.content.map(item => ({
      id: item.sellerBalanceHistoryId,
      settlementId: item.settlementId,
      date: formatDateTime(item.createdAt),
      amount: item.amount,
      status: mapBalanceStatus(item.status),
      statusText: getStatusText(item.status),
      createdAt: item.createdAt
    }))

    settlements.value = transformedData
    totalPages.value = pageData.totalPages
    currentPage.value = page

    // 요약 데이터 계산
    calculateSummary()
  } catch (error) {
    console.error('정산 내역 조회 실패:', error)
    if (error.response?.status === 401) {
      return
    }
    alert('정산 내역을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 백엔드 상태값을 프론트엔드 상태로 매핑
const mapBalanceStatus = (backendStatus) => {
  const statusMap = {
    'CREDIT': 'credit',
    'DEBIT': 'debit'
  }
  return statusMap[backendStatus] || 'credit'
}

// 상태 텍스트 변환
const getStatusText = (backendStatus) => {
  const textMap = {
    'CREDIT': '정산',
    'DEBIT': '송금'
  }
  return textMap[backendStatus] || '알 수 없음'
}

// 요약 데이터 계산
const calculateSummary = () => {
  const now = new Date()
  const thisMonth = settlements.value.filter(item => {
    const itemDate = new Date(item.createdAt)
    return itemDate.getMonth() === now.getMonth() &&
           itemDate.getFullYear() === now.getFullYear()
  })

  // 이번 달 정산 총액
  const thisMonthCredit = thisMonth
    .filter(item => item.status === 'credit')
    .reduce((sum, item) => sum + item.amount, 0)

  summary.value.monthlyRevenue = thisMonthCredit

  // 누적 정산 총액
  const totalCredit = settlements.value
    .filter(item => item.status === 'credit')
    .reduce((sum, item) => sum + item.amount, 0)

  // 전체 송금 총액
  const totalDebit = settlements.value
    .filter(item => item.status === 'debit')
    .reduce((sum, item) => sum + item.amount, 0)

  summary.value.totalSettled = totalCredit

  // 정산 예정 금액 = (누적 정산 - 전체 송금)
  // 3만원 미만이면 0, 3만원 이상이면 그 금액
  const pendingCalc = totalCredit - totalDebit
  summary.value.pendingAmount = pendingCalc >= 30000 ? pendingCalc : 0
}

const filteredSettlements = computed(() => {
  let filtered = [...settlements.value]

  // 기간 필터
  if (selectedPeriod.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt)

      switch (selectedPeriod.value) {
        case 'thisMonth': {
          return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          )
        }

        case 'lastMonth': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          return (
            itemDate.getMonth() === lastMonth.getMonth() &&
            itemDate.getFullYear() === lastMonth.getFullYear()
          )
        }

        case 'last3Months': {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3)
          return itemDate >= threeMonthsAgo
        }

        case 'last6Months': {
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6)
          return itemDate >= sixMonthsAgo
        }

        default:
          return true
      }
    })
  }

  // 상태 필터
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(item => item.status === selectedStatus.value)
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

onMounted(() => {
  fetchBalanceHistory()
})
</script>

<style scoped>
.settlement-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
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

.page-header p {
  color: #a0a0a0;
  font-size: 15px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  font-size: 40px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.card-value.highlight {
  color: #ffffff;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.filter-group select {
  padding: 10px 14px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #ffffff;
}

.settlement-table {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #0f0f0f;
}

th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
  border-bottom: 1px solid #2a2a2a;
}

td {
  padding: 16px;
  color: #e0e0e0;
  font-size: 14px;
  border-bottom: 1px solid #2a2a2a;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #222222;
}

.settlement-id {
  font-family: monospace;
  color: #999;
  font-size: 13px;
}

.amount {
  font-weight: 700;
  color: #ffffff;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.credit {
  background: #2a2a2a;
  color: #51cf66;
}

.status-badge.debit {
  background: #2a2a2a;
  color: #ff6b6b;
}

.loading-state {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #999;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0;
}

.btn-page {
  padding: 10px 20px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #222222;
  border-color: #3a3a3a;
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: #999;
  font-size: 14px;
  min-width: 80px;
  text-align: center;
}

.settlement-details {
  margin-top: 32px;
}

.detail-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
}

.detail-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-list li {
  color: #999;
  font-size: 14px;
  padding-left: 20px;
  position: relative;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ffffff;
}

@media (max-width: 900px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .settlement-table {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }
}
</style>




