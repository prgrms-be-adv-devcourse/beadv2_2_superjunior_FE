import api from './axios.js'
export const authAPI = {
    // 이메일 인증 코드
    sendVerificationEmail: async(email) => {
        const response = await api.get(`/members/email/${email}`)
        return response.data;
    },
    // 이메일 인증 (토큰 기반)
    verifyEmail: async(token) => {
        const response = await api.get(`/members/email/verification/${token}`)
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
        const response = await api.post(`/auth/login`,{
            email,
            password
        })
        return response.data;
    },
    // 로그아웃
    logout: async() => {
        const response = await api.post(`/auth/logout`)
        return response.data;
    },
    // 프로필 조회
    getProfile: async() => {
        const response = await api.get(`/members/profile`)
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
    // 주문 내역 조회
    getOrders: async() => {
        const response = await api.get(`/orders/consumer`)
        return response.data;
    },
    // 판매자 정보 조회
    getSellerInfo: async(sellerId) => {
        const response = await api.get(`/members/seller/${sellerId}`)
        return response.data;
    },
    // 내 상품 목록 조회
    getMyProducts: async() => {
        const response = await api.get(`/products`)
        return response.data;
    },
    // 판매자 주문 내역 조회
    getSellerOrders: async() => {
        const response = await api.get(`/orders/seller`)
        return response.data;
    },
    // 공동 구매 목록 조회
    getGroupPurchases: async() => {
        const response = await api.get(`/purchases`)
        return response.data;
    }
}