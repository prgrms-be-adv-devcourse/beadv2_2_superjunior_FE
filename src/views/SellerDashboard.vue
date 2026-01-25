<template>
  <main class="seller-page">
    <div class="container">
      <!-- 판매자 정보 섹션 -->
      <section class="seller-info-section">
        <div class="seller-hero">
          <div class="seller-main">
            <div class="seller-header">
              <div>
                <p class="eyebrow">판매자 센터</p>
              </div>
            </div>
            <!-- <h1>{{ seller.name }}</h1> -->
            <!-- <p class="description">{{ seller.description }}</p> -->
            <!-- <div class="badges">
              <span v-for="badge in seller.badges" :key="badge" class="badge">{{ badge }}</span>
            </div> -->
            <!-- <div class="hero-stats">
              <div class="stat">
                <strong>{{ seller.rating }}</strong>
                <span>평점</span>
              </div>
              <div class="stat">
                <strong>{{ seller.followers.toLocaleString() ?? '0' }}</strong>
                <span>팔로워</span>
              </div>
              <div class="stat">
                <strong>{{ seller.totalSales.toLocaleString() ?? '0' }}</strong>
                <span>누적 판매</span>
              </div>
              <div class="stat">
                <strong>{{ (seller.responseRate * 100).toFixed(0) }}%</strong>
                <span>응답률</span>
              </div>
            </div> -->
            <div class="seller-info-list">
              <div class="info-row">
                <span class="info-label">은행</span>
                <span class="info-value">{{ getBankName(sellerInfo.bankCode) || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">계좌번호</span>
                <span class="info-value">{{ sellerInfo.accountNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">예금주</span>
                <span class="info-value">{{ sellerInfo.accountHolder || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">사업자 등록번호</span>
                <span class="info-value">{{ sellerInfo.businessRegistrationNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">전화번호</span>
                <span class="info-value">{{ sellerInfo.phoneNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">이메일</span>
                <span class="info-value">{{ sellerInfo.email || '-' }}</span>
              </div>
            </div>
          </div>
          <button class="btn-edit-profile" @click="showEditModal = true">정보 수정</button>
        </div>
      </section>

      <!-- 대시보드 그리드 -->
      <section class="dashboard-grid">
        <!-- 정산 내역 -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>정산 내역</h2>
            <router-link to="/seller/settlement" class="view-all-link">전체보기 →</router-link>
          </div>
          <div class="settlement-list">
            <div v-for="item in settlement.history" :key="item.id" class="settlement-item">
              <div class="settlement-content">
                <div class="settlement-main">
                  <div class="settlement-date-group">
                    <span class="settlement-date-label">일시</span>
                    <span class="settlement-date">{{ item.date }}</span>
                  </div>
                  <div class="settlement-amount-group">
                    <span class="settlement-amount-label">금액</span>
                    <span class="settlement-amount">₩{{ (item.amount || 0).toLocaleString() ?? '0' }}</span>
                  </div>
                </div>
                <div class="settlement-status-wrapper">
                  <span class="settlement-status" :class="item.status">{{ item.statusText }}</span>
                </div>
              </div>
            </div>
            <div v-if="settlement.history.length === 0" class="empty-state">
              <p>정산 내역이 없습니다</p>
            </div>
          </div>
        </article>

        <!-- 판매 통계 -->
        <!-- <article class="panel wide">
          <div class="panel-header">
            <h2>판매 통계</h2>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-icon">📦</div>
              <span class="stat-label">총 판매 건수</span>
              <span class="stat-number">{{ sellerStats.totalSales.toLocaleString() ?? '0' }}</span>
            </div>
            <div class="stat-box">
              <div class="stat-icon">🛒</div>
              <span class="stat-label">진행 중인 공동구매</span>
              <span class="stat-number">{{ sellerStats.activeProducts }}</span>
            </div>
            <div class="stat-box">
              <div class="stat-icon">⭐</div>
              <span class="stat-label">평균 평점</span>
              <span class="stat-number">{{ sellerStats.averageRating }}</span>
            </div>
            <div class="stat-box">
              <div class="stat-icon">😊</div>
              <span class="stat-label">고객 만족도</span>
              <span class="stat-number">{{ sellerStats.satisfaction }}%</span>
            </div>
          </div>
        </article> -->

        <!-- 내 상품 목록 -->
        <article class="panel wide">
          <div class="panel-header">
            <div class="header-left">
              <h2>내 상품 목록</h2>

              <div class="search-bar">
                <input
                  v-model="searchKeyword"
                  placeholder="상품명을 검색하세요"
                  @keyup.enter="searchProducts"
                />

                <select v-model="searchCategory">
                  <option value="">전체 카테고리</option>
                  <option value="HOME">생활 & 주방</option>
                  <option value="FOOD">식품 & 간식</option>
                  <option value="HEALTH">건강 & 헬스</option>
                  <option value="BEAUTY">뷰티</option>
                  <option value="FASHION">패션 & 의류</option>
                  <option value="ELECTRONICS">전자 & 디지털</option>
                  <option value="KIDS">유아 & 어린이</option>
                  <option value="HOBBY">취미</option>
                  <option value="PET">반려동물</option>
                </select>

                <button class="btn btn-primary" @click="searchProducts">
                  검색
                </button>
              </div>
            </div>

            <div class="header-actions">
              <router-link
                to="/seller/register/product-register"
                class="btn-new-product"
              >
                + 상품 등록
              </router-link>
              <router-link to="/seller/products" class="link">
                전체 보기 →
              </router-link>
            </div>
          </div>

          <!-- ✅ 상품 카드 grid (카드만 들어감) -->
          <div class="product-list">
            <div v-if="loadingProducts" class="loading-state">
              <p>상품 목록을 불러오는 중...</p>
            </div>

            <template v-else>
              <div
                v-for="product in sellerProducts"
                :key="product.id"
                class="product-card"
                @click="goToProduct(product.id)"
              >
                <img :src="product.image" :alt="product.title" />
                <div class="product-info">
                  <p class="category">{{ product.category }}</p>
                  <h3>{{ product.title }}</h3>
                  <p class="price">
                    ₩{{ Number(product.currentPrice || 0).toLocaleString() }}
                  </p>
                  <span class="progress-text">재고: {{ product.stock }}개</span>
                </div>
              </div>

              <div v-if="sellerProducts.length === 0" class="empty-state">
                <p>등록된 상품이 없습니다</p>
                <router-link
                  to="/seller/register/product-register"
                  class="btn btn-primary"
                >
                  상품 등록하기
                </router-link>
              </div>
            </template>
          </div>

          <!-- ✅ pagination은 grid 밖 -->
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <div class="pagination">
              <button
                class="page-btn"
                :disabled="page === 0"
                @click="goToPage(page - 1)"
              >
                이전
              </button>

              <span class="page-info">
                {{ page + 1 }} / {{ totalPages }}
              </span>

              <button
                class="page-btn"
                :disabled="page + 1 >= totalPages"
                @click="goToPage(page + 1)"
              >
                다음
              </button>
            </div>
          </div>
        </article>


        <!-- 공동 구매 목록 -->
        <!-- 공동 구매 목록 -->
        <article class="panel wide">
          <div class="panel-header">
            <div class="header-left">
              <h2>공동 구매 목록</h2>

              <div class="search-bar">
                <input
                  v-model="purchaseSearchKeyword"
                  placeholder="공동구매명을 검색하세요"
                  @keyup.enter="fetchMyGroupPurchases"
                />

                <select v-model="purchaseSearchCategory">
                  <option value="">전체 카테고리</option>
                  <option value="HOME">생활 & 주방</option>
                  <option value="FOOD">식품 & 간식</option>
                  <option value="HEALTH">건강 & 헬스</option>
                  <option value="BEAUTY">뷰티</option>
                  <option value="FASHION">패션 & 의류</option>
                  <option value="ELECTRONICS">전자 & 디지털</option>
                  <option value="KIDS">유아 & 어린이</option>
                  <option value="HOBBY">취미</option>
                  <option value="PET">반려동물</option>
                </select>

                <button class="btn btn-primary" @click="fetchMyGroupPurchases">
                  검색
                </button>
              </div>
            </div>

            <div class="header-actions">
              <router-link to="/group-purchases/create" class="btn-new-product">
                + 공동구매 등록
              </router-link>
              <router-link to="/group-purchases" class="link">
                전체 보기 →
              </router-link>
            </div>
          </div>

          <div class="group-purchase-list">
            <div v-if="loadingGroupPurchases" class="loading-state">
              <p>공동구매 목록을 불러오는 중...</p>
            </div>
            <template v-else>
              <div
                v-for="gp in sellerGroupPurchases"
                :key="gp.id"
                class="group-purchase-item"
                @click="goToGroupPurchase(gp.id)"
              >
                <img :src="gp.image" :alt="gp.title" />
                <div class="item-info">
                  <h3>{{ gp.title }}</h3>
                  <p class="item-meta">
                    <span>참여자: {{ gp.currentCount }}/{{ gp.maxQuantity }}명</span>
                    <span>남은 시간: {{ getTimeRemaining(gp.endDate) }}</span>
                  </p>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${Math.min((gp.currentCount / gp.maxQuantity) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
                <div class="item-price">
                  <span class="original-price">₩{{ Number(gp.originalPrice || 0).toLocaleString() }}</span>
                  <span class="current-price">₩{{ gp.discountPrice.toLocaleString() ?? '0'}}</span>
                </div>
              </div>
              <div v-if="sellerGroupPurchases.length === 0" class="empty-state">
                <p>진행 중인 공동구매가 없습니다</p>
                <router-link to="/group-purchases/create" class="btn btn-primary">공동구매 등록하기</router-link>
              </div>
            </template>
          </div>
          <div v-if="purchaseTotalPages > 1" class="pagination-wrapper">
            <div class="pagination">
              <button
                class="page-btn"
                :disabled="purchasePage === 0"
                @click="goToPurchasePage(purchasePage - 1)"
              >
                이전
              </button>

              <span class="page-info">
                {{ purchasePage + 1 }} / {{ purchaseTotalPages }}
              </span>

              <button
                class="page-btn"
                :disabled="purchasePage + 1 >= purchaseTotalPages"
                @click="goToPurchasePage(purchasePage + 1)"
              >
                다음
              </button>
            </div>
          </div>
        </article>

        <!-- 주문 목록 -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>주문 목록</h2>
          </div>
          <div v-if="loadingOrders" class="loading-state">
            <p>주문 내역을 불러오는 중...</p>
          </div>
          <div v-else-if="orderList.length === 0" class="empty-state">
            <p>주문 내역이 없습니다</p>
          </div>
          <div v-else class="order-list">
            <div v-for="order in orderList" :key="order.orderId" class="order-item">
              <div class="order-header">
                <div>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  <span class="order-number">주문번호: {{ order.orderId || '-' }}</span>
                </div>
                <span class="order-status" :class="order.status?.toLowerCase()">{{ getStatusText(order.status) }}</span>
              </div>
              <div v-if="order.products && order.products.length > 0" class="order-products">
                <div v-for="product in order.products" :key="product.id" class="order-product">
                  <div class="product-details">
                    <h4>{{ product.title }}</h4>
                    <p class="product-option">{{ product.option }}</p>
                    <div class="product-meta">
                      <span>수량: {{ product.quantity }}개</span>
                      <span class="product-price">₩{{ Number(product.price || 0).toLocaleString() }}
</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="order-summary">
                <div class="order-summary-left">
                  <p v-if="order.groupPurchaseName" class="order-gp-name">
                    {{ order.groupPurchaseName }}
                  </p>
                </div>
                <div class="order-summary-right">
                  <p class="order-quantity label-bold">수량: {{ order.quantity }}개</p>
                  <p class="order-price label-bold">단가: ₩{{ (order.price||0).toLocaleString() || '-' }}</p>
                </div>
              </div>
              <div class="order-footer">
                <span class="order-total">총 결제금액: ₩{{ (order.totalAmount||0).toLocaleString() ?? '0' }}</span>
                <div class="order-actions">
                  <button class="btn btn-outline btn-sm" @click="viewOrderDetail(order.orderId)">상세보기</button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- 고객 문의 현황 -->
        <article class="panel">
          <div class="panel-header">
            <h2>고객 문의 현황</h2>
          </div>
          <ul class="qna-list">
            <li v-for="item in qna" :key="item.id" class="qna-item">
              <div class="qna-content">
                <p class="question">Q. {{ item.question }}</p>
                <p class="answer">A. {{ item.answer }}</p>
              </div>
              <span class="status" :class="item.status === '완료' ? 'completed' : 'pending'">{{ item.status }}</span>
            </li>
            <li v-if="qna.length === 0" class="empty-state">
              <p>문의 내역이 없습니다</p>
            </li>
          </ul>
        </article>

        <!-- 공지 사항 -->
        <article class="panel">
          <div class="panel-header">
            <h2>공지 사항</h2>
          </div>
          <ul class="notice-list">
            <li v-for="notice in notices" :key="notice.id" class="notice-item">
              <span class="tag">{{ notice.type }}</span>
              <span class="notice-title">{{ notice.title }}</span>
              <span class="date">{{ notice.date }}</span>
            </li>
            <li v-if="notices.length === 0" class="empty-state">
              <p>공지 사항이 없습니다</p>
            </li>
          </ul>
        </article>
      </section>
    </div>

    <!-- 판매자 정보 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>판매자 정보 수정</h2>
          <button class="close-btn" @click="showEditModal = false">✕</button>
        </div>
        <form @submit.prevent="saveSellerInfo" class="edit-form">
          <!-- <div class="form-section">
            <h3>상점 정보</h3>
            <div class="form-group">
              <label>상점명 *</label>
              <input v-model="editForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>상점 소개 *</label>
              <textarea v-model="editForm.description" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>배지 (쉼표로 구분)</label>
              <input v-model="badgesInput" type="text" placeholder="예: 프리미엄 셀러, 24시간 상담" />
            </div>
          </div> -->

          <div class="form-section">
            <h3>사업자 정보</h3>
            <div class="form-group">
              <label for="editBusinessNumber">사업자 등록번호 *</label>
              <input
                id="editBusinessNumber"
                v-model="editForm.businessRegistrationNumber"
                type="text"
                placeholder="000-00-00000"
                required
                maxlength="12"
                @input="formatBusinessNumber"
              />
              <p v-if="businessNumberError" class="form-error">{{ businessNumberError }}</p>
              <p class="form-hint">XXX-XX-XXXXX 형식으로 입력해주세요</p>
            </div>
          </div>

          <div class="form-section">
            <h3>계좌 정보</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="editBankCode">은행 *</label>
                <select
                  id="editBankCode"
                  v-model="editForm.bankCode"
                  required
                  @change="validateBankCode"
                >
                  <option value="">은행을 선택하세요</option>
                  <option v-for="bank in bankList" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </select>
                <p v-if="bankCodeError" class="form-error">{{ bankCodeError }}</p>
              </div>
              <div class="form-group">
                <label for="editAccountNumber">계좌번호 *</label>
                <input
                  id="editAccountNumber"
                  v-model="editForm.accountNumber"
                  type="text"
                  placeholder="계좌번호를 입력하세요"
                  required
                  maxlength="20"
                  @input="validateAccountNumber"
                />
                <p v-if="accountNumberError" class="form-error">{{ accountNumberError }}</p>
                <p class="form-hint">숫자만 입력 가능합니다 (1-20자)</p>
              </div>
            </div>
            <div class="form-group">
              <label for="editAccountHolder">예금주 *</label>
              <input
                id="editAccountHolder"
                v-model="editForm.accountHolder"
                type="text"
                placeholder="예금주명을 입력하세요"
                required
                maxlength="50"
                @input="validateAccountHolder"
              />
              <p v-if="accountHolderError" class="form-error">{{ accountHolderError }}</p>
              <p class="form-hint">한글과 영어만 입력 가능합니다 (1-50자)</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showEditModal = false">취소</button>
            <button type="submit" class="btn btn-primary" :disabled="!isEditFormValid">저장</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sellerProfile, sellerNotices, sellerQna } from '@/data/products'
import { authAPI } from '@/api/auth'
import { sellerBalanceApi, productApi } from '@/api/axios'
import { formatDateTime } from '@/utils/timeFormatter'

const router = useRouter()

const seller = ref({ ...sellerProfile })
const sellerProducts = ref([])
const sellerGroupPurchases = ref([])
const orderList = ref([])

const loadingProducts = ref(false)
const loadingGroupPurchases = ref(false)
const loadingOrders = ref(false)

const showEditModal = ref(false)

const sellerInfo = ref({
  bankCode: '',
  accountNumber: '',
  accountHolder: '',
  businessRegistrationNumber: '',
  phoneNumber: '',
  email: ''
})
const editForm = ref({
  name: '',
  description: '',
  businessRegistrationNumber: '',
  bankCode: '',
  accountNumber: '',
  accountHolder: ''
})
const badgesInput = ref('')

// 은행 코드 리스트
const bankList = [
  { code: '002', name: 'KDB산업은행' },
  { code: '003', name: 'IBK기업은행' },
  { code: '004', name: 'KB국민은행' },
  { code: '005', name: 'KEB하나은행' },
  { code: '007', name: '수협은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '020', name: '우리은행' },
  { code: '023', name: 'SC은행' },
  { code: '027', name: '씨티은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '045', name: 'MG새마을금고' },
  { code: '048', name: '신협' },
  { code: '050', name: '저축은행' },
  { code: '064', name: '산림조합' },
  { code: '071', name: '우체국' },
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
  { code: '103', name: 'SBI저축은행' },
  { code: '218', name: 'KB증권' },
  { code: '230', name: '미래에셋증권' },
  { code: '238', name: '미래에셋증권' },
  { code: '240', name: '삼성증권' },
  { code: '243', name: '한국투자증권' },
  { code: '247', name: 'NH투자증권' },
  { code: '261', name: '교보증권' },
  { code: '262', name: '하이투자증권' },
  { code: '263', name: '현대차투자증권' },
  { code: '264', name: '키움증권' },
  { code: '265', name: '이베스트증권' },
  { code: '266', name: 'SK증권' },
  { code: '267', name: '대신증권' },
  { code: '269', name: '한화투자증권' },
  { code: '270', name: '하나증권' },
  { code: '271', name: '토스증권' },
  { code: '278', name: '신한투자증권' },
  { code: '279', name: 'DB금융투자' },
  { code: '280', name: '유진투자' },
  { code: '287', name: '메리츠증권' },
  { code: '888', name: '토스머니' },
  { code: '889', name: '토스포인트' }
]

const accountNumberError = ref('')
const bankCodeError = ref('')
const accountHolderError = ref('')
const businessNumberError = ref('')

const settlement = ref({
  monthlyRevenue: 0,
  pendingAmount: 0,
  totalSettled: 0,
  history: []
})

// 정산 내역 조회 (최신 5개)
const fetchBalanceHistory = async () => {
  try {
    const response = await sellerBalanceApi.getBalanceHistory(0, 5)
    const pageData = response.data.data

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    settlement.value.history = pageData.content.map(item => ({
      id: item.sellerBalanceHistoryId,
      date: formatDateTime(item.createdAt),
      amount: item.amount,
      status: item.status === 'CREDIT' ? 'credit' : 'debit',
      statusText: item.status === 'CREDIT' ? '정산' : '송금'
    }))

    // 요약 데이터 계산
    calculateSettlementSummary()
  } catch (error) {
    console.error('정산 내역 조회 실패:', error)
  }
}

// 정산 요약 계산
const calculateSettlementSummary = () => {
  const now = new Date()

  // 이번 달 정산
  const thisMonthCredit = settlement.value.history
    .filter(item => {
      const itemDate = new Date(item.date)
      return item.status === 'credit' &&
             itemDate.getMonth() === now.getMonth() &&
             itemDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, item) => sum + item.amount, 0)

  settlement.value.monthlyRevenue = thisMonthCredit

  // 누적 정산
  const totalCredit = settlement.value.history
    .filter(item => item.status === 'credit')
    .reduce((sum, item) => sum + item.amount, 0)

  // 전체 송금
  const totalDebit = settlement.value.history
    .filter(item => item.status === 'debit')
    .reduce((sum, item) => sum + item.amount, 0)

  settlement.value.totalSettled = totalCredit

  // 정산 예정 금액 = (누적 정산 - 전체 송금)
  const pendingCalc = totalCredit - totalDebit
  settlement.value.pendingAmount = pendingCalc >= 30000 ? pendingCalc : 0
}

// const sellerStats = ref({
//   totalSales: 3245,
//   activeProducts: 8,
//   averageRating: 4.9,
//   satisfaction: 98
// })

const notices = ref([...sellerNotices])
const qna = ref([...sellerQna])

// 계좌번호 유효성 검사
const validateAccountNumber = () => {
  const value = editForm.value.accountNumber
  if (!value) {
    accountNumberError.value = ''
    return
  }
  if (!/^[0-9]+$/.test(value)) {
    accountNumberError.value = '계좌번호는 숫자만 입력 가능합니다.'
  } else if (value.length < 1 || value.length > 20) {
    accountNumberError.value = '계좌번호는 1-20자로 입력해주세요.'
  } else {
    accountNumberError.value = ''
  }
}

// 은행 코드 유효성 검사
const validateBankCode = () => {
  const value = editForm.value.bankCode
  if (!value) {
    bankCodeError.value = '은행을 선택해주세요.'
  } else {
    bankCodeError.value = ''
  }
}

// 예금주 유효성 검사
const validateAccountHolder = () => {
  const value = editForm.value.accountHolder
  if (!value) {
    accountHolderError.value = ''
    return
  }
  if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
    accountHolderError.value = '예금주는 한글과 영어만 입력 가능합니다.'
  } else if (value.length < 1 || value.length > 50) {
    accountHolderError.value = '예금주는 1-50자로 입력해주세요.'
  } else {
    accountHolderError.value = ''
  }
}

// 사업자 등록번호 포맷팅
const formatBusinessNumber = () => {
  let value = editForm.value.businessRegistrationNumber.replace(/[^0-9]/g, '')
  
  if (value.length > 10) {
    value = value.substring(0, 10)
  }
  
  if (value.length > 5) {
    value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5)
  } else if (value.length > 3) {
    value = value.substring(0, 3) + '-' + value.substring(3)
  }
  
  editForm.value.businessRegistrationNumber = value
  
  if (!value) {
    businessNumberError.value = ''
    return
  }
  if (!/^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(value)) {
    businessNumberError.value = '사업자 등록번호는 XXX-XX-XXXXX 형식으로 입력해야 합니다.'
  } else {
    businessNumberError.value = ''
  }
}

// 은행 코드를 은행 이름으로 변환
const getBankName = (bankCode) => {
  if (!bankCode) return ''
  const bank = bankList.find(b => b.code === bankCode)
  return bank ? bank.name : bankCode
}

// 날짜 포맷팅
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

// 주문 ID 포맷팅 (UUID를 짧게)
// const formatOrderId = (orderId) => {
//   if (!orderId) return '-'
//   // UUID의 첫 8자리만 표시
//   return orderId.toString().substring(0, 8).toUpperCase()
// }

// 주문 상태 텍스트 변환
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '결제 대기',
    'PAYMENT_COMPLETED': '결제 완료',
    'PAYMENT_FAILED': '결제 실패',
    'ORDER_FAILED': '주문 실패',
    'GROUP_PURCHASE_SUCCESS': '공동구매 성공',
    'GROUP_PURCHASE_FAIL': '공동구매 실패',
    'CANCEL_REQUESTED': '취소 요청',
    'CANCELLED': '취소 완료',
    'REVERSE_REQUESTED': '번복 요청',
    'REVERSED': '번복 완료',
    'REFUND_REQUESTED': '반품 요청',
    'REFUNDED': '반품 완료',
    'PURCHASE_CONFIRMED': '구매 확정',
    'pending': '결제 대기',
    'payment_completed': '결제 완료',
    'payment_failed': '결제 실패',
    'order_failed': '주문 실패',
    'group_purchase_success': '공동구매 성공',
    'group_purchase_fail': '공동구매 실패',
    'cancel_requested': '취소 요청',
    'cancelled': '취소 완료',
    'reverse_requested': '번복 요청',
    'reversed': '번복 완료',
    'refund_requested': '반품 요청',
    'refunded': '반품 완료',
    'purchase_confirmed': '구매 확정'
  }
  return statusMap[status] || status || '-'
}

const isEditFormValid = computed(() => {
  return (
    editForm.value.name &&
    editForm.value.description &&
    editForm.value.businessRegistrationNumber &&
    editForm.value.bankCode &&
    editForm.value.accountNumber &&
    editForm.value.accountHolder &&
    !accountNumberError.value &&
    !bankCodeError.value &&
    !accountHolderError.value &&
    !businessNumberError.value &&
    /^[0-9]+$/.test(editForm.value.accountNumber) &&
    editForm.value.accountNumber.length >= 1 &&
    editForm.value.accountNumber.length <= 20 &&
    /^[가-힣a-zA-Z\s]+$/.test(editForm.value.accountHolder) &&
    editForm.value.accountHolder.length >= 1 &&
    editForm.value.accountHolder.length <= 50 &&
    /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(editForm.value.businessRegistrationNumber)
  )
})

const loadSellerInfo = async () => {
  // memberId 가져오기
  const memberId = localStorage.getItem('member_id')
  
  if (!memberId) {
    console.error('memberId가 없습니다.')
    return
  }
  
  try {
    // 백엔드 API에서 판매자 정보 가져오기
    const response = await authAPI.getSellerInfo(memberId)
    console.log('판매자 정보:', response)
    
    const sellerData = response.data || response
    
    if (sellerData) {
      // 판매자 정보 표시용 데이터 설정
      sellerInfo.value = {
        bankCode: sellerData.bankCode || '',
        accountNumber: sellerData.accountNumber || '',
        accountHolder: sellerData.accountHolder || '',
        businessRegistrationNumber: sellerData.businessRegistrationNumber || '',
        phoneNumber: sellerData.phoneNumber || '',
        email: sellerData.email || ''
      }
      
      // 수정 폼에도 데이터 설정
      editForm.value = {
        name: seller.value.name,
        description: seller.value.description,
        businessRegistrationNumber: sellerData.businessRegistrationNumber || '',
        bankCode: sellerData.bankCode || '',
        accountNumber: sellerData.accountNumber || '',
        accountHolder: sellerData.accountHolder || ''
      }
    }
  } catch (error) {
    console.error('판매자 정보 조회 실패:', error)
    // 에러 발생 시 localStorage에서 불러오기
    const savedAccountInfo = JSON.parse(localStorage.getItem('seller_account_info') || 'null')
    
    sellerInfo.value = {
      bankCode: savedAccountInfo?.bankCode || '',
      accountNumber: savedAccountInfo?.accountNumber || '',
      accountHolder: savedAccountInfo?.accountHolder || '',
      businessRegistrationNumber: savedAccountInfo?.businessRegistrationNumber || '',
      phoneNumber: localStorage.getItem('user_phone') || '',
      email: localStorage.getItem('user_email') || ''
    }
    
    editForm.value = {
      name: seller.value.name,
      description: seller.value.description,
      businessRegistrationNumber: savedAccountInfo?.businessRegistrationNumber || '',
      bankCode: savedAccountInfo?.bankCode || '',
      accountNumber: savedAccountInfo?.accountNumber || '',
      accountHolder: savedAccountInfo?.accountHolder || ''
    }
  }
  
  const savedSeller = JSON.parse(localStorage.getItem('seller_profile') || 'null')
  if (savedSeller) {
    seller.value = { ...seller.value, ...savedSeller }
  }
  
  badgesInput.value = seller.value.badges ? seller.value.badges.join(', ') : ''
}

const saveSellerInfo = async () => {
  if (!isEditFormValid.value) {
    alert('모든 필수 항목을 올바르게 입력해주세요.')
    return
  }

  const badges = badgesInput.value
    .split(',')
    .map(b => b.trim())
    .filter(b => b.length > 0)
  
  const updatedSeller = {
    ...seller.value,
    name: editForm.value.name,
    description: editForm.value.description,
    badges: badges
  }
  
  seller.value = updatedSeller
  localStorage.setItem('seller_profile', JSON.stringify({
    name: updatedSeller.name,
    description: updatedSeller.description,
    badges: updatedSeller.badges
  }))
  
  // 계좌 정보 저장
  localStorage.setItem('seller_account_info', JSON.stringify({
    businessRegistrationNumber: editForm.value.businessRegistrationNumber,
    bankCode: editForm.value.bankCode,
    accountNumber: editForm.value.accountNumber,
    accountHolder: editForm.value.accountHolder
  }))
  
  // TODO: 백엔드 API 호출하여 계좌 정보 업데이트
  // await authAPI.updateSellerAccount({ ... })
  
  alert('판매자 정보가 저장되었습니다.')
  showEditModal.value = false
}

// const requestSettlementDispute = () => {
//   if (confirm('정산 의의를 신청하시겠습니까?')) {
//     alert('정산 의의 신청이 접수되었습니다. 검토 후 연락드리겠습니다.')
//   }
// }

const goToProduct = (id) => {
  router.push({ name: 'product-update', params: { productId: id } })
}

const goToGroupPurchase = (id) => {
  router.push({ name: 'group-purchase-detail', params: { id } })
}

// 공동 구매 상태 텍스트 변환
// const getPurchaseStatusText = (status) => {
//   if (!status) return '-'
  
//   const statusMap = {
//     'PENDING': '대기중',
//     'IN_PROGRESS': '진행중',
//     'COMPLETED': '완료',
//     'CANCELLED': '취소됨',
//     'pending': '대기중',
//     'in_progress': '진행중',
//     'completed': '완료',
//     'cancelled': '취소됨'
//   }
  
//   return statusMap[status] || status
// }

// 공동 구매 상태 클래스
// const getPurchaseStatusClass = (status) => {
//   if (!status) return ''
  
//   const statusLower = status.toLowerCase()
//   if (statusLower === 'in_progress' || statusLower === 'in-progress') {
//     return 'status-in-progress'
//   } else if (statusLower === 'completed') {
//     return 'status-completed'
//   } else if (statusLower === 'cancelled') {
//     return 'status-cancelled'
//   } else if (statusLower === 'pending') {
//     return 'status-pending'
//   }
//   return ''
// }

const viewOrderDetail = (orderId) => {
  alert(`주문 상세 정보를 확인합니다. (주문 ID: ${orderId})`)
  // TODO: 주문 상세 페이지로 이동
}

// 주문 내역 불러오기
const loadOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await authAPI.getSellerOrders()
    console.log('판매자 주문 내역:', response)
    
    const ordersData = response.data || response
    
    if (Array.isArray(ordersData)) {
      orderList.value = ordersData
    } else if (ordersData && Array.isArray(ordersData.content)) {
      // Pageable 객체인 경우
      orderList.value = ordersData.content
    } else {
      orderList.value = []
    }
  } catch (error) {
    console.error('주문 내역 조회 실패:', error)
    orderList.value = []
  } finally {
    loadingOrders.value = false
  }
}

//product
const searchKeyword = ref('')
const searchCategory = ref('')
const page = ref(0)
const size = ref(4)
const totalPages = ref(0)
const totalElements = ref(0)

//상품 검색
const searchProducts = async () => {
  loadingProducts.value = true
  try {
    const response = await productApi.getProducts({
      page: 0,
      size: 1000,
      sort: 'createdAt,desc'
    })
    const pageData = response?.data?.data || response?.data || {}
    const list = Array.isArray(pageData?.content) ? pageData.content : []

    const filtered = list.filter(product => {
      const matchesKeyword = searchKeyword.value
        ? product.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
        : true
      const matchesCategory = searchCategory.value
        ? product.category === searchCategory.value
        : true
      return matchesKeyword && matchesCategory
    })

    const start = page.value * size.value
    const end = start + size.value
    sellerProducts.value = filtered.slice(start, end).map(transformProduct)
    totalElements.value = filtered.length
    totalPages.value = Math.ceil(filtered.length / size.value)
  } catch (e) {
    console.error('상품 검색 실패', e)
    sellerProducts.value = []
    totalPages.value = 0
    totalElements.value = 0
  } finally {
    loadingProducts.value = false
  }
}

// 카테고리 즉시 반응
watch(searchCategory, () => {
  page.value = 0
  searchProducts()
})

// 검색어 debounce
let timer = null
watch(searchKeyword, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 0
    searchProducts()
  }, 300)
})

// 페이징
const goToPage = (newPage) => {
  if (newPage < 0 || newPage >= totalPages.value) return
  page.value = newPage
  searchProducts()
}

// 카테고리 한글 변환
const categoryMap = {
  'HOME': '생활 & 주방',
  'FOOD': '식품 & 간식',
  'HEALTH': '건강 & 헬스',
  'BEAUTY': '뷰티',
  'FASHION': '패션 & 의류',
  'ELECTRONICS': '전자 & 디지털',
  'KIDS': '유아 & 어린이',
  'HOBBY': '취미',
  'PET': '반려동물'
}

// 카테고리별 기본 이미지
const categoryImages = {
  'HOME': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'HEALTH': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  'KIDS': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  'HOBBY': 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400',
  'PET': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'
}

// 백엔드 데이터를 프론트엔드 형식으로 변환
const transformProduct = (product) => {
  // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지
  let image = product.imageUrl || product.image || product.thumbnailUrl
  if (!image || image.trim() === '') {
    image = categoryImages[product.category] || categoryImages['PET']
  }

  return {
    id: product.productId,
    title: product.name,
    currentPrice: product.price,
    originalPrice: product.price,
    category: categoryMap[product.category] || product.category,
    image: image,
    stock: 0,
    description: '',
    originalUrl: '',
    // 공동구매 정보는 추후 별도 API로 연동 (임시 값)
    currentCount: 0,
    targetCount: 10,
    timeLeft: '진행 중'
  }
}



// 공동구매 데이터 변환 (GroupPurchaseDocument 기준)
const transformGroupPurchase = (gp) => {
  // embedded product
  const product = gp.productSearchInfo || {}

  // 카테고리 변환 (ProductDocumentEmbedded.category)
  const categoryKorean =
    categoryMap[product.category] ||
    product.category ||
    '기타'

  // 이미지 우선순위
  let image = product.imageUrl || product.image || product.thumbnailUrl
    if (!image || image.trim() === '') {
      image = categoryImages[product.category]
    }

  return {
    // ID
    id: gp.groupPurchaseId,

    // 기본 정보
    title: gp.title,
    description: gp.description,

    // 상품 정보
    productName: gp.title, // 현재 Document 구조상 별도 productName 없음
    category: categoryKorean,

    // 가격
    discountPrice: gp.discountedPrice || 0,
    originalPrice: product.price || 0,

    // 수량
    minQuantity: gp.minQuantity,
    maxQuantity: gp.maxQuantity,
    currentCount: gp.currentQuantity || 0,

    // 상태 & 기간
    status: gp.status || 'OPEN',
    startDate: gp.startDate,
    endDate: gp.endDate,

    // 이미지
    image
  }
}

//purchase
const purchaseSearchKeyword = ref('')
const purchaseSearchCategory = ref('')
const purchaseStatus = ref('')
const purchasePage = ref(0)
const purchaseSize = ref(5)
const purchaseTotalPages = ref(0)
const purchaseTotalElements = ref(0)

// 내 공동구매 목록 불러오기
const searchGroupPurchases = async () => {
  loadingGroupPurchases.value = true
  try {
    const response = await authAPI.searchPurchase({
       keyword: purchaseSearchKeyword.value,
       category: purchaseSearchCategory.value,
       status: purchaseStatus.value,
       page: purchasePage.value,
       size: purchaseSize.value
     })
    sellerGroupPurchases.value = response.content.map(transformGroupPurchase)
    purchaseTotalPages.value = response.totalPages
    purchaseTotalElements.value = response.totalElements
  } catch (error) {
    console.error('공동구매 목록 조회 실패:', error)
      sellerGroupPurchases.value = []
      purchaseTotalPages.value = 0
      purchaseTotalElements.value = 0
  } finally {
    loadingGroupPurchases.value = false
  }
}

const goToPurchasePage = (newPage) => {
  if (newPage < 0 || newPage >= purchaseTotalPages.value) return
  purchasePage.value = newPage
  searchGroupPurchases()
}

watch(purchaseSearchCategory, () => {
  purchasePage.value = 0
  searchGroupPurchases()
})

let purchaseTimer = null
watch(purchaseSearchKeyword, () => {
  clearTimeout(purchaseTimer)
  purchaseTimer = setTimeout(() => {
    purchasePage.value = 0
    searchGroupPurchases()
  }, 300)
})

// 남은 시간 계산
const getTimeRemaining = (endDate) => {
  if (!endDate) return '기간 미정'

  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff < 0) return '종료됨'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}일 남음`
  if (hours > 0) return `${hours}시간 남음`
  return '1시간 이내'
}


onMounted(() => {
  loadSellerInfo()
  searchGroupPurchases()
  searchProducts()      // ✅ 여기
  loadOrders()
  fetchBalanceHistory() // 정산 내역 조회 (최신 5개)
})
</script>

<style scoped>
.seller-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 판매자 정보 섹션 */
.seller-info-section {
  margin-bottom: 32px;
}

.seller-hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid #3a3a3a;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.seller-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 24px;
}

.seller-main {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.eyebrow {
  color: #999;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.seller-hero h1 {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
}

.description {
  color: #cccccc;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 20px;
}

.badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.stat:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat strong {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.stat span {
  font-size: 13px;
  color: #cccccc;
  font-weight: 500;
}

.btn-edit-profile {
  padding: 12px 24px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-edit-profile:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.seller-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: #cccccc;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: #ffffff;
  font-weight: 600;
}

/* 대시보드 그리드 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.panel {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;        /* 🔥 줄바꿈 방지 */
  min-width: 0;             /* 🔥 flex overflow 방지 */
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;           /* 🔥 오른쪽 고정 */
}

.panel:hover {
  border-color: #3a3a3a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.panel.wide {
  grid-column: span 3;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap; /* 🔥 이게 핵심 */
  padding-bottom: 10px;
}

.panel-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.view-all-link {
  font-size: 14px;
  color: #999;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #ffffff;
}

.panel-header .subtitle {
  font-size: 14px;
  color: #999;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 7px;          /* 🔥 기존 10px → 14px */
}

.search-bar input {
  width: 300px;
  height: 40px;
  padding: 0 14px;
  background: #0f0f0f;          /* 🔥 흰색 제거 */
  border: 2px solid #2a2a2a;
  border-radius: 10px;
  font-size: 14px;
  color: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* 검색 input */
.search-bar select,
.search-bar .btn {
  height: 40px;
}

.search-bar input::placeholder {
  color: #777;
}

.search-bar input:focus,
.search-bar select:focus {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
}

/* 카테고리 select */
.search-bar select {
  padding: 0 14px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 10px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;
}

/* 검색 버튼 */
.search-bar .btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

/* 오른쪽 액션 버튼 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #cccccc;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-new-product {
  padding: 8px 16px;
  background: #ffffff;
  color: #0a0a0a;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-new-product:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 페이징 */
/* pagination wrapper (grid 영향 차단) */
.pagination-wrapper {
  width: 100%;
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 8px 18px;
  border-radius: 999px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2a2a2a;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #cccccc;
  font-weight: 600;
}

/* 정산 현황 */
.settlement-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #3a3a3a;
  transform: translateY(-2px);
}

.stat-card.highlight {
  border-color: #ffffff;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.stat-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

/* 정산 내역 */
.btn-dispute {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ff4757;
  color: #ff4757;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dispute:hover {
  background: #ff4757;
  color: #ffffff;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settlement-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.settlement-item:hover {
  border-color: #3a3a3a;
  background: #151515;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.settlement-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.settlement-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.settlement-date-group,
.settlement-amount-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settlement-date-label,
.settlement-amount-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settlement-date {
  font-size: 15px;
  color: #ffffff;
  font-weight: 600;
}

.settlement-amount {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.settlement-status-wrapper {
  display: flex;
  align-items: center;
}

.settlement-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.settlement-status.completed {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.settlement-status.pending {
  background: rgba(255, 212, 59, 0.2);
  color: #ffd43b;
  border: 1px solid #ffd43b;
}

.settlement-status.credit {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.settlement-status.debit {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

/* 판매 통계 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-box {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.stat-box:hover {
  border-color: #3a3a3a;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.stat-box .stat-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.stat-box .stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

/* 상품 목록 */
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #2a2a2a;
  background: #0f0f0f;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #3a3a3a;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.updated-date {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.product-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-text {
  font-size: 12px;
  color: #999;
}

.progress-bar {
  height: 6px;
  background: #0f0f0f;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffffff 0%, #cccccc 100%);
  border-radius: inherit;
  transition: width 0.3s;
}

/* 공동 구매 목록 */
.group-purchase-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-purchase-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-purchase-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.group-purchase-item img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.original-price {
  font-size: 14px;
  color: #666;
  text-decoration: line-through;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.item-date {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.status-in-progress {
  background: rgba(116, 192, 252, 0.2);
  color: #74c0fc;
  border: 1px solid #74c0fc;
}

.status-badge.status-completed {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.status-badge.status-cancelled {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid #ff4757;
}

.status-badge.status-pending {
  background: rgba(255, 212, 59, 0.2);
  color: #ffd43b;
  border: 1px solid #ffd43b;
}

/* 주문 목록 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
}

.order-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;
}

.order-date {
  color: #999;
  font-size: 13px;
  margin-right: 12px;
}

.order-number {
  color: #999;
  font-size: 13px;
}

.order-gp-name {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(56, 189, 248, 0.14));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.label-bold {
  font-size: 15px;
  font-weight: 700;
}

.order-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.order-status.completed {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.order-status.payment_completed {
  background: rgba(116, 192, 252, 0.2);
  color: #74c0fc;
  border: 1px solid #74c0fc;
}

.order-status.shipping {
  background: rgba(116, 192, 252, 0.2);
  color: #74c0fc;
  border: 1px solid #74c0fc;
}

.order-status.pending {
  background: rgba(255, 212, 59, 0.2);
  color: #ffd43b;
  border: 1px solid #ffd43b;
}

.order-status.in_progress {
  background: rgba(116, 192, 252, 0.2);
  color: #74c0fc;
  border: 1px solid #74c0fc;
}

.order-status.success {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.order-status.failed {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid #ff4757;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.order-product {
  display: flex;
  gap: 12px;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #0f0f0f;
  border-radius: 8px;
}

.order-summary-left {
  width: 100%;
  text-align: left;
}

.order-summary-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.order-quantity,
.order-price {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
  text-align: right;
}

.product-details {
  flex: 1;
}

.product-details h4 {
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.product-option {
  color: #999;
  font-size: 13px;
  margin: 0 0 8px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
}

.product-price {
  color: #ffffff;
  font-weight: 600;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
  margin-top: 12px;
}

.order-total {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

/* 고객 문의 */
.qna-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qna-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s;
}

.qna-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.qna-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question {
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
  margin: 0;
}

.answer {
  color: #cccccc;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.qna-item .status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.qna-item .status.completed {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.qna-item .status.pending {
  background: rgba(255, 212, 59, 0.2);
  color: #ffd43b;
  border: 1px solid #ffd43b;
}

/* 공지 사항 */
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.notice-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.tag {
  background: #2a2a2a;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.notice-title {
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.date {
  color: #999;
  font-size: 13px;
  white-space: nowrap;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 15px;
}

.loading-state p {
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state p {
  margin: 0 0 16px;
  color: #999;
}

/* 상품 목록의 빈 상태는 grid 전체 너비 차지 */
.product-list .empty-state {
  grid-column: 1 / -1;
}

/* 버튼 */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.btn-outline {
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #666;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  color: #ffffff;
  font-size: 24px;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #2a2a2a;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a2a;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.form-group select {
  cursor: pointer;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-error {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 4px;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* 반응형 */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .panel.wide {
    grid-column: span 2;
  }
  
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .panel.wide {
    grid-column: span 1;
  }
  
  .settlement-summary,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .seller-hero {
    flex-direction: column;
  }
  
  .seller-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
  
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }
  
  .seller-hero {
    padding: 24px;
  }
  
  .seller-hero h1 {
    font-size: 28px;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
  }
  
  .product-list {
    grid-template-columns: 1fr;
  }
  
  .group-purchase-item {
    flex-direction: column;
  }
  
  .group-purchase-item img {
    width: 100%;
    height: 200px;
  }
  
  .order-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-amount {
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 24px;
  }
}
</style>

