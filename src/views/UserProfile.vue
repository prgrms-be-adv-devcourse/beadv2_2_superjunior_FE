<template>
  <main class="page">
    <div class="container">
      <div class="page-header">
        <h1>마이페이지</h1>
      </div>

      <div class="mypage-layout">
        <!-- 왼쪽 사이드바 메뉴 -->
        <aside class="sidebar">
          <div class="user-welcome">
            <h3>{{ userInfo.name || '사용자' }}님</h3>
            <p>{{ userInfo.email }}</p>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section">
              <h4 class="nav-section-title">계정 정보</h4>
              <button
                :class="['nav-item', { active: activeMenu === 'profile' }]"
                @click="activeMenu = 'profile'"
              >
                <span class="nav-icon">👤</span>
                <span>기본 정보</span>
              </button>
              <button
                :class="['nav-item', { active: activeMenu === 'address' }]"
                @click="activeMenu = 'address'"
              >
                <span class="nav-icon">📍</span>
                <span>주소 관리</span>
              </button>
              <button
                :class="['nav-item', { active: activeMenu === 'point' }]"
                @click="activeMenu = 'point'"
              >
                <span class="nav-icon">💰</span>
                <span>포인트</span>
              </button>
            </div>

            <div class="nav-section">
              <h4 class="nav-section-title">쇼핑 정보</h4>
              <button
                :class="['nav-item', { active: activeMenu === 'orders' }]"
                @click="activeMenu = 'orders'"
              >
                <span class="nav-icon">📦</span>
                <span>주문 내역</span>
              </button>
            </div>

            <div v-if="isSeller" class="nav-section">
              <h4 class="nav-section-title">판매자</h4>
              <button
                :class="['nav-item', { active: activeMenu === 'seller-orders' }]"
                @click="activeMenu = 'seller-orders'"
              >
                <span class="nav-icon">🛒</span>
                <span>받은 주문</span>
              </button>
              <button
                class="nav-item"
                @click="goToSellerPage"
              >
                <span class="nav-icon">📊</span>
                <span>판매자 대시보드</span>
              </button>
            </div>

            <div v-if="!isSeller" class="nav-section">
              <button
                class="nav-item seller-application"
                @click="goToSellerApplication"
              >
                <span class="nav-icon">🏪</span>
                <span>판매자 신청</span>
              </button>
            </div>
          </nav>
        </aside>

        <!-- 오른쪽 컨텐츠 영역 -->
        <div class="content-area">
          <!-- 기본 정보 -->
          <section v-if="activeMenu === 'profile'" class="content-section">
            <h2 class="section-title">기본 정보</h2>
            <div class="panel">
              <h3>내 정보</h3>
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
            </div>
          </div>
          </section>

          <!-- 포인트 -->
          <section v-if="activeMenu === 'point'" class="content-section">
            <h2 class="section-title">포인트</h2>
            <div class="panel">
              <div class="point-balance">
                <h3>포인트 잔액</h3>
                <div class="balance-amount">{{ formatPrice(userInfo.point) }}P</div>
                <router-link to="/point/charge" class="btn btn-primary">포인트 충전</router-link>
              </div>
            </div>
          </section>

          <!-- 주소 관리 -->
          <section v-if="activeMenu === 'address'" class="content-section">
            <h2 class="section-title">주소 관리</h2>
            <div class="panel">
              <div class="address-header">
                <p>등록된 주소: {{ addressList.length }}개</p>
                <button class="btn btn-primary" @click="addNewAddress">주소 추가</button>
              </div>
              <div v-if="loadingAddresses" class="loading-state">
                <p>주소 목록을 불러오는 중...</p>
              </div>
              <div v-else-if="addressList.length === 0" class="empty-state">
                <p>등록된 주소가 없습니다</p>
              </div>
              <div v-else class="address-list">
                <div
                  v-for="address in addressList"
                  :key="address.addressId"
                  class="address-item"
                >
                  <div class="address-content">
                    <div class="address-main">
                      <p class="address-text">
                        <span class="receiver-name">{{ address.receiverName }}</span>
                        <span class="phone-number">{{ address.phoneNumber }}</span>
                      </p>
                      <p class="address-full">
                        <span v-if="address.postalCode" class="postal-code">
                          [{{ address.postalCode }}]
                        </span>
                        {{ address.address }} {{ address.addressDetail || '' }}
                      </p>
                    </div>
                    <button
                      class="delete-btn"
                      @click="deleteAddress(address.addressId)"
                      :disabled="deletingAddressId === address.addressId"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
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
            </div>
          </section>

          <!-- 주문 내역 -->
          <section v-if="activeMenu === 'orders'" class="content-section">
            <h2 class="section-title">주문 내역</h2>
            <div class="panel">
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
                          <span class="product-price">₩{{ formatPrice(product.price) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="order-summary">
                    <p class="order-quantity">수량: {{ order.quantity }}개</p>
                    <p class="order-price">단가: ₩{{ formatPrice(order.price) }}</p>
                  </div>
                  <div class="order-footer">
                    <span class="order-total">총 결제금액: ₩{{ formatPrice(order.totalAmount) }}</span>
                    <div class="order-actions">
                      <button class="btn btn-outline btn-sm" @click="viewOrderDetail(order.orderId)">상세보기</button>
                      <button
                        v-if="canCancelOrder(order)"
                        class="btn btn-danger btn-sm"
                        @click="handleCancelOrder(order.orderId)"
                      >
                        주문 취소
                      </button>
                      <button
                        v-if="canConfirmPurchase(order)"
                        class="btn btn-primary btn-sm"
                        @click="handleConfirmPurchase(order.orderId)"
                      >
                        주문 확정
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 주문 페이징 -->
              <div v-if="orderPageInfo.totalPages > 1" class="pagination">
                <button
                  class="page-btn"
                  :disabled="orderPageInfo.currentPage === 0"
                  @click="loadOrders(orderPageInfo.currentPage - 1)"
                >
                  이전
                </button>

                <span class="page-info">
                  {{ orderPageInfo.currentPage + 1 }} / {{ orderPageInfo.totalPages }}
                </span>

                <button
                  class="page-btn"
                  :disabled="orderPageInfo.currentPage >= orderPageInfo.totalPages - 1"
                  @click="loadOrders(orderPageInfo.currentPage + 1)"
                >
                  다음
                </button>
              </div>
            </div>
          </section>

          <!-- 판매자용 주문 목록 섹션 -->
          <section v-if="activeMenu === 'seller-orders'" class="content-section">
            <h2 class="section-title">받은 주문 내역 (판매자)</h2>
            <div class="panel">
              <div v-if="loadingSellerOrders" class="loading-orders">
                <p>주문 내역을 불러오는 중...</p>
              </div>
              <div v-else-if="sellerOrderHistory.length === 0" class="empty-orders">
                <p>받은 주문 내역이 없습니다</p>
              </div>
              <div v-else class="order-list">
                <div v-for="order in sellerOrderHistory" :key="order.orderId" class="order-item">
                  <div class="order-header">
                    <div>
                      <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                      <span class="order-number">주문번호: {{ order.orderId || '-' }}</span>
                    </div>
                    <span class="order-status" :class="order.status?.toLowerCase()">{{ getStatusText(order.status) }}</span>
                  </div>
                  <div class="order-summary">
                    <p class="order-quantity">수량: {{ order.quantity }}개</p>
                    <p class="order-price">단가: ₩{{ formatPrice(order.price) }}</p>
                  </div>
                  <div class="order-footer">
                    <span class="order-total">총 결제금액: ₩{{ formatPrice(order.totalAmount) }}</span>
                    <div class="order-actions">
                      <button class="btn btn-outline btn-sm" @click="viewOrderDetail(order.orderId)">상세보기</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 판매자 주문 페이징 -->
              <div v-if="sellerOrderPageInfo.totalPages > 1" class="pagination">
                <button
                  class="page-btn"
                  :disabled="sellerOrderPageInfo.currentPage === 0"
                  @click="loadSellerOrders(sellerOrderPageInfo.currentPage - 1)"
                >
                  이전
                </button>

                <span class="page-info">
                  {{ sellerOrderPageInfo.currentPage + 1 }} / {{ sellerOrderPageInfo.totalPages }}
                </span>

                <button
                  class="page-btn"
                  :disabled="sellerOrderPageInfo.currentPage >= sellerOrderPageInfo.totalPages - 1"
                  @click="loadSellerOrders(sellerOrderPageInfo.currentPage + 1)"
                >
                  다음
                </button>
              </div>
            </div>
          </section>

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
            <div
              v-for="address in addressList"
              :key="address.addressId"
              class="address-item"
            >
              <div class="address-content">
                <div class="address-main">
                  <p class="address-text">
                    <span class="receiver-name">{{ address.receiverName }}</span>
                    <span class="phone-number">{{ address.phoneNumber }}</span>
                  </p>
                  <p class="address-full">
                    <span v-if="address.postalCode" class="postal-code">
                      [{{ address.postalCode }}]
                    </span>
                    {{ address.address }} {{ address.addressDetail || '' }}
                  </p>
                </div>

                <!-- ❌ 삭제 버튼 -->
                <button
                  class="delete-btn"
                  @click="deleteAddress(address.addressId)"
                  :disabled="deletingAddressId === address.addressId"
                >
                  ✕
                </button>
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
          <button class="close-btn" @click.stop="closeEditAddressModal">✕</button>
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
    <!-- 주문 상세 모달 -->
    <div
      v-if="showOrderDetailModal"
      class="modal-overlay"
      @click.self="closeOrderDetailModal"
    >
      <div class="order-detail-modal">
        <div class="modal-header">
          <h2>주문 상세</h2>
          <button class="close-btn" @click.stop="closeOrderDetailModal">✕</button>
        </div>

        <div v-if="selectedOrder" class="order-detail-body">

          <!-- 주문 정보 -->
          <div class="order-detail-grid">

            <!-- LEFT -->
            <div class="order-detail-col">
              <!-- 주문 정보 -->
              <section class="order-detail-section">
                <h4 class="section-title">주문 정보</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">주문번호</span>
                    <span class="value">{{ selectedOrder.orderId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">주문일자</span>
                    <span class="value">{{ formatDate(selectedOrder.createdAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">주문 상태</span>
                    <span class="value status">
                      {{ getStatusText(selectedOrder.status) }}
                    </span>
                  </div>
                </div>
              </section>

              <!-- 공동구매 정보 -->
              <section class="order-detail-section">
                <h4 class="section-title">공동구매 정보</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">제목</span>
                    <span class="value">{{ selectGroupPurchase?.title || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">카테고리</span>
                    <span class="value badge">
                      {{ selectGroupPurchase?.category || '-' }}
                    </span>
                  </div>
                  <button
                    v-if="selectGroupPurchase"
                    class="link-btn"
                    @click="goGroupPurchaseDetail(
                      selectGroupPurchase.groupPurchaseId || selectGroupPurchase.id
                    )"
                  >
                    공동구매 페이지 →
                  </button>
                </div>
              </section>
            </div>

            <!-- RIGHT -->
            <div class="order-detail-col">
              <!-- 상품 정보 -->
              <section class="order-detail-section">
                <h4 class="section-title">상품 정보</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">상품명</span>
                    <span class="value">{{ selectProduct?.name || '-' }}</span>
                  </div>
                </div>
              </section>

              <!-- 배송 정보 -->
              <section class="order-detail-section">
                <h4 class="section-title">배송 정보</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">받는 분</span>
                    <span class="value">{{ selectedOrder.receiverName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">우편번호</span>
                    <span class="value">{{ selectedOrder.postalCode }}</span>
                  </div>
                  <div class="info-item column">
                    <span class="label">주소</span>
                    <span class="value">
                      {{ selectedOrder.address }} {{ selectedOrder.addressDetail }}
                    </span>
                  </div>
                </div>
              </section>

              <!-- 결제 정보 -->
              <section class="order-detail-section">
                <h4 class="section-title">결제 정보</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">수량</span>
                    <span class="value">{{ selectedOrder.quantity }}개</span>
                  </div>
                  <div class="info-item">
                    <span class="label">단가</span>
                    <span class="value">₩{{ formatPrice(selectedOrder.price) }}</span>
                  </div>
                  <div class="info-item total">
                    <span class="label">총 결제금액</span>
                    <span class="value highlight">
                      ₩{{ formatPrice(selectedOrder.quantity * selectedOrder.price) }}
                    </span>
                  </div>
                </div>
              </section>
            </div>

          </div>

        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/auth'
import AddressSearch from '@/components/AddressSearch.vue'
import { groupPurchaseApi, productApi } from '@/api/axios'

const router = useRouter()

// 활성 메뉴 (기본값: 프로필)
const activeMenu = ref('profile')

// 메뉴 변경 시 데이터 로드
watch(activeMenu, (newMenu) => {
  if (newMenu === 'address' && addressList.value.length === 0) {
    loadAddresses()
  }
})

const userInfo = ref({
  name: '',
  email: '',
  phoneNumber: '',
  joinDate: '',
  imageUrl: '',
  point: 0
})

const formatPrice = (value) => {
  const numberValue = Number(value)
  if (isNaN(numberValue)) return '-'
  return numberValue.toLocaleString()
}

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

// 주문 상세
const showOrderDetailModal = ref(false)
const selectedOrder = ref(null)
const selectGroupPurchase = ref(null)
const selectProduct = ref(null)

const viewOrderDetail = async (orderId) => {
  try {
    // 1️⃣ 주문 상세
    const orderResponse = await authAPI.getOrderDetail(orderId)
    const order = orderResponse?.data ?? orderResponse

    if (!order) {
      alert('주문 상세 정보를 불러올 수 없습니다.')
      return
    }

    // 2️⃣ 공동구매
    let groupPurchase = null
    if (order.groupPurchaseId) {
      const gpResponse =
        await groupPurchaseApi.getGroupPurchaseById(order.groupPurchaseId)

      // ⭐⭐⭐ 여기 중요
      groupPurchase = gpResponse?.data?.data ?? gpResponse?.data ?? null
    }

    // 3 상품
    let product = null
        if (groupPurchase.productId) {
          const pResponse =
            await productApi.getProductById(groupPurchase.productId)

          // ⭐⭐⭐ 여기 중요
          product = pResponse?.data?.data ?? pResponse?.data ?? null
        }

    selectedOrder.value = order
    selectGroupPurchase.value = groupPurchase
    selectProduct.value = product
    showOrderDetailModal.value = true
  } catch (e) {
    console.error('주문 상세 조회 실패', e)
    alert('주문 상세 조회에 실패했습니다.')
  }
}

const goGroupPurchaseDetail = (groupPurchaseId) => {
  if (!groupPurchaseId) return

  router.push({
    name: 'group-purchase-detail',
    params: { id: groupPurchaseId }
  })
}

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

// const userStats = ref({
//   purchasedProducts: 23,
//   reviews: 15,
//   groupPurchases: 18
// })

const orderHistory = ref([])
const loadingOrders = ref(false)

// 판매자용 주문 목록
const sellerOrderHistory = ref([])
const loadingSellerOrders = ref(false)

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

// 주소 삭제
const deletingAddressId = ref()

const deleteAddress = async (addressId) => {
  if (!confirm('해당 주소를 삭제하시겠습니까?')) return

  try {
    deletingAddressId.value = addressId
    await authAPI.deleteAddress(addressId)

    // 현재 페이지 다시 로드
    await loadAddresses()
  } catch (e) {
    console.error('주소 삭제 실패', e)
    alert('주소 삭제에 실패했습니다.')
  } finally {
    deletingAddressId.value = null
  }
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

      // 포인트 잔액 별도 조회
      try {
        const pointResponse = await authAPI.getPoints()
        const pointData = pointResponse?.data || pointResponse
        if (pointData?.pointBalance !== undefined) {
          userInfo.value.point = pointData.pointBalance || 0
        } else if (pointData?.point !== undefined) {
          // 하위 호환
          userInfo.value.point = pointData.point || 0
        }
      } catch (pointError) {
        console.error('포인트 조회 실패:', pointError)
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
  await loadOrders(0)

  // 판매자인 경우 판매자 주문 목록도 가져오기
  if (isSeller.value) {
    await loadSellerOrders(0)
  }
})

const orderPageInfo = ref({
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 5
})

// 주문 내역 불러오기
const loadOrders = async (page = 0) => {
  loadingOrders.value = true
  try {
    const pageData = await authAPI.getOrders({
      page,
      size: orderPageInfo.value.size
    })

    orderHistory.value = pageData.content

    orderPageInfo.value = {
      currentPage: page, // ✅ 여기!!
      totalPages: pageData.totalPages,
      totalElements: pageData.totalElements,
      size: pageData.size
    }
  } catch (e) {
    console.error('주문 내역 조회 실패', e)
    orderHistory.value = []
  } finally {
    loadingOrders.value = false
  }
}

// 판매자용 주문 목록 페이징 정보
const sellerOrderPageInfo = ref({
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 5
})

// 판매자용 주문 목록 불러오기
const loadSellerOrders = async (page = 0) => {
  loadingSellerOrders.value = true
  try {
    const pageData = await authAPI.getSellerOrders({
      page,
      size: sellerOrderPageInfo.value.size,
      sort: 'createdAt,asc'
    })

    sellerOrderHistory.value = pageData.content

    sellerOrderPageInfo.value = {
      currentPage: page,
      totalPages: pageData.totalPages,
      totalElements: pageData.totalElements,
      size: pageData.size
    }
  } catch (e) {
    console.error('판매자 주문 내역 조회 실패', e)
    sellerOrderHistory.value = []
  } finally {
    loadingSellerOrders.value = false
  }
}


const closeOrderDetailModal = () => {
  showOrderDetailModal.value = false
}

// 주문 취소 가능 여부 확인 (주문 확정 전에만 가능)
const canCancelOrder = (order) => {
  if (!order || !order.status) return false

  const cancelableStatuses = ['PENDING', 'IN_PROGRESS', 'SUCCESS']
  return cancelableStatuses.includes(order.status.toUpperCase())
}

// 주문 확정 가능 여부 확인 (공동구매 성공하고 2일 후부터)
const canConfirmPurchase = (order) => {
  if (!order || !order.status) return false

  // 이미 확정된 경우 불가
  if (order.status.toUpperCase() === 'CONFIRMED' || order.status.toUpperCase() === 'COMPLETED') {
    return false
  }

  // 주문이 성공 상태이고, createdAt으로부터 2일이 지난 경우
  if (order.status.toUpperCase() === 'SUCCESS' && order.createdAt) {
    const orderDate = new Date(order.createdAt)
    const twoDaysLater = new Date(orderDate.getTime() + (2 * 24 * 60 * 60 * 1000))
    const now = new Date()
    return now >= twoDaysLater
  }

  return false
}

// 주문 취소 처리
const handleCancelOrder = async (orderId) => {
  const cancelReason = prompt('주문을 취소하시겠습니까? 취소 사유를 입력해주세요:')

  if (!cancelReason) {
    return
  }

  try {
    await authAPI.cancelOrder(orderId, cancelReason)
    alert('주문이 취소되었습니다.')

    // 주문 목록 새로고침
    await loadOrders(orderPageInfo.value.currentPage)
  } catch (error) {
    console.error('주문 취소 실패:', error)
    alert(error.response?.data?.message || '주문 취소에 실패했습니다.')
  }
}

// 주문 확정 처리
const handleConfirmPurchase = async (orderId) => {
  if (!confirm('주문을 확정하시겠습니까? 확정 후에는 취소할 수 없습니다.')) {
    return
  }

  try {
    await authAPI.confirmPurchase(orderId)
    alert('구매가 확정되었습니다.')

    // 주문 목록 새로고침
    await loadOrders(orderPageInfo.value.currentPage)
  } catch (error) {
    console.error('주문 확정 실패:', error)
    alert(error.response?.data?.message || '주문 확정에 실패했습니다.')
  }
}

</script>

<style scoped>
/* 주소 삭제 버튼 */
.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;

  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);

  color: #ffffff;
  font-size: 16px;
  font-weight: 500;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  flex-shrink: 0;
}

/* hover 효과 */
.delete-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

/* 비활성화 상태 */
.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.container h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

/* 마이페이지 레이아웃 */
.mypage-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  min-height: 600px;
}

/* 사이드바 */
.sidebar {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 32px;
}

.user-welcome {
  padding-bottom: 20px;
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 20px;
}

.user-welcome h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.user-welcome p {
  font-size: 14px;
  color: #999;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.nav-item.active {
  background: #ffffff;
  color: #0a0a0a;
  font-weight: 600;
}

.nav-item.seller-application {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
}

.nav-item.seller-application:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.nav-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

/* 컨텐츠 영역 */
.content-area {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 32px;
  min-height: 600px;
}

.content-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #2a2a2a;
}

/* 포인트 섹션 */
.point-balance {
  text-align: center;
  padding: 40px 20px;
}

.point-balance h3 {
  font-size: 18px;
  font-weight: 600;
  color: #999;
  margin: 0 0 16px 0;
}

.balance-amount {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
}

/* 주소 관리 섹션 */
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.address-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
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
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-danger {
  background: #ff4757;
  color: #ffffff;
  border: 1px solid #ff4757;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  background: #ff3838;
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


.order-detail-modal {
  position: relative;
  z-index: 1001;
}
.close-btn {
  position: relative;
  z-index: 1002;
  pointer-events: auto;
}
.modal-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.8);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;           /* ⭐ 핵심 */
  pointer-events: all;    /* ⭐ 핵심 */
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

@media (max-width: 1024px) {
  .mypage-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    top: 0;
  }
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

  .balance-amount {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 20px;
  }

  .container {
    padding: 0 16px;
  }

  .mypage-layout {
    gap: 20px;
  }

  .content-area {
    padding: 20px;
  }

  .sidebar {
    padding: 20px;
  }

  .section-title {
    font-size: 20px;
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
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
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

/* 주문상세 */
.order-detail-section {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}
.order-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.link-btn {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;

  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  color: #ffffff;

  cursor: pointer;
  transition: all 0.2s ease;
}

.link-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: #ffffff;
}

.order-detail-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #ffffff;
  border-left: 4px solid #ffffff;
  padding-left: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-item.column {
  flex-direction: column;
  align-items: flex-start;
}

.label {
  font-size: 13px;
  color: #999;
  min-width: 90px;
}

.value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.value.status {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(116, 192, 252, 0.15);
  color: #74c0fc;
  font-size: 12px;
  font-weight: 600;
}

.value.badge {
  padding: 4px 10px;
  border-radius: 12px;
  background: #2a2a2a;
  font-size: 12px;
}

.info-item.total {
  border-top: 1px dashed #2a2a2a;
  padding-top: 12px;
  margin-top: 8px;
}

.value.highlight {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
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


