<template>
  <main class="order-create-page">
    <div class="container">
      <header class="page-header">
        <h1>주문하기</h1>
        <p class="subtitle">주문 정보를 입력해주세요</p>
      </header>

      <form class="order-form">
        <!-- 배송 정보 -->
        <section class="form-section">
          <h2>배송 정보</h2>
          
          <!-- 주소 선택 -->
          <div class="form-group" v-if="addresses.length > 0">
            <label>배송지 선택 *</label>
            <div class="address-options">
              <label
                v-for="address in addresses"
                :key="address.addressId"
                class="address-option"
                :class="{ active: selectedAddressId === address.addressId }"
              >
                <div class="radio-custom">
                  <input
                    type="radio"
                    :value="address.addressId"
                    v-model="selectedAddressId"
                    @change="selectAddress(address)"
                    :id="`address-${address.addressId}`"
                  />
                  <label :for="`address-${address.addressId}`" class="radio-label"></label>
                </div>
                <div class="address-info">
                  <div class="address-main">
                    <strong>{{ address.receiverName }}</strong>
                    <span class="address-phone">{{ address.phoneNumber }}</span>
                  </div>
                  <div class="address-detail">
                    <span>({{ address.postalCode }})</span>
                    <span>{{ address.address }}</span>
                    <span v-if="address.addressDetail">{{ address.addressDetail }}</span>
                  </div>
                </div>
              </label>
              <label
                class="address-option"
                :class="{ active: selectedAddressId === 'new' }"
              >
                <div class="radio-custom">
                  <input
                    type="radio"
                    value="new"
                    v-model="selectedAddressId"
                    @change="selectNewAddress"
                    id="address-new"
                  />
                  <label for="address-new" class="radio-label"></label>
                </div>
                <div class="address-info">
                  <strong>새 주소 입력</strong>
                </div>
              </label>
            </div>
          </div>

          <!-- 주소 입력 폼 -->
          <div class="form-group" v-if="selectedAddressId === 'new' || addresses.length === 0">
            <label>주소 *</label>
            <AddressSearch 
              v-model="orderForm.addressData"
              @update:modelValue="handleAddressUpdate"
            />
          </div>
          <div class="form-group" v-if="selectedAddressId === 'new' || addresses.length === 0">
            <label for="receiverName">수신자 이름 *</label>
            <input
              id="receiverName"
              v-model="orderForm.receiverName"
              type="text"
              required
              maxlength="100"
              placeholder="수신자 이름을 입력하세요"
            />
          </div>
          <div class="form-group" v-else>
            <label for="receiverName">수신자 이름 *</label>
            <input
              id="receiverName"
              v-model="orderForm.receiverName"
              type="text"
              required
              maxlength="100"
              placeholder="수신자 이름을 입력하세요"
            />
          </div>

        </section>

        <!-- 주문 요약 -->
        <section class="form-section">
          <h2>주문 요약</h2>
          <div v-if="loading" class="loading-state">
            <p>주문 정보를 불러오는 중...</p>
          </div>
          <div v-else-if="orderItems.length === 0" class="empty-state">
            <p>주문할 상품이 없습니다</p>
            <router-link to="/cart" class="btn btn-outline">장바구니로 이동</router-link>
          </div>
          <div v-else class="order-items">
            <div
              v-for="item in orderItems"
              :key="item.cartId || item.groupPurchaseId"
              class="order-item"
            >
              <div class="item-info">
                <h3 v-if="item.groupPurchase">{{ item.groupPurchase.title }}</h3>
                <h3 v-else>공동구매 ID: {{ item.groupPurchaseId }}</h3>
                <p class="item-quantity">수량: {{ item.quantity }}개</p>
                <p v-if="item.groupPurchase" class="item-price">
                  ₩{{ ((item.groupPurchase.discountedPrice || 0) * item.quantity).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
          <div class="order-total">
            <div class="total-row">
              <span>총 주문 금액</span>
              <strong>₩{{ totalAmount.toLocaleString() }}</strong>
            </div>
          </div>
        </section>

        <!-- 주문 버튼 -->
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleCancel">취소</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!isFormValid || submitting"
            @click="handleOrderSubmit"
          >
            {{ submitting ? '주문 처리 중...' : '주문하기' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { orderApi, cartApi, groupPurchaseApi } from '@/api/axios'
import { authAPI } from '@/api/auth'
import AddressSearch from '@/components/AddressSearch.vue'
import { generateUUID } from '@/utils/uuid'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const orderItems = ref([])
const addresses = ref([])
const selectedAddressId = ref('new')
const orderForm = ref({
  addressData: {
    address: '',
    addressDetail: '',
    postalCode: ''
  },
  receiverName: ''
})

// 장바구니에서 주문하는지, 개별 주문인지 확인
const isFromCart = computed(() => {
  return route.query.from === 'cart'
})

// 선택된 장바구니 ID들
const selectedCartIds = computed(() => {
  if (route.query.cartIds) {
    return route.query.cartIds.split(',').filter(id => id)
  }
  return []
})

const isFormValid = computed(() => {
  return (
    orderForm.value.addressData.address &&
    orderForm.value.addressData.addressDetail &&
    orderForm.value.addressData.postalCode &&
    orderForm.value.receiverName &&
    orderItems.value.length > 0
  )
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    const price = item.groupPurchase?.discountedPrice || 0
    return sum + price * item.quantity
  }, 0)
})

const handleAddressUpdate = (data) => {
  orderForm.value.addressData = { ...data }
}

// 주소 목록 불러오기
const loadAddresses = async () => {
  try {
    const response = await authAPI.getAddresses(0, 100)
    const pageResponse = response.data?.data || response.data
    const addressList = pageResponse?.content || []
    addresses.value = addressList
    
    // 주소가 있으면 첫 번째 주소를 기본 선택, 없으면 새 주소 입력
    if (addressList.length > 0) {
      selectedAddressId.value = addressList[0].addressId
      selectAddress(addressList[0])
    } else {
      selectedAddressId.value = 'new'
    }
  } catch (error) {
    console.error('주소 목록 조회 실패:', error)
    addresses.value = []
    selectedAddressId.value = 'new'
  }
}

// 주소 선택
const selectAddress = (address) => {
  orderForm.value.addressData = {
    address: address.address,
    addressDetail: address.addressDetail || '',
    postalCode: address.postalCode
  }
  orderForm.value.receiverName = address.receiverName
}

// 새 주소 입력 선택
const selectNewAddress = () => {
  orderForm.value.addressData = {
    address: '',
    addressDetail: '',
    postalCode: ''
  }
  orderForm.value.receiverName = ''
}

const loadOrderItems = async () => {
  loading.value = true
  try {
    if (isFromCart.value) {
      // 장바구니에서 주문
      const response = await cartApi.getCart(0, 100)
      const pageResponse = response.data?.data || response.data
      const cartData = pageResponse?.content || []
      
      // 선택된 항목만 필터링 (cartIds가 있으면)
      const filteredCartData = selectedCartIds.value.length > 0
        ? cartData.filter(item => selectedCartIds.value.includes(item.cartId))
        : cartData
      
      // 각 장바구니 항목에 공동구매 정보 가져오기
      const itemsWithDetails = await Promise.all(
        filteredCartData.map(async (cartItem) => {
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
      
      orderItems.value = itemsWithDetails
    } else {
      // 개별 주문 (공동구매 상세에서)
      const groupPurchaseId = route.query.groupPurchaseId
      const quantity = parseInt(route.query.quantity) || 1
      
      if (groupPurchaseId) {
        try {
          const gpResponse = await groupPurchaseApi.getGroupPurchaseById(groupPurchaseId)
          const groupPurchase = gpResponse.data?.data || gpResponse.data
          orderItems.value = [{
            groupPurchaseId,
            quantity,
            groupPurchase
          }]
        } catch (error) {
          console.error('공동구매 정보 조회 실패:', error)
          alert('주문할 상품 정보를 불러오는데 실패했습니다.')
          router.push('/')
        }
      }
    }
  } catch (error) {
    console.error('주문 정보 로드 실패:', error)
    alert('주문 정보를 불러오는데 실패했습니다.')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 네트워크 오류 재시도 함수
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      // 네트워크 오류나 5xx 에러만 재시도
      const isRetryable = 
        !error.response || // 네트워크 오류
        error.response.status >= 500 || // 서버 오류
        error.code === 'ECONNABORTED' || // 타임아웃
        error.code === 'ERR_NETWORK' // 네트워크 오류
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error
      }
      
      // 재시도 전 대기 (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt)
      console.log(`재시도 ${attempt + 1}/${maxRetries} (${waitTime}ms 후)`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError
}

const handleOrderSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  submitting.value = true
  try {
    const requestId = generateUUID()
    if (isFromCart.value) {
      // 장바구니에서 주문
      if (orderItems.value.length === 0) {
        alert('주문할 상품이 없습니다.')
        return
      }
      
      // 장바구니 ID 리스트 생성 (선택된 항목들만)
      const cartIds = selectedCartIds.value.length > 0
        ? selectedCartIds.value
        : orderItems.value.map(item => item.cartId).filter(id => id)
      
      if (cartIds.length === 0) {
        alert('주문할 상품이 없습니다.')
        return
      }
      
      const response = await retryRequest(async () => {
        return await orderApi.createOrderFromCart({
          cartIds: cartIds,
          address: orderForm.value.addressData.address,
          addressDetail: orderForm.value.addressData.addressDetail,
          postalCode: orderForm.value.addressData.postalCode,
          receiverName: orderForm.value.receiverName,
          requestId
        })
      })
      const orderData = response.data?.data || response.data
      console.log('주문 생성 성공:', orderData)
      
      // 주문 ID 추출
      const orderId = orderData?.orderId || orderData?.id
      if (!orderId) {
        throw new Error('주문 ID를 받지 못했습니다.')
      }
      router.push({ name: 'order-payment', query: { orderId, amount: totalAmount.value } })
    } else {
      // 개별 주문
      if (orderItems.value.length === 0) {
        alert('주문할 상품이 없습니다.')
        return
      }
      
      const item = orderItems.value[0]
      
      // sellerId 확인
      const sellerId = item.groupPurchase?.sellerId
      if (!sellerId) {
        alert('판매자 정보를 불러올 수 없습니다.')
        return
      }
      
      // 네트워크 오류 시 재시도
      const response = await retryRequest(async () => {
        return await orderApi.createOrder({
          groupPurchaseId: item.groupPurchaseId,
          quantity: item.quantity,
          address: orderForm.value.addressData.address,
          addressDetail: orderForm.value.addressData.addressDetail,
          postalCode: orderForm.value.addressData.postalCode,
          receiverName: orderForm.value.receiverName,
          sellerId: sellerId,
          requestId
        })
      })
      
      const orderData = response.data?.data || response.data
      console.log('주문 생성 성공:', orderData)
      
      // 주문 ID 추출
      const orderId = orderData?.orderId || orderData?.id
      if (!orderId) {
        throw new Error('주문 ID를 받지 못했습니다.')
      }
      
      router.push({ name: 'order-payment', query: { orderId, amount: totalAmount.value } })
    }
  } catch (error) {
    console.error('주문 실패:', error)
    
    // 중복 주문 에러 처리
    if (error.response?.status === 409 || 
        error.response?.data?.code === 'DUPLICATE_ORDER' ||
        error.response?.data?.message?.includes('중복') ||
        error.response?.data?.message?.includes('duplicate')) {
      // 이미 처리된 주문
      alert('주문이 이미 처리되었습니다.')
      return
    }
    
    const errorMessage = error.response?.data?.message || '주문 처리에 실패했습니다.'
    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}


const handleCancel = () => {
  if (confirm('주문을 취소하시겠습니까?')) {
    if (isFromCart.value) {
      router.push('/cart')
    } else {
      router.back()
    }
  }
}

onMounted(() => {
  loadOrderItems()
  loadAddresses()
})
</script>

<style scoped>
.order-create-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 800px;
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

.subtitle {
  color: #999;
  font-size: 16px;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
}

.form-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.order-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
}

.item-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.item-quantity,
.item-price {
  font-size: 14px;
  color: #999;
  margin: 4px 0;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.order-total {
  padding-top: 20px;
  border-top: 2px solid #2a2a2a;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  color: #ffffff;
}

.total-row strong {
  font-size: 24px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
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

.btn-primary:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-option:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.address-option.active {
  border-color: #ffffff;
  background: #1a1a1a;
}

.radio-custom {
  position: relative;
  margin-top: 4px;
}

.radio-custom input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.radio-label {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #3a3a3a;
  border-radius: 50%;
  background: #0f0f0f;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.radio-custom input[type="radio"]:checked + .radio-label {
  border-color: #ffffff;
  background: #ffffff;
}

.radio-custom input[type="radio"]:checked + .radio-label::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0a0a0a;
}

.radio-custom input[type="radio"]:hover + .radio-label {
  border-color: #666;
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.address-main strong {
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
}

.address-phone {
  color: #999;
  font-size: 14px;
}

.address-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #999;
  font-size: 14px;
  line-height: 1.5;
}

</style>

