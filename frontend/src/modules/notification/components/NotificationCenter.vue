<template>
  <div class="spirit-notif-dropdown" @click.stop>
    <!-- Header -->
    <div class="notif-spirit-header">
      <div class="header-title-aura">
        <i class="fas fa-scroll spirit-icon-scroll"></i>
        <h3>Truyền Âm</h3>
      </div>
      <div class="header-actions-aura">
        <button v-if="unreadCount > 0" @click="handleMarkAllRead" class="btn-clear-spirit">
          <i class="fas fa-broom"></i> <span class="btn-text-aura">Viên Mãn</span>
        </button>
        <button class="btn-close-aura mobile-only" @click="emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Tabs System -->
    <div class="notif-tabs-aura">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-spirit-item"
        :class="{ 'active-aura': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.label }}</span>
        <span v-if="tab.unread > 0" class="tab-badge-aura">{{ tab.unread }}</span>
      </button>
    </div>

    <!-- Notifications List -->
    <div class="notif-spirit-list" ref="listRef" @scroll="handleScroll">
      <div v-if="loading && filteredNotifications.length === 0" class="notif-spirit-loading">
        <i class="fas fa-yin-yang fa-spin"></i>
        <p>Đang thỉnh truyền âm...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="notif-spirit-empty">
        <i class="fas fa-comment-slash opacity-20"></i>
        <p>Không có truyền âm nào</p>
      </div>

      <div
        v-else
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="notif-spirit-item"
        :class="{ 'unread-aura': notif.is_read === 0 }"
        @click="onNotificationClick(notif)"
      >
        <div class="notif-spirit-icon">
          <i :class="getNotifIcon(notif.type)"></i>
        </div>
        <div class="notif-spirit-text">
          <div class="notif-content-aura" v-html="notif.content"></div>
          <div class="notif-meta-aura">
            <span class="notif-spirit-time">
              <i class="far fa-clock"></i> {{ formatTime(notif.created_at) }}
            </span>
            <span v-if="notif.is_read === 0" class="unread-dot-aura"></span>
          </div>
        </div>
      </div>

      <!-- Load More Loading -->
      <div v-if="loading && filteredNotifications.length > 0" class="notif-load-more">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useNotificationStore } from '../notification.store';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CATEGORY_MAP } from '../notification.api';

const props = defineProps({
  unreadCount: { type: Number, default: 0 }
});

const emit = defineEmits(['close', 'navigation']);

const notificationStore = useNotificationStore();
const activeTab = ref('all');
const listRef = ref(null);

const tabs = computed(() => [
  { id: 'all', label: 'Tất cả', unread: props.unreadCount },
  { id: 'interaction', label: 'Tương tác', unread: getUnreadByCategory('interaction') },
  { id: 'story', label: 'Truyện mới', unread: getUnreadByCategory('story') },
  { id: 'system', label: 'Hệ thống', unread: getUnreadByCategory('system') },
]);

const loading = computed(() => notificationStore.loading);
const notifications = computed(() => notificationStore.notifications);

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value;
  const targetTypes = CATEGORY_MAP[activeTab.value] || [];
  return notifications.value.filter(n => targetTypes.includes(n.type));
});

function getUnreadByCategory(category) {
  const types = CATEGORY_MAP[category] || [];
  return notifications.value.filter(n => n.is_read === 0 && types.includes(n.type)).length;
}

const onNotificationClick = async (notif) => {
  if (notif.is_read === 0) {
    await notificationStore.markAsRead(notif.id);
  }
  emit('navigation', notif);
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const formatTime = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  } catch (e) {
    return 'Vừa xong';
  }
};

const getNotifIcon = (type) => {
  if ([1, 2, 3].includes(type)) return 'fas fa-comments';
  if ([11, 12].includes(type)) return 'fas fa-scroll';
  if ([21, 22].includes(type)) return 'fas fa-bullhorn';
  return 'fas fa-envelope';
};

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    notificationStore.fetchNotifications(false);
  }
};

// Initial fetch if empty
onMounted(() => {
  if (notifications.value.length === 0) {
    notificationStore.fetchNotifications(true);
  }
});

// Watch tab changes to fetch if needed (though we currently fetch all)
watch(activeTab, (newTab) => {
  // If we decided to fetch per category, we would do it here
  // For now, the store fetches all notifications for the user
});

</script>

<style scoped>
.spirit-notif-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 420px;
  max-width: 95vw;
  background: #0f172a;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(52, 211, 153, 0.05);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideInDesktop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInDesktop {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.notif-spirit-header {
  padding: 16px 20px;
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-aura {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spirit-icon-scroll {
  color: #34d399;
  font-size: 1.1rem;
}

.notif-spirit-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.header-actions-aura {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-clear-spirit {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #34d399;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-clear-spirit:hover {
  background: #34d399;
  color: #0f172a;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.4);
}

.btn-close-aura {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Tabs */
.notif-tabs-aura {
  display: flex;
  background: rgba(15, 23, 42, 0.8);
  padding: 4px;
}

.tab-spirit-item {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 4px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-spirit-item.active-aura {
  color: #34d399;
}

.tab-spirit-item.active-aura::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
  border-radius: 2px;
}

.tab-badge-aura {
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 14px;
}

/* List */
.notif-spirit-list {
  max-height: 450px;
  overflow-y: auto;
  padding: 8px 0;
}

.notif-spirit-list::-webkit-scrollbar {
  width: 5px;
}

.notif-spirit-list::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.1);
  border-radius: 10px;
}

.notif-spirit-item {
  display: flex;
  gap: 15px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  position: relative;
}

.notif-spirit-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notif-spirit-item.unread-aura {
  background: rgba(52, 211, 153, 0.03);
}

.notif-spirit-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #475569;
  font-size: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.unread-aura .notif-spirit-icon {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.2);
}

.notif-spirit-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notif-content-aura {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
}

.unread-aura .notif-content-aura {
  color: #f1f5f9;
  font-weight: 500;
}

.notif-meta-aura {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-spirit-time {
  font-size: 0.7rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.unread-aura .notif-spirit-time {
  color: #34d399;
}

.unread-dot-aura {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
}

.notif-spirit-loading, .notif-spirit-empty {
  padding: 60px 20px;
  text-align: center;
  color: #475569;
}

.notif-spirit-loading i {
  font-size: 2rem;
  color: #34d399;
  margin-bottom: 15px;
}

.notif-load-more {
  padding: 15px;
  text-align: center;
  color: #34d399;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: flex;
  }

  .btn-text-aura {
    display: none;
  }

  .spirit-notif-dropdown {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    z-index: 2000;
    animation: slideInMobile 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  @keyframes slideInMobile {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .notif-spirit-header {
    padding: 20px;
    background: #0f172a;
  }

  .notif-spirit-list {
    max-height: none;
    flex: 1;
    padding-bottom: 40px;
  }

  .notif-tabs-aura {
    padding: 10px 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .tab-spirit-item {
    font-size: 0.85rem;
  }
}
</style>
