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

      <div class="filters">
        <div class="filter-row">
          <div class="search">
            <input
              v-model.trim="keyword"
              type="search"
              placeholder="제목으로 검색"
              @keyup.enter="search"
            />
            <button class="btn btn-outline" @click="search">검색</button>
          </div>
          <div class="filter-actions">
            <select v-model="sortFilter" class="sort-filter" @change="loadGroupPurchases">
              <option value="">최신순</option>
              <option value="currentQuantity,desc">인기순</option>
              <option value="endDate,asc">마감 직전 순</option>
              <option value="createdAt,desc">등록순</option>
            </select>
            <select v-model="statusFilter" class="status-filter">
              <option value="">전체 상태</option>
              <option value="SCHEDULED">예정됨</option>
              <option value="OPEN">진행 중</option>
              <option value="SUCCESS">성공</option>
              <option value="FAILED">실패</option>
            </select>
            <select v-model="categoryFilter" class="category-filter">
              <option value="">전체 카테고리</option>
              <option value="전자제품">전자제품</option>
              <option value="패션">패션</option>
              <option value="식품">식품</option>
              <option value="뷰티">뷰티</option>
              <option value="홈/리빙">홈/리빙</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="empty-state">
        <p>로딩 중...</p>
      </div>

      <div v-else-if="filteredGroupPurchases.length === 0" class="empty-state">
        <p>조건에 맞는 공동구매가 없습니다.</p>
        <button v-if="isSeller" class="btn btn-primary" @click="goToCreate">공동구매 생성하기</button>
      </div>

      <div v-else class="group-purchase-list-container">
        <div class="gp-list-header">
          <div class="gp-col gp-col-status">상태</div>
          <div class="gp-col gp-col-title">공동구매명</div>
          <div class="gp-col gp-col-price">가격</div>
          <div class="gp-col gp-col-progress">진행률</div>
          <div class="gp-col gp-col-time">남은 시간</div>
          <div class="gp-col gp-col-action">관리</div>
        </div>
        <article
          v-for="gp in filteredGroupPurchases"
          :key="gp.id"
          class="group-purchase-item"
          :class="{ 'expanded': expandedId === gp.id }"
        >
          <div class="gp-list-row" @click="handleCardClick(gp.id, gp)">
            <div class="gp-col gp-col-status">
              <span class="status-badge" :class="gp.status.toLowerCase()">
                {{ getStatusText(gp.status) }}
              </span>
            </div>
            <div class="gp-col gp-col-title">
              <div class="title-wrapper">
                <h3 class="title">{{ gp.title }}</h3>
                <span class="category">{{ gp.category }}</span>
              </div>
            </div>
            <div class="gp-col gp-col-price">
              <div class="price-wrapper">
                <span class="discount-price">₩{{ gp.discountPrice.toLocaleString() }}</span>
                <span class="original-price">₩{{ gp.originalPrice.toLocaleString() }}</span>
              </div>
            </div>
            <div class="gp-col gp-col-progress">
              <div class="progress-wrapper">
                <div class="progress-info">
                  <span class="progress-text">{{ gp.currentCount }} / {{ gp.maxQuantity }}명</span>
                  <span class="progress-percent">{{ Math.round((gp.currentCount / gp.maxQuantity) * 100) }}%</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${Math.min((gp.currentCount / gp.maxQuantity) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="gp-col gp-col-time">
              <span class="time-text">
                <span v-if="gp.endDate">{{ getTimeRemaining(gp.endDate) }}</span>
                <span v-else>기간 미정</span>
              </span>
            </div>
            <div class="gp-col gp-col-action">
              <!-- 내 공동구매 목록이거나 소유자인 경우 버튼 표시 -->
              <div v-if="!route.query.sellerId || isOwner(gp)" class="action-buttons">
                <!-- SCHEDULED (예정됨): 수정 + 삭제 -->
                <template v-if="gp.status === 'SCHEDULED'">
                  <button
                    class="btn btn-sm btn-outline"
                    @click.stop="handleEdit(gp.id)"
                  >
                    수정
                  </button>
                  <button
                    class="btn btn-sm btn-danger-outline"
                    @click.stop="handleDelete(gp.id)"
                  >
                    삭제
                  </button>
                </template>
                <!-- OPEN (진행중): 수정만 -->
                <button
                  v-else-if="gp.status === 'OPEN'"
                  class="btn btn-sm btn-outline"
                  @click.stop="handleEdit(gp.id)"
                >
                  수정
                </button>
                <!-- 기타 상태: 드롭다운 -->
                <button
                  v-else
                  class="expand-btn"
                  @click.stop="handleCardClick(gp.id, gp)"
                >
                  <span>{{ expandedId === gp.id ? '▼' : '▶' }}</span>
                </button>
              </div>
              <span v-else class="no-action">-</span>
            </div>
          </div>
          
          <!-- 주문 내역 드롭다운 (판매자만) -->
          <!-- <div v-if="isSeller && isOwner(gp) && expandedId === gp.id" class="order-dropdown"> -->
          <div v-if="expandedId === gp.id" class="order-dropdown">
            <div class="order-header-section">
              <h4>주문 내역</h4>
              <span class="order-count">총 {{ getOrdersForGroupPurchase(gp.id).length }}건</span>
            </div>
            <div v-if="getOrdersForGroupPurchase(gp.id).length === 0" class="no-orders">
              <p>아직 주문 내역이 없습니다.</p>
            </div>
            <div v-else class="order-list">
              <div class="order-list-header">
                <div class="order-col order-col-number">주문번호</div>
                <div class="order-col order-col-date">주문일자</div>
                <div class="order-col order-col-customer">구매자</div>
                <div class="order-col order-col-product">상품명</div>
                <div class="order-col order-col-quantity">수량</div>
                <div class="order-col order-col-amount">결제금액</div>
                <div class="order-col order-col-status">상태</div>
              </div>
              <div
                v-for="order in getOrdersForGroupPurchase(gp.id)"
                :key="order.id"
                class="order-item-row"
              >
                <div class="order-col order-col-number">
                  <span class="order-number-text">{{ order.orderNumber || `ORD-${order.id}` }}</span>
                </div>
                <div class="order-col order-col-date">
                  <span class="order-date-text">{{ formatDate(order.date || order.createdAt) }}</span>
                </div>
                <div class="order-col order-col-customer">
                  <div class="customer-info">
                    <span class="customer-name">{{ order.customerName || order.name || '익명' }}</span>
                    <span v-if="order.email" class="customer-email">{{ order.email }}</span>
                  </div>
                </div>
                <div class="order-col order-col-product">
                  <span class="product-name-text">{{ (order.products && order.products[0]) ? (order.products[0].title || order.products[0].productName) : (gp.productName) }}</span>
                </div>
                <div class="order-col order-col-quantity">
                  <span class="quantity-text">{{ (order.products && order.products[0]) ? (order.products[0].quantity || 1) : (order.quantity || 1) }}개</span>
                </div>
                <div class="order-col order-col-amount">
                  <span class="amount-text">₩{{ (order.totalAmount || (order.price || gp.discountPrice) * (order.quantity || 1)).toLocaleString() }}</span>
                </div>
                <div class="order-col order-col-status">
                  <span class="order-status" :class="order.status || 'pending'">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { groupPurchaseApi } from '@/api/axios'

const router = useRouter()
const route = useRoute()

const groupPurchases = ref([])
const keyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const sortFilter = ref('')
const expandedId = ref(null)
const loading = ref(false)

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

const isSeller = computed(() => {
  return localStorage.getItem('user_role') === 'seller'
})

const currentSellerId = computed(() => {
  return localStorage.getItem('user_email') || ''
})

const filteredGroupPurchases = computed(() => {
  let result = [...groupPurchases.value]

  if (keyword.value) {
    const keywordLower = keyword.value.toLowerCase()
    result = result.filter(
      (gp) =>
        gp.title.toLowerCase().includes(keywordLower) ||
        gp.productName.toLowerCase().includes(keywordLower) ||
        gp.seller.toLowerCase().includes(keywordLower)
    )
  }

  if (statusFilter.value) {
    result = result.filter((gp) => gp.status === statusFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter((gp) => gp.category === categoryFilter.value)
  }

  return result
})

const loadGroupPurchases = async () => {
  loading.value = true
  try {
    const sellerId = route.query.sellerId

    let response
    if (sellerId) {
      // 판매자별 공동구매 목록 조회
      response = await groupPurchaseApi.getGroupPurchasesBySeller(sellerId, 0, 100, sortFilter.value)
      console.log('판매자별 공동구매 목록:', response.data)
    } else {
      // 내 공동구매 목록 조회 (판매자 전용)
      response = await groupPurchaseApi.getMyGroupPurchases(sortFilter.value)
      console.log('내 공동구매 목록:', response.data)
    }

    // 응답 구조에 따라 조정
    const data = response.data.data || response.data
    const content = data.content || data

    // 백엔드 응답을 프론트엔드 형식으로 매핑
    groupPurchases.value = Array.isArray(content) ? content.map(gp => {
      // 카테고리 변환 (백엔드 enum -> 한글)
      const categoryKorean = categoryMap[gp.category] || gp.category || '기타'

      // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지
      let image = gp.imageUrl || gp.image || gp.thumbnailUrl || gp.originalUrl
      if (!image || image.trim() === '') {
        // category가 있으면 해당 카테고리 이미지, 없으면 기본 이미지
        image = categoryImages[gp.category] || categoryImages[categoryKorean] || categoryImages['PET']
      }

      return {
        id: gp.groupPurchaseId || gp.id,
        title: gp.title,
        category: categoryKorean,
        description: gp.description,
        productName: gp.productName || '상품명',
        seller: gp.sellerName || '판매자',
        sellerId: gp.sellerId,
        discountPrice: gp.discountedPrice || gp.discountPrice || 0,
        originalPrice: gp.price || gp.originalPrice || 0,
        minQuantity: gp.minQuantity,
        maxQuantity: gp.maxQuantity,
        currentCount: gp.currentQuantity || 0,
        status: gp.status || 'OPEN',
        startDate: gp.startDate,
        endDate: gp.endDate,
        createdAt: gp.createdAt,
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

const search = () => {
  // 검색은 computed에서 처리
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

const isOwner = (gp) => {
  const memberId = localStorage.getItem('member_id')
  const userEmail = localStorage.getItem('user_email')

  console.log('isOwner 체크:', {
    'gp.sellerId': gp.sellerId,
    'currentSellerId': currentSellerId.value,
    'member_id': memberId,
    'user_email': userEmail
  })

  // sellerId가 member_id, user_email 중 하나와 일치하면 소유자로 판단
  return gp.sellerId === memberId || gp.sellerId === userEmail || gp.sellerId === currentSellerId.value
}

const handleCardClick = (id, gp) => {
  if (isSeller.value && isOwner(gp)) {
    // 판매자이고 소유자인 경우 드롭다운 토글
    expandedId.value = expandedId.value === id ? null : id
  } else {
    // 일반 사용자이거나 소유자가 아닌 경우 상세 페이지로 이동
    expandedId.value = expandedId.value === id ? null : id
  }
}

// const goToDetail = (id) => {
//   router.push({ name: 'group-purchase-detail', params: { id } })
// }

const goToCreate = () => {
  router.push({ name: 'group-purchase-create' })
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

const getOrdersForGroupPurchase = (groupId) => {
  // localStorage에서 주문 내역 가져오기
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
  
  // 공동구매의 participants를 기반으로 주문 내역 생성
  const gp = groupPurchases.value.find(g => g.id === groupId)
  if (!gp) return []
  
  let orders = []
  
  // participants가 있으면 주문 내역으로 변환
  if (gp.participants && gp.participants.length > 0) {
    orders = gp.participants.map((participant, index) => ({
      id: `order-${groupId}-${index}`,
      orderNumber: `ORD-${groupId}-${index + 1}`,
      date: participant.date || participant.createdAt || new Date().toISOString(),
      customerName: participant.name || participant.customerName || '익명',
      email: participant.email || '',
      quantity: participant.quantity || 1,
      price: gp.discountPrice,
      totalAmount: (participant.quantity || 1) * gp.discountPrice,
      status: participant.status || 'completed',
      products: [{
        id: groupId,
        title: gp.productName,
        quantity: participant.quantity || 1,
        price: gp.discountPrice
      }]
    }))
  }
  
  // participants가 없으면 localStorage의 주문 내역에서 필터링
  if (orders.length === 0) {
    orders = allOrders.filter(order => {
      // 주문 내역에 groupPurchaseId가 있으면 매칭
      if (order.groupPurchaseId === groupId) return true
      // 주문 내역의 제품명이 공동구매 제품명과 일치하면 매칭
      if (order.products && order.products.some(p => p.title === gp.productName)) return true
      return false
    })
  }
  
  // 실제 주문 내역이 없으면 예시 데이터 생성
  if (orders.length === 0) {
    const now = new Date()
    const exampleCustomers = [
      { name: '김철수', email: 'kim@example.com' },
      { name: '이영희', email: 'lee@example.com' },
      { name: '박민수', email: 'park@example.com' },
      { name: '최지은', email: 'choi@example.com' },
      { name: '정대현', email: 'jung@example.com' }
    ]
    
    const statuses = ['completed', 'shipping', 'pending', 'delivered']
    
    // 공동구매 참여자 수만큼 예시 주문 생성 (최대 5개)
    const orderCount = Math.min(gp.currentCount || 3, 5)
    
    orders = Array.from({ length: orderCount }, (_, index) => {
      const customer = exampleCustomers[index % exampleCustomers.length]
      const quantity = Math.floor(Math.random() * 3) + 1 // 1~3개
      const orderDate = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)) // 최근 며칠 전
      const status = statuses[index % statuses.length]
      
      return {
        id: `example-order-${groupId}-${index}`,
        orderNumber: `ORD-${groupId}-${String(index + 1).padStart(4, '0')}`,
        date: orderDate.toISOString(),
        createdAt: orderDate.toISOString(),
        customerName: customer.name,
        email: customer.email,
        quantity: quantity,
        price: gp.discountPrice,
        totalAmount: quantity * gp.discountPrice,
        status: status,
        products: [{
          id: groupId,
          title: gp.productName,
          productName: gp.productName,
          quantity: quantity,
          price: gp.discountPrice
        }]
      }
    })
  }
  
  return orders
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '주문 대기',
    completed: '결제 완료',
    shipping: '배송 중',
    delivered: '배송 완료',
    cancelled: '취소됨'
  }
  return statusMap[status] || status || '주문 대기'
}

onMounted(() => {
  loadGroupPurchases()
})

// 쿼리 파라미터가 변경될 때 데이터 재로드
watch(() => route.query.sellerId, () => {
  loadGroupPurchases()
})
</script>

<style scoped>
.group-purchase-list-page {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.page-header p {
  color: #999;
  font-size: 15px;
}

.filters {
  margin-bottom: 32px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}

.search input {
  flex: 1;
  padding: 12px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
}

.search input:focus {
  outline: none;
  border-color: #ffffff;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.sort-filter,
.status-filter,
.category-filter {
  padding: 12px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
}

.sort-filter:focus,
.status-filter:focus,
.category-filter:focus {
  outline: none;
  border-color: #ffffff;
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

.group-purchase-list-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
}

.gp-list-header {
  display: grid;
  grid-template-columns: 0.8fr 2.5fr 1.2fr 1.5fr 1.2fr 1fr;
  gap: 16px;
  padding: 14px 20px;
  background: #0f0f0f;
  border-bottom: 2px solid #2a2a2a;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.group-purchase-item {
  border-bottom: 1px solid #2a2a2a;
  transition: background 0.2s;
}

.group-purchase-item:last-child {
  border-bottom: none;
}

.group-purchase-item:hover {
  background: #222222;
}

.group-purchase-item.expanded {
  background: #1f1f1f;
}

.gp-list-row {
  display: grid;
  grid-template-columns: 0.8fr 2.5fr 1.2fr 1.5fr 1.2fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  align-items: center;
}

.gp-col {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #e0e0e0;
}

.gp-col-status {
  justify-content: flex-start;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.scheduled {
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

.gp-col-title {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.category {
  font-size: 11px;
  color: #999;
  font-weight: 600;
}

.gp-col-product {
  color: #ffffff;
}

.product-name {
  font-size: 13px;
  margin: 0;
}

.gp-col-seller {
  color: #999;
}

.seller-name {
  font-size: 13px;
}

.gp-col-price {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.price-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.discount-price {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.original-price {
  font-size: 11px;
  color: #666;
  text-decoration: line-through;
}

.gp-col-progress {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.progress-wrapper {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 11px;
}

.progress-text {
  color: #999;
}

.progress-percent {
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

.gp-col-time {
  color: #999;
  font-size: 12px;
}

.time-text {
  font-size: 12px;
}

.gp-col-action {
  justify-content: center;
}

.expand-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 6px 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.no-action {
  color: #666;
  font-size: 12px;
}

@media (max-width: 1024px) {
  .gp-list-header,
  .gp-list-row {
    grid-template-columns: 0.8fr 2fr 1.2fr 1.2fr 1fr;
  }

  .gp-col-time {
    display: none;
  }
}

@media (max-width: 768px) {
  .gp-list-header,
  .gp-list-row {
    grid-template-columns: 1fr 2fr 1fr 1fr;
  }

  .gp-col-progress {
    display: none;
  }
}

.order-dropdown {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #2a2a2a;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.order-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-header-section h4 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.order-count {
  font-size: 14px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid #ff4757;
  color: #ff4757;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-outline:hover {
  background: #ff4757;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
}

.no-orders {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-orders p {
  margin: 0;
  font-size: 14px;
}

.order-list {
  display: flex;
  flex-direction: column;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

.order-list-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.2fr 1.5fr 0.8fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  background: #0f0f0f;
  border-bottom: 2px solid #2a2a2a;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.order-item-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.2fr 1.5fr 0.8fr 1fr 1fr;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #2a2a2a;
  background: #1a1a1a;
  transition: background 0.2s;
  align-items: center;
}

.order-item-row:hover {
  background: #222222;
}

.order-item-row:last-child {
  border-bottom: none;
}

.order-col {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #e0e0e0;
  word-break: break-word;
}

.order-col-number {
  font-weight: 600;
  color: #ffffff;
}

.order-number-text {
  font-family: monospace;
  font-size: 12px;
}

.order-col-date {
  color: #999;
}

.order-date-text {
  font-size: 12px;
}

.order-col-customer {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  color: #ffffff;
  font-weight: 500;
}

.customer-email {
  font-size: 11px;
  color: #999;
}

.order-col-product {
  color: #ffffff;
}

.product-name-text {
  font-size: 13px;
}

.order-col-quantity {
  color: #e0e0e0;
}

.quantity-text {
  font-size: 13px;
}

.order-col-amount {
  font-weight: 700;
  color: #ffffff;
}

.amount-text {
  font-size: 14px;
}

.order-col-status {
  justify-content: flex-start;
}

.order-status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.order-status.pending {
  background: #f59f00;
  color: #fff3bf;
}

.order-status.completed {
  background: #51cf66;
  color: #d3f9d8;
}

.order-status.shipping {
  background: #339af0;
  color: #d0ebff;
}

.order-status.delivered {
  background: #51cf66;
  color: #d3f9d8;
}

.order-status.cancelled {
  background: #fa5252;
  color: #ffe3e3;
}

@media (max-width: 1200px) {
  .order-list-header,
  .order-item-row {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
  }
  
  .order-col-number {
    grid-column: 1;
  }
  
  .order-col-date {
    grid-column: 2;
  }
  
  .order-col-customer {
    grid-column: 3;
  }
  
  .order-col-status {
    grid-column: 4;
  }
  
  .order-col-product,
  .order-col-quantity,
  .order-col-amount {
    display: none;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.scheduled {
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

.category {
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.product-name {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0 0 12px 0;
}

.seller-info {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.discount-price {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.original-price {
  font-size: 14px;
  color: #666;
  text-decoration: line-through;
}

.quantity-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: #0f0f0f;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: inherit;
  transition: width 0.3s;
}

.time-info {
  font-size: 13px;
  color: #999;
  text-align: right;
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
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #4a4a4a;
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

@media (max-width: 768px) {
  .group-purchase-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
  }

  .search {
    width: 100%;
  }
}
</style>

