// api/axios.js
import axios from "axios";
import router from "@/router";

const BASE_URL = "/api";  // 프록시를 통해 요청

// 단일 Axios 인스턴스
export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true, // 🔥 Cookie 자동 송수신 - Gateway가 accessToken 쿠키를 읽고 헤더 추가
    headers: {
        "Content-Type": "application/json",
    },
});

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 = 인증 실패 (백엔드에서 토큰 갱신도 실패한 경우)
        if (error.response?.status === 401) {
            const currentPath = router.currentRoute.value.fullPath;
            
            // 이미 로그인 페이지가 아닌 경우에만 리다이렉트
            if (currentPath !== "/auth/login") {
                router.push({
                    path: "/auth/login",
                    query: { redirect: currentPath },
                });
            }
        }
        return Promise.reject(error);
    }
);

// 상품 관련 API
export const productApi = {
    createProduct: (data) => api.post("/products", data),
    getProductById: (productId) => api.get(`/products/${productId}`),
    getProducts: () => api.get("/products"), // 상품 목록 조회 (백엔드 API 필요)
    updateProduct: (productId, data) => api.patch(`/products/${productId}`, data),
    deleteProduct: (productId) => api.delete(`/products/${productId}`),
};

// 공동구매 관련 API
export const groupPurchaseApi = {
    createGroupPurchase: (data) => api.post("/purchases", data),
    getGroupPurchaseById: (purchaseId) => api.get(`/purchases/${purchaseId}`),
};

export default api;