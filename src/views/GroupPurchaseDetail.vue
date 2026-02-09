<template>
  <main v-if="loading" class="group-purchase-detail-page">
    <div class="container">
      <div class="loading-container">
        <p>로딩 중...</p>
      </div>
    </div>
  </main>
  <main v-else-if="groupPurchase" class="group-purchase-detail-page">
    <div class="container">
      <div class="detail-header">
        <div class="header-info">
          <div class="status-badge" :class="groupPurchase.status?.toLowerCase()">
            {{ getStatusText(groupPurchase.status) }}
          </div>
          <span v-if="groupPurchase.createdAt" class="created-date">
            생성일: {{ formatDate(groupPurchase.createdAt) }}
          </span>
        </div>
        <div v-if="isOwner" class="owner-actions">
          <button class="btn btn-outline" @click="goToEdit">수정</button>
          <button class="btn btn-danger" @click="handleDelete">삭제</button>
        </div>
      </div>

      <section class="detail-content">
        <div class="main-info">
          <div class="product-image-section">
            <img
              :src="productImage"
              :alt="groupPurchase.title"
              @error="handleImageError"
            />
          </div>
          <h1>{{ groupPurchase.title }}</h1>
          <div class="product-links">
            <div v-if="groupPurchase.productId" class="product-link">
              <button class="btn btn-product-detail" @click="goToProduct">
                상품 정보 보기 →
              </button>
            </div>
          </div>
          <h3 class="description-title">상품소개</h3>
          <div class="description">
            <div v-if="renderedDescription" v-html="renderedDescription"></div>
            <p v-else>설명이 없습니다.</p>
          </div>
        </div>

        <div class="sidebar">
          <div class="info-card">
            <h3>가격 정보</h3>
            <div class="price-box">
              <span class="discount-price">₩{{ groupPurchase.discountedPrice?.toLocaleString() }}</span>
              <span v-if="groupPurchase.price" class="original-price">
                정가 ₩{{ groupPurchase.price.toLocaleString() }}
              </span>
            </div>
            <div v-if="groupPurchase.price && groupPurchase.discountedPrice" class="discount-rate">
              할인율: {{ Math.round(((groupPurchase.price - groupPurchase.discountedPrice) / groupPurchase.price) * 100) }}%
            </div>
          </div>

          <div class="info-card">
            <h3>수량 정보</h3>
            <div class="quantity-info">
              <div class="quantity-row">
                <span>최소 수량:</span>
                <strong>{{ groupPurchase.minQuantity }}개</strong>
              </div>
              <div class="quantity-row">
                <span>최대 수량:</span>
                <strong>{{ groupPurchase.maxQuantity }}개</strong>
              </div>
              <div class="quantity-row">
                <span>현재 참여 수량:</span>
                <strong>{{ groupPurchase.currentQuantity || 0 }}개</strong>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${Math.min(((groupPurchase.currentQuantity || 0) / groupPurchase.maxQuantity) * 100, 100)}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ Math.round(((groupPurchase.currentQuantity || 0) / groupPurchase.maxQuantity) * 100) }}% 달성
            </div>
          </div>

          <div class="info-card">
            <h3>기간 정보</h3>
            <div class="date-info">
              <div v-if="groupPurchase.startDate" class="date-row">
                <span>시작일:</span>
                <span>{{ formatDate(groupPurchase.startDate) }}</span>
              </div>
              <div v-if="groupPurchase.endDate" class="date-row">
                <span>종료일:</span>
                <span>{{ formatDate(groupPurchase.endDate) }}</span>
              </div>
              <div v-if="groupPurchase.endDate" class="time-remaining">
                {{ getTimeRemaining(groupPurchase.endDate) }}
              </div>
            </div>
          </div>

          <!-- 참여하기 버튼 (판매자가 아닌 경우만 표시) -->
          <div v-if="!isOwner" class="info-card participate-card">
            <h3>공동구매 참여</h3>
            <div class="participate-input">
              <label for="quantity">참여 수량</label>
              <input
                id="quantity"
                v-model.number="participateQuantity"
                type="number"
                min="1"
                :max="groupPurchase.maxQuantity - (groupPurchase.currentQuantity || 0)"
                placeholder="수량 입력"
              />
            </div>
            <div class="participate-total">
              <span>총 금액:</span>
              <strong>₩{{ ((participateQuantity || 0) * (groupPurchase.discountedPrice || 0)).toLocaleString() }}</strong>
            </div>
            <button
              class="btn btn-participate"
              :disabled="!canParticipate || participateLoading"
              @click="handleParticipate"
            >
              {{ participateLoading ? '처리 중...' : getParticipateButtonText }}
            </button>
            <!-- <button
              class="btn btn-outline cart-btn"
              :disabled="!canParticipate || participateLoading"
              @click="addToCartFromDetail"
            >
              장바구니 담기
            </button> -->
            <p v-if="groupPurchase.status !== 'OPEN'" class="status-message">
              {{ getStatusMessage }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
  <section v-else class="not-found container">
    <p>요청하신 공동구매를 찾을 수 없습니다.</p>
    <router-link class="btn btn-primary" to="/group-purchases">공동구매 목록으로 이동</router-link>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { groupPurchaseApi } from '@/api/axios'

// eslint-disable-next-line no-undef
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const groupPurchase = ref(null)
const loading = ref(false)
const imageError = ref(false)
const markdownParser = new MarkdownIt({ html: true })
const participateQuantity = ref(1)
const participateLoading = ref(false)

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
  'HOME': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
  'HEALTH': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600',
  'KIDS': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
  'HOBBY': 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600',
  'PET': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600'
}

const getDefaultImage = () => {
  return 'https://placehold.co/600x400/1a1a1a/666?text=No+Image'
}

const productImage = computed(() => {
  if (imageError.value) return getDefaultImage()
  if (!groupPurchase.value) return getDefaultImage()

  // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지
  let image = groupPurchase.value.imageUrl || groupPurchase.value.image
  if (!image || image.trim() === '') {
    // 원본 영문 카테고리로 이미지 매칭
    const category = groupPurchase.value.categoryOriginal || groupPurchase.value.category
    image = categoryImages[category] || categoryImages['PET']
  }
  return image || getDefaultImage()
})

const renderedDescription = computed(() => {
  const raw = groupPurchase.value?.description || ''
  if (!raw) return ''
  return markdownParser.render(raw)
})

const handleImageError = () => {
  imageError.value = true
}

const isOwner = computed(() => {
  if (!groupPurchase.value) return false
  const currentUserEmail = localStorage.getItem('user_email')
  return groupPurchase.value.sellerId === currentUserEmail
})

// 참여 가능 여부
const canParticipate = computed(() => {
  if (!groupPurchase.value) return false
  if (groupPurchase.value.status !== 'OPEN') return false
  if (!participateQuantity.value || participateQuantity.value < 1) return false

  const remainingQuantity = groupPurchase.value.maxQuantity - (groupPurchase.value.currentQuantity || 0)
  if (participateQuantity.value > remainingQuantity) return false

  return true
})


const groupPurchaseIdForOrder = computed(() => {
  return groupPurchase.value?.groupPurchaseId || groupPurchase.value?.id || props.id
})

// const sellerIdForOrder = computed(() => {
//   return groupPurchase.value?.sellerId || groupPurchase.value?.seller?.sellerId || null
// })

// 참여 버튼 텍스트
const getParticipateButtonText = computed(() => {
  if (!groupPurchase.value) return '참여하기'

  switch (groupPurchase.value.status) {
    case 'SCHEDULED':
      return '공동구매 준비 중'
    case 'OPEN':
      return '참여하기'
    case 'SUCCESS':
      return '마감됨'
    case 'FAILED':
      return '실패함'
    default:
      return '참여하기'
  }
})

// 상태 메시지
const getStatusMessage = computed(() => {
  if (!groupPurchase.value) return ''

  switch (groupPurchase.value.status) {
    case 'SCHEDULED':
      return '공동구매가 아직 시작되지 않았습니다.'
    case 'SUCCESS':
      return '이 공동구매는 성공적으로 마감되었습니다.'
    case 'FAILED':
      return '이 공동구매는 실패했습니다.'
    default:
      return ''
  }
})

const loadGroupPurchase = async () => {
  loading.value = true
  imageError.value = false // 이미지 에러 상태 초기화
  try {
    // 백엔드 API 호출
    const response = await groupPurchaseApi.getGroupPurchaseById(props.id)
    console.log('공동구매 상세 조회 성공:', response.data)

    // 응답 데이터 구조에 따라 조정
    const data = response.data.data || response.data

    // 카테고리 정보 추가 (원본 영문 카테고리는 이미지 매칭용으로 유지)
    groupPurchase.value = {
      ...data,
      categoryOriginal: data.category, // 원본 카테고리 (영문, 이미지 매칭용)
      categoryKorean: categoryMap[data.category] || data.category || '기타' // 한글 카테고리
    }
  } catch (error) {
    console.error('공동구매 상세 조회 실패:', error)
    groupPurchase.value = null
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const statusMap = {
    SCHEDULED: '예정됨',
    OPEN: '진행 중',
    SUCCESS: '성공',
    FAILED: '실패'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff < 0) return '종료됨'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}일 ${hours}시간 남음`
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`
  return `${minutes}분 남음`
}

const goToEdit = () => {
  router.push({ name: 'group-purchase-edit', params: { id: props.id } })
}

const goToProduct = () => {
  if (groupPurchase.value?.productId) {
    router.push({ name: 'product-detail', params: { id: groupPurchase.value.productId } })
  }
}

const handleParticipate = () => {
  if (!canParticipate.value) {
    alert('참여 조건을 확인해주세요.')
    return
  }

  if (!groupPurchaseIdForOrder.value) {
    alert('공동구매 정보를 불러오지 못했습니다.')
    return
  }

  // 주문 화면으로 이동
  router.push({
    path: '/order/create',
    query: {
      groupPurchaseId: groupPurchaseIdForOrder.value,
      quantity: participateQuantity.value || 1
    }
  })
}

// 장바구니 담기 (공동구매 상세, 선택 수량)
// const addToCartFromDetail = async () => {
//   if (!canParticipate.value) {
//     alert('참여 가능 상태를 확인해주세요.')
//     return
//   }

//   if (!groupPurchaseIdForOrder.value) {
//     alert('공동구매 정보를 불러오지 못했습니다.')
//     return
//   }

//   try {
//     const response = await cartApi.addToCart({
//       groupPurchaseId: groupPurchaseIdForOrder.value,
//       quantity: participateQuantity.value || 1
//     })
//     // ResponseDto<CartInfo> 구조에서 data 추출
//     const cartInfo = response.data?.data || response.data
//     console.log('장바구니 추가 성공:', {
//       cartId: cartInfo?.cartId,
//       memberId: cartInfo?.memberId,
//       groupPurchaseId: cartInfo?.groupPurchaseId,
//       quantity: cartInfo?.quantity,
//       createdAt: cartInfo?.createdAt,
//       updatedAt: cartInfo?.updatedAt
//     })
//     alert('장바구니에 담았습니다.')
//     // FloatingCart 업데이트 이벤트 발생
//     window.dispatchEvent(new CustomEvent('cart-updated'))
//   } catch (error) {
//     console.error('장바구니 담기 실패:', error)
//     const errorMessage = error.response?.data?.message || '장바구니 담기에 실패했습니다.'
//     alert(errorMessage)
//   }
// }

const handleDelete = async () => {
  if (confirm('정말 이 공동구매를 삭제하시겠습니까?')) {
    try {
      // 백엔드 API 호출
      await groupPurchaseApi.deleteGroupPurchase(props.id)
      console.log('공동구매 삭제 성공')

      alert('공동구매가 삭제되었습니다.')
      router.push('/group-purchases')
    } catch (error) {
      console.error('공동구매 삭제 실패:', error)
      const errorMessage = error.response?.data?.message || '공동구매 삭제에 실패했습니다.'
      alert(errorMessage)
    }
  }
}

onMounted(() => {
  loadGroupPurchase()
})

watch(() => props.id, () => {
  loadGroupPurchase()
})
</script>

<style scoped>
.group-purchase-detail-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.scheduled {
  background: #f59f00;
  color: #fff3bf;
}
body.theme-light .status-badge.scheduled {
  background: #f59f00;
  color: #fff3bf;
}

.status-badge.open {
  background: #51cf66;
  color: #d3f9d8;
}

.status-badge.success {
  background: #339af0;
  color: #d0ebff;
}

.status-badge.failed {
  background: #fa5252;
  color: #ffe3e3;
}

.created-date {
  font-size: 14px;
  color: var(--muted);
  font-weight: 600;
}

.owner-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.product-image-section {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 32px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg);
}

.product-image-section img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.main-info h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.product-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.product-link {
  display: flex;
}

.product-link a {
  display: inline-block;
  color: #339af0;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: color 0.2s;
}

.product-link a:hover {
  color: #69db7c;
  text-decoration: underline;
}

.btn-product-detail {
  background: transparent;
  color: #339af0;
  border: 2px solid #339af0;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-product-detail:hover {
  background: #339af0;
  color: #0a0a0a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
}

.description-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
  text-align: center;
}

.description {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.description p {
  font-size: 16px;
  line-height: 2.4;
  color: var(--text);
}

.description div,
.description p {
  text-align: center;
}

body.theme-light .description-title {
  color: #111111;
}

body.theme-light .description {
  background: #ffffff;
  border-color: #e2e2e7;
}

body.theme-light .description p,
body.theme-light .description div {
  color: #111111;
}

body.theme-light .participate-card {
  background: #ffffff;
  border: 2px solid #51cf66;
}

body.theme-light .participate-input label,
body.theme-light .participate-total span {
  color: #333333;
}

body.theme-light .participate-input input,
body.theme-light .participate-total {
  background: #ffffff;
  border-color: #51cf66;
  color: #111111;
}

body.theme-light .progress-bar {
  background: #e6e6ea;
}

body.theme-light .progress-fill {
  background: #111111;
}

body.theme-light .progress-text {
  color: #666666;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

.info-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.price-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.discount-price {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
}

.original-price {
  font-size: 16px;
  color: var(--muted);
  text-decoration: line-through;
}

.discount-rate {
  font-size: 14px;
  color: #51cf66;
  font-weight: 600;
}

.quantity-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.quantity-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text);
}

.quantity-row strong {
  color: var(--text);
  font-weight: 700;
}

.progress-bar {
  height: 10px;
  background: var(--bg);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: inherit;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--muted);
  text-align: right;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text);
}

.time-remaining {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
  font-size: 14px;
  color: #51cf66;
  font-weight: 600;
}

.participate-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border: 2px solid #51cf66;
}

.participate-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.participate-input label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.participate-input input {
  padding: 14px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 16px;
  color: var(--text);
  transition: border-color 0.2s;
}

.participate-input input:focus {
  outline: none;
  border-color: #51cf66;
}

.participate-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 16px;
}

.participate-total span {
  color: var(--muted);
  font-size: 14px;
}

.participate-total strong {
  color: var(--text);
  font-size: 20px;
  font-weight: 700;
}


.btn-participate {
  width: 100%;
  padding: 16px;
  background: #51cf66;
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-participate:hover:not(:disabled) {
  background: #69db7c;
  border-color: var(--text);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(81, 207, 102, 0.3);
}

/* 라이트 모드: 참여하기 버튼 테두리 */
:global(body.theme-light) .btn-participate {
  border-color: #51cf66;
}

:global(body.theme-light) .btn-participate:hover:not(:disabled) {
  border-color: #69db7c;
}

.btn-participate:disabled {
  background: #2a2a2a;
  color: var(--muted);
  cursor: not-allowed;
}

.cart-btn {
  margin-top: 8px;
  width: 100%;
}

.status-message {
  margin-top: 12px;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.product-image-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
}

.product-image-card img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.participants-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

.participants-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: var(--text);
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.btn-danger {
  background: #fa5252;
  color: var(--text);
  border: none;
}

.btn-danger:hover {
  background: #e03131;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
  color: var(--text);
}

.loading-container {
  text-align: center;
  padding: 100px 20px;
  color: var(--text);
  font-size: 18px;
}

@media (max-width: 900px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}
</style>



