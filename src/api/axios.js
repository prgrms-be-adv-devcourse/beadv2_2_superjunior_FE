// api/axios.js
import axios from "axios";
import router from "@/router";

const BASE_URL = "/api"; // 프록시를 통해 요청

// 단일 Axios 인스턴스
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30초로 증가 (디버깅용)
  withCredentials: true, // 🔥 Cookie 자동 송수신 - Gateway가 accessToken 쿠키를 읽고 헤더 추가
  headers: {
    "Content-Type": "application/json",
  },
});

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트만
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentPath = router.currentRoute.value.fullPath;
    // 401 = 인증 실패 (백엔드에서 토큰 갱신도 실패한 경우)
    if (
      error.response?.status === 401 &&
      error.response?.data.includes("만료된 토큰")
    ) {
      try {
        // 토큰 갱신 요청
        await api.get("/auth/refresh");
        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        router.push({
          path: "/login",
          query: { redirect: currentPath },
        });
        return Promise.reject(error);
      }
    }
    router.push({
      path: "/login",
      query: { redirect: currentPath },
    });
    return Promise.reject(error);
  }
);

// 상품 관련 API
export const productApi = {
  createProduct: (data) => api.post("/products", data),
  getProductById: (productId) => api.get(`/products/${productId}`),
  getProducts: () => api.get("/products"), // 전체 상품 목록 조회
  getMyProducts: () => api.get("/products/my"), // 내 상품 목록 조회 (판매자 전용)
  updateProduct: (productId, data) => api.patch(`/products/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
};

// 공동구매 관련 API
export const groupPurchaseApi = {
  createGroupPurchase: (data) => api.post("/purchases", data),
  getGroupPurchaseById: (purchaseId) => api.get(`/purchases/${purchaseId}`),
  getAllGroupPurchases: (page = 0, size = 100, sort = null) => {
    const params = { page, size };
    if (sort) params.sort = sort;
    return api.get("/purchases", { params }); // 전체 공동구매 목록 조회
  },
  getMyGroupPurchases: (sort = null) => {
    // 내 공동구매 목록 조회 (판매자 전용)
    const memberId = localStorage.getItem("member_id");
    if (!memberId) {
      return Promise.reject(new Error("로그인이 필요합니다."));
    }
    const params = { page: 0, size: 100 };
    if (sort) params.sort = sort;
    return api.get(`/purchases/seller/${memberId}`, { params });
  },
  getGroupPurchasesBySeller: (sellerId, page = 0, size = 10, sort = null) => {
    const params = { page, size };
    if (sort) params.sort = sort;
    return api.get(`/purchases/seller/${sellerId}`, { params });
  },
  updateGroupPurchase: (purchaseId, data) =>
    api.patch(`/purchases/${purchaseId}`, data),
  deleteGroupPurchase: (purchaseId) => api.delete(`/purchases/${purchaseId}`),
  searchGroupPurchases: ({
    keyword = "",
    status = "OPEN",
    category = "",
    page = 0,
    size = 10,
    sort,
  } = {}) => {
    const params = {
      keyword,
      status,
      category,
      page,
      size,
    };

    if (sort) {
      params.sort = sort;
    }

    return api.get("/searches/purchase/search", { params });
  },
};

export default api;
