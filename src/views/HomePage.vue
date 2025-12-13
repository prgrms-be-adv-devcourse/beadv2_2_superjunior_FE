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
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id" 
            class="category-card"
            @click="filterByCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-name">{{ category.name }}</div>
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
                    :style="{ width: `${(product.currentCount / product.targetCount) * 100}%` }"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupPurchaseApi } from '@/api/axios'

const router = useRouter()

const keyword = ref('')
const categories = [
  { id: 1, name: '전자제품', icon: '📱' },
  { id: 2, name: '패션', icon: '👕' },
  { id: 3, name: '식품', icon: '🍎' },
  { id: 4, name: '뷰티', icon: '💄' },
  { id: 5, name: '홈/리빙', icon: '🏠' },
  { id: 6, name: '스포츠', icon: '⚽' },
  { id: 7, name: '도서', icon: '📚' },
  { id: 8, name: '기타', icon: '📦' }
]

// 카테고리별 기본 이미지
const categoryImages = {
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  'HOME_LIVING': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  'BOOK': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
  'SPORTS': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
  'OTHER': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  '전자제품': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  '패션': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  '식품': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  '뷰티': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  '홈/리빙': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  '도서': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
  '스포츠': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
  '기타': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
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

const popularProducts = ref([])
const endingProducts = ref([])
const newProducts = ref([])

// 남은 시간 계산
const getTimeRemaining = (endDate) => {
  if (!endDate) return '기간 미정'

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

// 백엔드 데이터를 프론트엔드 형식으로 변환
const transformGroupPurchase = (gp) => {
  const categoryKorean = categoryMap[gp.category] || gp.category || '기타'
  const image = categoryImages[gp.category] || categoryImages[categoryKorean] || categoryImages['OTHER']

  const originalPrice = gp.price || 0
  const currentPrice = gp.discountedPrice || 0
  const discountRate = originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : 0

  return {
    id: gp.groupPurchaseId || gp.id,
    title: gp.title,
    category: categoryKorean,
    seller: gp.sellerName || '판매자',
    image: image,
    originalPrice: originalPrice,
    currentPrice: currentPrice,
    discountRate: discountRate,
    currentCount: gp.currentQuantity || 0,
    targetCount: gp.maxQuantity || 0,
    timeLeft: getTimeRemaining(gp.endDate),
    hot: false,
    urgent: false
  }
}

// 인기 공동구매 로드 (참여자 많은 순)
const loadPopularProducts = async () => {
  try {
    const response = await groupPurchaseApi.getAllGroupPurchases(0, 4, 'currentQuantity,desc')
    console.log('인기 공동구매:', response.data)

    const data = response.data.data || response.data
    const content = data.content || data

    if (Array.isArray(content)) {
      popularProducts.value = content.map(gp => {
        const product = transformGroupPurchase(gp)
        product.hot = true
        return product
      })
    }
  } catch (error) {
    console.error('인기 공동구매 조회 실패:', error)
    popularProducts.value = []
  }
}

// 마감 임박 공동구매 로드 (종료일 빠른 순)
const loadEndingProducts = async () => {
  try {
    const response = await groupPurchaseApi.getAllGroupPurchases(0, 2, 'endDate,asc')
    console.log('마감 임박 공동구매:', response.data)

    const data = response.data.data || response.data
    const content = data.content || data

    if (Array.isArray(content)) {
      endingProducts.value = content.map(gp => {
        const product = transformGroupPurchase(gp)
        product.urgent = true
        return product
      })
    }
  } catch (error) {
    console.error('마감 임박 공동구매 조회 실패:', error)
    endingProducts.value = []
  }
}

// 최신 공동구매 로드 (등록일 최신순)
const loadNewProducts = async () => {
  try {
    const response = await groupPurchaseApi.getAllGroupPurchases(0, 2, 'createdAt,desc')
    console.log('최신 공동구매:', response.data)

    const data = response.data.data || response.data
    const content = data.content || data

    if (Array.isArray(content)) {
      newProducts.value = content.map(gp => {
        const product = transformGroupPurchase(gp)
        return product
      })
    }
  } catch (error) {
    console.error('최신 공동구매 조회 실패:', error)
    newProducts.value = []
  }
}

const onSearch = () => {
  if (!keyword.value.trim()) return
  router.push({ path: '/products', query: { q: keyword.value } })
}

const filterByCategory = (categoryId) => {
  router.push({ path: '/products', query: { category: categoryId } })
}

const goToProduct = (productId) => {
  router.push({ name: 'product-detail', params: { id: productId } })
}

// 페이지 로드 시 데이터 가져오기
onMounted(() => {
  loadPopularProducts()
  loadEndingProducts()
  loadNewProducts()
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

/* 카테고리 */
.categories-section {
  background: #0a0a0a;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.category-card {
  text-align: center;
  padding: 24px 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  background: #222222;
  border-color: #ffffff;
  transform: translateY(-2px);
}

.category-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.category-name {
  font-size: 14px;
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

.badge.new {
  background: #2ed573;
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

  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
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

  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .category-icon {
    font-size: 32px;
  }

  .category-name {
    font-size: 12px;
  }
}
</style>



