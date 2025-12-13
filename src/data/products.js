export const sampleProducts = [
  {
    id: 1,
    title: '아이폰 15 Pro Max 256GB',
    subtitle: 'A17 Pro 칩셋과 5배 망원 카메라 탑재',
    category: 'ELECTRONICS',
    seller: '테크샵',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'
    ],
    originalPrice: 1590000,
    currentPrice: 1190000,
    discountRate: 25,
    currentCount: 45,
    targetCount: 50,
    timeLeft: '2일 5시간 남음',
    rating: 4.9,
    reviewCount: 182,
    shipping: '무료배송 / 전국 당일 발송',
    badges: ['베스트', '빠른배송'],
    specs: ['스토리지 256GB', '색상: 네이비 티타늄', '정품 등록 보장'],
    description:
      '가장 빠른 A17 Pro 칩셋과 5배 망원 카메라를 탑재한 최신 플래그쉽 모델입니다. 공동구매로 공식 판매가 대비 최대 25% 할인된 가격으로 만나보세요.',
    detailedDescription: `
      <h3>프리미엄 성능과 디자인</h3>
      <p>아이폰 15 Pro Max는 Apple의 최신 기술이 집약된 플래그쉽 스마트폰입니다. A17 Pro 칩셋으로 최고 수준의 성능을 제공하며, 모든 작업을 빠르고 부드럽게 처리합니다.</p>
      
      <h3>혁신적인 카메라 시스템</h3>
      <p>5배 망원 줌을 지원하는 프로급 카메라 시스템으로 멀리 떨어진 피사체도 선명하게 촬영할 수 있습니다. 야간 모드와 시네마틱 모드로 전문가 수준의 사진과 동영상을 제작할 수 있습니다.</p>
      
      <h3>내구성과 품질</h3>
      <p>티타늄 소재로 제작되어 가볍으면서도 강한 내구성을 자랑합니다. IP68 등급의 방수 방진 기능으로 일상적인 사용에서 안심할 수 있습니다.</p>
      
      <h3>배터리와 충전</h3>
      <p>하루 종일 사용 가능한 배터리 수명과 고속 무선 충전을 지원합니다. USB-C 포트로 더욱 편리한 충전이 가능합니다.</p>
      
      <h3>포함 구성품</h3>
      <ul>
        <li>아이폰 15 Pro Max 본체</li>
        <li>USB-C 케이블</li>
        <li>정품 보증서</li>
        <li>빠른 시작 가이드</li>
      </ul>
    `
  },
  {
    id: 2,
    title: '나이키 에어맥스 운동화',
    subtitle: '하루 종일 편안한 쿠셔닝',
    category: '패션',
    seller: '스포츠월드',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    originalPrice: 149000,
    currentPrice: 99000,
    discountRate: 34,
    currentCount: 78,
    targetCount: 100,
    timeLeft: '5일 남음',
    rating: 4.7,
    reviewCount: 96,
    shipping: '무료배송 / 30일 교환·환불',
    badges: ['인기', '남성용'],
    specs: ['사이즈 240-290', '색상 4종', '정품 보증'],
    description:
      '일상과 운동을 모두 커버하는 에어맥스. 우수한 통기성과 쿠셔닝으로 가벼운 착용감을 제공합니다. 공동구매 전용 색상 2종 포함!'
  },
  {
    id: 3,
    title: '프리미엄 한우 세트 (1kg)',
    subtitle: '1++ 등급 꽃등심 & 살치살 구성',
    category: '식품',
    seller: '프리미엄푸드',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800',
    originalPrice: 89000,
    currentPrice: 59000,
    discountRate: 34,
    currentCount: 32,
    targetCount: 40,
    timeLeft: '1일 12시간 남음',
    rating: 4.8,
    reviewCount: 54,
    shipping: '신선 포장 / 새벽 배송',
    badges: ['마감임박', '냉장'],
    specs: ['총 1kg', '산지 직송', '도축 48시간 내 포장'],
    description:
      '1++ 등급 한우만 골라 담은 프리미엄 세트입니다. 캠핑, 홈파티, 선물 용도로 인기 있는 구성으로 단백질 가득한 신선함을 그대로 보장합니다.'
  },
  {
    id: 4,
    title: '디올 립스틱 세트',
    subtitle: '베스트셀러 3종 컬러 번들',
    category: '뷰티',
    seller: '뷰티플러스',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    originalPrice: 89000,
    currentPrice: 59000,
    discountRate: 34,
    currentCount: 56,
    targetCount: 60,
    timeLeft: '3일 남음',
    rating: 4.6,
    reviewCount: 210,
    shipping: '전국 무료배송 / 선물 포장',
    badges: ['한정판', '선물추천'],
    specs: ['정품 케이스 포함', '퍼스널 컬러 3종', '유통기한 2027년'],
    description:
      '디올의 베스트셀러 컬러 3종으로 구성된 립 컬렉션. 한정 패키지와 정품 보증서를 포함해 특별한 선물로도 완벽합니다.'
  },
  {
    id: 5,
    title: '갤럭시 워치6 클래식',
    subtitle: '수면 코칭과 체성분 측정',
    category: '전자제품',
    seller: '스마트샵',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    originalPrice: 399000,
    currentPrice: 299000,
    discountRate: 25,
    currentCount: 18,
    targetCount: 20,
    timeLeft: '3시간 남음',
    rating: 4.4,
    reviewCount: 67,
    shipping: '오늘 출발 / 무료 반품',
    badges: ['마감임박', '스테인리스'],
    specs: ['47mm', '블랙', 'WPC 인증 충전기 포함'],
    description:
      '프리미엄 스틸 베젤과 수면 코칭 기능이 탑재된 갤럭시 워치6 클래식. 공동구매 특가로 마지막 수량을 확보하세요.'
  },
  {
    id: 6,
    title: '프리미엄 와인 세트',
    subtitle: '레드 + 화이트 2병 구성',
    category: '식품',
    seller: '와인나라',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    originalPrice: 129000,
    currentPrice: 89000,
    discountRate: 31,
    currentCount: 28,
    targetCount: 30,
    timeLeft: '5시간 남음',
    rating: 4.9,
    reviewCount: 112,
    shipping: '안전 포장 / 성인 인증 필요',
    badges: ['한정수량', '선물포장'],
    specs: ['750ml x 2', '프랑스산', '디캔터 포함'],
    description:
      '프랑스 보르도 레드와 상큼한 화이트 와인을 한 번에 즐길 수 있는 세트. 고급 디캔터와 전용 쇼핑백을 함께 드립니다.'
  },
  {
    id: 7,
    title: '무선 이어폰 프로',
    subtitle: '액티브 노이즈 캔슬링 2.0',
    category: '전자제품',
    seller: '오디오샵',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    originalPrice: 199000,
    currentPrice: 139000,
    discountRate: 30,
    currentCount: 12,
    targetCount: 50,
    timeLeft: '7일 남음',
    rating: 4.3,
    reviewCount: 41,
    shipping: '전국 무료배송',
    badges: ['신상품', '노캔'],
    specs: ['최대 28시간 재생', '무선 충전 지원', '방수 IPX4'],
    description:
      '차세대 액티브 노이즈 캔슬링과 멀티포인트 페어링을 지원하는 무선 이어폰입니다. 출퇴근·헬스 모두 사용 가능한 생활 방수 등급.'
  },
  {
    id: 8,
    title: '프리미엄 쿠션 세트',
    subtitle: '커버력과 보습력 모두 잡은 톤업 쿠션',
    category: '뷰티',
    seller: '코스메틱',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    originalPrice: 69000,
    currentPrice: 49000,
    discountRate: 29,
    currentCount: 8,
    targetCount: 30,
    timeLeft: '6일 남음',
    rating: 4.5,
    reviewCount: 76,
    shipping: '전국 무료배송 / 리필 1개 포함',
    badges: ['신상품', '수분폭탄'],
    specs: ['21호/23호', 'SPF50+ PA++++', '저자극 테스트 완료'],
    description:
      '고밀착 커버와 미세 보습 입자가 하루종일 촉촉함을 유지해 줍니다. 리필 1개와 퍼프 2개가 추가로 제공됩니다.'
  }
]

export const sellerProfile = {
  name: '테크샵',
  rating: 4.9,
  followers: 1240,
  responseRate: 0.98,
  totalSales: 3245,
  monthlySales: 182,
  description:
    '최신 전자제품과 프리미엄 액세서리를 공동구매 전용가로 제공하는 테크 전문 셀러입니다. 정품 보증과 빠른 A/S를 약속드려요.',
  badges: ['프리미엄 셀러', '24시간 상담', '빠른배송 파트너']
}

export const sellerNotices = [
  { id: 1, title: '12월 배송 일정 안내', date: '2025-12-01', type: '배송' },
  { id: 2, title: '신규 공동구매 오픈 예고 (이어폰/태블릿)', date: '2025-11-28', type: '이벤트' },
  { id: 3, title: 'A/S 접수 방법 간소화 안내', date: '2025-11-20', type: '공지' }
]

export const sellerQna = [
  {
    id: 1,
    question: '아이폰 색상 변경 가능한가요?',
    answer: '네, 공동구매 종료 전까지 색상 변경 가능합니다. 채팅 또는 문의 남겨주세요.',
    status: '완료'
  },
  {
    id: 2,
    question: '워치 밴드 추가 구매 가능한가요?',
    answer: '추가 구성으로 실리콘 밴드(₩19,000) 구매 옵션을 열어두었습니다.',
    status: '완료'
  },
  {
    id: 3,
    question: '배송지 변경은 언제까지 되나요?',
    answer: '결제 후 24시간 이내에만 가능합니다. 배송 탭의 “배송지 변경” 버튼을 이용해주세요.',
    status: '완료'
  }
]

export const cartItemsMock = [
  { productId: 1, quantity: 1, option: '네이비 티타늄 / 256GB' },
  { productId: 2, quantity: 2, option: '270 / 블랙' },
  { productId: 6, quantity: 1, option: '기본 구성' }
]

export const getProductById = (id) =>
  sampleProducts.find((product) => product.id === Number(id))

export const getSellerProducts = (sellerName) =>
  sampleProducts.filter((product) => product.seller === sellerName)


