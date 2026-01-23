<template>
  <main v-if="!loading && groupPurchase" class="group-purchase-edit-page">
    <div class="container">
      <div class="page-header">
        <h1>공동구매 수정</h1>
        <p>공동구매 정보를 수정하세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="edit-form">
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
                :key="product.productId"
                :value="product.productId"
              >
                {{ product.name }}
              </option>
            </select>
            <p v-if="!products.length" class="form-hint">등록된 상품이 없습니다.</p>
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
            {{ loading ? '수정 중...' : '수정 완료' }}
          </button>
        </div>
      </form>
    </div>
  </main>
  <section v-else class="not-found container">
    <p>요청하신 공동구매를 찾을 수 없습니다.</p>
    <router-link class="btn btn-primary" to="/group-purchases">공동구매 목록으로 이동</router-link>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupPurchaseApi, productApi } from '@/api/axios'

// eslint-disable-next-line no-undef
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()

const groupPurchase = ref(null)
const products = ref([])
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

// datetime-local을 ISO 8601 (OffsetDateTime) 형식으로 변환
const convertToOffsetDateTime = (datetimeLocal) => {
  if (!datetimeLocal) return null
  const date = new Date(datetimeLocal)
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

// OffsetDateTime을 datetime-local 형식으로 변환
const convertFromOffsetDateTime = (offsetDateTime) => {
  if (!offsetDateTime) return ''
  try {
    const date = new Date(offsetDateTime)
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

const loadGroupPurchase = async () => {
  loading.value = true
  try {
    // 백엔드 API 호출
    const response = await groupPurchaseApi.getGroupPurchaseById(props.id)
    console.log('공동구매 조회 성공:', response.data)

    const data = response.data.data || response.data
    groupPurchase.value = data

    // 폼에 기존 데이터 채우기
    form.value = {
      title: data.title,
      description: data.description || '',
      productId: data.productId,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      discountedPrice: data.discountedPrice || data.discountPrice || 0,
      startDate: convertFromOffsetDateTime(data.startDate),
      endDate: convertFromOffsetDateTime(data.endDate)
    }

    // 권한 체크
    const currentUserEmail = localStorage.getItem('user_email')
    const currentMemberId = localStorage.getItem('member_id')

    console.log('권한 체크:', {
      'data.sellerId': data.sellerId,
      'currentUserEmail': currentUserEmail,
      'currentMemberId': currentMemberId
    })

    // sellerId가 member_id 또는 user_email과 일치하지 않으면 권한 없음
    if (data.sellerId !== currentUserEmail && data.sellerId !== currentMemberId) {
      alert('수정 권한이 없습니다.')
      router.push({ name: 'group-purchase-detail', params: { id: props.id } })
      return
    }
  } catch (error) {
    console.error('공동구매 조회 실패:', error)
    groupPurchase.value = null
    alert('공동구매 정보를 불러오는데 실패했습니다.')
    router.push('/group-purchases')
  } finally {
    loading.value = false
  }
}

// 판매자의 상품 목록 가져오기
const fetchProducts = async () => {
  try {
    const response = await productApi.getProducts()
    console.log('상품 목록:', response.data)

    const data = response.data?.data || response.data
    const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
    products.value = list.map(product => ({
      productId: product.productId,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: 0
    }))
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    products.value = []
  }
}

const handleCancel = () => {
  router.push({ name: 'group-purchase-detail', params: { id: props.id } })
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

    console.log('수정 요청 데이터:', requestData)

    // API 호출
    const response = await groupPurchaseApi.updateGroupPurchase(props.id, requestData)
    console.log('공동구매 수정 성공:', response.data)

    alert('공동구매가 성공적으로 수정되었습니다!')
    router.push({ name: 'group-purchase-detail', params: { id: props.id } })
  } catch (error) {
    console.error('Group purchase update error:', error)
    const errorMessage = error.response?.data?.message || '공동구매 수정에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGroupPurchase()
  fetchProducts()
})

watch(() => props.id, () => {
  loadGroupPurchase()
  fetchProducts()
})
</script>

<style scoped>
.group-purchase-edit-page {
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

.edit-form {
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

.not-found {
  text-align: center;
  padding: 100px 20px;
  color: #ffffff;
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



