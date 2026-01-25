import api, { authApi } from './axios.js'
export const authAPI = {
    // 이메일 인증 코드
    sendVerificationEmail: async(email) => {
        const response = await api.post(`/email/${email}`)
        return response.data;
    },
    // 이메일 인증 (토큰 기반)
    verifyEmail: async(email, token) => {
        const response = await api.post(`/email/verification`, {
            email,
            token
        })
        return response.data;
    },
    // 이름 중복 체크
    checkNameDuplication: async(name) => {
        const response = await api.get(`/members/name/${name}`)
        return response.data;
    },
    // 회원 가입
    signUp: async(signUpDate) => {
        const response = await api.post(`/members`,{
            email: signUpDate.email,
            password: signUpDate.password,
            name: signUpDate.name,
            phoneNumber: signUpDate.phoneNumber,
        })
        return response.data;
    },
    // 로그인 (별도 인증 컨트롤러에 있을 것으로 추정)
    login: async(email, password) => {
        const response = await authApi.post(`/auth/login`,{
            email,
            password
        })
        return response.data;
    },
    // 로그아웃
    logout: async() => {
        const response = await authApi.get(`/auth/logout`)
        return response.data;
    },
    // 프로필 조회
    getProfile: async() => {
        const response = await api.get(`/members/profile`)
        return response.data;
    },
    // 프로필 수정
    updateProfile: async(name, phoneNumber) => {
        const response = await api.put(`/members/profile`, {
            name,
            phoneNumber
        })
        return response.data;
    },
    // 주소 목록 조회
    getAddresses: async(page = 0, size = 10) => {
        const response = await api.get(`/members/addresses`, {
            params: { page, size }
        })
        return response.data;
    },
    // 주소 추가
    addAddress: async(addressData) => {
        const response = await api.post(`/members/address`, addressData)
        return response.data;
    },
    // 주소 수정
    updateAddress: async(addressId, addressData) => {
        const response = await api.put(`/members/address/${addressId}`, addressData)
        return response.data;
    },
    // 주소 삭제
    deleteAddress: async(addressId) => {
            const response = await api.delete(`/members/address/${addressId}`, addressId)
            return response.data;
        },
    // 판매자 신청
    sellerRegister: async(sellerData) => {
        const response = await api.post(`/members/seller`, {
            accountNumber: sellerData.accountNumber,
            bankCode: sellerData.bankCode,
            accountHolder: sellerData.accountHolder,
            businessRegistrationNumber: sellerData.businessRegistrationNumber
        })
        return response.data;
    },
    updateSeller: async(sellerData) => {
        const response = await api.put(`/members/seller`, {
            accountNumber: sellerData.accountNumber,
            bankCode: sellerData.bankCode,
            accountHolder: sellerData.accountHolder,
            businessRegistrationNumber: sellerData.businessRegistrationNumber
        })
        return response.data;
    },
    // 주문 내역 조회
    getOrders: async ({
      page = 0,
      size = 5,
      sort = 'createdAt,desc'
    } = {}) => {
      const response = await api.get('/orders/consumer', {
        params: {
          page,
          size,
          sort
        }
      })

      return response.data.data
    },
    getOrderDetail: async(orderId) =>{
        const response = await api.get(`/orders/${orderId}`)
        return response.data;
    },
    // 주문 취소
    cancelOrder: async(orderId, cancelReason) => {
        const response = await api.post(`/orders/cancel/${orderId}`, {
            cancelReason: cancelReason
        })
        return response.data;
    },
    // 취소된 주문 목록 조회
    getCanceledOrders: async({
      page = 0,
      size = 20,
      sort = 'createdAt,desc'
    } = {}) => {
      const response = await api.get('/orders/cancel', {
        params: { page, size, sort }
      })
      return response.data.data
    },
    // 주문 확정
    confirmPurchase: async(orderId) => {
        const response = await api.patch(`/orders/${orderId}/purchase-confirmed`)
        return response.data;
    },
    // 판매자 정보 조회
    getSellerInfo: async(sellerId) => {
        const response = await api.get(`/members/seller/${sellerId}`)
        return response.data;
    },
    // 내 상품 목록 조회
    getMyProducts: async() => {
        const response = await api.get(`/searches/product/search`)
        return response.data;
    },
    // 판매자 주문 내역 조회
    getSellerOrders: async({
      page = 0,
      size = 20,
      sort = 'createdAt,asc'
    } = {}) => {
      const response = await api.get('/orders/seller', {
        params: { page, size, sort }
      })
      return response.data.data
    },
    // 공동 구매 목록 조회
    getGroupPurchases: async() => {
        const response = await api.get(`/purchases`)
        return response.data;
    },

    // 포인트 잔액 조회
    getPoints: async() => {
        const response = await api.get(`/points`)
        return response.data;
    },
    getChargeHistory(paymentId) {
        return api.get(`/payments/${paymentId}`)
      },

    searchProducts: async ({
        keyword = '',
        category = '',
        page = 0,
        size = 6,
        sort = 'createdAt,desc'
      } = {}) => {
        const response = await api.get('/searches/product/search', {
          params: {
            keyword,
            category,
            page,
            size,
            sort
          }
          // ❗ sellerId는 Gateway or axios interceptor에서 Header로 자동 포함된다고 가정
        })

        return response.data.data
      },

    searchPurchase: async ({
        keyword = '',
        category = '',
        status = '',
        page = 0,
        size = 6,
        sort = ''
      } = {}) => {
        const response = await api.get('/searches/purchase/mine', {
          params: {
            keyword,
            category,
            status,
            page,
            size,
            sort
          }
          // ❗ sellerId는 Gateway or axios interceptor에서 Header로 자동 포함된다고 가정
        })

        return response.data.data
      },

    searchAIRecommandPurchases: async ({
               keyword = '',
               category = ''
           } = {}) => {
        const response = await api.get('/ai/recommandations', {
            params: {
                keyword,
                category
            }
        })

        return response.data.data
    },

    // 비밀번호 변경
    changePassword: async(password, newPassword) => {
        const response = await api.put(`/members/password`, {
            password,
            newPassword
        })
        return response.data;
    },

    // 회원 탈퇴
    deleteAccount: async(password) => {
        const response = await api.delete(`/members`, {
            data: { password }
        })
        return response.data;
    }
}
