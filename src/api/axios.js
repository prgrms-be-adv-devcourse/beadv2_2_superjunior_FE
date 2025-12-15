// api/axios.js
import axios from "axios";
import router from "@/router";

const BASE_URL = "/api"; // Gateway 프록시 경유

// 단일 Axios 인스턴스
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // 🔥 Cookie 기반 인증
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ✅ 응답 인터셉터
 * - 401 + "만료된 토큰" → refresh 시도
 * - 실패 시 로그인 페이지로 리다이렉트
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentPath = router.currentRoute.value.fullPath;

    if (
      error.response?.status === 401 &&
      typeof error.response?.data === "string" &&
      error.response.data.includes("만료된 토큰")
    ) {
      try {
        // 토큰 갱신
        await api.get("/auth/refresh");
        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        router.push({
          path: "/login",
          query: { redirect: currentPath },
        });
        return Promise.reject(refreshError);
      }
    }

    // 그 외 401
    if (error.response?.status === 401) {
      router.push({
        path: "/login",
        query: { redirect: currentPath },
      });
    }

    return Promise.reject(error);
  }
);

/* =========================
 * 상품 관련 API
 * ========================= */
export const productApi = {
  createProduct: (data) => api.post("/products", data),
  getProductById: (productId) => api.get(`/products/${productId}`),
  getProducts: () => api.get("/products"),

  // 🔥 검색 서비스 기준 (판매자 상품 검색)
  getMyProducts: (params = {}) =>
    api.get("/searches/product/search", { params }),

  updateProduct: (productId, data) =>
    api.patch(`/products/${productId}`, data),

  deleteProduct: (productId) =>
    api.delete(`/products/${productId}`),
};

/* =========================
 * 공동구매 관련 API
 * ========================= */
export const groupPurchaseApi = {
  createGroupPurchase: (data) => api.post("/purchases", data),

  getGroupPurchaseById: (purchaseId) =>
    api.get(`/purchases/${purchaseId}`),

  getAllGroupPurchases: (page = 0, size = 100, sort = null) => {
    const params = { page, size };
    if (sort) params.sort = sort;
    return api.get("/purchases", { params });
  },

  getMyGroupPurchases: (sort = null) => {
    const memberId = localStorage.getItem("member_id");
    if (!memberId) {
      return Promise.reject(new Error("로그인이 필요합니다."));
    }

    const params = { page: 0, size: 100 };
    if (sort) params.sort = sort;

    return api.get(`/purchases/seller/${memberId}`, { params });
  },

  updateGroupPurchase: (purchaseId, data) =>
    api.patch(`/purchases/${purchaseId}`, data),

  deleteGroupPurchase: (purchaseId) =>
    api.delete(`/purchases/${purchaseId}`),

  searchGroupPurchases: ({
    keyword = "",
    status = "OPEN",
    category = "",
    page = 0,
    size = 10,
    sort,
  } = {}) => {
    const params = { keyword, status, category, page, size };
    if (sort) params.sort = sort;
    return api.get("/searches/purchase/search", { params });
  },
};

// 알림 관련 API
export const notificationApi = {
    // 알림 목록 조회 (페이지네이션)
    getNotifications: (page = 0, size = 20, sort = 'createdAt,desc') => {
        const params = { page, size, sort }
        return api.get("/notifications", { params })
    },
    // 읽지 않은 알림 목록 조회 (페이지네이션)
    getUnreadNotifications: (page = 0, size = 20, sort = 'createdAt,desc') => {
        const params = { page, size, sort }
        return api.get("/notifications/unread", { params })
    },
    // 읽지 않은 알림 개수 조회
    getUnreadCount: () => {
        return api.get("/notifications/unread", { params: { page: 0, size: 1 } })
            .then(response => response.data.data.totalElements || 0)
    },
    // 알림 읽음 처리
    markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
    // 알림 전체 읽음 처리
    markAllAsRead: () => api.patch("/notifications/read"),
};

// 주문 관련 API
export const orderApi = {
    createOrder: (data) => api.post("/orders", data),
};

// 장바구니 관련 API
export const cartApi = {
    getCart: (page = 0, size = 100) => api.get("/carts", { params: { page, size } }),
    addToCart: (data) => api.post("/carts", data),
};

// 판매자 정산 관련 API
export const sellerBalanceApi = {
    // 잔액 조회
    getBalance: () => api.get("/balances"),

    // 정산 내역 조회 (페이지네이션)
    getBalanceHistory: (page = 0, size = 20, sort = 'createdAt,desc') => {
        const params = { page, size, sort }
        return api.get("/balances/history", { params })
    },
};

export default api;

