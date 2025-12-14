<template>
  <main class="page">
    <div class="container">
      <div class="page-header">
        <h1>마이페이지</h1>
        <div class="header-actions">
          <button 
            v-if="isSeller" 
            class="btn btn-primary" 
            @click="goToSellerPage"
          >
            판매자 대시보드
          </button>
          <button 
            v-else 
            class="btn btn-primary" 
            @click="goToSellerApplication"
          >
            판매자 신청
          </button>
        </div>
      </div>
      
      <!-- 일반 사용자 정보 -->
      <div class="user-section">
        <div class="grid">
          <div class="panel">
            <h3>기본 정보</h3>
            <div class="user-info">
              <div class="info-row">
                <span class="info-label">이름</span>
                <span class="info-value">{{ userInfo.name || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">이메일</span>
                <span class="info-value">{{ userInfo.email || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">전화번호</span>
                <span class="info-value">{{ userInfo.phoneNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">가입일</span>
                <span class="info-value">{{ userInfo.joinDate || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">프로필 이미지</span>
                <div class="image-preview">
                  <img v-if="userInfo.imageUrl" :src="userInfo.imageUrl" alt="프로필" class="profile-image" />
                  <span v-else class="no-image">이미지 없음</span>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">포인트 잔액</span>
                <div class="point-info">
                  <span class="info-value point-value">{{ (userInfo.point || 0).toLocaleString() }}P</span>
                  <router-link to="/point/charge" class="btn-point-charge">포인트 충전</router-link>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">주소 정보</span>
                <button type="button" class="btn-address-manage" @click="openAddressModal">
                  주소 관리 <!--({{ addressPageInfo.totalElements }}개)-->
                </button>
              </div>
            </div>
          </div>
          
          <div class="panel">
            <h3>활동 통계</h3>
            <div class="user-stats">
              <div class="stat-box">
                <span class="stat-label">구매한 상품</span>
                <span class="stat-number">{{ userStats.purchasedProducts }}</span>
              </div>
              <!-- <div class="stat-box">
                <span class="stat-label">작성한 리뷰</span>
                <span class="stat-number">{{ userStats.reviews }}</span>
              </div> -->
              <div class="stat-box">
                <span class="stat-label">참여한 공동구매</span>
                <span class="stat-number">{{ userStats.groupPurchases }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel">
          <h3>주문 내역</h3>
          <div v-if="loadingOrders" class="loading-orders">
            <p>주문 내역을 불러오는 중...</p>
          </div>
          <div v-else-if="orderHistory.length === 0" class="empty-orders">
            <p>주문 내역이 없습니다</p>
            <router-link to="/products" class="btn btn-outline">상품 둘러보기</router-link>
          </div>
          <div v-else class="order-list">
            <div v-for="order in orderHistory" :key="order.orderId" class="order-item">
              <div class="order-header">
                <div>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  <span class="order-number">주문번호: {{ order.orderId || '-' }}</span>
                </div>
                <span class="order-status" :class="order.status?.toLowerCase()">{{ getStatusText(order.status) }}</span>
              </div>
              <div v-if="order.products && order.products.length > 0" class="order-products">
                <div v-for="product in order.products" :key="product.id" class="order-product">
                  <div class="product-details">
                    <h4>{{ product.title }}</h4>
                    <p class="product-option">{{ product.option }}</p>
                    <div class="product-meta">
                      <span>수량: {{ product.quantity }}개</span>
                      <span class="product-price">₩{{ product.price.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="order-summary">
                <p class="order-quantity">수량: {{ order.quantity }}개</p>
                <p class="order-price">단가: ₩{{ order.price?.toLocaleString() || '-' }}</p>
              </div>
              <div class="order-footer">
                <span class="order-total">총 결제금액: ₩{{ order.totalAmount.toLocaleString() }}</span>
                <div class="order-actions">
                  <button class="btn btn-outline btn-sm" @click="viewOrderDetail(order.orderId)">상세보기</button>
                  <button v-if="order.status === 'COMPLETED' || order.status === 'completed'" class="btn btn-outline btn-sm" @click="requestRefund(order.orderId)">환불신청</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- 주소 목록 모달 -->
    <div v-if="showAddressModal" class="modal-overlay" @click.self="closeAddressModal">
      <div class="address-modal">
        <div class="modal-header">
          <h2>주소 관리</h2>
          <button class="close-btn" @click="closeAddressModal">✕</button>
        </div>
        <div class="address-list-container">
          <div v-if="loadingAddresses" class="loading-state">
            <p>주소 목록을 불러오는 중...</p>
          </div>
          <div v-else-if="addressList.length === 0" class="empty-state">
            <p>등록된 주소가 없습니다</p>
            <button class="btn btn-primary" @click="addNewAddress">주소 추가</button>
          </div>
          <div v-else class="address-list">
            <div v-for="address in addressList" :key="address.addressId" class="address-item">
              <div class="address-content">
                <div class="address-main">
                  <p class="address-text">
                    <span class="receiver-name">{{ address.receiverName }}</span>
                    <span class="phone-number">{{ address.phoneNumber }}</span>
                  </p>
                  <p class="address-full">
                    <span v-if="address.postalCode" class="postal-code">[{{ address.postalCode }}]</span>
                    {{ address.address }} {{ address.addressDetail || '' }}
                  </p>
                </div>
              </div>
            </div>
            <!-- 페이지네이션 -->
            <div v-if="addressPageInfo.totalPages > 1" class="pagination">
              <button 
                class="page-btn" 
                :disabled="addressPageInfo.currentPage === 0"
                @click="loadAddresses(addressPageInfo.currentPage - 1)"
              >
                이전
              </button>
              <span class="page-info">
                {{ addressPageInfo.currentPage + 1 }} / {{ addressPageInfo.totalPages }}
              </span>
              <button 
                class="page-btn"
                :disabled="addressPageInfo.currentPage >= addressPageInfo.totalPages - 1"
                @click="loadAddresses(addressPageInfo.currentPage + 1)"
              >
                다음
              </button>
            </div>
            <!-- 주소 추가 버튼 -->
            <div class="add-address-section">
              <button class="btn btn-primary" @click="addNewAddress">주소 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 주소 수정 모달 -->
    <div v-if="showEditAddressModal" class="modal-overlay" @click.self="closeEditAddressModal">
      <div class="address-edit-modal">
        <div class="modal-header">
          <h2>{{ editingAddress ? '주소 수정' : '주소 추가' }}</h2>
          <button class="close-btn" @click="closeEditAddressModal">✕</button>
        </div>
        <form @submit.prevent="saveAddress" class="address-form">
          <div class="form-group">
            <label>받는 분 이름 *</label>
            <input v-model="addressForm.receiverName" type="text" required placeholder="받는 분 이름을 입력하세요" />
          </div>
          <div class="form-group">
            <label>받는 분 전화번호 *</label>
            <input v-model="addressForm.phoneNumber" type="tel" required placeholder="010-0000-0000" />
          </div>
          <div class="form-group">
            <label>주소 *</label>
            <AddressSearch 
              v-model="addressFormData"
              @update:modelValue="handleAddressUpdate"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="closeEditAddressModal">취소</button>
            <button type="submit" class="btn btn-primary" :disabled="savingAddress">
              {{ savingAddress ? '저장 중...' : '저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/auth'
import AddressSearch from '@/components/AddressSearch.vue'

const router = useRouter()

const userInfo = ref({
  name: '',
  email: '',
  phoneNumber: '',
  joinDate: '',
  imageUrl: '',
  point: 0
})

const showAddressModal = ref(false)
const showEditAddressModal = ref(false)
const loadingAddresses = ref(false)
const savingAddress = ref(false)
const editingAddress = ref(null)
const addressList = ref([])
const addressPageInfo = ref({
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 10
})

const addressForm = ref({
  receiverName: '',
  phoneNumber: '',
  postalCode: '',
  address: '',
  addressDetail: ''
})

const addressFormData = ref({
  postalCode: '',
  address: '',
  addressDetail: ''
})

const userStats = ref({
  purchasedProducts: 23,
  reviews: 15,
  groupPurchases: 18
})

const orderHistory = ref([])
const loadingOrders = ref(false)

const userRole = ref(null)

const isSeller = computed(() => {
  // localStorage와 API에서 가져온 role 모두 확인
  const localRole = localStorage.getItem('user_role')
  const role = userRole.value || localRole
  
  // 대소문자 구분 없이 비교 (SELLER, seller, ROLE_SELLER 등 모두 처리)
  if (!role) return false
  
  const roleUpper = role.toUpperCase()
  return roleUpper === 'SELLER' || roleUpper === 'ROLE_SELLER' || roleUpper.includes('SELLER')
})

const goToSellerPage = () => {
  router.push('/seller')
}

const goToSellerApplication = () => {
  router.push('/seller/application')
}

// 주소 목록 불러오기
const loadAddresses = async (page = 0) => {
  loadingAddresses.value = true
  try {
    const response = await authAPI.getAddresses(page, 10)
    console.log('주소 목록:', response)
    
    if (response.data && Array.isArray(response.data.content)) {
      addressList.value = response.data.content
      addressPageInfo.value = {
        currentPage: response.data.number || page,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
        size: response.data.size || 10
      }
    } else if (Array.isArray(response.data)) {
      // 배열로 직접 반환되는 경우
      addressList.value = response.data
      addressPageInfo.value = {
        currentPage: 0,
        totalPages: 1,
        totalElements: response.data.length,
        size: 10
      }
    }
  } catch (error) {
    console.error('주소 목록 조회 실패:', error)
    alert('주소 목록을 불러오는데 실패했습니다.')
  } finally {
    loadingAddresses.value = false
  }
}

// 주소 모달 열기
const openAddressModal = () => {
  showAddressModal.value = true
  loadAddresses()
}

// 주소 모달 닫기
const closeAddressModal = () => {
  showAddressModal.value = false
}

// 주소 수정 모달 열기
// const editAddress = (address) => {
//   editingAddress.value = address
//   addressForm.value = {
//     receiverName: address.receiverName || '',
//     phoneNumber: address.phoneNumber || '',
//     postalCode: address.postalCode || '',
//     address: address.address || '',
//     addressDetail: address.addressDetail || ''
//   }
//   addressFormData.value = {
//     postalCode: address.postalCode || '',
//     address: address.address || '',
//     addressDetail: address.addressDetail || ''
//   }
//   showEditAddressModal.value = true
// }

// 새 주소 추가
const addNewAddress = () => {
  editingAddress.value = null
  addressForm.value = {
    receiverName: '',
    phoneNumber: '',
    postalCode: '',
    address: '',
    addressDetail: ''
  }
  addressFormData.value = {
    postalCode: '',
    address: '',
    addressDetail: ''
  }
  showEditAddressModal.value = true
}

// 주소 수정 모달 닫기
const closeEditAddressModal = () => {
  showEditAddressModal.value = false
  editingAddress.value = null
  addressForm.value = {
    receiverName: '',
    phoneNumber: '',
    postalCode: '',
    address: '',
    addressDetail: ''
  }
  addressFormData.value = {
    postalCode: '',
    address: '',
    addressDetail: ''
  }
}

// AddressSearch 컴포넌트에서 주소 업데이트
const handleAddressUpdate = (addressData) => {
  addressForm.value.postalCode = addressData.postalCode || ''
  addressForm.value.address = addressData.address || ''
  addressForm.value.addressDetail = addressData.addressDetail || ''
}

// 주소 저장
const saveAddress = async () => {
  if (!addressForm.value.receiverName || !addressForm.value.phoneNumber || !addressForm.value.address) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  savingAddress.value = true
  try {
    if (editingAddress.value) {
      // 주소 수정
      await authAPI.updateAddress(editingAddress.value.addressId, {
        receiverName: addressForm.value.receiverName,
        phoneNumber: addressForm.value.phoneNumber,
        postalCode: addressForm.value.postalCode,
        address: addressForm.value.address,
        addressDetail: addressForm.value.addressDetail
      })
      alert('주소가 수정되었습니다.')
    } else {
      // 주소 추가
      await authAPI.addAddress({
        receiverName: addressForm.value.receiverName,
        phoneNumber: addressForm.value.phoneNumber,
        postalCode: addressForm.value.postalCode,
        address: addressForm.value.address,
        addressDetail: addressForm.value.addressDetail
      })
      alert('주소가 추가되었습니다.')
    }
    
    closeEditAddressModal()
    loadAddresses(addressPageInfo.value.currentPage)
  } catch (error) {
    console.error('주소 저장 실패:', error)
    alert(error.response?.data?.message || '주소 저장에 실패했습니다.')
  } finally {
    savingAddress.value = false
  }
}

// 우편번호 검색 (AddressSearch 컴포넌트에서 처리됨)
// const searchPostalCode = () => {
//   // AddressSearch 컴포넌트의 openAddressSearch가 자동으로 호출됨
// }

// 주문 ID 포맷팅 함수 (UUID를 읽기 쉬운 형식으로 변환)
// const formatOrderId = (orderId) => {
//   if (!orderId) return '-'
  
//   // 이미 포맷된 형식인지 확인 (ORD-로 시작하는 경우)
//   if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
//     return orderId
//   }
  
//   // UUID인 경우 변환: ORD-년도-UUID마지막8자리
//   if (typeof orderId === 'string' && orderId.includes('-')) {
//     const currentYear = new Date().getFullYear()
//     // UUID의 마지막 8자리 사용 (하이픈 제거 후)
//     const uuidPart = orderId.replace(/-/g, '').slice(-8).toUpperCase()
//     return `ORD-${currentYear}-${uuidPart}`
//   }
  
//   // 그 외의 경우 그대로 반환
//   return orderId
// }

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// 주문 상태 텍스트 변환
const getStatusText = (status) => {
  if (!status) return '알 수 없음'
  
  const statusMap = {
    'IN_PROGRESS': '진행 중',
    'SUCCESS': '주문 성공',
    'FAILED': '주문 실패',
    'PENDING': '주문 대기',
    'CONFIRMED': '주문 확인',
    'SHIPPING': '배송 중',
    'COMPLETED': '배송 완료',
    'CANCELLED': '주문 취소',
    'REFUNDED': '환불 완료',
    'in_progress': '진행 중',
    'success': '주문 성공',
    'failed': '주문 실패',
    'pending': '주문 대기',
    'confirmed': '주문 확인',
    'shipping': '배송 중',
    'completed': '배송 완료',
    'cancelled': '주문 취소',
    'refunded': '환불 완료'
  }
  
  return statusMap[status] || status
}

const viewOrderDetail = (orderId) => {
  alert(`주문 상세 정보를 확인합니다. (주문 ID: ${orderId})`)
  // TODO: 주문 상세 페이지로 이동
}

// const requestRefund = (orderId) => {
//   if (confirm('환불을 신청하시겠습니까?')) {
//     alert('환불 신청이 접수되었습니다.')
//     // TODO: 환불 신청 API 호출
//   }
// }

onMounted(async () => {
  // 저장된 사용자 정보 불러오기
  const savedUserData = localStorage.getItem('user_data')
  if (savedUserData) {
    try {
      const userData = JSON.parse(savedUserData)
      userInfo.value.name = userData.name || userInfo.value.name
      userInfo.value.email = userData.email || userInfo.value.email
      userInfo.value.phone = userData.phone || userInfo.value.phone
      if (userData.createdAt) {
        userInfo.value.joinDate = new Date(userData.createdAt).toLocaleDateString('ko-KR')
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  
  const savedEmail = localStorage.getItem('user_email')
  if (savedEmail) {
    userInfo.value.email = savedEmail
  }
  
  // 프로필 API에서 정보 가져오기
  try {
    const profileResponse = await authAPI.getProfile()
    console.log('프로필 정보:', profileResponse)
    
    const profileData = profileResponse.data || profileResponse
    
    if (profileData) {
      // role 정보 업데이트 (판매자 여부 확인용)
      if (profileData.role) {
        userRole.value = profileData.role
        localStorage.setItem('user_role', profileData.role)
      }
      
      // 사용자 정보 업데이트 (role, memberId 제외)
      if (profileData.email) {
        userInfo.value.email = profileData.email
        localStorage.setItem('user_email', profileData.email)
      }
      if (profileData.name) {
        userInfo.value.name = profileData.name
      }
      if (profileData.phoneNumber) {
        userInfo.value.phoneNumber = profileData.phoneNumber
      }
      if (profileData.imageUrl) {
        userInfo.value.imageUrl = profileData.imageUrl
      }
      if (profileData.createdAt) {
        userInfo.value.joinDate = new Date(profileData.createdAt).toLocaleDateString('ko-KR')
      }
      if (profileData.point !== undefined) {
        userInfo.value.point = profileData.point || 0
      }
      
      // memberId는 localStorage에만 저장 (화면에는 표시 안 함)
      if (profileData.memberId) {
        localStorage.setItem('member_id', profileData.memberId)
      }
    }
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    // 프로필 조회 실패해도 localStorage의 정보 사용
    const savedEmail = localStorage.getItem('user_email')
    if (savedEmail) {
      userInfo.value.email = savedEmail
    }
  }

  // 주문 내역 가져오기
  await loadOrders()
})

// 주문 내역 불러오기
const loadOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await authAPI.getOrders()
    console.log('주문 내역:', response)
    
    // 응답 데이터 구조에 따라 처리
    const ordersData = response.data || response
    
    if (Array.isArray(ordersData)) {
      orderHistory.value = ordersData
    } else if (ordersData && Array.isArray(ordersData.content)) {
      // Pageable 객체인 경우
      orderHistory.value = ordersData.content
    } else {
      orderHistory.value = []
    }
  } catch (error) {
    console.error('주문 내역 조회 실패:', error)
    orderHistory.value = []
    // 에러가 발생해도 사용자에게는 조용히 처리 (빈 목록 표시)
  } finally {
    loadingOrders.value = false
  }
}
</script>

<style scoped>
.page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.container h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.panel h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #ffffff;
}

.row {
  display: grid;
  gap: 8px;
  margin: 12px 0;
}

.row label {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 14px;
}

input,
textarea {
  background: #0f0f0f;
  color: #ffffff;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

input::placeholder,
textarea::placeholder {
  color: #666;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.chip {
  background: #f1f3f5;
  color: #495057;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chip input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
  margin-top: 16px;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

/* 판매자 정산 섹션 */
.settlement-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.stat-value.highlight {
  color: #ffffff;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

.settlement-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settlement-date {
  font-size: 13px;
  color: #999;
}

.settlement-amount {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.settlement-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.settlement-status.completed {
  background: #2a2a2a;
  color: #51cf66;
}

.settlement-status.pending {
  background: #2a2a2a;
  color: #ffd43b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-box {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-box .stat-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.stat-box .stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

/* 사용자 정보 섹션 */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-of-type {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 14px;
}

.info-value {
  color: #ffffff;
  font-size: 14px;
}

.point-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.point-value {
  font-weight: 700;
  color: #ffffff;
}

.btn-point-charge {
  padding: 8px 16px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-point-charge:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2a2a2a;
}

.no-image {
  color: #999;
  font-size: 13px;
}

.btn-address-manage {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-address-manage:hover {
  background: #2a2a2a;
  border-color: #666;
}

.info-input {
  flex: 1;
  max-width: 200px;
  margin-left: auto;
}

.address-input-group {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 400px;
  margin-left: auto;
}

.address-input {
  flex: 1;
  max-width: none;
}

.btn-address-search {
  padding: 8px 16px;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-address-search:hover {
  background: #f0f0f0;
}

.loading-orders,
.empty-orders {
  text-align: center;
  padding: 40px 20px;
}

.empty-orders p {
  color: #999;
  margin-bottom: 16px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  background: #0f0f0f;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;
}

.order-date {
  color: #999;
  font-size: 13px;
  margin-right: 12px;
}

.order-number {
  color: #999;
  font-size: 13px;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.order-status.completed {
  background: #2a2a2a;
  color: #51cf66;
}

.order-status.shipping {
  background: #2a2a2a;
  color: #74c0fc;
}

.order-status.pending {
  background: #2a2a2a;
  color: #ffd43b;
}

.order-status.in_progress {
  background: rgba(116, 192, 252, 0.2);
  color: #74c0fc;
  border: 1px solid #74c0fc;
}

.order-status.success {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border: 1px solid #51cf66;
}

.order-status.failed {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid #ff4757;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.order-product {
  display: flex;
  gap: 12px;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #0f0f0f;
  border-radius: 8px;
}

.order-quantity,
.order-price {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
  text-align: right;
}

.product-details {
  flex: 1;
}

.product-details h4 {
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.product-option {
  color: #999;
  font-size: 13px;
  margin: 0 0 8px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
}

.product-price {
  color: #ffffff;
  font-weight: 600;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
}

.order-total {
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 920px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .settlement-summary,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .user-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .container h1 {
    font-size: 24px;
  }

  .panel {
    padding: 20px;
  }
}

/* 주소 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.address-modal,
.address-edit-modal {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 32px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2a2a2a;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #2a2a2a;
}

.address-list-container {
  min-height: 200px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 0 0 16px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
}

.address-item:hover {
  border-color: #3a3a3a;
  background: #151515;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.address-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-text {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.receiver-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 16px;
}

.phone-number {
  color: #999;
  font-size: 14px;
}

.address-full {
  color: #cccccc;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.postal-code {
  color: #999;
  font-weight: 500;
}

.add-address-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2a2a2a;
  display: flex;
  justify-content: center;
}

.add-address-section .btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.add-address-section .btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.add-address-section .btn-primary:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2a2a2a;
}

.page-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2a2a2a;
  border-color: #666;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #999;
  font-size: 14px;
}

/* 주소 수정 폼 */
.address-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-form .form-group label {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 14px;
}

.address-form .form-group input {
  padding: 12px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
  font-family: inherit;
}

.address-form .form-group input:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.postal-code-group {
  display: flex;
  gap: 8px;
}

.postal-code-group input {
  flex: 1;
}

.btn-search-postal {
  padding: 12px 16px;
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-search-postal:hover {
  background: #2a2a2a;
  border-color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.form-actions .btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.form-actions .btn-outline {
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #ffffff;
}

.form-actions .btn-outline:hover {
  background: #2a2a2a;
  border-color: #666;
}

.form-actions .btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.form-actions .btn-primary:hover:not(:disabled) {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.form-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .address-modal,
  .address-edit-modal {
    padding: 24px;
  }

  .address-content {
    flex-direction: column;
  }

  .postal-code-group {
    flex-direction: column;
  }

  .btn-search-postal {
    width: 100%;
  }
}
</style>


