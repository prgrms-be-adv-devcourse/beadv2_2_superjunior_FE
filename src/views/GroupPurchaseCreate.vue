<template>
  <main class="group-purchase-create-page">
    <div class="container">
      <div class="page-header">
        <h1>공동구매 생성</h1>
        <p>새로운 공동구매를 생성하세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="create-form">
        <div class="form-section">
          <h3>기본 정보</h3>
          <div class="form-group">
            <label for="title">제목 *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="공동구매 제목을 입력하세요 (최대 100자)"
              required
              maxlength="100"
            />
          </div>
          <div class="form-group">
            <label for="description">설명</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="5"
              placeholder="공동구매에 대한 상세한 설명을 작성해주세요"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>상품 선택</h3>
          <div class="form-group">
            <label for="productId">상품 선택 *</label>
            <select id="productId" v-model="form.productId" required>
              <option value="">상품을 선택하세요</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} (재고: {{ product.stock }})
              </option>
            </select>
            <p v-if="!products.length" class="form-hint">등록된 상품이 없습니다. 먼저 상품을 등록해주세요.</p>
          </div>
          <div v-if="selectedProduct" class="selected-product-info">
            <div class="info-row">
              <span class="info-label">선택한 상품:</span>
              <span class="info-value">{{ selectedProduct.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">원가:</span>
              <span class="info-value">₩{{ selectedProduct.price.toLocaleString() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">재고:</span>
              <span class="info-value">{{ selectedProduct.stock }}개</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>수량 및 가격 정보</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="minQuantity">최소 수량 *</label>
              <input
                id="minQuantity"
                v-model.number="form.minQuantity"
                type="number"
                placeholder="예: 10"
                required
                min="1"
              />
            </div>
            <div class="form-group">
              <label for="maxQuantity">최대 수량 *</label>
              <input
                id="maxQuantity"
                v-model.number="form.maxQuantity"
                type="number"
                placeholder="예: 100"
                required
                min="1"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="discountedPrice">할인가 *</label>
            <input
              id="discountedPrice"
              v-model.number="form.discountedPrice"
              type="number"
              placeholder="할인된 가격을 입력하세요"
              required
              min="0"
            />
            <p v-if="selectedProduct && form.discountedPrice" class="discount-preview">
              <span v-if="form.discountedPrice < selectedProduct.price">
                할인율: {{ Math.round((1 - form.discountedPrice / selectedProduct.price) * 100) }}%
                (₩{{ (selectedProduct.price - form.discountedPrice).toLocaleString() }} 할인)
              </span>
              <span v-else class="warning-text">
                할인가가 원가보다 높습니다
              </span>
            </p>
          </div>
        </div>

        <div class="form-section">
          <h3>기간 정보</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">시작일 *</label>
              <input
                id="startDate"
                v-model="form.startDate"
                type="datetime-local"
                required
              />
            </div>
            <div class="form-group">
              <label for="endDate">종료일 *</label>
              <input
                id="endDate"
                v-model="form.endDate"
                type="datetime-local"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleCancel">취소</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
            {{ loading ? '생성 중...' : '공동구매 생성하기' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupPurchaseApi, productApi } from '@/api/axios'

const router = useRouter()

const form = ref({
  title: '',
  description: '',
  productId: '',
  minQuantity: null,
  maxQuantity: null,
  discountedPrice: null,
  startDate: '',
  endDate: ''
})

const products = ref([])
const loading = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.productId &&
    form.value.minQuantity &&
    form.value.maxQuantity &&
    form.value.discountedPrice !== null &&
    form.value.startDate &&
    form.value.endDate &&
    form.value.minQuantity <= form.value.maxQuantity
  )
})

// 선택된 상품 정보
const selectedProduct = computed(() => {
  if (!form.value.productId) return null
  return products.value.find(p => p.id === form.value.productId)
})

const handleCancel = () => {
  if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
    router.push('/seller')
  }
}

// datetime-local을 ISO 8601 (OffsetDateTime) 형식으로 변환
const convertToOffsetDateTime = (datetimeLocal) => {
  if (!datetimeLocal) return null
  const date = new Date(datetimeLocal)
  // ISO 8601 형식으로 변환 (예: 2025-12-15T00:00:00+09:00)
  const offset = -date.getTimezoneOffset()
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0')
  const offsetSign = offset >= 0 ? '+' : '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  if (form.value.minQuantity > form.value.maxQuantity) {
    alert('최소 수량은 최대 수량보다 작거나 같아야 합니다.')
    return
  }

  // 시작일이 현재보다 과거인지 확인
  const startDate = new Date(form.value.startDate)
  const now = new Date()
  if (startDate < now) {
    alert('시작일은 현재 또는 미래여야 합니다.')
    return
  }

  // 종료일이 시작일보다 늦은지 확인
  const endDate = new Date(form.value.endDate)
  if (endDate <= startDate) {
    alert('종료일은 시작일보다 늦어야 합니다.')
    return
  }

  loading.value = true
  try {
    // 백엔드 API 스펙에 맞게 데이터 구성
    const requestData = {
      minQuantity: form.value.minQuantity,
      maxQuantity: form.value.maxQuantity,
      title: form.value.title,
      description: form.value.description || null,
      discountedPrice: form.value.discountedPrice,
      startDate: convertToOffsetDateTime(form.value.startDate),
      endDate: convertToOffsetDateTime(form.value.endDate),
      productId: form.value.productId
    }

    console.log('요청 데이터:', requestData)

    // API 호출
    const response = await groupPurchaseApi.createGroupPurchase(requestData)
    console.log('공동구매 생성 성공:', response.data)

    alert('공동구매가 성공적으로 생성되었습니다!')
    router.push('/group-purchases')
  } catch (error) {
    console.error('Group purchase creation error:', error)
    const errorMessage = error.response?.data?.message || '공동구매 생성에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// 판매자의 상품 목록 가져오기
const fetchProducts = async () => {
  try {
    // 내 상품 목록 조회 API 호출 (판매자 전용)
    const response = await productApi.getMyProducts()
    console.log('내 상품 목록:', response.data)

    // ProductDetailInfo 형식을 선택 옵션에 맞게 변환
    let productList = []
    if (response.data && response.data.data) {
      productList = response.data.data
    } else if (Array.isArray(response.data)) {
      productList = response.data
    }

    // 백엔드 ProductDetailInfo를 form에 맞게 변환
    products.value = productList.map(p => ({
      id: p.productId,
      name: p.name,
      stock: p.stock,
      price: p.price,
      category: p.category
    }))

    console.log('변환된 상품 목록:', products.value)
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    const errorMessage = error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.'
    alert(errorMessage)
    products.value = []
  }
}

onMounted(() => {
  // 로그인 체크
  const token = localStorage.getItem('access_token')
  if (!token) {
    alert('로그인이 필요합니다.')
    router.push('/login')
    return
  }

  // 판매자 권한 체크
  const role = localStorage.getItem('user_role')
  if (role !== 'SELLER') {
    alert('판매자만 공동구매를 생성할 수 있습니다.')
    router.push('/seller/application')
    return
  }

  fetchProducts()
})
</script>

<style scoped>
.group-purchase-create-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 900px;
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
  color: #999;
  font-size: 15px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 14px 16px;
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  font-size: 15px;
  color: #ffffff;
  transition: border-color 0.2s;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #666;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ffffff;
  background: #151515;
}

.form-group select {
  cursor: pointer;
}

.form-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.selected-product-info {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
}

.discount-preview {
  font-size: 13px;
  color: #51cf66;
  font-weight: 600;
  margin-top: 4px;
}

.warning-text {
  color: #ff6b6b;
}

.discount-info {
  padding: 12px;
  background: #0f0f0f;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 600;
  display: flex;
  gap: 16px;
}

.image-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
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
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>



