<template>
  <main class="home-page">
    <!-- 히어로 섹션 -->
    <section class="hero">
      <div class="hero-background"></div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">함께하면 더 저렴하게</h1>
          <p class="hero-subtitle">공동구매로 최대 50% 할인받고, 안전한 거래로 만족스러운 쇼핑을 경험하세요</p>
          <div class="search-box">
            <input
              v-model="keyword"
              type="text"
              placeholder="상품명, 브랜드, 카테고리를 검색해보세요"
              class="search-input"
              @keyup.enter="onSearch"
            />
            <button class="btn btn-primary btn-search" @click="onSearch">
              <span>검색</span>
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-value">12,345</div>
              <div class="stat-label">진행중인 공동구매</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">98,765</div>
              <div class="stat-label">누적 참여자</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₩1.2억</div>
              <div class="stat-label">이번 달 절약액</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 카테고리 섹션 -->
    <section class="section categories-section">
      <div class="container">
        <h2 class="section-title">카테고리</h2>
        <div ref="categoriesEl" class="categories-scroll">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="filterByCategory(category.value)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-name">{{ category.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 인기 공동구매 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🔥 인기 공동구매</h2>
          <router-link :to="{ name: 'products', query: { section: 'popular' } }" class="view-all">전체보기 →</router-link>
        </div>
        <div class="products-grid">
          <div
            v-for="product in popularProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <div
                class="product-image"
                :style="{ backgroundImage: `url(${product.image})` }"
              ></div>
              <div class="badge hot">인기</div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-info">
                <div class="price-row">
                  <span class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
                  <span class="discount-rate">{{ product.discountRate }}% 할인</span>
                </div>
                <div class="current-price">₩{{ product.currentPrice.toLocaleString() }}</div>
              </div>
              <div class="product-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ product.currentCount }}명 참여</span>
                  <span class="progress-target">목표: {{ product.targetCount }}명</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(product.currentCount / product.targetCount) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div class="product-footer">
                <span class="time-left">⏰ {{ product.timeLeft }}</span>
                <div class="footer-actions">
                  <button
                    class="btn btn-outline btn-sm"
                    @click.stop="addToCart(product)"
                  >
                    장바구니
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    @click.stop="goToProduct(product.id)"
                  >
                    참여하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 마감 임박 공동구매 -->
    <section class="section section-muted">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">⏰ 마감 임박</h2>
          <router-link :to="{ name: 'products', query: { section: 'ending' } }" class="view-all">전체보기 →</router-link>
        </div>
        <div class="products-grid">
          <div
            v-for="product in endingProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <div class="product-image" :style="{ backgroundImage: `url(${product.image})` }"></div>
              <div class="badge urgent">마감임박</div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-info">
                <div class="price-row">
                  <span class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
                  <span class="discount-rate">{{ product.discountRate }}% 할인</span>
                </div>
                <div class="current-price">₩{{ product.currentPrice.toLocaleString() }}</div>
              </div>
              <div class="product-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ product.currentCount }}명 참여</span>
                  <span class="progress-target">목표: {{ product.targetCount }}명</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{
                      width: `${Math.min(
                        (product.currentCount / product.targetCount) * 100,
                        100
                      )}%`
                    }"
                  ></div>
                </div>
              </div>
              <div class="product-footer">
                <span class="time-left urgent-time">⏰ {{ product.timeLeft }}</span>
              <div class="footer-actions">
                <button
                  class="btn btn-outline btn-sm"
                  @click.stop="addToCart(product)"
                >
                  장바구니
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click.stop="goToProduct(product.id)"
                >
                  참여하기
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 최대 할인 공동구매 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">✨ 최대 할인</h2>
          <router-link :to="{ name: 'products', query: { section: 'discount' } }" class="view-all">전체보기 →</router-link>
        </div>
        <div class="products-grid">
          <div
            v-for="product in discountProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <div class="product-image" :style="{ backgroundImage: `url(${product.image})` }"></div>
              <div class="badge discount">할인</div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-info">
                <div class="price-row">
                  <span class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
                  <span class="discount-rate">{{ product.discountRate }}% 할인</span>
                </div>
                <div class="current-price">₩{{ product.currentPrice.toLocaleString() }}</div>
              </div>
              <div class="product-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ product.currentCount }}명 참여</span>
                  <span class="progress-target">목표: {{ product.targetCount }}명</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(product.currentCount / product.targetCount) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div class="product-footer">
                <span class="time-left">⏰ {{ product.timeLeft }}</span>
                <div class="footer-actions">
                  <button
                    class="btn btn-outline btn-sm"
                    @click.stop="addToCart(product)"
                  >
                    장바구니
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    @click.stop="goToProduct(product.id)"
                  >
                    참여하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 맞춤형 추천 -->
    <section v-if="recommendedProducts.length" class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            맞춤형 추천
            <span v-if="recommendedReason" class="section-reason">{{ recommendedReason }}</span>
          </h2>
          <router-link :to="{ name: 'products', query: { section: 'recommend' } }" class="view-all">전체보기 →</router-link>
        </div>
        <div class="products-grid">
          <div
            v-for="product in recommendedProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <div class="product-image" :style="{ backgroundImage: `url(${product.image})` }"></div>
              <div class="badge recommend">추천</div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-info">
                <div class="price-row">
                  <span class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
                  <span class="discount-rate">{{ product.discountRate }}% 할인</span>
                </div>
                <div class="current-price">₩{{ product.currentPrice.toLocaleString() }}</div>
              </div>
              <div class="product-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ product.currentCount }}명 참여</span>
                  <span class="progress-target">목표: {{ product.targetCount }}명</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(product.currentCount / product.targetCount) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div class="product-footer">
                <span class="time-left">⏰ {{ product.timeLeft }}</span>
                <div class="footer-actions">
                  <button
                    class="btn btn-outline btn-sm"
                    @click.stop="addToCart(product)"
                  >
                    장바구니
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    @click.stop="goToProduct(product.id)"
                  >
                    참여햐기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 서비스 특징 -->
    <section class="section section-muted features-section">
      <div class="container">
        <h2 class="section-title">왜 공동구매를 선택해야 할까요?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3 class="feature-title">최대 50% 할인</h3>
            <p class="feature-desc">많은 사람이 함께하면 더 저렴하게 구매할 수 있습니다</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">안전한 거래</h3>
            <p class="feature-desc">예치금 시스템으로 안전하게 거래하고, 실패 시 전액 환불됩니다</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">빠른 배송</h3>
            <p class="feature-desc">목표 달성 시 즉시 주문 처리되어 빠르게 배송됩니다</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⭐</div>
            <h3 class="feature-title">검증된 판매자</h3>
            <p class="feature-desc">신뢰할 수 있는 판매자만 등록되어 있어 안심하고 구매하세요</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { groupPurchaseApi, cartApi } from '@/api/axios'
import {authAPI as auth} from "@/api/auth";

const router = useRouter()

const keyword = ref('')
const categories = [
  { id: 1, value: 'ALL', label: '전체', icon: '✨' },
  { id: 2, value: 'HOME', label: '생활 · 주방', icon: '🏠' },
  { id: 3, value: 'FOOD', label: '식품 · 간식', icon: '🍎' },
  { id: 4, value: 'HEALTH', label: '건강 · 헬스', icon: '💊' },
  { id: 5, value: 'BEAUTY', label: '뷰티', icon: '💄' },
  { id: 6, value: 'FASHION', label: '패션 · 의류', icon: '👟' },
  { id: 7, value: 'ELECTRONICS', label: '전자 · 디지털', icon: '📱' },
  { id: 8, value: 'KIDS', label: '유아 · 어린이', icon: '🧸' },
  { id: 9, value: 'HOBBY', label: '취미', icon: '🎮' },
  { id: 10, value: 'PET', label: '반려동물', icon: '🐶' }
]

// 카테고리별 기본 이미지
const categoryImages = {
  'HOME': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'HEALTH': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  'KIDS': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  'HOBBY': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400',
  'PET': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'
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

const popularProducts = ref([])

//드래그 스크롤
const categoriesEl = ref(null)

let isDown = false
let startX = 0
let scrollLeft = 0

const onMouseDown = (e) => {
  if (!categoriesEl.value) return
  isDown = true
  categoriesEl.value.classList.add('dragging')
  startX = e.pageX - categoriesEl.value.offsetLeft
  scrollLeft = categoriesEl.value.scrollLeft
}

const onMouseLeave = () => {
  isDown = false
  categoriesEl.value?.classList.remove('dragging')
}

const onMouseUp = () => {
  isDown = false
  categoriesEl.value?.classList.remove('dragging')
}

const onMouseMove = (e) => {
  if (!isDown || !categoriesEl.value) return
  e.preventDefault()
  const x = e.pageX - categoriesEl.value.offsetLeft
  const walk = (x - startX) * 1.5 // 드래그 속도
  categoriesEl.value.scrollLeft = scrollLeft - walk
}

//남은 날짜 계산
const calcTimeLeft = (endDate) => {
  if (!endDate) return ''

  const end = new Date(endDate)
  const now = new Date()
  const diffMs = end - now

  if (diffMs <= 0) return '마감'

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  return days > 0
    ? `${days}일 ${hours}시간 남음`
    : `${hours}시간 남음`
}

const isUrgent = (endDate) => {
  if (!endDate) return false
  return (new Date(endDate) - new Date()) / (1000 * 60 * 60) <= 24
}

//진행 중인 공동구매 중 참여 수량이 제일 많은 항목 불러오기
const fetchPopularProducts = async () => {
  const res = await groupPurchaseApi.searchGroupPurchases({
    status: 'OPEN',
    sort: 'currentQuantity,desc',
    size: 3
  })

  return res.data.data.content
}

// 형식 맞추기 (GroupPurchaseDocument 기준)
const mapToProductCard = (gp) => {
  const product = gp.productSearchInfo || {}

  // 카테고리 변환 (백엔드 enum -> 한글)
  const categoryCode = product.category
  const categoryKorean = categoryMap[categoryCode] || categoryCode || '기타'

  let image = categoryImages[categoryCode] || categoryImages['PET']

  // 이미지 우선순위
//  let image = product.originalUrl
//  if (!image || image.trim() === '') {
//    image = categoryImages[categoryCode] || categoryImages['PET']
//  }

  const originalPrice = product.price || 0
  const discountedPrice = gp.discountedPrice ?? originalPrice

  // 할인율 (백엔드 discountRate 있으면 우선)
  const discountRate =
    gp.discountRate != null
      ? gp.discountRate
      : originalPrice > 0
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0

  return {
    // ✅ 유지
    id: gp.groupPurchaseId,
    groupPurchaseId: gp.groupPurchaseId, // 명시적으로 groupPurchaseId 추가
    title: gp.title,
    subtitle: gp.description,
    category: categoryKorean,
    seller: gp.sellerName || '판매자',
    image,

    // 가격
    originalPrice,
    currentPrice: discountedPrice,
    discountRate,

    // 수량
    currentCount: gp.currentQuantity || 0,
    targetCount: gp.maxQuantity || 1,

    // 상태 계산
    timeLeft: calcTimeLeft(gp.endDate),
    hot: (gp.currentQuantity || 0) >= (gp.minQuantity || 0),
    urgent: isUrgent(gp.endDate)
  }
}


//마감 임박
const endingProducts = ref([])

const fetchEndingProducts = async () => {
  const res = await groupPurchaseApi.searchGroupPurchases({
    status: 'OPEN',
    sort: 'endDate,asc',
    size: 3
  })

  return res.data.data.content
}

//최대 할인 공동구매
const discountProducts = ref([])

const fetchDiscountProducts = async () => {
  const res = await groupPurchaseApi.searchGroupPurchases({
    status: 'OPEN',
    sort: 'discountRate,desc',
    size: 3
  })

  return res.data.data.content
}

//맞춤형 추천
// todo api 수정 필요
const recommendedProducts = ref([])
const recommendedReason = ref('')

const fetchRecommendedProducts = async () => {
  const res = await auth.searchAIRecommendPurchases({
    status: 'OPEN',
    sort: 'currentQuantity,desc',
    size: 3
  })

  return {
    items: res?.groupPurchase ?? [],
    reason: res?.reason ?? ''
  }
}

const onSearch = () => {
  router.push({ path: '/products', query: { q: keyword.value } })
}

const filterByCategory = (categoryId) => {
  router.push({ path: '/products', query: { category: categoryId } })
}

const goToProduct = (productId) => {
  router.push({ name: 'group-purchase-detail', params: { id: productId } })
}

const addToCart = async (product) => {
  try {
    const response = await cartApi.addToCart({
      groupPurchaseId: product.groupPurchaseId || product.id,
      quantity: 1
    })
    // ResponseDto<CartInfo> 구조에서 data 추출
    const cartInfo = response.data?.data || response.data
    console.log('장바구니 추가 성공:', {
      cartId: cartInfo?.cartId,
      memberId: cartInfo?.memberId,
      groupPurchaseId: cartInfo?.groupPurchaseId,
      quantity: cartInfo?.quantity,
      createdAt: cartInfo?.createdAt,
      updatedAt: cartInfo?.updatedAt
    })
    alert('장바구니에 담았습니다.')
    // FloatingCart 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch (error) {
    console.error('장바구니 담기 실패:', error)
    const message = error.response?.data?.message || '장바구니 담기에 실패했습니다.'
    alert(message)
  }
}

onMounted(async () => {
  // 카테고리 드래그 스크롤 이벤트 등록
  const el = categoriesEl.value
  if (el) {
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
  }

  // 공동구매 데이터 로드
  try {
    const [popularDocs, endingDocs, discountDocs] = await Promise.all([
      fetchPopularProducts(),
      fetchEndingProducts(),
      fetchDiscountProducts()
    ])

    popularProducts.value = popularDocs.map(mapToProductCard)
    endingProducts.value = endingDocs.map(mapToProductCard)
    discountProducts.value = discountDocs.map(mapToProductCard)
  } catch (e) {
    console.error('메인 페이지 상품 조회 실패', e)
    popularProducts.value = []
    endingProducts.value = []
    discountProducts.value = []
  }

  try {
    const recommendDocs = await fetchRecommendedProducts()
    recommendedProducts.value = recommendDocs.items.map(mapToProductCard)
    recommendedReason.value = recommendDocs.reason
  } catch (e) {
    console.error('추천 상품 조회 실패', e)
    recommendedProducts.value = []
    recommendedReason.value = ''
  }
})

onBeforeUnmount(() => {
  const el = categoriesEl.value
  if (el) {
    el.removeEventListener('mousedown', onMouseDown)
    el.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('mouseup', onMouseUp)
    el.removeEventListener('mousemove', onMouseMove)
  }
})
</script>

<style scoped>
.home-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 히어로 섹션 */
.hero {
  position: relative;
  background: #1a1a1a;
  padding: 80px 0 60px;
  overflow: hidden;
  border-bottom: 1px solid #2a2a2a;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px;
  opacity: 0.95;
  font-weight: 400;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto 50px;
  gap: 12px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  font-size: 16px;
  color: #ffffff;
  background: transparent;
}

.search-input::placeholder {
  color: #666;
}

.btn-search {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 섹션 공통 */
.section {
  padding: 60px 0;
}

.section-muted {
  background: #111111;
  border-top: 1px solid #2a2a2a;
  border-bottom: 1px solid #2a2a2a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.section-reason {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #999999;
}

.view-all {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: color 0.2s;
}

.view-all:hover {
  color: #cccccc;
}

/* 카테고리 (가로 드래그) */
.categories-section {
  background: #0a0a0a;
}

.categories-scroll.dragging {
  cursor: grabbing;
}

.categories-scroll {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;

  cursor: grab;
  user-select: none;

  overflow-x: auto;
  overflow-y: hidden;

  padding: 8px 4px 12px;

  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-card {
  flex: 0 0 auto;
  min-width: 110px;
  height: 96px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;

  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: #ffffff;
  transform: translateY(-2px);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

/* 상품 그리드 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border-color: #3a3a3a;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #0f0f0f;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge.hot {
  background: #ff4757;
}

.badge.urgent {
  background: #ff6348;
}

.badge.discount {
  background: #2ed573;
}

.badge.recommend {
  background: #ffa502;
}

.product-info {
  padding: 20px;
}

.product-category {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #ffffff;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-seller {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}

.product-price-info {
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.original-price {
  font-size: 14px;
  color: #666;
  text-decoration: line-through;
}

.discount-rate {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  background: #2a2a2a;
  padding: 2px 8px;
  border-radius: 4px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.product-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.progress-text {
  color: #ffffff;
  font-weight: 600;
}

.progress-target {
  color: #888;
}

.progress-bar {
  height: 8px;
  background: #0f0f0f;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  transition: width 0.3s;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.time-left {
  font-size: 13px;
  color: #888;
}

.urgent-time {
  color: #ff6b6b;
  font-weight: 600;
}

.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* 특징 섹션 */
.features-section {
  background: #0a0a0a;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 40px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #ffffff;
}

.feature-desc {
  font-size: 15px;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .search-box {
    flex-direction: column;
    padding: 12px;
  }

  .search-input {
    width: 100%;
  }

  .btn-search {
    width: 100%;
  }

  .hero-stats {
    flex-direction: column;
    gap: 32px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 60px 0 40px;
  }

  .section {
    padding: 40px 0;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .category-icon {
    font-size: 32px;
  }

  .category-name {
    font-size: 12px;
  }
}
</style>
