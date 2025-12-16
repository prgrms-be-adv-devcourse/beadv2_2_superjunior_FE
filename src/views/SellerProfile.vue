<template>
  <main class="seller-profile-page">
    <div class="container">
      <section class="seller-hero">
        <div class="hero-content">
          <div class="seller-info">
            <h1>{{ seller.name || '판매자' }}</h1>
          </div>
        </div>
      </section>

      <section class="seller-products-section">
        <h2>공동구매 목록</h2>
        <div v-if="sellerProducts.length === 0" class="empty-state">
          <p>등록된 공동구매가 없습니다.</p>
        </div>
        <div v-else class="products-grid">
          <div
            v-for="product in sellerProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <img :src="product.image" :alt="product.title" />
            </div>
            <div class="product-info">
              <p class="product-category">{{ product.category }}</p>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-info">
                <span class="current-price">₩{{ product.currentPrice?.toLocaleString() }}</span>
              </div>
              <div v-if="product.status" class="product-status">
                상태: {{ product.status }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="seller-notices-section">
        <h2>공지 사항</h2>
        <ul class="notice-list">
          <li v-for="notice in notices" :key="notice.id" class="notice-item">
            <span class="notice-tag">{{ notice.type }}</span>
            <span class="notice-title">{{ notice.title }}</span>
            <span class="notice-date">{{ notice.date }}</span>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const seller = ref({ name: '' })
const sellerProducts = ref([])

// 더미 공지사항 데이터
const notices = ref([
  { id: 1, type: '공지', title: '신규 상품이 등록되었습니다', date: '2024-12-15' },
  { id: 2, type: '안내', title: '배송 일정 안내', date: '2024-12-10' },
  { id: 3, type: '이벤트', title: '할인 이벤트 진행 중', date: '2024-12-05' }
])

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

const loadProducts = async () => {
  try {
    // 공동구매 검색 API를 사용해서 특정 판매자의 공동구매 조회
    const response = await api.get(`/searches/purchase/search/seller`, {
      params: {
        sellerId: props.id,
        keyword: '',
        category: '',
        page: 0,
        size: 100
      }
    })
    const productsData = response.data.data ?? response.data
    const productsList = Array.isArray(productsData) ? productsData : productsData.content ?? []

    // 첫 번째 공동구매에서 판매자 이름 가져오기
    if (productsList.length > 0) {
      seller.value = {
        name: productsList[0].sellerName || productsList[0].seller?.name || '판매자'
      }
    }

    sellerProducts.value = productsList.map(purchase => {
      const categoryKorean = categoryMap[purchase.category] || purchase.category || '기타'
      let purchaseImage = purchase.imageUrl || purchase.image
      if (!purchaseImage || purchaseImage.trim() === '') {
        purchaseImage = categoryImages[purchase.category] || categoryImages['PET']
      }

      return {
        id: purchase.purchaseId || purchase.id,
        title: purchase.title || purchase.name,
        category: categoryKorean,
        price: purchase.targetPrice || purchase.price,
        currentPrice: purchase.targetPrice || purchase.price,
        image: purchaseImage,
        status: purchase.status
      }
    })
  } catch (error) {
    console.error('판매자 공동구매 목록 조회 실패:', error)
    sellerProducts.value = []
  }
}

const goToProduct = (id) => {
  router.push({ name: 'group-purchase-detail', params: { id } })
}

onMounted(() => {
  loadProducts()
})

watch(
  () => props.id,
  () => {
    loadProducts()
  }
)
</script>

<style scoped>
.seller-profile-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.seller-hero {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 32px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.seller-info h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.seller-products-section,
.seller-notices-section {
  margin-bottom: 32px;
}

.seller-products-section h2,
.seller-notices-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a0a0a0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #4a4a4a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.product-image-wrapper {
  width: 100%;
  height: 200px;
  background: #0f0f0f;
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-category {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  margin: 0;
}

.product-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.product-price-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.product-status {
  font-size: 13px;
  color: #a0a0a0;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: inline-block;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-tag {
  background: #2a2a2a;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.notice-title {
  flex: 1;
  color: #ffffff;
  font-weight: 500;
}

.notice-date {
  color: #999;
  font-size: 13px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .seller-info h1 {
    font-size: 24px;
  }
}
</style>

