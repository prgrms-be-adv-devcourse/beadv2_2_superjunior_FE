import { createRouter, createWebHistory } from 'vue-router'
import { authAPI } from '@/api/auth'

import HomePage from '../views/HomePage.vue'
import CommunityList from '../views/CommunityList.vue'
import CommunityCreate from '../views/CommunityCreate.vue'
import CommunityPostDetail from '../views/CommunityPostDetail.vue'
import UserFollowing from '../views/UserFollowing.vue'
import UserNotifications from '../views/UserNotifications.vue'
import UserProfile from '../views/UserProfile.vue'
import UserDirectory from '../views/UserDirectory.vue'
import ProductsList from '../views/ProductsList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CartPage from '../views/CartPage.vue'
import SellerDashboard from '../views/SellerDashboard.vue'
import SellerSettlement from '../views/SellerSettlement.vue'
import SellerApplication from '../views/SellerApplication.vue'
import SellerProductsList from '../views/SellerProductsList.vue'
import SellerProfile from '../views/SellerProfile.vue'
import ProductRegister from '../views/ProductRegister.vue'
import ProductUpdate from '../views/ProductUpdate.vue'
import UserLogin from '../views/UserLogin.vue'
import UserSignup from '../views/UserSignup.vue'
import GroupPurchaseCreate from '../views/GroupPurchaseCreate.vue'
import GroupPurchaseList from '../views/GroupPurchaseList.vue'
import GroupPurchaseDetail from '../views/GroupPurchaseDetail.vue'
import GroupPurchaseEdit from '../views/GroupPurchaseEdit.vue'
import PointCharge from '../views/PointCharge.vue'
import PointChargeSuccess from '../views/PointChargeSuccess.vue'
import PointChargeFail from '../views/PointChargeFail.vue'
import OrderCreate from '../views/OrderCreate.vue'
import OrderPayment from '../views/OrderPayment.vue'
import OrderComplete from '../views/OrderComplete.vue'
import OrderPaymentSuccess from '../views/OrderPaymentSuccess.vue'
import OrderPaymentFail from '../views/OrderPaymentFail.vue'

const routes = [
  // 공개 페이지 (로그인 불필요)
  { path: '/', name: 'home', component: HomePage },
  { path: '/products', name: 'products', component: ProductsList },
  { path: '/products/:id', name: 'product-detail', component: ProductDetail, props: true },
  { path: '/group-purchases', name: 'group-purchases', component: GroupPurchaseList },
  { path: '/group-purchases/:id', name: 'group-purchase-detail', component: GroupPurchaseDetail, props: true },
  { path: '/community', name: 'community', component: CommunityList },
  { path: '/community/:id', name: 'community-detail', component: CommunityPostDetail, props: true },
  { path: '/users', name: 'users', component: UserDirectory },
  { path: '/login', name: 'login', component: UserLogin },
  { path: '/register', name: 'register', component: UserSignup },

  // 인증 필요 페이지
  { path: '/cart', name: 'cart', component: CartPage, meta: { requiresAuth: true } },
  { path: '/community/write', name: 'community-write', component: CommunityCreate, meta: { requiresAuth: true } },
  { path: '/me/following', name: 'following', component: UserFollowing, meta: { requiresAuth: true } },
  { path: '/me/notifications', name: 'notifications', component: UserNotifications, meta: { requiresAuth: true } },
  { path: '/me/profile', name: 'profile', component: UserProfile, meta: { requiresAuth: true } },

  // 판매자 페이지 (인증 필요)
  { path: '/seller', name: 'seller', component: SellerDashboard, meta: { requiresAuth: true } },
  { path: '/seller/products', name: 'seller-products', component: SellerProductsList, meta: { requiresAuth: true } },
  { path: '/seller/products/:productId/edit', name: 'product-update', component: ProductUpdate, props: true, meta: { requiresAuth: true } },
  { path: '/seller/settlement', name: 'seller-settlement', component: SellerSettlement, meta: { requiresAuth: true } },
  { path: '/seller/application', name: 'seller-application', component: SellerApplication, meta: { requiresAuth: true } },
  { path: '/seller/register/product-register', name: 'product-register', component: ProductRegister, meta: { requiresAuth: true } },
  { path: '/seller/profile/:id?', name: 'seller-profile', component: SellerProfile, props: true, meta: { requiresAuth: true } },

  // 공동구매 관리 (인증 필요)
  { path: '/group-purchases/create', name: 'group-purchase-create', component: GroupPurchaseCreate, meta: { requiresAuth: true } },
  { path: '/group-purchases/:id/edit', name: 'group-purchase-edit', component: GroupPurchaseEdit, props: true, meta: { requiresAuth: true } },

  // 포인트 (인증 필요)
  { path: '/point/charge', name: 'point-charge', component: PointCharge, meta: { requiresAuth: true } },
  { path: '/point/charge/success', name: 'point-charge-success', component: PointChargeSuccess, meta: { requiresAuth: true } },
  { path: '/point/charge/fail', name: 'point-charge-fail', component: PointChargeFail, meta: { requiresAuth: true } },

  // 주문 (인증 필요)
  { path: '/order/create', name: 'order-create', component: OrderCreate, meta: { requiresAuth: true } },
  { path: '/order/payment', name: 'order-payment', component: OrderPayment, meta: { requiresAuth: true } },
  { path: '/order/complete', name: 'order-complete', component: OrderComplete, meta: { requiresAuth: true } },
  { path: '/success', name: 'order-payment-success', component: OrderPaymentSuccess },
  { path: '/fail', name: 'order-payment-fail', component: OrderPaymentFail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증 가드: meta.requiresAuth가 true인 라우트는 프로필 확인
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    let memberId = localStorage.getItem('member_id')
    if (!memberId) {
      try {
        const profile = await authAPI.getProfile()
        const rawData = profile?.data || profile
        const profileData = rawData?.data || rawData
        if (!profileData?.memberId) {
          throw new Error('로그인 정보가 없습니다.')
        }
        memberId = profileData.memberId
        localStorage.setItem('member_id', memberId)
        localStorage.setItem('user_data', JSON.stringify(profileData))
        if (profileData.email) localStorage.setItem('user_email', profileData.email)
        if (profileData.role) localStorage.setItem('user_role', profileData.role)
        if (profileData.name) localStorage.setItem('user_name', profileData.name)
      } catch (error) {
        localStorage.removeItem('member_id')
        localStorage.removeItem('user_email')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_name')
        localStorage.removeItem('user_data')
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    }
  }
  next()
})

export default router


