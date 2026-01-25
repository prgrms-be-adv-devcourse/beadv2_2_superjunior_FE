<template>
  <header class="site-header">
    <div class="container">
      <div class="brand" @click="router.push('/')">
        <img src="/favicon-design2.svg" alt="0909 공구공구" class="brand-icon" />
        <span class="brand-text">0909 공구공구</span>
      </div>
      <nav class="nav">
        <router-link class="nav-link" to="/">홈</router-link>
        <router-link class="nav-link" to="/products">공동 구매</router-link>
        <!-- <router-link class="nav-link" to="/community">커뮤니티</router-link> -->
      </nav>
      <div class="actions">
        <button class="icon-btn theme-btn" @click="toggleTheme" :aria-label="theme === 'dark' ? '라이트 모드' : '다크 모드'">
          <span class="icon">{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
        </button>
        <button class="icon-btn cart-btn" @click="goToCart">
          <span class="icon">🛒</span>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </button>
        <button class="icon-btn" @click="goToNotifications">
          <span class="icon">🔔</span>
          <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
        </button>
        <router-link v-if="!isLoggedIn" class="btn btn-outline" to="/login">로그인</router-link>
        <router-link v-if="!isLoggedIn" class="btn btn-primary" to="/register">회원가입</router-link>
        <div v-if="isLoggedIn" class="user-menu">
          <button class="btn btn-outline" @click="goToMyPage">마이페이지</button>
          <button class="btn btn-outline" @click="handleLogout">로그아웃</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi, cartApi } from '@/api/axios'
import { authAPI } from '@/api/auth'

const router = useRouter()

const isLoggedIn = ref(false)
const cartCount = ref(0)
const notificationCount = ref(0)
const theme = ref('dark')
let authCheckInterval = null
let notificationCheckInterval = null
let cartCountInterval = null

const checkAuthStatus = async () => {
  const memberId = localStorage.getItem('member_id')
  const wasLoggedIn = isLoggedIn.value
  isLoggedIn.value = !!memberId
  if (!memberId) {
    cartCount.value = 0
    notificationCount.value = 0
  } else if (!wasLoggedIn) {
    // 로그인 상태로 변경된 경우 장바구니와 알림 개수 로드
    await loadCartCount()
    loadNotificationCount()
  }
}

const verifySession = async () => {
  try {
    const profile = await authAPI.getProfile()
    const rawData = profile?.data || profile
    const profileData = rawData?.data || rawData
    if (profileData?.memberId) {
      localStorage.setItem('member_id', profileData.memberId)
      localStorage.setItem('user_data', JSON.stringify(profileData))
      if (profileData.email) localStorage.setItem('user_email', profileData.email)
      if (profileData.role) localStorage.setItem('user_role', profileData.role)
      if (profileData.name) localStorage.setItem('user_name', profileData.name)
      isLoggedIn.value = true
    } else {
      throw new Error('로그인 정보가 없습니다.')
    }
  } catch (error) {
    localStorage.removeItem('member_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_profile')
    isLoggedIn.value = false
  }
}

const loadNotificationCount = async () => {
  if (!isLoggedIn.value) {
    notificationCount.value = 0
    return
  }

  try {
    const count = await notificationApi.getUnreadCount()
    notificationCount.value = count



  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 실패:', error)
    // 에러가 나도 기존 값 유지
  }
}

const loadCartCount = async () => {
  const memberId = localStorage.getItem('member_id')
  if (!memberId) {
    cartCount.value = 0
    return
  }

  try {
    const response = await cartApi.getCart(0, 100)
    const pageResponse = response.data?.data || response.data
    const cartData = pageResponse?.content || []
    // 장바구니 항목의 총 수량 계산
    cartCount.value = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0)
  } catch (error) {
    console.error('장바구니 개수 조회 실패:', error)
    cartCount.value = 0
  }
}

const applyTheme = (value) => {
  theme.value = value
  document.body.classList.toggle('theme-light', value === 'light')
  document.body.classList.toggle('theme-dark', value === 'dark')
  localStorage.setItem('theme', value)
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

const handleCartUpdated = () => {
  loadCartCount()
}


const goToCart = () => {
  router.push('/cart')
}

const goToNotifications = () => {
  router.push('/me/notifications')
}

const goToMyPage = () => {
  router.push('/me/profile')
}

const handleStorageChange = async (e) => {
  if (e.key === 'member_id') {
    await checkAuthStatus()
    loadNotificationCount()
  }
}

const handleAuthChanged = async () => {
  await checkAuthStatus()
  if (!isLoggedIn.value) {
    await verifySession()
  }
  loadNotificationCount()
}

const handleNotificationChanged = () => {
  loadNotificationCount()
}

// 페이지 포커스/가시성 변경 시 알림 개수 갱신
const handleVisibilityChange = () => {
  if (!document.hidden && isLoggedIn.value) {
    loadNotificationCount()
  }
}

const handleFocus = () => {
  if (isLoggedIn.value) {
    loadNotificationCount()
  }
}

const handleLogout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    try {
      await authAPI.logout()
    } catch (error) {
      console.warn('로그아웃 요청 실패:', error)
    }
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_profile')
    localStorage.removeItem('member_id')
    localStorage.removeItem('user_name')
    isLoggedIn.value = false
    cartCount.value = 0
    notificationCount.value = 0
    router.push('/')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  applyTheme(savedTheme === 'light' ? 'light' : 'dark')
  checkAuthStatus()
  if (!isLoggedIn.value) {
    verifySession()
  }
  // loadCartCount()
  // loadNotificationCount()
  
  // 로그인 상태 변경 감지 (다른 탭에서의 변경)
  window.addEventListener('storage', handleStorageChange)
  
  // 커스텀 이벤트로 로그인 상태 변경 감지 (같은 탭에서의 변경)
  window.addEventListener('auth-changed', handleAuthChanged)

  // 알림 상태 변경 감지 (알림을 읽었을 때)
  window.addEventListener('notification-changed', handleNotificationChanged)

  
  // 장바구니 업데이트 이벤트 리스너
  window.addEventListener('cart-updated', handleCartUpdated)
  
  // 같은 탭에서의 변경 감지를 위한 주기적 체크
  authCheckInterval = setInterval(() => {
    const memberId = localStorage.getItem('member_id')
    if (!!memberId !== isLoggedIn.value) {
      checkAuthStatus()
    }
  }, 1000)
  

  // 읽지 않은 알림 개수 주기적 갱신 (10초마다)
  // notificationCheckInterval = setInterval(() => {
  //   if (isLoggedIn.value) {
  //     loadNotificationCount()
  //   }
  // }, 10000)
  
  // 페이지 포커스/가시성 변경 시 알림 개수 갱신
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)

  // 장바구니 개수 주기적 업데이트 (5초마다)
  // cartCountInterval = setInterval(() => {
  //   if (isLoggedIn.value) {
  //     loadCartCount()
  //   }
  // }, 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('auth-changed', handleAuthChanged)
  window.removeEventListener('notification-changed', handleNotificationChanged)
  window.removeEventListener('cart-updated', handleCartUpdated)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
  }
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval)
  }
  if (cartCountInterval) {
    clearInterval(cartCountInterval)
  }
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  transition: opacity 0.2s;
}

.brand:hover {
  opacity: 0.8;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.brand:hover .brand-icon {
  transform: scale(1.1) rotate(5deg);
}

.brand-text {
  color: var(--text);
}

.nav {
  display: flex;
  gap: 32px;
  margin-left: 40px;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  position: relative;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text);
}

.nav-link.router-link-active {
  color: var(--text);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--text);
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.icon-btn:hover {
  background: var(--hover);
}

.icon {
  font-size: 20px;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.4;
}

.btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border-color: var(--border-strong);
}

.btn-outline:hover {
  background: var(--hover);
  border-color: var(--border);
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  background: var(--btn-primary-hover);
}

.user-menu {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .brand-text {
    font-size: 20px;
  }

  .actions {
    gap: 8px;
  }

  .btn {
    padding: 0 12px;
    font-size: 13px;
  }

  .user-menu {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 12px 16px;
  }

  .brand-text {
    display: none;
  }

  .btn-outline {
    display: none;
  }
}
</style>


