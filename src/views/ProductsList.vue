<template>
  <main class="products-page">
    <section class="page-hero">
      <div class="container">
        <div>
          <p class="eyebrow">공동구매 마켓</p>
          <h1>지금 인기 있는 상품을 만나보세요</h1>
          <p class="subtitle">
            카테고리, 할인율, 마감 임박 순으로 필터링하고 바로 장바구니에 담을 수 있어요.
          </p>
        </div>
        <div class="stats">
          <div class="stat">
            <strong>{{ sampleProductsList.length }}</strong>
            <span>등록된 상품</span>
          </div>
          <div class="stat">
            <strong>₩{{ totalSavings.toLocaleString() }}</strong>
            <span>예상 절약액</span>
          </div>
          <div class="stat">
            <strong>{{ participantsCount.toLocaleString() }}명</strong>
            <span>참여 중</span>
          </div>
        </div>
      </div>
    </section>

    <section class="filters">
      <div class="container">
        <div class="filter-row">
          <div class="chips">
            <button
              v-for="section in primarySections"
              :key="section.id"
              type="button"
              class="chip"
              :class="{ active: selectedSection === section.id }"
              @click="setSection(section.id)"
            >
              {{ section.label }}
            </button>
          </div>
          <div class="filter-actions">
            <div class="search">
              <input
                v-model.trim="keyword"
                type="search"
                placeholder="상품명을 입력하세요"
                @keyup.enter="search"
              />
              <button class="btn btn-outline" @click="search">검색</button>
            </div>
            <div class="category-select">
              <label>
                카테고리
                <select v-model="selectedCategory">
                  <option :value="null">전체</option>
                  <option v-for="category in categories.slice(1)" :key="category.id" :value="category.id">
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div class="filter-row secondary">
          <div class="chips">
            <button
              v-for="section in secondarySections"
              :key="section.id"
              type="button"
              class="chip"
              :class="{ active: selectedSection === section.id }"
              @click="setSection(section.id)"
            >
              {{ section.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="product-grid-section">
      <div class="container">
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <p>조건에 맞는 상품이 없습니다. 다른 필터를 시도해 주세요.</p>
          <button class="btn btn-primary" @click="resetFilters">필터 초기화</button>
        </div>
        <div v-else class="product-grid">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="image-wrapper">
              <img :src="product.image" :alt="product.title" loading="lazy" />
              <div class="badge-group">
                <span v-for="badge in product.badges" :key="badge" class="badge">
                  {{ badge }}
                </span>
              </div>
              <button
                type="button"
                class="bookmark"
                :class="{ active: wishlist.has(product.id) }"
                @click.stop="toggleWishlist(product.id)"
              >
                {{ wishlist.has(product.id) ? '★' : '☆' }}
              </button>
            </div>
            <div class="card-body">
              <p class="category">{{ product.category }}</p>
              <h2>{{ product.title }}</h2>
              <p class="subtitle">{{ product.subtitle }}</p>
              <div class="price-row">
                <div>
                  <p class="current-price">₩{{ product.currentPrice.toLocaleString() }}</p>
                  <p class="meta">
                    <span class="discount">{{ product.discountRate }}% OFF</span>
                    <span class="original">₩{{ product.originalPrice.toLocaleString() }}</span>
                  </p>
                </div>
              </div>
              <div class="progress">
                <div class="progress-head">
                  <span>{{ product.currentCount }}명 참여</span>
                  <span>목표 {{ product.targetCount }}명</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${Math.min(product.currentCount / product.targetCount * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
              <div class="card-footer">
                <span class="time">⏰ {{ product.timeLeft }}</span>
                <button class="btn btn-primary" @click.stop="addToCart(product)">
                  장바구니 담기
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { groupPurchaseApi } from '@/api/axios'

const router = useRouter()
const route = useRoute()

const sampleProductsList = ref([])
const keyword = ref('')
const selectedSection = ref('popular')
const selectedCategory = ref(null)
const wishlist = ref(new Set())
const loading = ref(false)

const categories = [
  { id: 1, name: '전체', icon: '✨' },
  { id: 2, name: '생활 & 주방', icon: '🏠' },
  { id: 3, name: '식품 & 간식', icon: '🍎' },
  { id: 4, name: '건강 & 헬스', icon: '💪' },
  { id: 5, name: '뷰티', icon: '💄' },
  { id: 6, name: '패션 & 의류', icon: '👟' },
  { id: 7, name: '전자 & 디지털', icon: '📱' },
  { id: 8, name: '유아 & 어린이', icon: '👶' },
  { id: 9, name: '취미', icon: '🎨' },
  { id: 10, name: '반려동물', icon: '🐾' }
]

const primarySections = [
  { id: 'popular', label: '인기' },
  { id: 'new', label: '신규' },
  { id: 'ending', label: '마감 임박' },
  { id: 'discount', label: '할인율 높은 순' }
]

const secondarySections = [
  { id: 'priceLow', label: '가격 낮은 순' },
  { id: 'priceHigh', label: '가격 높은 순' }
]

const sections = [...primarySections, ...secondarySections]

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
  'PET': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
  '생활 & 주방': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  '식품 & 간식': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  '건강 & 헬스': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  '뷰티': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  '패션 & 의류': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  '전자 & 디지털': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  '유아 & 어린이': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  '취미': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400',
  '반려동물': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'
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
  // 카테고리 변환 (백엔드 enum -> 한글)
  const categoryKorean = categoryMap[gp.category] || gp.category || '기타'

  // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지
  let image = gp.imageUrl || gp.image || gp.thumbnailUrl || gp.originalUrl
  if (!image || image.trim() === '') {
    // category가 있으면 해당 카테고리 이미지, 없으면 기본 이미지
    image = categoryImages[gp.category] || categoryImages[categoryKorean] || categoryImages['PET']
  }

  const originalPrice = gp.price || 0
  const currentPrice = gp.discountedPrice || 0
  const discountRate = originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : 0

  // 마감 임박 판단 (24시간 이내)
  const timeLeft = getTimeRemaining(gp.endDate)
  const isUrgent = timeLeft.includes('시간') && !timeLeft.includes('일')

  const badges = []
  if (isUrgent) badges.push('마감임박')
  if (discountRate >= 30) badges.push(`${discountRate}% 할인`)

  return {
    id: gp.groupPurchaseId || gp.id,
    title: gp.title,
    subtitle: gp.description?.substring(0, 50) || '',
    category: categoryKorean,
    image: image,
    originalPrice: originalPrice,
    currentPrice: currentPrice,
    discountRate: discountRate,
    currentCount: gp.currentQuantity || 0,
    targetCount: gp.maxQuantity || 0,
    timeLeft: timeLeft,
    badges: badges
  }
}

const participantsCount = computed(() => {
  return sampleProductsList.value.reduce((sum, product) => sum + product.currentCount, 0)
})

const totalSavings = computed(() => {
  return sampleProductsList.value.reduce(
    (sum, product) => sum + (product.originalPrice - product.currentPrice) * product.currentCount,
    0
  )
})

const filteredProducts = computed(() => {
  let result = [...sampleProductsList.value]

  // 키워드 검색 필터링
  if (keyword.value) {
    const keywordLower = keyword.value.toLowerCase()
    result = result.filter(
      (product) =>
        product.title.toLowerCase().includes(keywordLower) ||
        (product.subtitle && product.subtitle.toLowerCase().includes(keywordLower))
    )
  }

  // 카테고리 필터링
  if (selectedCategory.value && selectedCategory.value !== 1) {
    const category = categories.find((item) => item.id === selectedCategory.value)?.name
    result = result.filter((product) => product.category === category)
  }

  // section에 따른 정렬은 loadProducts에서 이미 처리됨
  return result
})

const loadProducts = async () => {
  loading.value = true
  try {
    // section에 따라 sort 파라미터 결정
    let sortParam = null

    if (selectedSection.value === 'popular') {
      sortParam = 'currentQuantity,desc'
    } else if (selectedSection.value === 'new') {
      sortParam = 'createdAt,desc'
    } else if (selectedSection.value === 'ending') {
      sortParam = 'endDate,asc'
    } else if (selectedSection.value === 'discount') {
      // 할인율은 프론트에서 계산 후 정렬
      sortParam = null
    } else if (selectedSection.value === 'priceLow') {
      sortParam = 'discountedPrice,asc'
    } else if (selectedSection.value === 'priceHigh') {
      sortParam = 'discountedPrice,desc'
    }

    const response = await groupPurchaseApi.getAllGroupPurchases(0, 100, sortParam)
    console.log('전체 공동구매 목록:', response.data)

    const data = response.data.data || response.data
    const content = data.content || data

    if (Array.isArray(content)) {
      sampleProductsList.value = content.map(transformGroupPurchase)

      // 할인율 정렬이 필요한 경우 프론트에서 정렬
      if (selectedSection.value === 'discount') {
        sampleProductsList.value.sort((a, b) => b.discountRate - a.discountRate)
      }
    } else {
      sampleProductsList.value = []
    }
  } catch (error) {
    console.error('공동구매 목록 조회 실패:', error)
    sampleProductsList.value = []
  } finally {
    loading.value = false
  }
}

const setSection = (section) => {
  selectedSection.value = section
  router.replace({ query: { ...route.query, section } })
  loadProducts()
}

const search = () => {
  // 메서드 존재로 입력값과 동기화만 수행
}

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = null
  selectedSection.value = 'popular'
}

const toggleWishlist = (productId) => {
  if (wishlist.value.has(productId)) {
    wishlist.value.delete(productId)
  } else {
    wishlist.value.add(productId)
  }
  wishlist.value = new Set(wishlist.value)
}

const goToDetail = (productId) => {
  router.push({ name: 'group-purchase-detail', params: { id: productId } })
}

const addToCart = (product) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  cart.push({ productId: product.id, quantity: 1 })
  localStorage.setItem('cart', JSON.stringify(cart))
  router.push({ name: 'cart' })
}

onMounted(() => {
  loadProducts()
})

watch(() => route.query.section, (section) => {
  if (section && sections.some((item) => item.id === section)) {
    selectedSection.value = section
  }
}, { immediate: true })
</script>

<style scoped>
.products-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-hero {
  padding: 48px 0 32px;
}

.page-hero .eyebrow {
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.page-hero h1 {
  font-size: 36px;
  margin-bottom: 12px;
  color: #ffffff;
}

.page-hero .subtitle {
  color: #999;
}

.stats {
  display: flex;
  gap: 32px;
  margin-top: 24px;
}

.stat {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  flex: 1;
}

.stat strong {
  display: block;
  font-size: 20px;
  color: #ffffff;
}

.stat span {
  color: #999;
  font-size: 14px;
}

.filters {
  background: #0a0a0a;
  border-top: 1px solid #2a2a2a;
  border-bottom: 1px solid #2a2a2a;
  padding: 24px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-row.secondary {
  margin-top: 12px;
  justify-content: flex-start;
}

.chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.chip {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.chip.active {
  border-color: #ffffff;
  color: #0a0a0a;
  background: #ffffff;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  display: flex;
  gap: 8px;
}

.search input {
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  min-width: 260px;
  color: #ffffff;
}

.search input::placeholder {
  color: #666;
}

.search input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.category-select {
  color: #ffffff;
}

.category-select select {
  margin-left: 8px;
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  min-width: 180px;
}

.category-select select:focus {
  outline: none;
  border-color: #ffffff;
}

.product-grid-section {
  padding: 40px 0 80px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  border-color: #3a3a3a;
}

.image-wrapper {
  position: relative;
  padding-top: 72%;
}

.image-wrapper img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-group {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.badge {
  background: rgba(0, 0, 0, 0.65);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.bookmark {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
}

.bookmark.active {
  color: #f59f00;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-body h2 {
  font-size: 20px;
  margin: 0;
  color: #ffffff;
}

.card-body .subtitle {
  color: #999;
  font-size: 14px;
}

.category {
  color: #ffffff;
  font-weight: 600;
  font-size: 13px;
}

.price-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.meta {
  font-size: 13px;
  color: #999;
}

.discount {
  color: #ffffff;
  font-weight: 600;
  margin-right: 8px;
}

.original {
  text-decoration: line-through;
  color: #666;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #ffffff;
}

.progress-bar {
  height: 8px;
  background: #0f0f0f;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 13px;
  color: #999;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  background: #f0f0f0;
}

.btn-outline {
  border: 1px solid #3a3a3a;
  background: transparent;
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #ffffff;
}

.empty-state p {
  color: #999;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-row.secondary {
    margin-top: 8px;
  }

  .chips {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .search {
    width: 100%;
  }

  .search input {
    flex: 1;
    min-width: auto;
  }

  .category-select {
    width: 100%;
  }

  .category-select select {
    width: 100%;
  }

  .price-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


