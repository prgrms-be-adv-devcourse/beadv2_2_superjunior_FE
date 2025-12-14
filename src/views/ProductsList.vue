<template>
  <main class="products-page">
    <!-- HERO -->
    <section class="page-hero">
      <div class="container">
        <div>
          <p class="eyebrow">공동구매 마켓</p>
          <h1>공동구매 상품</h1>
          <p class="subtitle">
            진행 상태와 카테고리별로 공동구매 상품을 확인하세요.
          </p>
        </div>
      </div>
    </section>

    <!-- FILTER -->
    <section class="filters">
      <div class="container">

        <!-- STATUS -->
        <div class="filter-row">
          <div class="chips">
            <button
              v-for="section in primarySections"
              :key="section.id"
              class="chip"
              :class="{ active: selectedStatus === section.id }"
              @click="setStatus(section.id)"
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
          </div>
        </div>

        <!-- CATEGORY (더보기) -->
        <div class="filter-row secondary">
          <div class="chips" :class="{ expanded: showAllCategories }">
            <button
              v-for="category in visibleCategories"
              :key="category.value"
              class="chip"
              :class="{ active: selectedCategory === category.value }"
              @click="selectCategory(category.value)"
            >
              {{ category.icon }} {{ category.label }}
            </button>

            <button
              v-if="hiddenCategories.length > 0"
              class="chip"
              @click="toggleMoreCategories"
            >
              {{ showAllCategories ? '접기' : '+ 더보기' }}
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- GRID -->
    <section class="product-grid-section">
      <div class="container">
        <div v-if="products.length === 0 && !loading" class="empty-state">
          <p>조건에 맞는 상품이 없습니다.</p>
        </div>

        <div v-else class="product-grid">
          <article
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="image-wrapper">
              <img :src="product.image" :alt="product.title" />

              <div class="badge-group">
                <span
                  v-for="badge in product.badges"
                  :key="badge"
                  class="badge"
                >
                  {{ badge }}
                </span>
              </div>

              <button
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
                <p class="current-price">
                  ₩{{ product.currentPrice.toLocaleString() }}
                </p>
                <p class="meta">
                  <span class="discount">{{ product.discountRate }}% OFF</span>
                  <span class="original">
                    ₩{{ product.originalPrice.toLocaleString() }}
                  </span>
                </p>
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
                <button class="btn btn-primary">장바구니 담기</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupPurchaseApi } from '@/api/axios'

const router = useRouter()

/* ======================
 * 상태
 * ====================== */
const products = ref([])
const loading = ref(false)

const keyword = ref('')
const selectedStatus = ref('OPEN')
const selectedCategory = ref('')

/* ======================
 * 위시리스트
 * ====================== */
const wishlist = ref(new Set())

const toggleWishlist = (id) => {
  const next = new Set(wishlist.value)
  next.has(id) ? next.delete(id) : next.add(id)
  wishlist.value = next
}

/* ======================
 * STATUS
 * ====================== */
const primarySections = [
  { id: 'OPEN', label: '진행중' },
  { id: 'SCHEDULED', label: '진행전' },
  { id: 'SUCCESS', label: '완료' },
  { id: 'FAILED', label: '실패' }
]

/* ======================
 * CATEGORY (더보기)
 * ====================== */
const showAllCategories = ref(false)

const allCategories = [
  { value: '', label: '전체', icon: '✨' },
  { value: 'HOME', label: '생활·주방', icon: '🏠' },
  { value: 'FOOD', label: '식품·간식', icon: '🍎' },
  { value: 'HEALTH', label: '건강·헬스', icon: '💊' },
  { value: 'BEAUTY', label: '뷰티', icon: '💄' },
  { value: 'FASHION', label: '패션·의류', icon: '👟' },
  { value: 'ELECTRONICS', label: '전자·디지털', icon: '📱' },
  { value: 'KIDS', label: '유아·어린이', icon: '🧸' },
  { value: 'HOBBY', label: '취미', icon: '🎮' },
  { value: 'PET', label: '반려동물', icon: '🐶' }
]

const visibleCategories = computed(() => {
  return showAllCategories.value
    ? allCategories
    : allCategories.slice(0, 4) // 전체 + 3개
})

const hiddenCategories = computed(() => {
  return showAllCategories.value ? [] : allCategories.slice(4)
})

const toggleMoreCategories = () => {
  showAllCategories.value = !showAllCategories.value
}

const selectCategory = (value) => {
  selectedCategory.value = value
  loadProducts()
}

/* ======================
 * UTIL
 * ====================== */
const getTimeLeft = (endDate) => {
  const diff = new Date(endDate) - new Date()
  if (diff <= 0) return '종료됨'
  const h = Math.floor(diff / 36e5)
  const d = Math.floor(h / 24)
  return d > 0 ? `${d}일 ${h % 24}시간 남음` : `${h}시간 남음`
}

/* ======================
 * TRANSFORM
 * ====================== */
const transform = (doc) => {
  const p = doc.productDocumentEmbedded || {}
  const badges = []

  if (doc.discountRate >= 30) badges.push(`${doc.discountRate}% 할인`)
  if (doc.status === 'SCHEDULED') badges.push('오픈예정')
  if (doc.status === 'SUCCESS') badges.push('완료')
  if (doc.status === 'FAILED') badges.push('실패')

  return {
    id: doc.groupPurchaseId,
    title: doc.title,
    subtitle: doc.description || '',
    category: p.category || '',
    image: p.originalUrl || '',
    originalPrice: p.price || 0,
    currentPrice: doc.discountedPrice || 0,
    discountRate: doc.discountRate || 0,
    currentCount: doc.currentQuantity || 0,
    targetCount: doc.maxQuantity || 1,
    timeLeft: getTimeLeft(doc.endDate),
    badges
  }
}

/* ======================
 * ES SEARCH
 * ====================== */
const loadProducts = async () => {
  loading.value = true
  try {
    const res = await groupPurchaseApi.searchGroupPurchases({
      keyword: keyword.value,
      status: selectedStatus.value,
      category: selectedCategory.value,
      size: 100
    })

    const content = res.data?.data?.content ?? []
    products.value = content.map(transform)
  } catch (e) {
    console.error('공동구매 검색 실패', e)
    products.value = []
  } finally {
    loading.value = false
  }
}

/* ======================
 * EVENTS
 * ====================== */
const setStatus = (status) => {
  selectedStatus.value = status
  loadProducts()
}

const search = () => loadProducts()

const goToDetail = (id) => {
  router.push({ name: 'group-purchase-detail', params: { id } })
}

/* ======================
 * INIT
 * ====================== */
onMounted(loadProducts)
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

.filter-row.secondary {
  flex-direction: column;
  align-items: flex-start;
}

/* 더보기 펼쳤을 때 줄바꿈 허용 */
.chips.expanded {
  flex-wrap: wrap;
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


