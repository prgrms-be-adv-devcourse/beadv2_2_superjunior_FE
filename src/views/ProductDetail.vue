<template>
  <main v-if="product" class="product-detail-page">
    <div class="container">
      <!-- 요약 영역 -->
      <section class="summary">
        <!-- 이미지 갤러리 -->
        <div class="gallery">
          <div class="main-image">
            <img
              :src="selectedImage || product.image || product.images?.[0]"
              :alt="product.title"
              @error="handleImageError"
            />
          </div>

          <div
            v-if="product.images && product.images.length > 1"
            class="thumbnail-list"
          >
            <div
              v-for="(img, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImage === img || (!selectedImage && index === 0) }"
              @click="selectedImage = img"
            >
              <img :src="img" :alt="`${product.title} ${index + 1}`" @error="e => e.target.src = getDefaultImage()" />
            </div>
          </div>
        </div>

        <!-- 상품 정보 -->
        <!-- 상품 정보 -->
        <div class="info">
  <div class="info-top">
    <p class="category">{{ product.category }}</p>
    <h1 class="product-title">{{ product.title }}</h1>

    <!-- 제목 바로 아래 가격/재고 -->
    <p class="price-stock">
      ₩{{ product.currentPrice.toLocaleString() }}
      <span v-if="product.stock !== undefined" class="stock-inline">
        · 재고 {{ product.stock.toLocaleString() }}개 남음
      </span>
    </p>
  </div>

  <div class="info-bottom">
    <p v-if="product.subtitle" class="subtitle">
      {{ product.subtitle }}
    </p>

    <ul v-if="product.specs?.length" class="specs">
      <li v-for="spec in product.specs" :key="spec">
        ✅ {{ spec }}
      </li>
    </ul>

    <div class="actions">
      <button class="btn btn-outline" @click="goToSeller">
        판매자 보기
      </button>
    </div>
  </div>
</div>
      </section>

      <!-- 상세 영역 -->
      <section class="content">
        <!-- 상품 설명 -->
        <article class="panel description-panel">
          <h2>상품 설명</h2>
          <p>
            {{ product.description }}
          </p>
          <p class="short-description link-extra" v-if="product.originalLink">
              <a
                :href="product.originalLink"
                target="_blank"
                rel="noopener"
              >
                공식 사이트 바로가기 →
              </a>
          </p>
          <!-- 상세 설명 / 기본 설명 -->
          <div
            v-if="product.detailedDescription"
            class="detailed-description"
            v-html="product.detailedDescription"
          />
          <div v-else class="detailed-description">
            <h3>사용 안내</h3>
            <p>
              상품 수령 후 정품 인증을 진행해주시기 바랍니다.
              A/S는 구매일로부터 1년간 무상 제공됩니다.
            </p>

            <h3>배송 안내</h3>
            <p>
              결제 완료 후 1~2일 내 발송되며,
              배송 추적은 주문 내역에서 확인할 수 있습니다.
            </p>
          </div>

          <!-- 추가 정보: 등록일 / 수정일 -->
          <div
            class="detailed-description-extra"
            v-if="product.originalLink || product.createdAt || product.updatedAt"
          >
            <p v-if="product.createdAt">
              등록일: {{ formatDate(product.createdAt) }}
            </p>
            <p v-if="product.updatedAt">
              수정일: {{ formatDate(product.updatedAt) }}
            </p>
          </div>
        </article>

        <!-- 판매자 공지 -->
        <article class="panel">
          <h2>판매자 공지</h2>
          <ul class="notice-list">
            <li v-for="notice in sellerNotices" :key="notice.id">
              <span class="tag">{{ notice.type }}</span>
              <span class="title">{{ notice.title }}</span>
              <span class="date">{{ notice.date }}</span>
            </li>
          </ul>
        </article>

        <!-- FAQ -->
        <article class="panel">
          <h2>자주 묻는 질문</h2>
          <details v-for="item in sellerQna" :key="item.id">
            <summary>{{ item.question }}</summary>
            <p>{{ item.answer }}</p>
          </details>
        </article>
      </section>
    </div>
  </main>

  <!-- 상품 없음 -->
  <section v-else class="not-found container">
    <p>요청하신 상품을 찾을 수 없습니다.</p>
    <router-link class="btn btn-primary" to="/products">
      상품 목록으로 이동
    </router-link>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sellerNotices, sellerQna } from '@/data/products'
import api from '@/api/axios'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const product = ref(null)
const selectedImage = ref(null)

// 카테고리 한글 변환
const categoryMap = {
  'HOME': '생활 & 주방',
  'FOOD': '식품 & 간식',
  'HEALTH': '건강 & 헬스',
  'BEAUTY': '뷰티',
  'FASHION': '패션 & 의류',
  'ELECTRONICS': '전자 & 디지털',
  'KIDS': '유아 & 어린이',
  'HOBBY': '취미',
  'PET': '반려동물'
}

// 카테고리별 기본 이미지
const categoryImages = {
  'HOME': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  'FOOD': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'HEALTH': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'BEAUTY': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  'FASHION': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
  'KIDS': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  'HOBBY': 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400',
  'PET': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400'
}

const getDefaultImage = () => {
  return 'https://placehold.co/400x400/1a1a1a/666?text=No+Image'
}

const loadProduct = async () => {
  try {
    const response = await api.get(`/products/${props.id}`)
    const productData = response.data.data ?? response.data

    // 카테고리 한글명 변환
    const categoryKorean = categoryMap[productData.category] || productData.category || '기타'

    // 이미지 우선순위: 백엔드 이미지 > 카테고리별 기본 이미지 > 기본 플레이스홀더
    let productImage = productData.imageUrl || productData.image
    if (!productImage || productImage.trim() === '') {
      productImage = categoryImages[productData.category] || categoryImages['PET']
    }
    const productImages = productData.images || [productImage]

    product.value = {
      id: productData.productId,
      title: productData.name,
      subtitle: null,
      category: categoryKorean,
      price: productData.price,
      currentPrice: productData.price,
      originalPrice: productData.price,
      description: productData.description,
      stock: productData.stock,
      originalLink: productData.originalLink,
      sellerId: productData.sellerId,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
      image: productImage,
      images: productImages,
    }
  } catch (error) {
    console.error('상품 조회 실패:', error)
    product.value = null
  }
}

const goToSeller = () => {
  if (!product.value) return
  router.push({ name: 'seller', params: { id: product.value.sellerId } })
}

const handleImageError = (e) => {
  e.target.src = getDefaultImage()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(loadProduct)

watch(
  () => props.id,
  () => loadProduct()
)
</script>

<style scoped>
/* 기존 스타일 그대로 사용 + 설명 아래 여백만 살짝 추가 */

.product-detail-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 32px;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  opacity: 0.7;
}

.thumbnail:hover {
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: #ffffff;
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.info-top {
  text-align: left;
}

.stock-inline {
  font-weight: 400;
  color: #cccccc;
  margin-left: 6px;
}

.info-bottom {
  margin-top: auto;
}

.product-title {
  color: #ffffff;
  font-size: 32px;   /* 제목 크게 */
  font-weight: 700;
  margin: 8px 0 10px;
}

.price-stock {
  margin: 0;
  font-size: 18px;   /* 가격/재고 같은 크기 */
  font-weight: 600;
  color: #ffffff;
}

.info h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 12px 0;
}

.category {
  color: #ffffff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.subtitle {
  color: #999;
  margin-top: 8px;
}

.price-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.specs {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.specs li {
  color: #e0e0e0;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  cursor: pointer;
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

.shipping {
  font-size: 14px;
  color: #999;
}

.content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.panel {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.panel h2 {
  margin-bottom: 12px;
  color: #ffffff;
}

.description-panel {
  grid-column: span 2;
}

.short-description {
  font-size: 16px;
  line-height: 1.8;
  color: #e0e0e0;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a2a;
}

.detailed-description {
  line-height: 1.8;
  color: #e0e0e0;
}

.detailed-description h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 24px 0 12px;
}

.detailed-description h3:first-child {
  margin-top: 0;
}

.detailed-description p {
  margin-bottom: 16px;
  font-size: 15px;
  color: #e0e0e0;
}

/* 상품 설명 밑 추가 정보 여백만 살짝 */
.detailed-description-extra {
  margin-top: 16px;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
}

.notice-list .title {
  color: #ffffff;
}

.notice-list .date {
  color: #999;
}

.notice-list .tag {
  background: #2a2a2a;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

details {
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #0f0f0f;
}

details summary {
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

details p {
  color: #e0e0e0;
  margin-top: 8px;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
  color: #ffffff;
}

.not-found p {
  color: #ffffff;
  margin-bottom: 20px;
}

.link-extra {
  margin-top: 48px;  /* 두 줄 정도 간격 */
}

@media (max-width: 900px) {
  .summary,
  .content {
    grid-template-columns: 1fr;
  }

  .description-panel {
    grid-column: span 1;
  }
}

@media (max-width: 600px) {
  .actions {
    flex-direction: column;
  }
}
</style>
