<template>
  <div class="spirit-notif-dropdown cosmic-glass" @click.stop>
    
    <div class="notif-spirit-header">
      <div class="header-title-aura">
        <div class="icon-wrapper">
          <i class="fas fa-paper-plane spirit-icon-send"></i>
        </div>
        <h3>Truyền Âm Phù</h3>
      </div>
      
      <div class="header-actions-aura">
        <button v-if="unreadCount > 0" @click="handleMarkAllRead" class="btn-clear-spirit">
          <i class="fas fa-eye"></i> <span class="btn-text-aura">Lĩnh Ngộ Hết</span>
        </button>
        <button class="btn-close-aura mobile-only" @click="emit('close')">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    </div>

    <div class="notif-tabs-aura hide-scrollbar">
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

    <div class="notif-spirit-list hide-scrollbar" ref="listRef" @scroll="handleScroll">
      
      <div v-if="loading && filteredNotifications.length === 0" class="notif-state-box">
        <i class="fas fa-yin-yang fa-spin text-cyan-400 text-3xl mb-3"></i>
        <p>Đang thỉnh truyền âm thiên địa...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="notif-state-box empty">
        <div class="empty-icon-wrap">
          <i class="fas fa-wind"></i>
        </div>
        <p>Không gian tĩnh lặng, chưa có truyền âm nào.</p>
      </div>

      <div
        v-else
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="notif-spirit-item ripple"
        :class="{ 'unread-aura': notif.is_read === 0 }"
        @click="onNotificationClick(notif)"
      >
        <div class="notif-spirit-icon">
          <i :class="getNotifIcon(notif.type)"></i>
        </div>
        
        <div class="notif-spirit-text">
          <div class="notif-content-aura truncate-2-lines" v-html="notif.content"></div>
          <div class="notif-meta-aura">
            <span class="notif-spirit-time">
              <i class="far fa-clock"></i> {{ formatTime(notif.created_at) }}
            </span>
          </div>
        </div>

        <div v-if="notif.is_read === 0" class="unread-indicator">
          <span class="pulse-dot"></span>
        </div>
      </div>

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
  { id: 'all', label: 'Tất Cả', unread: props.unreadCount },
  { id: 'interaction', label: 'Luận Đạo', unread: getUnreadByCategory('interaction') },
  { id: 'story', label: 'Truyện Mới', unread: getUnreadByCategory('story') },
  { id: 'system', label: 'Thiên Đạo', unread: getUnreadByCategory('system') },
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
  // Auto close on mobile after click
  if (window.innerWidth <= 768) {
    emit('close');
  }
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
  if (CATEGORY_MAP.interaction.includes(type)) return 'fas fa-comments';
  if (CATEGORY_MAP.story.includes(type)) return 'fas fa-book-open';
  if (CATEGORY_MAP.system.includes(type)) return 'fas fa-bolt-lightning';
  return 'fas fa-envelope';
};

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    notificationStore.fetchNotifications(false);
  }
};

onMounted(() => {
  if (notifications.value.length === 0) {
    notificationStore.fetchNotifications(true);
  }
});

watch(activeTab, () => {
  if (listRef.value) {
    listRef.value.scrollTop = 0;
  }
});
</script>

<style scoped>
/* ===== DESKTOP DROPDOWN BASE ===== */
.spirit-notif-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: -20px; /* Đẩy nhẹ sang phải để cân đối với icon chuông */
  width: 400px;
  max-width: 90vw;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(34, 211, 238, 0.05);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform-origin: top right;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ===== HEADER ===== */
.notif-spirit-header {
  padding: 18px 24px;
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.08) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-aura {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrapper {
  width: 36px; height: 36px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.spirit-icon-send { color: #22d3ee; font-size: 1.1rem; }

.notif-spirit-header h3 {
  margin: 0; font-size: 1.15rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px;
}

.header-actions-aura { display: flex; align-items: center; gap: 10px; }

.btn-clear-spirit {
  background: transparent;
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: #22d3ee;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; gap: 6px;
}

.btn-clear-spirit:hover {
  background: rgba(34, 211, 238, 0.15);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
}

.mobile-only { display: none; }

/* ===== TABS ===== */
.notif-tabs-aura {
  display: flex;
  padding: 0 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
}

.tab-spirit-item {
  flex: 1;
  background: transparent; border: none;
  padding: 14px 10px;
  color: #64748b; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; transition: all 0.3s;
  position: relative; white-space: nowrap;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}

.tab-spirit-item:hover { color: #94a3b8; }

.tab-spirit-item.active-aura { color: #22d3ee; }
.tab-spirit-item.active-aura::after {
  content: ''; position: absolute; bottom: -1px; left: 15%; right: 15%;
  height: 2px; background: #22d3ee; box-shadow: 0 -2px 10px #22d3ee; border-radius: 2px 2px 0 0;
}

.tab-badge-aura {
  background: #ef4444; color: white; font-size: 0.65rem;
  padding: 2px 6px; border-radius: 12px; font-weight: 900;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

/* ===== LIST ===== */
.notif-spirit-list {
  max-height: 480px; overflow-y: auto; padding: 0;
}

/* States */
.notif-state-box { padding: 60px 20px; text-align: center; color: #64748b; font-size: 0.9rem; }
.empty-icon-wrap { width: 60px; height: 60px; margin: 0 auto 15px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }

/* Item */
.notif-spirit-item {
  display: flex; align-items: flex-start; gap: 15px;
  padding: 16px 24px; cursor: pointer; transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03); position: relative;
}

.notif-spirit-item:hover { background: rgba(255, 255, 255, 0.03); padding-left: 28px; }

.notif-spirit-item.unread-aura {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.08) 0%, transparent 100%);
}

.notif-spirit-icon {
  width: 44px; height: 44px; border-radius: 14px;
  background: rgba(30, 41, 59, 0.8);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #64748b; font-size: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.unread-aura .notif-spirit-icon {
  background: rgba(34, 211, 238, 0.1); color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.3);
  box-shadow: inset 0 0 10px rgba(34, 211, 238, 0.1);
}

.notif-spirit-text { flex: 1; display: flex; flex-direction: column; gap: 6px; }

.notif-content-aura { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }
.unread-aura .notif-content-aura { color: #f1f5f9; font-weight: 600; }

.truncate-2-lines {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.notif-meta-aura { display: flex; align-items: center; margin-top: 4px;}
.notif-spirit-time { font-size: 0.75rem; color: #475569; display: flex; align-items: center; gap: 6px; }
.unread-aura .notif-spirit-time { color: #22d3ee; }

/* Unread Dot Pulse */
.unread-indicator { display: flex; align-items: center; justify-content: center; height: 100%; padding-top: 10px;}
.pulse-dot {
  width: 10px; height: 10px; background: #22d3ee; border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% { transform: scale(2.5); opacity: 0; }
}

.notif-load-more { padding: 15px; text-align: center; color: #22d3ee; }
.ripple { position: relative; overflow: hidden; }

/* =========================================================
   ===== HIỆU ỨNG VÀ TỐI ƯU CHO MOBILE (MOBILE FIRST) ======
   ========================================================= */
@media (max-width: 768px) {
  .mobile-only { display: flex; }
  .btn-text-aura { display: none; } /* Giấu chữ trên nút "Lĩnh ngộ hết" để tiết kiệm chỗ */

  /* Biến dropdown thành Top Sheet trượt xuống từ trên (Dưới Header) */
  .spirit-notif-dropdown {
    position: fixed;
    top: 70px; /* Dưới Header (70px) */
    left: 0; right: 0;
    bottom: auto;
    width: 100vw;
    height: auto;
    max-height: 80dvh;
    border-radius: 0 0 24px 24px;
    border: none;
    border-bottom: 1px solid rgba(34, 211, 238, 0.3);
    z-index: 9999;
    animation: slideDownMobile 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    background: #020617;
  }

  @keyframes slideDownMobile {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .notif-spirit-header {
    padding: 20px;
    background: #0f172a;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }

  .btn-close-aura {
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.2);
    color: #f43f5e;
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; cursor: pointer;
  }

  /* Kéo dài không gian chứa để lướt thoải mái */
  .notif-spirit-list {
    max-height: none;
    flex: 1;
    padding-bottom: env(safe-area-inset-bottom, 40px); /* Hỗ trợ tai thỏ / thanh home của iOS */
  }

  /* Cho phép tab cuộn ngang, touch area to hơn */
  .notif-tabs-aura {
    padding: 0;
    justify-content: flex-start;
  }

  .tab-spirit-item {
    font-size: 0.9rem;
    padding: 16px 20px; /* Touch target to hơn */
  }

  .notif-spirit-item {
    padding: 18px 20px; /* Tăng touch target cho từng dòng thông báo */
  }

  .notif-spirit-icon {
    width: 50px; height: 50px; /* Icon to ra một chút */
    font-size: 1.2rem;
  }
}
</style>
