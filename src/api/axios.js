// api/axios.js
import axios from "axios";

// 개발 환경: 프록시 사용 (/api)
// 프로덕션 환경: 실제 백엔드 URL 사용 (https://0982.store/api)
const BASE_URL = process.env.NODE_ENV === 'production'
  ? "https://0982.store/api"
  : "/api";

// /auth 엔드포인트는 /api 프리픽스 제거됨
const AUTH_BASE_URL = process.env.NODE_ENV === 'production'
  ? "https://0982.store"
  : "";

// 단일 Axios 인스턴스
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // 🔥 Cookie 기반 인증
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * =========================
 * Refresh Queue (JS 전용)
 * =========================
 */
let isRefreshing = false;
let refreshPromise = null; // Promise<void> | null
let queue = []; // { resolve, reject }[]

function flushQueueSuccess() {
  queue.forEach(({ resolve }) => resolve());
  queue = [];
}

function flushQueueFail(err) {
  queue.forEach(({ reject }) => reject(err));
  queue = [];
}

async function runRefresh() {
  // 이미 refresh 중이면 같은 Promise 공유
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      await authApi.get("/auth/refresh");
      flushQueueSuccess();
    } catch (e) {
      flushQueueFail(e);
      throw e;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * =========================
 * Response Interceptor
 * =========================
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // 네트워크 에러 등 response 없으면 그대로
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const reqUrl = originalRequest.url || "";

    // 인증 관련 요청은 인터셉터에서 제외 (무한루프 방지, 정상적인 에러일 수 있음)
    if (
      reqUrl.includes("/auth/refresh") ||
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/signup") ||
      reqUrl.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    // 401 아니면 그대로
    if (status !== 401) {
      return Promise.reject(error);
    }

    // 이미 재시도한 요청이면 반복 금지
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 만료 토큰 판별(문자열/객체 모두 처리) - 가능하면 백엔드 errorCode로 바꾸는 게 더 좋음
    const data = error.response.data;
    const errorMessage = typeof data === "string" ? data : data?.message || "";
    const isExpired = errorMessage.includes("만료된 토큰");
    const isNotLoggedIn = errorMessage.includes("로그인 정보가 없습니다");

    // 로그인 정보가 없으면 refresh 시도하지 않고 그대로 반환
    if (isNotLoggedIn) {
      // 로컬 스토리지 비우기 (로그인 시 저장되는 항목들만 제거)
      localStorage.removeItem("access_token");
      localStorage.removeItem("member_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      return Promise.reject(error);
    }

    // 만료가 아닌 401은 그대로 반환
    if (!isExpired) {
      return Promise.reject(error);
    }

    // 만료된 토큰 → refresh 후 원요청 1회 재시도
    originalRequest._retry = true;

    // refresh 중이면 큐로 대기했다가 refresh 완료 후 재시도
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        });
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // refresh를 내가 대표로 수행
    try {
      await runRefresh();
      return api(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    }
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
    sellerId = null,
    page = 0,
    size = 10,
    sort,
  } = {}) => {
    const params = { keyword, status, sellerId, category, page, size };
    if (sort) params.sort = sort;
    return api.get("/searches/purchase/search", { params });
  },

  searchAllGroupPurchases: ({
      keyword = "",
      status = "OPEN",
      category = "",
      page = 0,
      size = 10,
      sort,
    } = {}) => {
      const params = { keyword, status, category, page, size };
      if (sort) params.sort = sort;
      return api.get("/searches/purchase/search/seller", { params });
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
    createOrderFromCart: (data) => api.post("/orders/cart", data), // 장바구니에서 주문
};

// 장바구니 관련 API
export const cartApi = {
    getCart: (page = 0, size = 100) => api.get("/carts", { params: { page, size } }),
    addToCart: (data) => api.post("/carts", data),
    updateCart: (data) => api.patch("/carts", data), // { cartId, quantity }
    deleteFromCart: (data) => api.delete("/carts", { data }), // { cartId }
    flushCart: () => api.delete("/carts/all"),
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

