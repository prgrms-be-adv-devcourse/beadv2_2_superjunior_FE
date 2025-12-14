<template>
  <main class="register-page">
    <div class="container">
      <div class="page-header">
        <h1>상품 등록</h1>
        <p>새로운 공동구매 상품을 등록하세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="register-form">
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
            {{ loading ? '등록 중...' : '상품 등록하기' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/axios'

const router = useRouter()

const form = ref({
  title: '',
  category: '',
  currentPrice: null,
  stock: null,
  originalUrl: '',
  description: ''
})

const loading = ref(false)

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
  if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
    router.push('/seller')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  loading.value = true
  try {
    // 백엔드 API 스펙에 맞게 데이터 구성
    const requestData = {
      name: form.value.title,
      price: form.value.currentPrice,
      category: form.value.category,
      description: form.value.description,
      stock: form.value.stock,
      originalUrl: form.value.originalUrl
    }

    // API 호출
    const response = await productApi.createProduct(requestData)
    console.log('상품 등록 성공:', response.data)

    alert('상품이 성공적으로 등록되었습니다!')
    router.push('/seller/products')
  } catch (error) {
    console.error('Product registration error:', error)
    const errorMessage = error.response?.data?.message || '상품 등록에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    loading.value = false
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
    alert('판매자만 상품을 등록할 수 있습니다.')
    router.push('/seller/application')
  }
})
</script>

<style scoped>
.register-page {
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

.register-form {
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




