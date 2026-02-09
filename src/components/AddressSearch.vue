<template>
  <div class="address-search">
    <!-- 우편번호 + 검색 버튼 -->
    <div class="postal-code-row">
      <input
        type="text"
        v-model="postalCode"
        placeholder="우편번호"
        readonly
        class="postal-code-input"
      />
      <button type="button" @click="openAddressSearch" class="search-btn">
        우편번호 검색
      </button>
    </div>
    
    <!-- 주소 -->
    <input
      v-model="address"
      type="text"
      placeholder="주소"
      readonly
      class="address-input"
    />

    <!-- 상세주소 -->
    <input
      v-model="addressDetail"
      type="text"
      placeholder="상세주소를 입력하세요"
      @input="updateAddress"
      class="address-detail-input"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      address: '',
      addressDetail: '',
      postalCode: ''
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const address = ref(props.modelValue?.address || '')
const addressDetail = ref(props.modelValue?.addressDetail || '')
const postalCode = ref(props.modelValue?.postalCode || '')

// 다음 주소 검색 팝업 열기
const openAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: function(data) {
      // 도로명 주소 또는 지번 주소
      let fullAddress = data.roadAddress || data.jibunAddress
      
      // 건물명이 있으면 추가
      if (data.buildingName) {
        fullAddress += ` (${data.buildingName})`
      }
      
      address.value = fullAddress
      postalCode.value = data.zonecode
      addressDetail.value = '' // 상세주소 초기화
      
      updateAddress()
    }
  }).open()
}

// 주소 정보 업데이트
const updateAddress = () => {
  emit('update:modelValue', {
    address: address.value,
    addressDetail: addressDetail.value,
    postalCode: postalCode.value
  })
}

// props 변경 감지
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    address.value = newValue.address || ''
    addressDetail.value = newValue.addressDetail || ''
    postalCode.value = newValue.postalCode || ''
  }
}, { deep: true })
</script>

<style scoped>
.address-search {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.postal-code-row {
  display: flex;
  gap: 8px;
}

.postal-code-input {
  width: 150px;
  padding: 12px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  cursor: not-allowed;
  font-family: inherit;
}

.address-input,
.address-detail-input {
  padding: 12px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text);
  transition: border-color 0.2s;
  font-family: inherit;
}

.address-input {
  cursor: not-allowed;
}

.address-detail-input:focus {
  outline: none;
  border-color: var(--text);
  background: var(--hover);
}

/* 라이트 모드 스타일 */
:global(body.theme-light) .postal-code-input,
:global(body.theme-light) .address-input,
:global(body.theme-light) .address-detail-input {
  background: #ffffff;
  border-color: #d0d0d6;
  color: #0f172a;
}

:global(body.theme-light) .address-detail-input:focus {
  border-color: #0f172a;
  background: #ffffff;
}

.address-input::placeholder,
.address-detail-input::placeholder,
.postal-code-input::placeholder {
  color: #666;
}

/* 라이트 모드 placeholder */
:global(body.theme-light) .address-input::placeholder,
:global(body.theme-light) .address-detail-input::placeholder,
:global(body.theme-light) .postal-code-input::placeholder {
  color: #94a3b8;
}

.search-btn {
  padding: 12px 20px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--hover);
  border-color: var(--muted);
}

/* 라이트 모드 스타일 */
:global(body.theme-light) .search-btn {
  border-color: #d0d0d6;
  color: #0f172a;
}

:global(body.theme-light) .search-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}
</style>
