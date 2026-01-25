<template>
  <main class="order-complete-page">
    <div class="container">
      <div class="complete-card">
        <div class="icon success-icon">
          <span>✓</span>
        </div>
        <h1>주문이 완료되었습니다</h1>
        <p class="message">주문이 성공적으로 접수되었습니다.</p>
        <div class="actions">
          <router-link to="/me/profile?tab=orders" class="btn btn-primary">주문 내역 보기</router-link>
          <router-link to="/" class="btn btn-outline">홈으로 가기</router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 주문 완료 후 장바구니 업데이트 이벤트 발생
  window.dispatchEvent(new CustomEvent('cart-updated'))
  // 주문 완료 후 알림 업데이트 이벤트 발생 (주문 알림이 생성될 수 있음)
  window.dispatchEvent(new CustomEvent('notification-changed'))
})
</script>

<style scoped>
.order-complete-page {
  background: #0a0a0a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.container {
  max-width: 500px;
  width: 100%;
}

.complete-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 24px;
}

.success-icon {
  background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
  color: white;
}

.success-icon span {
  font-weight: 700;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.message {
  color: #999;
  font-size: 16px;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: #ffffff;
  color: #0a0a0a;
}

.btn-primary:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
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

@media (max-width: 480px) {
  .complete-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>

