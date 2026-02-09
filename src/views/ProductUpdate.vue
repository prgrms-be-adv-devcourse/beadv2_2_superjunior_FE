<template>
  <main class="update-page">
    <div class="container">
      <div class="page-header">
        <h1>상품 수정</h1>
        <p>등록된 상품 정보를 수정하세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="update-form">
        <div class="form-section">
          <h3>기본 정보</h3>
          <div class="form-group">
            <label for="title">상품명 *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="상품명을 입력하세요"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="category">카테고리 *</label>
              <select id="category" v-model="form.category" required>
                <option value="">카테고리를 선택하세요</option>
                <option value="HOME">생활 & 주방</option>
                <option value="FOOD">식품 & 간식</option>
                <option value="HEALTH">건강 & 헬스</option>
                <option value="BEAUTY">뷰티</option>
                <option value="FASHION">패션 & 의류</option>
                <option value="ELECTRONICS">전자 & 디지털</option>
                <option value="KIDS">유아 & 어린이</option>
                <option value="HOBBY">취미</option>
                <option value="PET">반려동물</option>
              </select>
            </div>
            <div class="form-group">
              <label for="stock">재고 수량 *</label>
              <input
                id="stock"
                v-model.number="form.stock"
                type="number"
                placeholder="재고 수량"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>가격 정보</h3>
          <div class="form-group">
            <label for="currentPrice">상품 가격 *</label>
            <input
              id="currentPrice"
              v-model.number="form.currentPrice"
              type="number"
              placeholder="상품 가격을 입력하세요"
              required
              min="0"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>상품 이미지</h3>
          <div class="form-group">
            <label for="productImage">상품 이미지</label>
            <input
              id="productImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleImageChange"
            />
            <p class="form-hint">jpg, png, webp / 최대 10MB</p>
            <p v-if="imageError" class="form-error">{{ imageError }}</p>
          </div>
          <div v-if="imagePreviewUrl" class="image-preview">
            <img :src="imagePreviewUrl" alt="상품 이미지 미리보기" />
            <button type="button" class="btn btn-outline btn-sm" @click="clearImage">
              이미지 제거
            </button>
          </div>
          <div v-if="form.imageUrl && !imagePreviewUrl" class="current-image">
            <p class="form-hint">현재 이미지:</p>
            <img :src="form.imageUrl" alt="현재 상품 이미지" class="current-image-preview" />
          </div>
          <p v-if="form.imageUrl && !imageUploading && !imagePreviewUrl" class="upload-status success">
            기존 이미지 사용 중
          </p>
          <p v-if="imageUploading" class="upload-status">이미지 업로드 중...</p>
        </div>

        <div class="form-section">
          <h3>상품 원본 링크</h3>
          <div class="form-group">
            <label for="originalUrl">상품 원본 URL *</label>
            <input
              id="originalUrl"
              type="url"
              v-model="form.originalUrl"
              placeholder="상품 원본 페이지 URL을 입력하세요"
              required
            />
          </div>
        </div>

        <div class="form-section">
          <h3>상품 설명</h3>
          <div class="form-group">
            <label for="description">상품 설명 *</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="8"
              placeholder="상품에 대한 상세한 설명을 작성해주세요"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleCancel">취소</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
            {{ loading ? '수정 중...' : '상품 수정하기' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import api, { productApi } from '@/api/axios'

const route = useRoute()
const router = useRouter()
const productId = route.params.productId

const form = ref({
  title: '',
  category: '',
  currentPrice: null,
  stock: null,
  originalUrl: '',
  description: '',
  imageUrl: ''
})

const loading = ref(false)
const selectedImageFile = ref(null)
const imagePreviewUrl = ref('')
const imageUploading = ref(false)
const imageError = ref('')

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.category &&
    form.value.currentPrice &&
    form.value.stock !== null &&
    form.value.originalUrl &&
    form.value.description
  )
})

const handleCancel = () => {
  if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
    router.push('/seller/products')
  }
}

const handleImageChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    imageError.value = 'jpg, png, webp 형식만 업로드할 수 있습니다.'
    event.target.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    imageError.value = '이미지 크기는 10MB를 초과할 수 없습니다.'
    event.target.value = ''
    return
  }

  imageError.value = ''
  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)

  try {
    await uploadProductImage()
  } catch (error) {
    console.error('이미지 업로드 실패:', error)
    imageError.value = '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
  }
}

const clearImage = () => {
  selectedImageFile.value = null
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  imagePreviewUrl.value = ''
  form.value.imageUrl = ''
  imageError.value = ''
}

const requestPresignedUrl = async (file) => {
  const response = await api.post('/products/images/presigned-url', {
    fileName: file.name,
    contentType: file.type
  })
  const data = response?.data?.data || response?.data || {}
  return {
    presignedUrl: data.presignedUrl,
    imageUrl: data.imageUrl
  }
}

const uploadToS3 = async (file, presignedUrl) => {
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type
    }
  })
}

const uploadProductImage = async () => {
  if (!selectedImageFile.value) return
  imageUploading.value = true
  try {
    const { presignedUrl, imageUrl } = await requestPresignedUrl(selectedImageFile.value)
    if (!presignedUrl || !imageUrl) {
      throw new Error('Presigned URL 발급에 실패했습니다.')
    }
    await uploadToS3(selectedImageFile.value, presignedUrl)
    form.value.imageUrl = imageUrl
  } finally {
    imageUploading.value = false
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const requestData = {
      name: form.value.title,
      price: form.value.currentPrice,
      category: form.value.category,
      description: form.value.description,
      stock: form.value.stock,
      originalLink: form.value.originalUrl
    }

    // 이미지가 업로드된 경우에만 imageUrl 추가
    if (form.value.imageUrl) {
      requestData.imageUrl = form.value.imageUrl
    }

    const response = await productApi.updateProduct(productId, requestData)
    console.log('상품 수정 성공:', response.data)
    alert('상품이 성공적으로 수정되었습니다!')
    router.push('/seller/products')
  } catch (error) {
    console.error('Product update error:', error)
    const errorMessage = error.response?.data?.message || '상품 수정에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await productApi.getProductById(productId)
    const product = response.data?.data || response.data

    form.value = {
      title: product.name || '',
      category: product.category || '',
      currentPrice: product.price ?? null,
      stock: product.stock ?? null,
      originalUrl: product.originalUrl || product.originalLink || '',
      description: product.description || '',
      imageUrl: product.imageUrl || product.image || ''
    }
  } catch (error) {
    console.error('상품 정보 불러오기 실패:', error)
    alert('상품 정보를 불러오지 못했습니다.')
    router.push('/seller/products')
  }
})
</script>

<style scoped>
  .update-page {
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
  
  .update-form {
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
  
  .discount-info {
    padding: 12px;
    background: #0f0f0f;
    border-radius: 8px;
    color: #ffffff;
    font-weight: 600;
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
  
  .image-input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .image-input-row input {
    flex: 1;
  }
  
  .btn-remove {
    padding: 14px 20px;
    background: transparent;
    border: 1px solid #3a3a3a;
    border-radius: 12px;
    color: #ff6b6b;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  
  .btn-remove:hover {
    background: #2a2a2a;
    border-color: #ff6b6b;
  }
  
  .btn-add-image {
    padding: 12px 20px;
    background: transparent;
    border: 2px dashed #3a3a3a;
    border-radius: 12px;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-add-image:hover {
    border-color: #ffffff;
    background: #1a1a1a;
  }
  
  .form-hint {
    font-size: 12px;
    color: #666;
    margin-top: -4px;
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
  
  .form-hint {
    font-size: 12px;
    color: #666;
    margin-top: -4px;
  }

  .form-error {
    font-size: 12px;
    color: #ff6b6b;
    margin-top: -4px;
  }

  .image-preview {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .image-preview img {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 12px;
    border: 2px solid #2a2a2a;
  }

  .current-image {
    margin-top: 16px;
  }

  .current-image-preview {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 12px;
    border: 2px solid #2a2a2a;
    margin-top: 8px;
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 14px;
  }

  .upload-status {
    font-size: 13px;
    color: #999;
    margin-top: 8px;
  }

  .upload-status.success {
    color: #51cf66;
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
  body.theme-light .update-page {
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

  body.theme-light .form-hint {
    color: #666666 !important;
  }

  body.theme-light .form-error {
    color: #ff6b6b !important;
  }

  body.theme-light .image-preview img,
  body.theme-light .current-image-preview {
    border-color: #e2e8f0 !important;
  }

  body.theme-light .upload-status {
    color: #666666 !important;
  }

  body.theme-light .upload-status.success {
    color: #51cf66 !important;
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
  