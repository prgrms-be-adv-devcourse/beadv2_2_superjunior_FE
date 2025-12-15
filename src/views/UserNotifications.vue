<template>
  <main class="notifications-page">
    <div class="container">
      <div class="page-header">
        <h1>알림</h1>
        <button v-if="notifications.length > 0" class="btn-clear" @click="clearAll">전체 삭제</button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>알림을 불러오는 중...</p>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <p>알림이 없습니다</p>
      </div>

      <!-- 알림 목록 -->
      <div v-else class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon" :class="notification.type">
            <span>{{ getIcon(notification.type) }}</span>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ notification.time }}</div>
          </div>
          <button class="btn-delete" @click.stop="deleteNotification(notification.id)">×</button>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="btn-page"
            :disabled="currentPage === 0"
            @click="fetchNotifications(currentPage - 1)"
          >
            이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button
            class="btn-page"
            :disabled="currentPage >= totalPages - 1"
            @click="fetchNotifications(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notificationApi } from '@/api/axios'

const notifications = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

// 알림 목록 조회
const fetchNotifications = async (page = 0) => {
  try {
    loading.value = true
    const response = await notificationApi.getNotifications(page, pageSize)

    console.log('알림 API 응답:', response.data)

    // ResponseDto<PageResponse<NotificationInfo>> 구조
    const pageData = response.data.data

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const transformedNotifications = pageData.content.map(notification => ({
      id: notification.id,
      memberId: notification.memberId,
      type: mapNotificationType(notification.type),
      title: notification.title,
      message: notification.message,
      failureMessage: notification.failureMessage,
      read: notification.status === 'READ',
      referenceId: notification.referenceId,
      time: '방금 전' // TODO: createdAt 필드가 백엔드에 추가되면 실제 시간으로 변경
    }))

    notifications.value = transformedNotifications
    totalPages.value = pageData.totalPages
    currentPage.value = page
  } catch (error) {
    console.error('알림 조회 실패:', error)
    if (error.response?.status === 401) {
      // 인증 에러는 인터셉터에서 처리됨
      return
    }
    alert('알림을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 백엔드 NotificationType을 프론트 type으로 매핑
const mapNotificationType = (backendType) => {
  // 백엔드 타입을 소문자로 변환
  const type = backendType?.toLowerCase()
  return type || 'system'
}

const getIcon = (type) => {
  const icons = {
    order: '📦',
    delivery: '🚚',
    review: '⭐',
    promotion: '🎉',
    settlement: '💰',
    system: '🔔'
  }
  return icons[type] || '🔔'
}

const markAsRead = async (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.read) {
    try {
      await notificationApi.markAsRead(id)
      notification.read = true
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      // 에러가 나도 UI상으로는 읽음 처리 (낙관적 업데이트)
      notification.read = true
    }
  }
}

const deleteNotification = async (id) => {
  try {
    await notificationApi.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (error) {
    console.error('알림 삭제 실패:', error)
    alert('알림 삭제에 실패했습니다.')
  }
}

const clearAll = async () => {
  if (confirm('모든 알림을 삭제하시겠습니까?')) {
    try {
      await notificationApi.deleteAllNotifications()
      notifications.value = []
    } catch (error) {
      console.error('전체 알림 삭제 실패:', error)
      alert('알림 삭제에 실패했습니다.')
    }
  }
}

// 컴포넌트 마운트 시 알림 조회
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.btn-clear {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  border-color: #3a3a3a;
  color: #ffffff;
}

.loading-state {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #999;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #222222;
  border-color: #3a3a3a;
}

.notification-item.unread {
  border-left: 4px solid #ffffff;
  background: #1f1f1f;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  background: #0f0f0f;
}

.notification-icon.order {
  background: #2a2a2a;
}

.notification-icon.delivery {
  background: #2a2a2a;
}

.notification-icon.review {
  background: #2a2a2a;
}

.notification-icon.promotion {
  background: #2a2a2a;
}

.notification-icon.settlement {
  background: #2a2a2a;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.notification-message {
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.notification-item.unread .notification-title {
  color: #ffffff;
  font-weight: 700;
}

.btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0;
}

.btn-page {
  padding: 10px 20px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #222222;
  border-color: #3a3a3a;
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: #999;
  font-size: 14px;
  min-width: 80px;
  text-align: center;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .notification-item {
    padding: 12px;
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>



