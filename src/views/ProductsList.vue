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
              v-for="status in statusFilters"
              :key="status.id"
              class="chip"
              :class="{ active: selectedStatus === status.value }"
              @click="setStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
          <div class="search">
            <input
              v-model.trim="keyword"
              type="search"
              placeholder="상품명을 입력하세요"
              @keyup.enter="search"
            />
            <button class="btn btn-outline" @click="search">검색</button>
          </div>
        </div>

        <div class="filter-row secondary">
            <div class="category-wrapper">
              <div class="categories primary">
                <!-- 기본 카테고리 -->
                <button
                  v-for="cat in primaryCategories"
                  :key="cat.value"
                  class="category-btn"
                  :class="{ active: selectedCategory === cat.value }"
                  @click="filterByCategory(cat.value)"
                >
                  <span>{{ cat.icon }}</span>
                  <span>{{ cat.label }}</span>
                </button>

                <!-- 더보기 버튼 -->
                <button class="category-btn more" @click="showMoreCategories = !showMoreCategories">
                  ➕ 더보기
                </button>
              </div>

              <!-- 더보기 영역 -->
              <div v-if="showMoreCategories" class="categories secondary">
                <button
                  v-for="cat in secondaryCategories"
                  :key="cat.value"
                  class="category-btn"
                  :class="{ active: selectedCategory === cat.value }"
                  @click="filterByCategory(cat.value)"
                >
                  <span>{{ cat.icon }}</span>
                  <span>{{ cat.label }}</span>
                </button>
              </div>
          </div>
          <div class="sort">
            <label>
              정렬
              <select v-model="sortBy">
                <option value="popular">인기순</option>
                <option value="discountRate">할인율 높은순</option>
                <option value="priceLow">가격 낮은순</option>
                <option value="priceHigh">가격 높은순</option>
                <option value="deadline">마감 임박순</option>
              </select>
            </label>
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
                @click="toggleWishlist(product.id)"
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
                <button class="btn btn-outline" @click="goToDetail(product.id)">
                  상세보기
                </button>
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
                <button class="btn btn-primary" @click="addToCart(product)">
                  장바구니 담기
                </button>
              </div>
            </div>
          </article>
        </div>
        <div
          v-if="totalPages > 1"
          class="pagination"
        >
          <button
            class="page-btn"
            :disabled="currentPage === 0"
            @click="goToPage(currentPage - 1)"
          >
            이전
          </button>

          <span class="page-info">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>

          <button
            class="page-btn"
            :disabled="currentPage + 1 === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NoImages from '@/data/NoImages.png'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const sampleProductsList = ref([])
const keyword = ref('')
const selectedSection = ref('popular')
const selectedCategory = ref(null)
const sortBy = ref('popular')
const wishlist = ref(new Set())

const currentPage = ref(0)
const pageSize = 3
const totalPages = ref(0)

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

const showMoreCategories = ref(false)

const primaryCategories = computed(() =>
  categories.slice(0, 4) // 전체 + 3개
)

const secondaryCategories = computed(() =>
  categories.slice(4)
)

const statusFilters = [
  { id: 'OPEN', label: '진행 중', value: 'OPEN' },
  { id: 'SCHEDULED', label: '진행 전', value: 'SCHEDULED' },
  { id: 'SUCCESS', label: '성공', value: 'SUCCESS' },
  { id: 'FAILED', label: '실패', value: 'FAILED' }
]

const selectedStatus = ref('OPEN')

const setStatus = (status) => {
  selectedStatus.value = status
  currentPage.value = 0
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

const filteredProducts = computed(() => sampleProductsList.value)

const toApiSort = (sortBy) => {
  switch (sortBy) {
    case 'discountRate':
      return 'discountRate,desc'
    case 'priceLow':
      return 'discountedPrice,asc'
    case 'priceHigh':
      return 'discountedPrice,desc'
    case 'deadline':
      return 'endDate,asc'         // ✅ 마감 임박순
    default:
      return 'currentQuantity,desc'
  }
}

const searchGroupPurchases = async ({
  keyword = '',
  status = 'OPEN',
  category = '',
  page = 0,
  size = 10,
  sort = 'createdAt,desc'
} = {}) => {
  const response = await axios.get('/api/searches/purchase/search', {
    params: {
      keyword,
      status,
      category,
      page,
      size,
      sort
    }
  })

  // ResponseDto<PageResponse<...>> 에서 data만 반환
  return response.data.data
}

const mapToProductCard = (doc) => {
  const originalPrice = doc.productDocumentEmbedded.price
  const discountedPrice = doc.discountedPrice

  return {
    id: doc.groupPurchaseId,
    title: doc.title,
    subtitle: doc.description,
    category: doc.productDocumentEmbedded.category, // KIDS, HOME
    currentPrice: discountedPrice,
    originalPrice,
    discountRate: (doc.productDocumentEmbedded.price > 0
                       ? Math.round(((doc.productDocumentEmbedded.price - doc.discountedPrice) / doc.productDocumentEmbedded.price) * 100)
                       : 0),
    currentCount: doc.currentQuantity,
    targetCount: doc.maxQuantity,
    timeLeft: calcTimeLeft(doc.endDate),
    image: NoImages, // 임시 이미지
    badges: [doc.status] // SCHEDULED 등
  }
}

const calcTimeLeft = (endDate) => {
  if (!endDate) return ''

  const end = new Date(endDate)
  const now = new Date()

  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return '마감'

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`
  }

  return `${hours}시간 남음`
}

const loadProducts = async () => {
  const page = await searchGroupPurchases({
    keyword: keyword.value,
    status: selectedStatus.value, // 상태 필터 쓰고 있으면
    category:
      selectedCategory.value && selectedCategory.value !== 'ALL'
        ? selectedCategory.value
        : '',
    page: currentPage.value,
    size: pageSize,
    sort: toApiSort(sortBy.value) // ✅ 서버 정렬
  })

  sampleProductsList.value = page.content.map(mapToProductCard)
  totalPages.value = page.totalPages
}

const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  loadProducts()
}

const filterByCategory = (categoryValue) => {
  selectedCategory.value =
    selectedCategory.value === categoryValue ? null : categoryValue;
};

const search = async () => {
  await loadProducts()
}

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = null
  selectedSection.value = 'popular'
  sortBy.value = 'popular'
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

watch(
  () => route.query,
  (query) => {
    if (query.status) {
      selectedStatus.value = query.status
    }

    if (query.category) {
      selectedCategory.value = query.category
    }

    if (query.keyword) {
      keyword.value = query.keyword
    }

    if (query.page) {
      currentPage.value = Number(query.page)
    }
  },
  { immediate: true }
)

watch(
  [selectedSection, selectedCategory, keyword, sortBy, currentPage],
  () => {
    loadProducts()

    router.replace({
      query: {
        section: selectedSection.value,
        category:
          selectedCategory.value && selectedCategory.value !== 'ALL'
            ? selectedCategory.value
            : undefined,
        keyword: keyword.value || undefined,
        page: currentPage.value
      }
    })
  }
)

watch(
  [selectedStatus, selectedCategory, keyword, sortBy, currentPage],
  () => {
    loadProducts()
  }
)
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
  margin-top: 16px;
}

.chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.chip {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.chip.active {
  border-color: #ffffff;
  color: #0a0a0a;
  background: #ffffff;
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

.category-wrapper {
  display: flex;
  flex-direction: column;
}

.categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.categories.primary {
  margin-bottom: 8px;
}

.categories.secondary {
  margin-top: 4px;
}

.category-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
}

.category-btn.active {
  border-color: #ffffff;
  color: #ffffff;
}

.sort {
  color: #ffffff;
}

.sort select {
  margin-left: 8px;
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
}

.sort select:focus {
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
  justify-content: space-between;
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

  .search {
    width: 100%;
  }

  .search input {
    flex: 1;
    min-width: auto;
  }

  .price-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

.pagination {
  margin-top: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #999;
  font-size: 14px;
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

.image-wrapper.placeholder {
  background: linear-gradient(135deg, #1f1f1f, #2a2a2a);
}

.image-wrapper.placeholder img {
  object-fit: contain;
  padding: 24px;
  opacity: 0.4;
}
</style>


