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
            <label for="purchaseImages">대표 사진</label>
            <input
              id="purchaseImages"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              @change="handleImageFilesChange"
            />
            <p class="form-hint">첫 번째 이미지가 대표 사진으로 사용됩니다 (jpg, png, webp / 최대 10MB)</p>
            <p v-if="imageError" class="form-error">{{ imageError }}</p>
          </div>
          <div v-if="imagePreviews.length" class="image-preview-grid">
            <div v-for="(preview, index) in imagePreviews" :key="preview" class="image-preview-item">
              <img :src="preview" alt="공동구매 이미지 미리보기" />
              <button type="button" class="btn btn-outline btn-sm" @click="removeImage(index)">
                삭제
              </button>
            </div>
          </div>
          <p v-if="imageUploading" class="upload-status">이미지 업로드 중...</p>
          <div class="form-group">
            <label for="description">설명</label>
            <div class="tiptap-toolbar">
              <button type="button" class="btn btn-outline btn-sm" @click="triggerDescriptionImage">
                이미지 첨부
              </button>
              <input
                ref="descriptionImageInput"
                class="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleDescriptionImageChange"
              />
            </div>
            <EditorContent :editor="editor" class="tiptap-editor" />
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
                {{ product.name }} - ₩{{ (product.price || 0).toLocaleString() }}
              </option>
            </select>
            <p v-if="loadingProducts" class="form-hint">상품 목록을 불러오는 중...</p>
            <p v-else-if="!products.length" class="form-hint">등록된 상품이 없습니다. 먼저 상품을 등록해주세요.</p>
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
          <p class="form-hint">공동구매 오픈은 시작일 / 시작시간에 따라 자동으로 오픈됩니다.</p>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">시작일 *</label>
              <input
                id="startDate"
                v-model="form.startDate"
                type="date"
                required
                :min="minDateStr"
                class="date-input"
              />
            </div>
            <div class="form-group">
              <label for="startTime">시작 시간 *</label>
              <div class="time-input-group">
                <select
                  id="startTimePeriod"
                  v-model="form.startTimePeriod"
                  required
                  class="time-period-select"
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
                <select
                  id="startTime"
                  v-model="form.startTime"
                  required
                  class="time-input"
                >
                  <option value="00:00">00:00</option>
                  <option value="01:00">01:00</option>
                  <option value="02:00">02:00</option>
                  <option value="03:00">03:00</option>
                  <option value="04:00">04:00</option>
                  <option value="05:00">05:00</option>
                  <option value="06:00">06:00</option>
                  <option value="07:00">07:00</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                </select>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="endDate">종료일 *</label>
              <input
                id="endDate"
                v-model="form.endDate"
                type="date"
                required
                :min="endDateMinStr"
                class="date-input"
              />
            </div>
            <div class="form-group">
              <label for="endTime">종료 시간 *</label>
              <div class="time-input-group">
                <select
                  id="endTimePeriod"
                  v-model="form.endTimePeriod"
                  required
                  class="time-period-select"
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
                <select
                  id="endTime"
                  v-model="form.endTime"
                  required
                  class="time-input"
                >
                  <option value="00:00">00:00</option>
                  <option value="01:00">01:00</option>
                  <option value="02:00">02:00</option>
                  <option value="03:00">03:00</option>
                  <option value="04:00">04:00</option>
                  <option value="05:00">05:00</option>
                  <option value="06:00">06:00</option>
                  <option value="07:00">07:00</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                </select>
              </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api, { groupPurchaseApi, productApi } from '@/api/axios'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const router = useRouter()
const route = useRoute()

// 오늘 날짜를 Date 객체로 반환
const getTodayDate = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const form = ref({
  title: '',
  description: '',
  productId: '',
  minQuantity: null,
  maxQuantity: null,
  discountedPrice: null,
  startDate: getTodayDate(),
  startTime: '00:00',
  startTimePeriod: 'AM',
  endDate: getTodayDate(),
  endTime: '00:00',
  endTimePeriod: 'AM'
})


const products = ref([])
const loading = ref(false)
const loadingProducts = ref(false)
const imageUrls = ref([])
const imagePreviews = ref([])
const imageUploading = ref(false)
const imageError = ref('')
const descriptionImageInput = ref(null)
const pendingImages = ref([])

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.productId &&
    form.value.minQuantity &&
    form.value.maxQuantity &&
    form.value.discountedPrice !== null &&
    form.value.startDate &&
    form.value.startTime &&
    form.value.startTimePeriod &&
    form.value.endDate &&
    form.value.endTime &&
    form.value.endTimePeriod &&
    form.value.minQuantity <= form.value.maxQuantity
  )
})

// 선택된 상품 정보
const selectedProduct = computed(() => {
  if (!form.value.productId) return null
  return products.value.find(p => p.productId === form.value.productId)
})

const getReturnPath = () => {
  const from = route.query.from
  if (typeof from !== 'string') return null
  const rawPath = decodeURIComponent(from)
  if (rawPath.startsWith('/')) {
    return rawPath
  }
  return null
}

const goBackOrFallback = () => {
  const returnPath = getReturnPath()
  if (returnPath) {
    router.push(returnPath)
    return
  }
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/seller')
}

const handlePopState = () => {
  const returnPath = getReturnPath()
  if (returnPath) {
    router.replace(returnPath)
  }
}

const handleCancel = () => {
  if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
    goBackOrFallback()
  }
}

const triggerDescriptionImage = () => {
  descriptionImageInput.value?.click()
}

const uploadPurchaseImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/purchases/images', formData)
  const data = response?.data?.data || response?.data || {}
  if (!data.imageUrl) {
    throw new Error('이미지 업로드에 실패했습니다.')
  }

  return data.imageUrl
}

const deletePurchaseImage = async (imageUrl) => {
  if (!imageUrl) return
  try {
    await api.delete('/purchases/images', { params: { imageUrl } })
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
  }
}

let editor = null
const insertImage = (imageUrl) => {
  if (!editor?.value) return
  editor.value.chain().focus().setImage({ src: imageUrl }).run()
}

const queueDescriptionImage = (file) => {
  const localUrl = URL.createObjectURL(file)
  pendingImages.value.push({ file, localUrl })
  insertImage(localUrl)
}

const handleDescriptionImageChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
    alert('이미지는 jpg, png, webp 형식이며 10MB 이하만 가능합니다.')
    return
  }

  queueDescriptionImage(file)
}

const handleDescriptionFiles = async (files = []) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const imageFiles = files.filter(file => allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024)
  if (!imageFiles.length) return false
  for (const file of imageFiles) {
    queueDescriptionImage(file)
  }
  return true
}

editor = useEditor({
  extensions: [StarterKit, Image],
  content: '',
  editorProps: {
    handleDrop: (view, event) => {
      const files = Array.from(event.dataTransfer?.files || [])
      if (!files.length) return false
      event.preventDefault()
      handleDescriptionFiles(files)
      return true
    },
    handlePaste: (view, event) => {
      const files = Array.from(event.clipboardData?.files || [])
      if (!files.length) return false
      event.preventDefault()
      handleDescriptionFiles(files)
      return true
    }
  }
})

const handleImageFilesChange = async (event) => {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const invalidFile = files.find(
    file => !allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024
  )
  if (invalidFile) {
    imageError.value = '이미지는 jpg, png, webp 형식이며 10MB 이하만 가능합니다.'
    event.target.value = ''
    return
  }

  imageError.value = ''
  imageUploading.value = true

  try {
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file)
      imagePreviews.value.push(previewUrl)

      const imageUrl = await uploadPurchaseImage(file)
      imageUrls.value.push(imageUrl)
    }
  } catch (error) {
    console.error('공동구매 이미지 업로드 실패:', error)
    imageError.value = '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
  } finally {
    imageUploading.value = false
  }
}

const removeImage = (index) => {
  const preview = imagePreviews.value[index]
  if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
  imagePreviews.value.splice(index, 1)
  const removedUrl = imageUrls.value.splice(index, 1)[0]
  if (removedUrl && removedUrl.startsWith('http')) {
    deletePurchaseImage(removedUrl)
  }
}


// 오전/오후와 시간을 합쳐서 24시간 형식으로 변환
const convertTo24Hour = (timeStr, period) => {
  if (!timeStr) return '00:00'
  
  const [hours, minutes] = timeStr.split(':').map(Number)
  let hour24 = hours
  
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0
  }
  
  return `${String(hour24).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`
}

// date와 time을 합쳐서 ISO 8601 (OffsetDateTime) 형식으로 변환
const convertToOffsetDateTime = (dateStr, timeStr, period) => {
  if (!dateStr || !timeStr) return null
  
  // 오전/오후를 24시간 형식으로 변환
  const time24 = convertTo24Hour(timeStr, period)
  
  // date와 time을 합쳐서 Date 객체 생성
  const dateTimeStr = `${dateStr}T${time24}:00`
  const date = new Date(dateTimeStr)
  
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

  // 시작일과 시간을 합쳐서 Date 객체 생성
  const startTime24 = convertTo24Hour(form.value.startTime, form.value.startTimePeriod)
  const startDateTimeStr = `${form.value.startDate}T${startTime24}:00`
  const startDate = new Date(startDateTimeStr)
  const now = new Date()
  if (startDate < now) {
    alert('시작일시는 현재 또는 미래여야 합니다.')
    return
  }

  // 종료일과 시간을 합쳐서 Date 객체 생성
  const endTime24 = convertTo24Hour(form.value.endTime, form.value.endTimePeriod)
  const endDateTimeStr = `${form.value.endDate}T${endTime24}:00`
  const endDate = new Date(endDateTimeStr)
  if (endDate <= startDate) {
    alert('종료일시는 시작일시보다 늦어야 합니다.')
    return
  }

  loading.value = true
  try {
    // 백엔드 API 스펙에 맞게 데이터 구성
    form.value.description = editor?.value?.getHTML() || ''
    let descriptionHtml = form.value.description
    if (pendingImages.value.length) {
      for (const pending of pendingImages.value) {
        if (!descriptionHtml.includes(pending.localUrl)) continue
        const uploadedUrl = await uploadPurchaseImage(pending.file)
        descriptionHtml = descriptionHtml.split(pending.localUrl).join(uploadedUrl)
        URL.revokeObjectURL(pending.localUrl)
      }
      pendingImages.value = pendingImages.value.filter(
        item => descriptionHtml.includes(item.localUrl)
      )
    }
    form.value.description = descriptionHtml || ''
    const requestData = {
      minQuantity: form.value.minQuantity,
      maxQuantity: form.value.maxQuantity,
      title: form.value.title,
      description: form.value.description || null,
      discountedPrice: form.value.discountedPrice,
      startDate: convertToOffsetDateTime(form.value.startDate, form.value.startTime, form.value.startTimePeriod),
      endDate: convertToOffsetDateTime(form.value.endDate, form.value.endTime, form.value.endTimePeriod),
      productId: form.value.productId,
      imageUrl: imageUrls.value[0] || null
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
  loadingProducts.value = true
  try {
    const response = await productApi.getProducts()
    const data = response.data?.data || response.data
    const productList = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []

    products.value = productList.map(p => ({
      productId: p.productId,
      name: p.name,
      stock: 0,
      price: p.price,
      category: p.category
    }))

    console.log('변환된 상품 목록:', products.value)
  } catch (error) {
    console.error('상품 목록 조회 실패:', error)
    products.value = []
    alert(error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.')
  } finally {
    loadingProducts.value = false
  }
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
  // 로그인 체크
  const memberId = localStorage.getItem('member_id')
  if (!memberId) {
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

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
  pendingImages.value.forEach(item => URL.revokeObjectURL(item.localUrl))
  pendingImages.value = []
  editor?.value?.destroy()
})
</script>

<style scoped>
.group-purchase-create-page {
  background: var(--bg);
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
  color: var(--text);
  margin-bottom: 8px;
}

.page-header p {
  color: var(--muted);
  font-size: 15px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
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
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  transition: border-color 0.2s;
}

.tiptap-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tiptap-editor {
  min-height: 220px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--bg);
  color: var(--text);
  line-height: 1.8;
  overflow-y: auto;
}

.tiptap-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 190px;
  font-size: 18px;
  text-align: center;
}

.tiptap-editor :deep(img) {
  max-width: 100%;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* v-calendar DatePicker 스타일 */
.date-input {
  width: 100%;
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.9;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--muted);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--text);
  background: #151515;
}

.form-group select {
  cursor: pointer;
}

.time-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.time-period-select {
  padding: 14px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  transition: border-color 0.2s;
  cursor: pointer;
  min-width: 80px;
}

.time-period-select:focus {
  outline: none;
  border-color: var(--text);
  background: #151515;
}

.time-input {
  flex: 1;
  padding: 14px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  transition: border-color 0.2s;
  cursor: pointer;
}

.time-input:focus {
  outline: none;
  border-color: var(--text);
  background: #151515;
}

.form-hint {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

.selected-product-info {
  background: var(--bg);
  border: 1px solid var(--border);
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
  color: var(--muted);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text);
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
  background: var(--bg);
  border-radius: 8px;
  color: var(--text);
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

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.image-preview-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}

.image-preview-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-status {
  margin-top: 12px;
  color: var(--muted);
  font-size: 13px;
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
  color: var(--text);
}

.btn-outline:hover {
  background: var(--hover);
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

/* 라이트 모드 스타일 */
body.theme-light .group-purchase-create-page {
  background: #ffffff !important;
}

body.theme-light .page-header h1 {
  color: #0f172a !important;
}

body.theme-light .page-header p {
  color: #666666 !important;
}

body.theme-light .form-section {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .form-section h3 {
  color: #0f172a !important;
}

body.theme-light .form-group label {
  color: #0f172a !important;
}

body.theme-light .form-group input,
body.theme-light .form-group select,
body.theme-light .form-group textarea {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .form-group input:focus,
body.theme-light .form-group select:focus,
body.theme-light .form-group textarea:focus {
  border-color: #0f172a !important;
  background: #ffffff !important;
}

body.theme-light .form-group input::placeholder,
body.theme-light .form-group textarea::placeholder {
  color: #999999 !important;
}

body.theme-light .tiptap-editor {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .tiptap-editor:focus {
  border-color: #0f172a !important;
  background: #ffffff !important;
}

body.theme-light .time-period-select,
body.theme-light .time-input {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .time-period-select:focus,
body.theme-light .time-input:focus {
  border-color: #0f172a !important;
  background: #ffffff !important;
}

body.theme-light .date-input::-webkit-calendar-picker-indicator {
  filter: invert(0) !important;
}

body.theme-light .form-hint {
  color: #666666 !important;
}

body.theme-light .selected-product-info {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .info-label {
  color: #666666 !important;
}

body.theme-light .info-value {
  color: #0f172a !important;
}

body.theme-light .image-preview-item {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

body.theme-light .upload-status {
  color: #666666 !important;
}

body.theme-light .btn-outline {
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .btn-outline:hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

body.theme-light .btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
}

body.theme-light .btn-primary:hover:not(:disabled) {
  background: #1e293b !important;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2) !important;
}
</style>



