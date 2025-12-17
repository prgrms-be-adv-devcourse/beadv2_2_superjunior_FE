<template>
  <div v-if="isOpen" class="floating-cart">
    <div class="cart-header">
      <h3>장바구니</h3>
      <button class="btn-close" @click="closeCart">×</button>
    </div>
    <div class="cart-body">
      <div v-if="loading" class="empty-cart">
        <p>로딩 중...</p>
      </div>
      <div v-else-if="items.length === 0" class="empty-cart">
        <p>장바구니가 비어있습니다</p>
        <router-link to="/products" class="btn btn-outline" @click="closeCart">상품 둘러보기</router-link>
      </div>
      <div v-else class="cart-items">
        <div v-for="item in items" :key="item.cartId" class="cart-item">
          <div v-if="item.groupPurchase" class="item-info">
            <h4>{{ item.groupPurchase.title || '공동구매 상품' }}</h4>
            <p class="item-price">₩{{ ((item.groupPurchase.discountedPrice || 0) * item.quantity).toLocaleString() }}</p>
            <div class="quantity-control">
              <button 
                @click.stop="changeQuantity(item.cartId, -1)"
                :disabled="updatingItems.has(item.cartId) || item.quantity <= 1"
              >-</button>
              <span>{{ item.quantity }}</span>
              <button 
                @click.stop="changeQuantity(item.cartId, 1)"
                :disabled="updatingItems.has(item.cartId)"
              >+</button>
            </div>
          </div>
          <div v-else class="item-info">
            <h4>상품 정보 없음</h4>
            <p class="item-price">수량: {{ item.quantity }}</p>
          </div>
          <button 
            class="btn-delete" 
            @click.stop="removeItem(item.cartId)"
            :disabled="updatingItems.has(item.cartId)"
          >×</button>
        </div>
      </div>
    </div>
    <div v-if="items.length > 0" class="cart-footer">
      <div class="cart-summary">
        <span>총 {{ totalQuantity }}개</span>
        <strong>₩{{ totalPrice.toLocaleString() }}</strong>
      </div>
      <router-link to="/cart" class="btn btn-primary" @click="closeCart">장바구니 보기</router-link>
    </div>
  </div>
  <button v-else class="floating-cart-button" @click="openCart">
    <span class="cart-icon">🛒</span>
    <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { cartApi } from '@/api/axios'
import { groupPurchaseApi } from '@/api/axios'

const isOpen = ref(false)
const items = ref([])
const loading = ref(false)
const updatingItems = ref(new Set()) // 수정 중인 항목 ID들
let cartUpdateInterval = null

const cartCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => {
    const price = item.groupPurchase?.discountedPrice || 0
    return sum + price * item.quantity
  }, 0)
})

const loadCartItems = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    items.value = []
    return
  }

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
  } catch (error) {
    console.error('장바구니 조회 실패:', error)
    // 503 에러는 서버 연결 문제이므로 조용히 처리 (사용자에게는 빈 장바구니 표시)
    if (error.response?.status === 503) {
      console.warn('Gateway 서버에 연결할 수 없습니다. Gateway가 실행 중인지 확인하세요.')
    }
    items.value = []
  } finally {
    loading.value = false
  }
}

const openCart = () => {
  isOpen.value = true
  loadCartItems()
}

const closeCart = () => {
  isOpen.value = false
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
    
    const response = await cartApi.updateCart(requestData)
    
    // PATCH 응답에서 업데이트된 데이터 사용
    // ResponseDto<CartInfo> 구조: response.data.data 또는 response.data
    const updatedCartItem = response.data?.data || response.data
    
    if (updatedCartItem && updatedCartItem.cartId) {
      // 로컬 상태만 업데이트 (GET 요청 없이)
      const itemIndex = items.value.findIndex(i => i.cartId === cartId)
      if (itemIndex !== -1) {
        // 응답 데이터로 수량만 업데이트 (공동구매 정보는 유지)
        items.value[itemIndex].quantity = updatedCartItem.quantity
        items.value[itemIndex].updatedAt = updatedCartItem.updatedAt
      }
    } else {
      // 응답이 예상과 다르면 전체 장바구니 다시 로드
      await loadCartItems()
    }
  } catch (error) {
    console.error('장바구니 수량 변경 실패:', error)
    // 에러 발생 시 전체 장바구니 다시 로드
    await loadCartItems()
  } finally {
    updatingItems.value.delete(cartId)
  }
}

const removeItem = async (cartId) => {
  // 업데이트 중 표시
  updatingItems.value.add(cartId)
  
  try {
    const requestData = {
      cartId
    }
    
    await cartApi.deleteFromCart(requestData)
    
    // 삭제 성공 시 로컬 상태에서 제거
    items.value = items.value.filter(item => item.cartId !== cartId)
    
    // 장바구니 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch (error) {
    console.error('장바구니 항목 삭제 실패:', error)
    // 에러 발생 시 전체 장바구니 다시 로드
    await loadCartItems()
  } finally {
    updatingItems.value.delete(cartId)
  }
}

const handleCartUpdate = () => {
  loadCartItems()
}

onMounted(() => {
  loadCartItems()
  // 장바구니 업데이트 이벤트 리스너
  window.addEventListener('cart-updated', handleCartUpdate)
  // 주기적으로 장바구니 업데이트
  cartUpdateInterval = setInterval(() => {
    loadCartItems()
  }, 5000) // 5초마다 업데이트
})

onBeforeUnmount(() => {
  window.removeEventListener('cart-updated', handleCartUpdate)
  if (cartUpdateInterval) {
    clearInterval(cartUpdateInterval)
  }
})
</script>

<style scoped>
.floating-cart {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  max-height: 600px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a2a;
}

.cart-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding: 16px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-cart p {
  color: #999;
  margin-bottom: 16px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  position: relative;
}

.cart-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  margin: 4px 0;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  background: #0f0f0f;
  margin-top: 4px;
}

.quantity-control button {
  width: 24px;
  height: 24px;
  border: none;
  background: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 0 8px;
  color: #ffffff;
  font-size: 13px;
  min-width: 30px;
  text-align: center;
}

.btn-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #2a2a2a;
  color: #ff6b6b;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart-footer {
  padding: 16px 20px;
  border-top: 1px solid #2a2a2a;
  background: #0f0f0f;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #999;
  font-size: 14px;
}

.cart-summary strong {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.floating-cart-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.3s;
}

.floating-cart-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.cart-icon {
  font-size: 28px;
}

.cart-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4757;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
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
  background: #f0f0f0;
}

@media (max-width: 480px) {
  .floating-cart {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
    max-height: 70vh;
  }
}
</style>









