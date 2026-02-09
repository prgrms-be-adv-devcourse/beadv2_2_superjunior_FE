<template>
  <main class="seller-products-page">
    <div class="container">
      <div class="page-header">
        <h1>내 상품 목록</h1>
        <p>등록한 모든 상품을 확인하고 관리할 수 있습니다.</p>
      </div>

      <div
        v-if="!loading"
        class="filters-bar"
      >
        <div class="filter-group">
          <label for="seller-category-select">카테고리</label>
          <select
            id="seller-category-select"
            v-model="selectedCategory"
          >
            <option value="all">전체 카테고리</option>
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="filter-group search-group">
          <label for="seller-search-input">상품명</label>
          <div class="search-control">
            <input
              id="seller-search-input"
              v-model="searchKeyword"
              type="text"
              placeholder="상품명을 입력하세요"
              @keyup.enter="handleSearch"
            />
            <button class="btn btn-outline" @click="handleSearch">
              검색
            </button>
          </div>
        </div>
        <button class="btn-text" @click="resetFilters">
          필터 초기화
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <p>상품 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="sellerProducts.length === 0" class="empty-state">
        <p>등록된 상품이 없습니다.</p>
        <router-link
          :to="{ path: '/seller/register/product-register', query: { from: route.fullPath } }"
          class="btn btn-primary"
        >
          상품 등록하기
        </router-link>
      </div>

      <div v-else>
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <p>조건에 맞는 상품이 없습니다.</p>
          <button class="btn btn-primary" @click="resetFilters">
            필터 초기화
          </button>
        </div>

        <div v-else class="products-grid">
          <div v-for="product in pagedProducts" :key="product.id" class="product-card">
            <div class="product-image-wrapper">
              <img :src="product.imageUrl || product.image || product.images?.[0]" :alt="product.title" />
              <div class="product-badges">
                <span v-if="product.currentCount >= product.targetCount" class="badge badge-success">목표 달성</span>
                <span v-if="product.currentCount < product.targetCount * 0.3" class="badge badge-new">신규</span>
              </div>
            </div>
            <div class="product-info">
              <p class="product-category">{{ product.category }}</p>
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-subtitle">{{ product.subtitle }}</p>
              <div class="product-price-info">
                <span class="current-price">₩{{ product.currentPrice?.toLocaleString() || product.price?.toLocaleString() }}</span>
                <span v-if="product.originalPrice" class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
              </div>
              <div class="product-progress">
                <div class="progress-info">
                  <span class="progress-text">
                    재고: {{ product.stock }}개
                  </span>
                  <span class="progress-percent">
                    {{ Math.round(((product.currentCount || 0) / product.targetCount) * 100) }}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${Math.min(((product.currentCount || 0) / product.targetCount) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
              <div class="product-meta">
                <span class="rating">⭐ {{ product.rating || 0 }}</span>
                <span class="reviews">리뷰 {{ product.reviewCount || 0 }}</span>
              </div>
              <div class="product-actions">
                <button class="btn btn-outline" @click="viewProduct(product.id)">상세보기</button>
                <button class="btn btn-outline" @click="editProduct(product.id)">수정</button>
                <button class="btn btn-outline btn-danger" @click="deleteProduct(product.id)">삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProducts.length > 0 && totalPages > 1" class="pagination">
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
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productApi } from '@/api/axios'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const page = ref(0)
const size = ref(9)
const searchKeyword = ref('')
const selectedCategory = ref('all')

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
    subtitle: '',
    currentPrice: product.price,
    price: product.price,
    originalPrice: null,
    category: categoryMap[product.category] || product.category,
    rawCategory: product.category,
    image: image,
    stock: 0,
    description: '',
    originalUrl: '',
    // 공동구매 정보는 추후 별도 API로 연동 (임시 값)
    currentCount: 0,
    targetCount: 10,
    rating: 0,
    reviewCount: 0
  }
}
const sellerProducts = ref([])
const filteredProducts = computed(() => {
  let list = sellerProducts.value

  if (selectedCategory.value !== 'all') {
    list = list.filter(product => product.rawCategory === selectedCategory.value)
  }

  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter(product =>
      product.title?.toLowerCase().includes(keyword)
    )
  }

  return list
})

const pagedProducts = computed(() => {
  const start = page.value * size.value
  return filteredProducts.value.slice(start, start + size.value)
})

const totalPages = computed(() => {
  if (filteredProducts.value.length === 0) return 0
  return Math.ceil(filteredProducts.value.length / size.value)
})

const categoryOptions = computed(() => {
  return Object.entries(categoryMap).map(([value, label]) => ({
    value,
    label
  }))
})

const loadProducts = async () => {
  loading.value = true
  try {
    const response = await productApi.getProducts()
    const data = response.data?.data || response.data
    const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
    sellerProducts.value = list.map(transformProduct)
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    sellerProducts.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (nextPage) => {
  if (nextPage < 0 || nextPage >= totalPages.value) return
  page.value = nextPage
}

const viewProduct = (id) => {
  router.push({ name: 'product-detail', params: { id } })
}

const editProduct = (id) => {
  router.push({ name: 'product-update', params: { productId: id } })
}

const deleteProduct = async (id) => {
  if (!confirm('정말 이 상품을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    // UUID 형식인지 확인 (백엔드에서 UUID를 사용하므로)
    // id가 숫자면 UUID로 변환 필요할 수 있음
    const productId = typeof id === 'string' && id.includes('-') ? id : id.toString()
    const targetProduct = filteredProducts.value.find(product => product.id === productId)
    
    await productApi.deleteProduct(productId)

    if (targetProduct?.imageUrl) {
      await productApi.deleteProductImage(targetProduct.imageUrl)
    }
    
    alert('상품이 삭제되었습니다.')
    loadProducts()
  } catch (error) {
    const errorMessage = error.response?.data?.message || '상품 삭제에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
    console.error('Product deletion error:', error)
  }
}

const handleSearch = () => {
  page.value = 0
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = 'all'
  page.value = 0
}

watch([searchKeyword, selectedCategory], () => {
  page.value = 0
})

watch(filteredProducts, () => {
  const maxPage = Math.max(0, totalPages.value - 1)
  if (page.value > maxPage) {
    page.value = 0
  }
})

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.seller-products-page {
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

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  color: #a0a0a0;
  font-size: 14px;
}

.filter-group select,
.search-control input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #2a2a2a;
  background: #111111;
  color: #ffffff;
}

.search-control {
  display: flex;
  gap: 10px;
}

.search-control .btn {
  flex: 0 0 auto;
  min-width: 110px;
}

.btn-text {
  background: transparent;
  border: none;
  color: #9dbbff;
  font-weight: 600;
  cursor: pointer;
  align-self: center;
}

.btn-text:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0a0a0;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 18px;
}

.empty-state .btn-primary {
  background: #ffffff;
  color: #0a0a0a;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
}

.empty-state .btn-primary:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #a0a0a0;
  font-size: 16px;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #4a4a4a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  background: #0f0f0f;
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #2b8a3e;
  color: white;
}

.badge-new {
  background: #4c6ef5;
  color: white;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-category {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  margin: 0;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
  line-height: 1.4;
}

.product-price-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.original-price {
  font-size: 14px;
  color: #666;
  text-decoration: line-through;
}

.product-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 13px;
  color: #e0e0e0;
}

.progress-percent {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: #0f0f0f;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: inherit;
  transition: width 0.3s;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #a0a0a0;
}

.rating {
  color: #ffffff;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #4a4a4a;
  background: transparent;
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #666;
}

.btn-danger {
  border-color: #ff4757;
  color: #ff4757;
}

.btn-danger:hover {
  background: #ff4757;
  color: white;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #ffffff;
  color: #0a0a0a;
  border-color: #ffffff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  min-width: 80px;
  text-align: center;
  font-weight: 600;
  color: #ffffff;
}

/* 라이트 모드 스타일 */
body.theme-light .seller-products-page {
  background: #ffffff !important;
}

body.theme-light .page-header h1 {
  color: #0f172a !important;
}

body.theme-light .page-header p {
  color: #666666 !important;
}

body.theme-light .filters-bar {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .filter-group label {
  color: #0f172a !important;
}

body.theme-light .filter-group select,
body.theme-light .filter-group input {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .filter-group select:focus,
body.theme-light .filter-group input:focus {
  border-color: #0f172a !important;
}

body.theme-light .btn-outline {
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .btn-outline:hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

body.theme-light .btn-text {
  color: #0f172a !important;
}

body.theme-light .empty-state {
  color: #666666 !important;
}

body.theme-light .loading-state {
  color: #666666 !important;
}

body.theme-light .product-card {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .product-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

body.theme-light .product-image-wrapper {
  background: #f1f5f9 !important;
}

body.theme-light .product-category {
  color: #666666 !important;
}

body.theme-light .product-title {
  color: #0f172a !important;
}

body.theme-light .product-subtitle {
  color: #666666 !important;
}

body.theme-light .current-price {
  color: #0f172a !important;
}

body.theme-light .original-price {
  color: #999999 !important;
}

body.theme-light .progress-text {
  color: #666666 !important;
}

body.theme-light .progress-percent {
  color: #0f172a !important;
}

body.theme-light .product-actions {
  border-top-color: #e2e8f0 !important;
}

body.theme-light .action-btn {
  color: #0f172a !important;
}

body.theme-light .action-btn:hover {
  background: #f1f5f9 !important;
}

body.theme-light .action-btn.danger:hover {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

body.theme-light .pagination {
  border-top-color: #e2e8f0 !important;
}

body.theme-light .page-btn {
  border-color: #e2e8f0 !important;
  background: #ffffff !important;
  color: #0f172a !important;
}

body.theme-light .page-btn:hover:not(:disabled) {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

body.theme-light .page-info {
  color: #0f172a !important;
}
</style>


