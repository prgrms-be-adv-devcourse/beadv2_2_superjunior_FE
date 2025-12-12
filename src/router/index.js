import { createRouter, createWebHistory } from 'vue-router'

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
import UserLogin from '../views/UserLogin.vue'
import UserSignup from '../views/UserSignup.vue'
import GroupPurchaseCreate from '../views/GroupPurchaseCreate.vue'
import GroupPurchaseList from '../views/GroupPurchaseList.vue'
import GroupPurchaseDetail from '../views/GroupPurchaseDetail.vue'
import GroupPurchaseEdit from '../views/GroupPurchaseEdit.vue'
import PointCharge from '../views/PointCharge.vue'
import PointChargeSuccess from '../views/PointChargeSuccess.vue'
import PointChargeFail from '../views/PointChargeFail.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/products', name: 'products', component: ProductsList },
  { path: '/products/:id', name: 'product-detail', component: ProductDetail, props: true },
  { path: '/cart', name: 'cart', component: CartPage },
  { path: '/seller', name: 'seller', component: SellerDashboard },
  { path: '/seller/products', name: 'seller-products', component: SellerProductsList },
  { path: '/seller/settlement', name: 'seller-settlement', component: SellerSettlement },
  { path: '/seller/application', name: 'seller-application', component: SellerApplication },
  { path: '/seller/register/product-register', name: 'product-register', component: ProductRegister },
  { path: '/seller/profile/:id?', name: 'seller-profile', component: SellerProfile, props: true },
  { path: '/community', name: 'community', component: CommunityList },
  { path: '/community/:id', name: 'community-detail', component: CommunityPostDetail, props: true },
  { path: '/community/write', name: 'community-write', component: CommunityCreate },
  { path: '/me/following', name: 'following', component: UserFollowing },
  { path: '/me/notifications', name: 'notifications', component: UserNotifications },
  { path: '/me/profile', name: 'profile', component: UserProfile },
  { path: '/users', name: 'users', component: UserDirectory },
  { path: '/login', name: 'login', component: UserLogin },
  { path: '/register', name: 'register', component: UserSignup },
  { path: '/group-purchases', name: 'group-purchases', component: GroupPurchaseList },
  { path: '/group-purchases/create', name: 'group-purchase-create', component: GroupPurchaseCreate },
  { path: '/group-purchases/:id', name: 'group-purchase-detail', component: GroupPurchaseDetail, props: true },
  { path: '/group-purchases/:id/edit', name: 'group-purchase-edit', component: GroupPurchaseEdit, props: true },
  { path: '/point/charge', name: 'point-charge', component: PointCharge },
  { path: '/point/charge/success', name: 'point-charge-success', component: PointChargeSuccess },
  { path: '/point/charge/fail', name: 'point-charge-fail', component: PointChargeFail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 간단한 권한 가드 (목업): 토큰이 필요한 라우트 예시
const authRequired = new Set(['/community/write','/me/reviews','/me/following','/me/notifications','/me/profile','/group-purchases/create'])
router.beforeEach((to, from, next) => {
  if (authRequired.has(to.path)) {
    const token = localStorage.getItem('access_token')
    if (!token) return next({ path: '/', query: { redirect: to.fullPath } })
  }
  next()
})

export default router


