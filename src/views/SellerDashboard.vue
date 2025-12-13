<template>
  <main class="seller-page">
    <div class="container">
      <!-- 판매자 정보 섹션 -->
      <section class="seller-info-section">
        <div class="seller-hero">
          <div class="seller-main">
            <p class="eyebrow">판매자 센터</p>
            <h1>{{ seller.name }}</h1>
            <p class="description">{{ seller.description }}</p>
            <div class="badges">
              <span v-for="badge in seller.badges" :key="badge" class="badge">{{ badge }}</span>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <strong>{{ seller.rating }}</strong>
                <span>평점</span>
              </div>
              <div class="stat">
                <strong>{{ seller.followers.toLocaleString() }}</strong>
                <span>팔로워</span>
              </div>
              <div class="stat">
                <strong>{{ seller.totalSales.toLocaleString() }}</strong>
                <span>누적 판매</span>
              </div>
              <div class="stat">
                <strong>{{ (seller.responseRate * 100).toFixed(0) }}%</strong>
                <span>응답률</span>
              </div>
            </div>
          </div>
          <button class="btn-edit-profile" @click="showEditModal = true">정보 수정</button>
        </div>
      </section>

      <!-- 대시보드 그리드 -->
      <section class="dashboard-grid">
        <!-- 정산 현황 -->
        <article class="panel">
          <div class="panel-header">
            <h2>정산 현황</h2>
          </div>
          <div class="settlement-summary">
            <div class="stat-card">
              <span class="stat-label">이번 달 매출</span>
              <span class="stat-value">₩{{ settlement.monthlyRevenue.toLocaleString() }}</span>
            </div>
            <div class="stat-card highlight">
              <span class="stat-label">정산 예정 금액</span>
              <span class="stat-value">₩{{ settlement.pendingAmount.toLocaleString() }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">누적 정산 금액</span>
              <span class="stat-value">₩{{ settlement.totalSettled.toLocaleString() }}</span>
            </div>
          </div>
        </article>

        <!-- 정산 내역 -->
        <article class="panel">
          <div class="panel-header">
            <h2>정산 내역</h2>
            <button class="btn-dispute" @click="requestSettlementDispute">정산 의의 신청</button>
          </div>
          <div class="settlement-list">
            <div v-for="item in settlement.history" :key="item.id" class="settlement-item">
              <div class="settlement-info">
                <span class="settlement-date">{{ item.date }}</span>
                <span class="settlement-amount">₩{{ item.amount.toLocaleString() }}</span>
              </div>
              <span class="settlement-status" :class="item.status">{{ item.statusText }}</span>
            </div>
            <div v-if="settlement.history.length === 0" class="empty-state">
              <p>정산 내역이 없습니다</p>
            </div>
          </div>
        </article>

        <!-- 판매 통계 -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>판매 통계</h2>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-icon">📦</div>
              <span class="stat-label">총 판매 건수</span>
              <span class="stat-number">{{ sellerStats.totalSales.toLocaleString() }}</span>
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
        </article>

        <!-- 내 상품 목록 -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>내 상품 목록</h2>
            <div class="header-actions">
              <router-link to="/seller/register/product-register" class="btn-new-product">+ 상품 등록</router-link>
              <router-link to="/seller/products" class="link">전체 보기 →</router-link>
            </div>
          </div>
          <div class="product-list">
            <div v-if="loading" class="loading-state">
              <p>상품 목록을 불러오는 중...</p>
            </div>
            <template v-else>
              <div
                v-for="product in sellerProducts.slice(0, 4)"
                :key="product.id"
                class="product-card"
                @click="goToProduct(product.id)"
              >
                <img :src="product.image" :alt="product.title" />
                <div class="product-info">
                  <p class="category">{{ product.category }}</p>
                  <h3>{{ product.title }}</h3>
                  <p class="price">₩{{ product.currentPrice.toLocaleString() }}</p>
                  <div class="progress-info">
                    <span class="progress-text">재고: {{ product.stock }}개</span>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: `${Math.min((product.currentCount / product.targetCount) * 100, 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="sellerProducts.length === 0" class="empty-state">
                <p>등록된 상품이 없습니다</p>
                <router-link to="/seller/register/product-register" class="btn btn-primary">상품 등록하기</router-link>
              </div>
            </template>
          </div>
        </article>

        <!-- 공동 구매 목록 -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>공동 구매 목록</h2>
            <div class="header-actions">
              <router-link to="/group-purchases/create" class="btn-new-product">+ 공동구매 등록</router-link>
              <router-link to="/group-purchases" class="link">전체 보기 →</router-link>
            </div>
          </div>
          <div class="group-purchase-list">
            <div
              v-for="product in sellerProducts.slice(0, 3)"
              :key="product.id"
              class="group-purchase-item"
              @click="goToProduct(product.id)"
            >
              <img :src="product.image" :alt="product.title" />
              <div class="item-info">
                <h3>{{ product.title }}</h3>
                <p class="item-meta">
                  <span>참여자: {{ product.currentCount }}/{{ product.targetCount }}명</span>
                  <span>남은 시간: {{ product.timeLeft }}</span>
                </p>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${Math.min((product.currentCount / product.targetCount) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
              <div class="item-price">
                <span class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
                <span class="current-price">₩{{ product.currentPrice.toLocaleString() }}</span>
              </div>
            </div>
            <div v-if="sellerProducts.length === 0" class="empty-state">
              <p>진행 중인 공동구매가 없습니다</p>
              <router-link to="/group-purchases/create" class="btn btn-primary">공동구매 등록하기</router-link>
            </div>
          </div>
        </article>

        <!-- 주문 목록 (공동 구매별) -->
        <article class="panel wide">
          <div class="panel-header">
            <h2>주문 목록</h2>
            <span class="subtitle">공동 구매별 주문 현황</span>
          </div>
          <div class="order-list">
            <div v-for="order in orderList" :key="order.id" class="order-item">
              <div class="order-header">
                <div>
                  <span class="order-date">{{ order.date }}</span>
                  <span class="order-number">주문번호: {{ order.orderNumber }}</span>
                </div>
                <span class="order-status" :class="order.status">{{ order.statusText }}</span>
              </div>
              <div class="order-content">
                <div class="order-product-info">
                  <img :src="order.productImage" :alt="order.productTitle" />
                  <div>
                    <h4>{{ order.productTitle }}</h4>
                    <p class="product-option">{{ order.option }}</p>
                    <p class="order-meta">수량: {{ order.quantity }}개</p>
                  </div>
                </div>
                <div class="order-amount">
                  <span class="amount-label">주문 금액</span>
                  <span class="amount-value">₩{{ order.totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <div v-if="orderList.length === 0" class="empty-state">
              <p>주문 내역이 없습니다</p>
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
          <div class="form-section">
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
          </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sellerProfile, sellerNotices, sellerQna } from '@/data/products'
import { productApi } from '@/api/axios'

const router = useRouter()

const seller = ref({ ...sellerProfile })
const sellerProducts = ref([])
const showEditModal = ref(false)
const loading = ref(false)
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
  monthlyRevenue: 12500000,
  pendingAmount: 8500000,
  totalSettled: 45000000,
  history: [
    { id: 1, date: '2025-12-01', amount: 5000000, status: 'completed', statusText: '정산 완료' },
    { id: 2, date: '2025-11-15', amount: 3200000, status: 'completed', statusText: '정산 완료' },
    { id: 3, date: '2025-11-01', amount: 7500000, status: 'completed', statusText: '정산 완료' },
    { id: 4, date: '2025-12-15', amount: 8500000, status: 'pending', statusText: '정산 예정' }
  ]
})

const sellerStats = ref({
  totalSales: 3245,
  activeProducts: 8,
  averageRating: 4.9,
  satisfaction: 98
})

const notices = ref([...sellerNotices])
const qna = ref([...sellerQna])

const orderList = ref([
  {
    id: 1,
    orderNumber: 'ORD-2025-001',
    date: '2025-12-15',
    status: 'completed',
    statusText: '주문 완료',
    productTitle: '아이폰 15 Pro Max 256GB',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    option: '네이비 티타늄 / 256GB',
    quantity: 1,
    totalAmount: 1190000
  },
  {
    id: 2,
    orderNumber: 'ORD-2025-002',
    date: '2025-12-10',
    status: 'shipping',
    statusText: '배송 중',
    productTitle: '나이키 에어맥스 운동화',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    option: '270 / 블랙',
    quantity: 2,
    totalAmount: 198000
  },
  {
    id: 3,
    orderNumber: 'ORD-2025-003',
    date: '2025-12-05',
    status: 'pending',
    statusText: '주문 대기',
    productTitle: '프리미엄 한우 세트 (1kg)',
    productImage: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
    option: '기본 구성',
    quantity: 1,
    totalAmount: 59000
  }
])

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

const loadSellerInfo = () => {
  const savedSeller = JSON.parse(localStorage.getItem('seller_profile') || 'null')
  if (savedSeller) {
    seller.value = { ...seller.value, ...savedSeller }
  }
  
  // 저장된 계좌 정보 불러오기
  const savedAccountInfo = JSON.parse(localStorage.getItem('seller_account_info') || 'null')
  
  editForm.value = {
    name: seller.value.name,
    description: seller.value.description,
    businessRegistrationNumber: savedAccountInfo?.businessRegistrationNumber || '',
    bankCode: savedAccountInfo?.bankCode || '',
    accountNumber: savedAccountInfo?.accountNumber || '',
    accountHolder: savedAccountInfo?.accountHolder || ''
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

const requestSettlementDispute = () => {
  if (confirm('정산 의의를 신청하시겠습니까?')) {
    alert('정산 의의 신청이 접수되었습니다. 검토 후 연락드리겠습니다.')
  }
}

const goToProduct = (id) => {
  router.push({ name: 'product-detail', params: { id } })
}

// 카테고리 한글 변환
const categoryMap = {
  'ELECTRONICS': '전자제품',
  'FASHION': '패션',
  'FOOD': '식품',
  'BEAUTY': '뷰티',
  'HOME_LIVING': '홈/리빙',
  'BOOK': '도서',
  'SPORTS': '스포츠',
  'OTHER': '기타'
}

// 카테고리별 기본 이미지
const categoryImages = {
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  'HOME_LIVING': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  'BOOK': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
  'SPORTS': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
  'OTHER': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
}

// 백엔드 데이터를 프론트엔드 형식으로 변환
const transformProduct = (product) => {
  return {
    id: product.productId,
    title: product.name,
    currentPrice: product.price,
    originalPrice: product.price,
    category: categoryMap[product.category] || product.category,
    image: categoryImages[product.category] || categoryImages['OTHER'],
    stock: product.stock,
    description: product.description,
    originalUrl: product.originalLink,
    // 공동구매 정보는 추후 별도 API로 연동 (임시 값)
    currentCount: 0,
    targetCount: 10,
    timeLeft: '진행 중'
  }
}

// 내 상품 목록 불러오기
const fetchMyProducts = async () => {
  loading.value = true
  try {
    const response = await productApi.getMyProducts()
    console.log('내 상품 목록:', response.data)

    // 백엔드 응답 데이터 변환
    if (response.data && response.data.data) {
      sellerProducts.value = response.data.data.map(transformProduct)
    } else if (Array.isArray(response.data)) {
      sellerProducts.value = response.data.map(transformProduct)
    }
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    // 에러 시 빈 배열 유지
    sellerProducts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSellerInfo()
  fetchMyProducts()
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

.seller-main {
  flex: 1;
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
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2a2a2a;
}

.panel-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.panel-header .subtitle {
  font-size: 14px;
  color: #999;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  transition: all 0.2s;
}

.settlement-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.settlement-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settlement-date {
  font-size: 13px;
  color: #999;
}

.settlement-amount {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
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

.product-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
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

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.order-product-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.order-product-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

.order-product-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 6px;
}

.product-option {
  font-size: 13px;
  color: #999;
  margin: 0 0 6px;
}

.order-meta {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.order-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-label {
  font-size: 13px;
  color: #999;
}

.amount-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
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
