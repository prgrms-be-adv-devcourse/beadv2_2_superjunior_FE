<template>
  <main class="cart-page">
    <div class="container">
      <header class="cart-header">
        <div>
          <p class="eyebrow">장바구니</p>
          <h1>담아둔 공동구매 상품</h1>
          <p class="subtitle">
            공동구매는 참여 인원이 채워져야 확정됩니다. 결제 전까지 수량과 옵션을 자유롭게 수정하세요.
          </p>
        </div>
        <div class="summary-box">
          <p>총 {{ totalQuantity }}개</p>
          <strong>₩{{ totalPrice.toLocaleString() }}</strong>
        </div>
      </header>

      <section class="cart-content">
        <article class="cart-items">
          <div v-if="loading" class="empty-state">
            <p>장바구니를 불러오는 중...</p>
          </div>
          <div v-else-if="items.length === 0" class="empty-state">
            <p>장바구니가 비어 있어요.</p>
            <router-link class="btn btn-primary" to="/products">상품 둘러보기</router-link>
          </div>
          <div class="select-all-bar" v-if="items.length > 0">
            <div class="select-all-actions">
              <label class="select-all-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedItems.size === items.length && items.length > 0"
                  @change="toggleSelectAll"
                />
                <span>전체 선택</span>
              </label>
              <button class="clear-btn" @click="clearCart" :disabled="updatingItems.size > 0">
                전체 비우기
              </button>
            </div>
            <span class="selected-count">{{ selectedItems.size }}개 선택됨</span>
          </div>
          <div
            v-for="item in items"
            :key="item.cartId"
            class="cart-item"
            :class="{ selected: selectedItems.has(item.cartId) }"
          >
            <div class="item-checkbox-wrapper">
              <input
                type="checkbox"
                :checked="selectedItems.has(item.cartId)"
                @change="toggleItem(item.cartId)"
                class="item-checkbox"
              />
            </div>
            <div class="item-body">
              <div class="item-head">
                <h2 v-if="item.groupPurchase">{{ item.groupPurchase.title || '공동구매 상품' }}</h2>
                <h2 v-else>공동구매 ID: {{ item.groupPurchaseId }}</h2>
                <p class="option">수량: {{ item.quantity }}개</p>
              </div>
              <div class="item-meta">
                <p v-if="item.groupPurchase" class="price">
                  ₩{{ ((item.groupPurchase.discountedPrice || 0) * item.quantity).toLocaleString() }}
                </p>
                <p v-else class="price">가격 정보 없음</p>
                <p class="quantity-label">수량</p>
                <div class="quantity-control">
                  <button 
                    @click="changeQuantity(item.cartId, -1)"
                    :disabled="updatingItems.has(item.cartId) || item.quantity <= 1"
                  >-</button>
                  <span>{{ item.quantity }}</span>
                  <button 
                    @click="changeQuantity(item.cartId, 1)"
                    :disabled="updatingItems.has(item.cartId)"
                  >+</button>
                </div>
              </div>
              <div class="item-footer">
                <button 
                  class="link-btn" 
                  @click="removeItem(item.cartId)"
                  :disabled="updatingItems.has(item.cartId)"
                >삭제</button>
              </div>
            </div>
          </div>
        </article>

        <aside class="checkout">
          <div class="checkout-card">
            <h3>결제 요약</h3>
            <div class="row">
              <span>상품 금액</span>
              <strong>₩{{ totalPrice.toLocaleString() }}</strong>
            </div>
            <div class="row">
              <span>할인 금액</span>
              <strong class="discount">-₩{{ totalDiscount.toLocaleString() }}</strong>
            </div>
            <div class="row">
              <span>배송비</span>
              <strong>무료</strong>
            </div>
            <hr />
            <div class="row total">
              <span>총 결제 예정 금액</span>
              <strong>₩{{ selectedTotalPrice.toLocaleString() }}</strong>
            </div>
            <button
              class="btn btn-primary"
              :disabled="selectedItems.size === 0"
              @click="goToOrder"
            >
              주문하기 ({{ selectedItems.size }}개)
            </button>
            <p class="notice">공동구매 미달성 시 결제금액은 자동 환불됩니다.</p>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartApi } from '@/api/axios'
import { groupPurchaseApi } from '@/api/axios'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const updatingItems = ref(new Set()) // 수정 중인 항목 ID들
const selectedItems = ref(new Set()) // 선택된 장바구니 항목 ID들

const loadCartItems = async () => {
  try {
    loading.value = true
    const response = await cartApi.getCart(0, 100)
    // ResponseDto<PageResponse<CartInfo>> 구조에서 content 추출
    // PageResponse 구조: { content, totalPages, totalElements, first, last, size, numberOfElements }
    const pageResponse = response.data?.data || response.data
    const cartData = pageResponse?.content || []
    
    // 각 장바구니 항목에 공동구매 정보 가져오기
    const itemsWithDetails = await Promise.all(
      cartData.map(async (cartItem) => {
        try {
          const gpResponse = await groupPurchaseApi.getGroupPurchaseById(cartItem.groupPurchaseId)
          const groupPurchase = gpResponse.data?.data || gpResponse.data
          return {
            ...cartItem,
            groupPurchase
          }
        } catch (error) {
          console.error('공동구매 정보 조회 실패:', error)
          return {
            ...cartItem,
            groupPurchase: null
          }
        }
      })
    )
    
    items.value = itemsWithDetails
    // 장바구니 로드 시 모든 항목 자동 선택
    selectedItems.value.clear()
    itemsWithDetails.forEach(item => selectedItems.value.add(item.cartId))
  } catch (error) {
    console.error('장바구니 조회 실패:', error)
    // 503 에러는 서버 연결 문제
    if (error.response?.status === 503) {
      console.warn('Gateway 서버에 연결할 수 없습니다. Gateway가 실행 중인지 확인하세요.')
    }
    items.value = []
  } finally {
    loading.value = false
  }
}

const totalPrice = computed(() => {
  return items.value.reduce(
    (sum, item) => {
      const price = item.groupPurchase?.discountedPrice || 0
      return sum + price * item.quantity
    },
    0
  )
})

const totalDiscount = computed(() => {
  return items.value.reduce(
    (sum, item) => {
      const originalPrice = item.groupPurchase?.price || item.groupPurchase?.discountedPrice || 0
      const discountedPrice = item.groupPurchase?.discountedPrice || 0
      return sum + (originalPrice - discountedPrice) * item.quantity
    },
    0
  )
})

// const finalPrice = computed(() => {
//   return totalPrice.value
// })

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 선택된 항목들의 총 가격
const selectedTotalPrice = computed(() => {
  return items.value
    .filter(item => selectedItems.value.has(item.cartId))
    .reduce((sum, item) => {
      const price = item.groupPurchase?.discountedPrice || 0
      return sum + price * item.quantity
    }, 0)
})

// 전체 선택/해제
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    items.value.forEach(item => selectedItems.value.add(item.cartId))
  } else {
    selectedItems.value.clear()
  }
}

// 개별 항목 선택/해제
const toggleItem = (cartId) => {
  if (selectedItems.value.has(cartId)) {
    selectedItems.value.delete(cartId)
  } else {
    selectedItems.value.add(cartId)
  }
}

const changeQuantity = async (cartId, delta) => {
  const item = items.value.find(item => item.cartId === cartId)
  if (!item) return
  
  const newQuantity = Math.max(1, item.quantity + delta)
  if (newQuantity === item.quantity) return // 수량이 변경되지 않으면 종료
  
  // 업데이트 중 표시
  updatingItems.value.add(cartId)
  
  try {
    const requestData = {
      cartId,
      quantity: newQuantity
    }
    
    console.log('PATCH 요청 전송:', requestData)
    console.log('요청 URL:', '/api/carts')
    
    const response = await cartApi.updateCart(requestData)
    
    console.log('PATCH 응답 받음:', response)
    console.log('PATCH 응답 데이터:', response.data)
    
    // PATCH 응답에서 업데이트된 데이터 사용
    // ResponseDto<CartInfo> 구조: response.data.data 또는 response.data
    const updatedCartItem = response.data?.data || response.data
    
    console.log('업데이트할 장바구니 항목:', updatedCartItem)
    
    if (updatedCartItem && updatedCartItem.cartId) {
      // 로컬 상태만 업데이트 (GET 요청 없이)
      const itemIndex = items.value.findIndex(i => i.cartId === cartId)
      if (itemIndex !== -1) {
        // 응답 데이터로 모든 필드 업데이트 (공동구매 정보는 유지)
        items.value[itemIndex] = {
          ...items.value[itemIndex],
          cartId: updatedCartItem.cartId,
          memberId: updatedCartItem.memberId,
          groupPurchaseId: updatedCartItem.groupPurchaseId,
          quantity: updatedCartItem.quantity,
          createdAt: updatedCartItem.createdAt,
          updatedAt: updatedCartItem.updatedAt
        }
        console.log('로컬 상태 업데이트 완료:', items.value[itemIndex])
      } else {
        console.warn('업데이트할 항목을 찾을 수 없음:', cartId)
        // 항목을 찾을 수 없으면 전체 목록 다시 불러오기
        await loadCartItems()
      }
    } else {
      console.warn('응답에 유효한 데이터가 없음, 전체 목록 다시 불러오기')
      // 응답에 데이터가 없으면 전체 목록 다시 불러오기
      await loadCartItems()
    }
    
    // 장바구니 개수 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch (error) {
    console.error('수량 변경 실패:', error)
    const errorMessage = error.response?.data?.message || '수량 변경에 실패했습니다.'
    alert(errorMessage)
    // 에러 발생 시에는 전체 목록 다시 불러오기
    await loadCartItems()
  } finally {
    updatingItems.value.delete(cartId)
  }
}

const removeItem = async (cartId) => {
  if (!confirm('장바구니에서 제거하시겠습니까?')) {
    return
  }
  
  // 업데이트 중 표시
  updatingItems.value.add(cartId)
  
  try {
    await cartApi.deleteFromCart({ cartId })
    // 장바구니 목록 다시 불러오기
    await loadCartItems()
    // 장바구니 개수 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch (error) {
    console.error('장바구니 항목 삭제 실패:', error)
    const errorMessage = error.response?.data?.message || '장바구니 항목 삭제에 실패했습니다.'
    alert(errorMessage)
    // 에러 발생 시에도 목록 다시 불러오기
    await loadCartItems()
  } finally {
    updatingItems.value.delete(cartId)
  }
}

const clearCart = async () => {
  if (!confirm('장바구니를 전체 비우시겠습니까?')) {
    return
  }

  try {
    await cartApi.flushCart()
    items.value = []
    selectedItems.value.clear()
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch (error) {
    console.error('장바구니 비우기 실패:', error)
    const message = error.response?.data?.message || '장바구니 비우기에 실패했습니다.'
    alert(message)
  }
}

const goToOrder = () => {
  if (selectedItems.value.size === 0) {
    alert('주문할 상품을 선택해주세요.')
    return
  }
  
  // 선택된 cartId들을 쿼리 파라미터로 전달
  const selectedCartIds = Array.from(selectedItems.value)
  router.push({ 
    path: '/order/create', 
    query: { 
      from: 'cart',
      cartIds: selectedCartIds.join(',')
    } 
  })
}

onMounted(() => {
  loadCartItems()
})
</script>

<style scoped>
.cart-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  align-items: flex-start;
}

.eyebrow {
  text-transform: uppercase;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.cart-header h1 {
  color: #ffffff;
}

.subtitle {
  color: #999;
}

.summary-box {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  text-align: right;
}

.summary-box p {
  margin: 0;
  color: #999;
}

.summary-box strong {
  font-size: 24px;
  color: #ffffff;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.select-all-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  margin-bottom: 8px;
}

.select-all-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 500;
}

.select-all-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.selected-count {
  color: #999;
  font-size: 14px;
}

.clear-btn {
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #ff6b6b;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.clear-btn:hover:not(:disabled) {
  color: #ff5252;
  border-color: #ff5252;
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cart-item {
  display: flex;
  gap: 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.cart-item.selected {
  border-color: #ffffff;
  background: #1f1f1f;
}

.item-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ffffff;
}

.cart-item img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
}

.item-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category {
  color: #ffffff;
  font-weight: 600;
}

.item-body h2 {
  color: #ffffff;
}

.option {
  color: #999;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-meta .quantity-label {
  color: #999;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  overflow: hidden;
  background: #0f0f0f;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: none;
  background: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-control button:hover:not(:disabled) {
  background: #2a2a2a;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control span {
  padding: 0 16px;
  color: #ffffff;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.link-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.link-btn:hover:not(:disabled) {
  color: #ff5252;
  text-decoration: underline;
}

.link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkout-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.checkout-card h3 {
  margin-bottom: 16px;
  color: #ffffff;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  color: #e0e0e0;
}

.row span {
  color: #999;
}

.row strong {
  color: #ffffff;
}

.row.total strong {
  font-size: 22px;
  color: #ffffff;
}

.discount {
  color: #ffffff;
}

.checkout-card hr {
  border: none;
  border-top: 1px solid #2a2a2a;
  margin: 16px 0;
}

.btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover:not(:disabled) {
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.notice {
  font-size: 13px;
  color: #999;
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #ffffff;
}

.empty-state p {
  color: #999;
  margin-bottom: 16px;
}

@media (max-width: 960px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .cart-item {
    flex-direction: column;
  }

  .cart-item img {
    width: 100%;
    height: 220px;
  }

  .item-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

