<template>
  <main class="group-purchase-list-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1>{{ route.query.sellerId ? '판매자별 공동구매 목록' : '내 공동구매 목록' }}</h1>
          <p>{{ route.query.sellerId ? '해당 판매자의 공동구매를 확인하세요' : '등록한 모든 공동구매를 확인하고 관리할 수 있습니다.' }}</p>
        </div>
        <!-- <button v-if="isSeller" class="btn btn-primary" @click="goToCreate"> -->
        <button class="btn btn-primary" @click="goToCreate">
          + 공동구매 생성
        </button>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <label for="gp-category-select">카테고리</label>
          <select
            id="gp-category-select"
            v-model="categoryFilter"
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

        <div class="filter-group">
          <label for="gp-status-select">상태</label>
          <select
            id="gp-status-select"
            v-model="statusFilter"
          >
            <option value="all">전체 상태</option>
            <option value="SCHEDULED">예정됨</option>
            <option value="OPEN">진행 중</option>
            <option value="SUCCESS">성공</option>
            <option value="FAILED">실패</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="gp-sort-select">정렬</label>
          <select
            id="gp-sort-select"
            v-model="sortFilter"
            @change="handleSortChange"
          >
            <option value="updatedAt,desc">최근 등록순</option>
            <option value="currentQuantity,desc">인기순</option>
            <option value="endDate,asc">마감 임박순</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label for="gp-search-input">공동구매명</label>
          <div class="search-control">
            <input
              id="gp-search-input"
              v-model="searchKeyword"
              type="text"
              placeholder="공동구매명을 입력하세요"
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

      <div>
        <section class="product-grid-section">
          <div v-if="loading" class="loading-state">
            <p>공동구매 목록을 불러오는 중...</p>
          </div>
          <div v-else-if="filteredGroupPurchases.length === 0" class="empty-state">
            <p>조건에 맞는 공동구매가 없습니다.</p>
            <button v-if="isSeller" class="btn btn-primary" @click="goToCreate">공동구매 생성하기</button>
          </div>
          <div v-else class="product-grid">
            <article
              v-for="gp in pagedGroupPurchases"
              :key="gp.id"
              class="product-card"
              @click="goToDetail(gp.id)"
            >
              <div class="image-wrapper">
                <img :src="gp.image" :alt="gp.title" />
                <div class="badge-group">
                  <span class="badge status-badge" :class="gp.status.toLowerCase()">
                    {{ getStatusText(gp.status) }}
                  </span>
                  <span class="badge" v-if="gp.endDate">
                    {{ getTimeRemaining(gp.endDate) }}
                  </span>
                </div>
              </div>

              <div class="card-body">
                <p class="category">{{ gp.category }}</p>
                <h2>{{ gp.title }}</h2>
                <p class="subtitle">{{ gp.seller }}</p>

                <div class="price-row">
                  <p class="current-price">₩{{ formatCurrency(gp.discountPrice) }}</p>
                  <p class="meta">
                    <span class="original">₩{{ formatCurrency(gp.originalPrice) }}</span>
                  </p>
                </div>

                <div class="progress">
                  <div class="progress-head">
                    <span>{{ gp.currentCount }}명 참여</span>
                    <span>목표 {{ gp.maxQuantity }}명</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${Math.min((gp.currentCount / gp.maxQuantity) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>

                <div class="card-footer">
                  <span class="time">
                    ⏰ {{ gp.endDate ? getTimeRemaining(gp.endDate) : '기간 미정' }}
                  </span>
                  <div class="footer-actions">
                    <template v-if="isOwner(gp)">
                      <button class="btn btn-outline btn-sm" @click.stop="handleEdit(gp.id)">수정</button>
                      <button class="btn btn-outline btn-sm btn-danger" @click.stop="handleDelete(gp.id)">삭제</button>
                    </template>
                    <template v-else>
                      <button
                        class="btn btn-outline btn-sm"
                        :disabled="gp.status !== 'OPEN'"
                        @click.stop="addToCartFromList(gp.id)"
                      >
                        장바구니
                      </button>
                      <button
                        class="btn btn-primary btn-sm"
                        :disabled="gp.status !== 'OPEN'"
                        @click.stop="goToDetail(gp.id)"
                      >
                        참여하기
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-if="filteredGroupPurchases.length > 0 && totalPages > 1" class="pagination">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { groupPurchaseApi, cartApi } from '@/api/axios'
import { authAPI } from '@/api/auth'

const router = useRouter()
const route = useRoute()

const groupPurchases = ref([])
const searchKeyword = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const sortFilter = ref('updatedAt,desc')
const loading = ref(false)
const page = ref(0)
const size = ref(9)
const serverTotalPages = ref(0)
const useServerPaging = computed(() => !route.query.sellerId)

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


const normalizeCategory = (rawCategory) => {
  if (!rawCategory) {
    return { key: '', label: '기타' }
  }

  const upper = String(rawCategory).toUpperCase()
  if (categoryMap[upper]) {
    return { key: upper, label: categoryMap[upper] }
  }

  const matched = Object.entries(categoryMap).find(([, label]) => label === rawCategory)
  if (matched) {
    return { key: matched[0], label: matched[1] }
  }

  return { key: upper, label: rawCategory || '기타' }
}

const isSeller = computed(() => {
  return localStorage.getItem('user_role') === 'seller'
})

const currentSellerId = computed(() => {
  return localStorage.getItem('user_email') || ''
})

const sortFieldMap = {
  currentQuantity: 'currentCount',
  updatedAt: 'updatedAt',
  endDate: 'endDate'
}

const getComparableValue = (item, field) => {
  if (!item) return 0
  const value = item[field]
  if (field === 'createdAt' || field === 'endDate' || field === 'startDate') {
    return value ? new Date(value).getTime() : 0
  }
  return typeof value === 'number' ? value : Number(value) || 0
}

const filteredGroupPurchases = computed(() => {
  if (useServerPaging.value) {
    return groupPurchases.value
  }

  let result = [...groupPurchases.value]

  if (categoryFilter.value !== 'all') {
    result = result.filter((gp) => gp.rawCategory === categoryFilter.value)
  }

  if (statusFilter.value !== 'all') {
    result = result.filter((gp) => gp.status === statusFilter.value)
  }

  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    result = result.filter(
      (gp) =>
        gp.title.toLowerCase().includes(keyword) ||
        gp.productName.toLowerCase().includes(keyword) ||
        gp.seller.toLowerCase().includes(keyword)
    )
  }

  const [sortFieldKey, direction = 'desc'] = (sortFilter.value || 'updatedAt,desc').split(',')
  const targetField = sortFieldMap[sortFieldKey] || sortFieldKey || 'updatedAt'
  const dir = direction === 'asc' ? 1 : -1

  result.sort((a, b) => {
    const aVal = getComparableValue(a, targetField)
    const bVal = getComparableValue(b, targetField)
    if (aVal === bVal) return 0
    return aVal > bVal ? dir : -dir
  })

  return result
})

const pagedGroupPurchases = computed(() => {
  if (useServerPaging.value) {
    return filteredGroupPurchases.value
  }
  const start = page.value * size.value
  return filteredGroupPurchases.value.slice(start, start + size.value)
})

const totalPages = computed(() => {
  if (useServerPaging.value) return serverTotalPages.value
  if (filteredGroupPurchases.value.length === 0) return 0
  return Math.ceil(filteredGroupPurchases.value.length / size.value)
})

const categoryOptions = computed(() => {
  return Object.entries(categoryMap).map(([value, label]) => ({
    value,
    label
  }))
})

const loadGroupPurchases = async () => {
  loading.value = true
  try {
    const sellerId = route.query.sellerId

    let response
    if (sellerId) {
      // 판매자별 공동구매 목록 조회
      response = await groupPurchaseApi.searchGroupPurchases(sellerId, 0, 20, sortFilter.value)
      console.log('판매자별 공동구매 목록:', response.data)
    } else {
      // 내 공동구매 목록 조회 (판매자 전용)
      response = await authAPI.searchPurchase({
        keyword: searchKeyword.value,
        category: categoryFilter.value === 'all' ? '' : categoryFilter.value,
        status: statusFilter.value === 'all' ? '' : statusFilter.value,
        page: page.value,
        size: size.value,
        sort: sortFilter.value
      })
      console.log('내 공동구매 목록:', response)
    }

    // 응답 구조에 따라 조정
    const data = sellerId ? (response.data.data || response.data) : response
    const content = data.content || data

    if (!sellerId) {
      serverTotalPages.value = data.totalPages || 0
    }

    // 백엔드 응답을 프론트엔드 형식으로 매핑
    groupPurchases.value = Array.isArray(content) ? content.map(gp => {
      const productInfo = gp.productSearchInfo || {}
      const rawCategory = productInfo.category || gp.category
      const normalizedCategory = normalizeCategory(rawCategory)
      const categoryKorean = normalizedCategory.label

      // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지
      let image = gp.imageUrl
        || gp.image
        || gp.thumbnailUrl
        || gp.originalUrl
      if (!image || image.trim() === '') {
        image = categoryImages[normalizedCategory.key] || categoryImages[categoryKorean] || categoryImages['PET']
      }

      const discountedPrice = gp.discountedPrice || gp.discountPrice || 0
      const originalPrice = productInfo.price || gp.price || gp.originalPrice || discountedPrice || 0

      return {
        id: gp.groupPurchaseId || gp.id,
        title: gp.title,
        category: categoryKorean,
        rawCategory: normalizedCategory.key,
        description: gp.description,
        productName: gp.productName || '???',
        sellerId: productInfo.sellerId || gp.sellerId,
        discountPrice: discountedPrice,
        originalPrice: originalPrice,
        minQuantity: gp.minQuantity,
        maxQuantity: gp.maxQuantity,
        currentCount: gp.currentQuantity || 0,
        status: gp.status || 'OPEN',
        startDate: gp.startDate,
        endDate: gp.endDate,
        updatedAt: gp.updatedAt,
        image: image
      }
    }) : []
  } catch (error) {
    console.error('공동구매 목록 조회 실패:', error)
    const errorMessage = error.response?.data?.message || '공동구매 목록을 불러오는데 실패했습니다.'
    console.error(errorMessage)
    groupPurchases.value = []
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

const formatCurrency = (value) => {
  const num = Number(value || 0)
  return num.toLocaleString()
}

const isOwner = (gp) => {
  // 내 공동구매 목록을 보는 경우(sellerId 쿼리가 없는 경우)는 모두 내 것
  if (!route.query.sellerId) {
    return true
  }

  const memberId = localStorage.getItem('member_id')
  const userEmail = localStorage.getItem('user_email')

  console.log('isOwner 체크:', {
    'gp.sellerId': gp.sellerId,
    'currentSellerId': currentSellerId.value,
    'member_id': memberId,
    'user_email': userEmail,
    'route.query.sellerId': route.query.sellerId
  })

  // sellerId가 member_id, user_email 중 하나와 일치하면 소유자로 판단
  return gp.sellerId === memberId || gp.sellerId === userEmail || gp.sellerId === currentSellerId.value
}

const goToDetail = (id) => {
  router.push({ name: 'group-purchase-detail', params: { id } })
}

const goToCreate = () => {
  router.push({
    name: 'group-purchase-create',
    query: { from: route.fullPath }
  })
}

const handleEdit = (id) => {
  router.push({ name: 'group-purchase-edit', params: { id } })
}

const handleDelete = async (id) => {
  if (!confirm('정말 이 공동구매를 삭제하시겠습니까?')) {
    return
  }

  try {
    await groupPurchaseApi.deleteGroupPurchase(id)
    alert('공동구매가 삭제되었습니다.')
    // 목록 새로고침
    await loadGroupPurchases()
  } catch (error) {
    console.error('공동구매 삭제 실패:', error)
    const errorMessage = error.response?.data?.message || '공동구매 삭제에 실패했습니다.'
    alert(errorMessage)
  }
}

const handleSearch = () => {
  page.value = 0
  loadGroupPurchases()
}

const resetFilters = () => {
  searchKeyword.value = ''
  categoryFilter.value = 'all'
  statusFilter.value = 'all'
  sortFilter.value = 'updatedAt,desc'
  page.value = 0
  loadGroupPurchases()
}

const handleSortChange = () => {
  page.value = 0
  loadGroupPurchases()
}

const goToPage = (nextPage) => {
  if (nextPage < 0) return
  page.value = nextPage
  loadGroupPurchases()
}

// 장바구니 담기 (목록, 수량 기본 1)
const addToCartFromList = async (groupPurchaseId) => {
  try {
    const response = await cartApi.addToCart({
      groupPurchaseId,
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
    const errorMessage = error.response?.data?.message || '장바구니 담기에 실패했습니다.'
    alert(errorMessage)
  }
}

onMounted(() => {
  loadGroupPurchases()
})

// 쿼리 파라미터가 변경될 때 데이터 재로드
watch(() => route.query.sellerId, () => {
  loadGroupPurchases()
})

watch([searchKeyword, categoryFilter, statusFilter], () => {
  page.value = 0
  if (useServerPaging.value) {
    loadGroupPurchases()
  }
})

watch(filteredGroupPurchases, () => {
  const maxPage = Math.max(0, totalPages.value - 1)
  if (page.value > maxPage) {
    page.value = maxPage
  }
})
</script>

<style scoped>
.group-purchase-list-page {
  background: var(--bg);
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
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
  min-width: 180px;
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
  border: 1px solid var(--border);
  background: #111111;
  color: var(--text);
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #a0a0a0;
}

.empty-state {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.gp-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.product-grid-section {
  padding: 20px 0 60px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: var(--surface);
  border: 1px solid var(--border);
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
  padding-top: 70%;
  width: 100%;
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

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-body h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text);
}

.card-body .subtitle {
  color: var(--muted);
  font-size: 14px;
}

.category {
  color: var(--text);
  font-weight: 600;
  font-size: 13px;
}

.price-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.current-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.meta {
  font-size: 13px;
  color: var(--muted);
}

.original {
  text-decoration: line-through;
  color: var(--muted);
}

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text);
}

.progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 8px;
  background: var(--bg);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.time {
  font-size: 13px;
  color: var(--muted);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.gp-card {
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.gp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.open {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.scheduled {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  border: 1px solid rgba(250, 204, 21, 0.3);
}

.status-badge.success {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.status-badge.failed {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.time-remaining {
  font-size: 13px;
  color: #bbbbbb;
}

.gp-card-body {
  display: flex;
  gap: 16px;
  min-width: 0;
}

.gp-image {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg);
}

.gp-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gp-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.gp-category {
  font-size: 13px;
  color: #a0a0a0;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gp-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  word-break: break-word;
}

.gp-seller {
  margin: 0;
  color: #c7c7c7;
  font-size: 14px;
}

.gp-price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.gp-price-row .price {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.gp-price-row .original-price {
  font-size: 14px;
  color: #777;
  text-decoration: line-through;
}

.gp-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #bdbdbd;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ffffff, #cccccc);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.gp-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #a0a0a0;
  flex-wrap: wrap;
}

.gp-card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-outline {
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.btn-danger {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-danger:hover {
  background: #ff6b6b;
  color: #0a0a0a;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #ffffff;
  color: #0a0a0a;
  border-color: var(--text);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  min-width: 80px;
  text-align: center;
  font-weight: 600;
  color: var(--text);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-bar {
    flex-direction: column;
  }

  .gp-card-body {
    flex-direction: column;
  }

  .gp-image {
    width: 100%;
    height: 200px;
  }

  .gp-meta {
    flex-direction: column;
    gap: 6px;
  }
}

/* 라이트 모드 스타일 */
body.theme-light .group-purchase-list-page {
  background: #ffffff !important;
}

body.theme-light .page-header h1 {
  color: #0f172a !important;
}

body.theme-light .page-header p {
  color: #666666 !important;
}

body.theme-light .filter-group label {
  color: #0f172a !important;
}

body.theme-light .filter-group select,
body.theme-light .search-control input {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .filter-group select:focus,
body.theme-light .search-control input:focus {
  border-color: #0f172a !important;
  background: #ffffff !important;
}

body.theme-light .search-control input::placeholder {
  color: #999999 !important;
}

body.theme-light .btn-text {
  color: #0f172a !important;
}

body.theme-light .btn-outline {
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .btn-outline:hover:not(:disabled) {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

body.theme-light .btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
}

body.theme-light .btn-primary:hover:not(:disabled) {
  background: #1e293b !important;
}

body.theme-light .loading-state,
body.theme-light .empty-state {
  color: #666666 !important;
}

body.theme-light .empty-state {
  border-color: #e2e8f0 !important;
}

body.theme-light .product-card {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .product-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1) !important;
}

body.theme-light .card-body h2 {
  color: #0f172a !important;
}

body.theme-light .card-body .subtitle {
  color: #666666 !important;
}

body.theme-light .category {
  color: #0f172a !important;
}

body.theme-light .current-price {
  color: #0f172a !important;
}

body.theme-light .meta,
body.theme-light .original {
  color: #999999 !important;
}

body.theme-light .progress-head {
  color: #0f172a !important;
}

body.theme-light .progress-bar {
  background: #f1f5f9 !important;
}

body.theme-light .progress-fill {
  background: #0f172a !important;
}

body.theme-light .time {
  color: #666666 !important;
}

body.theme-light .page-btn {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
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
