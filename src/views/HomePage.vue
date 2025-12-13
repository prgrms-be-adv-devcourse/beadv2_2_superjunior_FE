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
              <div class="product-image" :style="{ backgroundImage: `url(${product.image})` }"></div>
              <div v-if="product.urgent" class="badge urgent">마감임박</div>
              <div v-if="product.hot" class="badge hot">인기</div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-seller">판매자: {{ product.seller }}</div>
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
                <button class="btn btn-primary btn-sm">참여하기</button>
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
                <button class="btn btn-primary btn-sm">참여하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 최신 공동구매 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">✨ 최신 공동구매</h2>
          <router-link :to="{ name: 'products', query: { section: 'new' } }" class="view-all">전체보기 →</router-link>
        </div>
        <div class="products-grid">
          <div 
            v-for="product in newProducts" 
            :key="product.id" 
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <div class="product-image" :style="{ backgroundImage: `url(${product.image})` }"></div>
              <div class="badge new">신규</div>
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
                <button class="btn btn-primary btn-sm">참여하기</button>
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
import axios from 'axios'
import NoImages from '@/data/NoImages.png'

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
//카테고리 드래그 스크롤
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

onMounted(() => {
  const el = categoriesEl.value
  if (!el) return

  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('mouseup', onMouseUp)
  el.addEventListener('mousemove', onMouseMove)
})

onBeforeUnmount(() => {
  const el = categoriesEl.value
  if (!el) return

  el.removeEventListener('mousedown', onMouseDown)
  el.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('mouseup', onMouseUp)
  el.removeEventListener('mousemove', onMouseMove)
})

const popularProducts = ref([])


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

//진행 중인 공동구매 중 참여 수량이 제일 많은 3개 불러오기
const fetchPopularProducts = async () => {
  const response = await axios.get('/api/searches/purchase/search', {
    params: {
      status: 'OPEN',
      sort: 'currentQuantity,desc',
      page: 0,
      size: 3
    }
  })

  return response.data.data.content
}

//형식 맞추기
const mapToPopularCard = (doc) => {
  const originalPrice = doc.productDocumentEmbedded?.price ?? 0
  const discountedPrice = doc.discountedPrice ?? originalPrice

  return {
    id: doc.groupPurchaseId,
    title: doc.title,
    category: doc.productDocumentEmbedded?.category ?? '',
    seller: doc.sellerName,
    image: doc.productDocumentEmbedded?.imageUrl || NoImages,
    originalPrice,
    currentPrice: discountedPrice,
    discountRate: doc.discountRate ?? 0,
    currentCount: doc.currentQuantity,
    targetCount: doc.maxQuantity,
    timeLeft: calcTimeLeft(doc.endDate),
    hot: doc.currentQuantity >= doc.minQuantity,
    urgent: isUrgent(doc.endDate)
  }
}

const endingProducts = ref([
        {
          id: 5,
          title: '갤럭시 워치6 클래식',
          category: '전자제품',
          seller: '스마트샵',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          originalPrice: 399000,
          currentPrice: 299000,
          discountRate: 25,
          currentCount: 18,
          targetCount: 20,
          timeLeft: '3시간 남음',
          urgent: true
        },
        {
          id: 6,
          title: '프리미엄 와인 세트',
          category: '식품',
          seller: '와인나라',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
          originalPrice: 129000,
          currentPrice: 89000,
          discountRate: 31,
          currentCount: 28,
          targetCount: 30,
          timeLeft: '5시간 남음',
          urgent: true
        }
      ])

const newProducts = ref([
        {
          id: 7,
          title: '무선 이어폰 프로',
          category: '전자제품',
          seller: '오디오샵',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          originalPrice: 199000,
          currentPrice: 139000,
          discountRate: 30,
          currentCount: 12,
          targetCount: 50,
          timeLeft: '7일 남음',
          urgent: false
        },
        {
          id: 8,
          title: '프리미엄 쿠션 세트',
          category: '뷰티',
          seller: '코스메틱',
          image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
          originalPrice: 69000,
          currentPrice: 49000,
          discountRate: 29,
          currentCount: 8,
          targetCount: 30,
          timeLeft: '6일 남음',
          urgent: false
        }
      ])

const onSearch = () => {
  if (!keyword.value.trim()) return
  router.push({ path: '/products', query: { q: keyword.value } })
}

const filterByCategory = (categoryId) => {
  router.push({ path: '/products', query: { category: categoryId } })
}

const goToProduct = (productId) => {
  router.push({ name: 'group-purchase-detail', params: { id: productId } })
}

onMounted(async () => {
  try {
    const docs = await fetchPopularProducts()
    popularProducts.value = docs.map(mapToPopularCard)
  } catch (e) {
    console.error('인기 공동구매 조회 실패', e)
    popularProducts.value = []
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

/* ==============================
   히어로 섹션
============================== */
.hero {
  position: relative;
  background: #1a1a1a;
  padding: 80px 0 60px;
  overflow: hidden;
  border-bottom: 1px solid #2a2a2a;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
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
  color: #ffffff;
}

.stat-label {
  font-size: 14px;
  color: #cccccc;
}

.hero-background {
  position: absolute;
  inset: 0;
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
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.95;
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
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  background: transparent;
  color: #ffffff;
}

.search-input::placeholder {
  color: #666;
}

/* ==============================
   섹션 공통
============================== */
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
  color: #ffffff;
}

.view-all {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
}

/* ==============================
   카테고리 (가로 드래그)
============================== */
.categories-section {
  background: #0a0a0a;
}

.categories-scroll.dragging {
  cursor: grabbing;
}

.categories-scroll.dragging .category-card {
  pointer-events: none; /* 드래그 중 클릭 방지 */
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

/* ==============================
   상품 카드
============================== */
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
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: #3a3a3a;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #0f0f0f;
}

.product-image {
  position: absolute;
  inset: 0;
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
  color: #ffffff;
}

.badge.hot { background: #ff4757; }
.badge.urgent { background: #ff6348; }
.badge.new { background: #2ed573; }

.product-info {
  padding: 20px;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

/* ==============================
   반응형
============================== */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 40px 0;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>




