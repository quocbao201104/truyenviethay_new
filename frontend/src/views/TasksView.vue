<template>
  <div class="tasks-page-cosmic">
    <div class="cosmic-bg-particles"></div>

    <HeroPanel
      :currentLevel="currentLevel"
      :userPoints="userPoints"
      :userCurrency="userCurrency"
      :remainingLifespan="remainingLifespan"
      :levelProgress="levelProgress"
      :processingUpgrade="processingUpgrade"
      :userName="heroName"
      :avatarUrl="heroAvatarUrl"
      :equippedFrame="heroEquippedFrame"
      :equippedBadge="equippedBadge"
      @upgrade="handleUpgradeLevel"
    />

    <section class="game-tabs-divine">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="divine-tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i class="fas" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <div class="content-area-xianxia">
      <section v-show="activeTab === 'tasks'" class="panel-cosmic animate-fadeIn">
        <QuestList
          :tasks="orderedTasks"
          :loading="loading.tasks"
          :processingTaskId="processingTask"
          @claim="handleClaimTask"
        />
      </section>

      <section v-show="activeTab === 'mailbox'" class="panel-cosmic animate-fadeIn">
        <MailboxList :mailbox="mailbox" :processingId="processingMailbox" @claim="handleClaimMailbox" />
      </section>

      <section v-show="activeTab === 'shop'" class="panel-cosmic animate-fadeIn">
        <ShopZone
          :shopItems="shopItems"
          :shopZones="shopZones"
          :activeShopZone="activeShopZone"
          :filteredShopItems="filteredShopItems"
          :userCurrency="userCurrency"
          :getItemTypeLabel="getItemTypeLabel"
          @change-zone="activeShopZone = $event"
          @buy="openBuyModal"
        />
      </section>

      <section v-show="activeTab === 'inventory'" class="panel-cosmic animate-fadeIn">
        <InventoryGrid
          :inventoryItems="inventoryItems"
          :badges="badges"
          :processingItemId="processingInventoryItem"
          :processingBadgeId="processingEquip"
          :getItemTypeLabel="getItemTypeLabel"
          :formatExpiry="formatInventoryExpiry"
          :canEquipItem="canEquipItem"
          @use-item="handleUseInventoryItem"
          @equip-badge="handleEquipBadge"
        />
      </section>
    </div>

    <TransactionModal
      :isOpen="isBuyModalOpen"
      :item="buyModalItem"
      :userCurrency="userCurrency"
      :processing="processingBuy === buyModalItem?.id"
      :getItemTypeLabel="getItemTypeLabel"
      @close="closeBuyModal"
      @confirm="handleConfirmBuy"
    />
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useGamification } from '@/composables/useGamification';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useUserStore } from '@/modules/user/user.store';
import { useChatStore } from '@/modules/chat/chat.store';
import { getAvatarUrl } from '@/config/constants';

import HeroPanel from '@/modules/gamification/components/HeroPanel.vue';
import QuestList from '@/modules/gamification/components/QuestList.vue';
import MailboxList from '@/modules/gamification/components/MailboxList.vue';
import ShopZone from '@/modules/gamification/components/ShopZone.vue';
import InventoryGrid from '@/modules/gamification/components/InventoryGrid.vue';
import TransactionModal from '@/modules/gamification/components/TransactionModal.vue';

export default {
  name: 'TasksView',
  components: {
    HeroPanel, QuestList, MailboxList, ShopZone, InventoryGrid, TransactionModal,
  },
  setup() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const chatStore = useChatStore();

    const {
      userPoints, currentLevel, tasks, mailbox, badges, shopItems, inventoryItems, userCurrency,
      levelProgress, fetchUserPoints, fetchCurrentLevel, fetchTasks, claimTask, fetchUserCurrency,
      fetchMailbox, fetchInventoryBadges, fetchShopItems, fetchInventoryItems, claimFromMailbox,
      equipBadge, buyShopItem, equipInventoryItem, upgradeLevel,
    } = useGamification();

    // ĐÃ ĐỔI TÊN THUẬT NGỮ TU TIÊN
    const tabs = [
      { id: 'tasks', label: 'Tông Môn Lịch Luyện', icon: 'fa-flag-checkered' },
      { id: 'mailbox', label: 'Phi Kiếm Truyền Thư', icon: 'fa-feather-pointed' },
      { id: 'shop', label: 'Vạn Giới Thương Các', icon: 'fa-building-columns' },
      { id: 'inventory', label: 'Nhẫn Càn Khôn', icon: 'fa-ring' },
    ];

    const shopZones = [
      { id: 'phap_bao', label: 'Pháp Bảo', icon: 'fa-dragon' },
      { id: 'ky_vat', label: 'Kỳ Vật', icon: 'fa-flask-vial' },
      { id: 'vat_pham', label: 'Vật Phẩm', icon: 'fa-wand-magic-sparkles' },
    ];

    const processingMailbox = ref(null);
    const processingTask = ref(null);
    const processingEquip = ref(null);
    const processingUpgrade = ref(false);
    const processingBuy = ref(null);
    const processingInventoryItem = ref(null);
    const loading = ref({ tasks: false });
    const activeTab = ref('tasks');
    const activeShopZone = ref('phap_bao');
    const isBuyModalOpen = ref(false);
    const buyModalItem = ref(null);

    const heroName = computed(() => authStore.user?.full_name || 'Vô Danh Đạo Hữu');
    const heroAvatarUrl = computed(() => getAvatarUrl(authStore.user?.avatar));
    const heroEquippedFrame = computed(() => authStore.user?.equipped_frame || null);
    const equippedBadge = computed(() => {
      const rewardBadge = (badges.value || []).find(b => b.is_equipped);
      if (rewardBadge) return rewardBadge;

      const shopBadge = (inventoryItems.value || []).find(item => item.item_type === 'badge' && item.is_equipped);
      if (shopBadge) {
        return {
          badge_name: shopBadge.name,
          icon_url: shopBadge.image_url,
          color: shopBadge.css_class || '#fbbf24',
          rarity: 'rare'
        };
      }
      return null;
    });

    const filteredShopItems = computed(() => {
      const items = shopItems.value || [];
      const inventory = inventoryItems.value || [];
      const ownedBadgeIds = (badges.value || []).map((badge) => badge.reward_id);

      const zoneMapping = {
        phap_bao: ['avatar_frame', 'chat_color'], ky_vat: ['badge'], vat_pham: ['consumable'],
      };

      const allowedTypes = zoneMapping[activeShopZone.value] || [];

      return items
        .filter((item) => allowedTypes.includes(item.item_type))
        .map((item) => {
          let isOwned = false;
          if (item.item_type === 'badge') {
            isOwned = ownedBadgeIds.includes(item.id) || (badges.value || []).some((badge) => badge.badge_name === item.name);
          } else if (item.item_type !== 'consumable') {
            isOwned = inventory.some((invItem) => invItem.item_id === item.id || invItem.name === item.name);
          }
          return { ...item, isOwned };
        });
    });

    const orderedTasks = computed(() => {
      const safeTasks = tasks.value || [];
      return [...safeTasks.filter((task) => task.status === 'completed'), ...safeTasks.filter((task) => task.status !== 'completed')];
    });

    const remainingLifespan = computed(() => {
      if (!currentLevel.value || !currentLevel.value.end_date) return null;
      const endDate = new Date(currentLevel.value.end_date);
      const diffMs = endDate.getTime() - new Date().getTime();
      if (diffMs <= 0) return 'Sắp cạn kiệt';
      return `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} ngày`;
    });

    const canEquipItem = (itemType) => ['avatar_frame', 'badge', 'chat_color', 'consumable'].includes(itemType);

    const getItemTypeLabel = (itemType) => {
      const labels = { avatar_frame: 'Khung Avatar', badge: 'Kỳ Vật', consumable: 'Vật Phẩm', chat_color: 'Sắc Thái' };
      return labels[itemType] || 'Vật Phẩm';
    };

    const formatInventoryExpiry = (expiresAt) => {
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime())) return 'Sắp biến mất';
      return `Hạn đến ${date.toLocaleDateString('vi-VN')}`;
    };

    const openBuyModal = (item) => {
      if (item?.isOwned) return;
      buyModalItem.value = item;
      isBuyModalOpen.value = true;
    };

    const closeBuyModal = (force = false) => {
      if (processingBuy.value && !force) return;
      isBuyModalOpen.value = false;
      buyModalItem.value = null;
    };

    const handleConfirmBuy = async (qty = 1) => {
      if (!buyModalItem.value) return;
      processingBuy.value = buyModalItem.value.id;
      try {
        await buyShopItem(buyModalItem.value.id, qty);
        await fetchInventoryItems();
        await fetchUserCurrency();
        closeBuyModal(true);
      } finally { processingBuy.value = null; }
    };

    const handleClaimMailbox = async (userRewardId) => {
      processingMailbox.value = userRewardId;
      try {
        await claimFromMailbox(userRewardId);
        await Promise.all([fetchMailbox(), fetchInventoryBadges(), fetchInventoryItems(), fetchUserCurrency()]);
      } finally { processingMailbox.value = null; }
    };

    const handleClaimTask = async (taskId) => {
      processingTask.value = taskId;
      try { await claimTask(taskId); } finally { processingTask.value = null; }
    };

    const handleEquipBadge = async (rewardId) => {
      processingEquip.value = rewardId;
      try { await equipBadge(rewardId); } finally { processingEquip.value = null; }
    };

    const handleUseInventoryItem = async (item) => {
      if (!item || !canEquipItem(item.item_type)) return;
      try {
        if (Number(item.item_id) === 3) { chatStore.openWithMegaphone(); return; }
        processingInventoryItem.value = item.inventory_id;
        await equipInventoryItem(item.inventory_id);
      } catch (e) { console.error(e); } finally { processingInventoryItem.value = null; }
    };

    const handleUpgradeLevel = async () => {
      processingUpgrade.value = true;
      try {
        await upgradeLevel(authStore.user.id);
        await userStore.fetchUserProfile();
      } finally { processingUpgrade.value = false; }
    };

    onMounted(async () => {
      if (!authStore.user?.id) return;
      loading.value.tasks = true;
      await Promise.all([
        fetchUserPoints(authStore.user.id), fetchCurrentLevel(authStore.user.id), fetchUserCurrency(),
        fetchTasks().finally(() => { loading.value.tasks = false; }),
        fetchMailbox(), fetchInventoryBadges(), fetchShopItems(), fetchInventoryItems(),
      ]);
    });

    return {
      tabs, shopZones, tasks, mailbox, badges, shopItems, inventoryItems, userPoints, currentLevel,
      userCurrency, levelProgress, loading, activeTab, activeShopZone, orderedTasks, remainingLifespan,
      heroName, heroAvatarUrl, heroEquippedFrame, equippedBadge, processingMailbox, processingTask,
      processingEquip, processingUpgrade, processingBuy, processingInventoryItem, isBuyModalOpen,
      buyModalItem, filteredShopItems, handleClaimMailbox, handleClaimTask, handleEquipBadge,
      handleUseInventoryItem, handleUpgradeLevel, handleConfirmBuy, openBuyModal, closeBuyModal,
      getItemTypeLabel, canEquipItem, formatInventoryExpiry,
    };
  },
};
</script>

<style scoped>
/* Vũ trụ không gian (Deep Space & Gold) */
.tasks-page-cosmic {
  position: relative;
  min-height: 100vh;
  padding: 1.6rem;
  color: #e8f2ff;
  font-family: 'Be Vietnam Pro', sans-serif;
  background-color: #050510;
  overflow: hidden;
}

/* Hiệu ứng bụi sao lấp lánh vũ trụ */
.cosmic-bg-particles {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 15% 20%, rgba(251, 191, 36, 0.15) 1px, transparent 2px),
    radial-gradient(circle at 85% 10%, rgba(255, 255, 255, 0.15) 2px, transparent 2px),
    radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.1) 1.5px, transparent 1.5px),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 150px 150px, 200px 200px, 120px 120px, 90px 90px;
  animation: cosmicDrift 40s linear infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes cosmicDrift {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}

.game-tabs-divine,
.panel-cosmic {
  position: relative;
  z-index: 5;
  width: min(1120px, 100%);
  margin-inline: auto;
}

.game-tabs-divine {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-top: 30px;
  margin-bottom: 25px;
}

/* Các tab (Khối linh thạch chứa trận pháp) */
.divine-tab-btn {
  height: 55px;
  border-radius: 12px;
  border: 1px solid rgba(251, 191, 36, 0.15);
  background: rgba(10, 15, 30, 0.8);
  color: #94a3b8;
  cursor: pointer;
  font-weight: 800;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.divine-tab-btn::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  transform: scaleX(0); transition: 0.3s;
}

.divine-tab-btn:hover {
  transform: translateY(-3px);
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.05);
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

.divine-tab-btn:hover::before { transform: scaleX(1); }

.divine-tab-btn.active {
  color: #050510;
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
}

.divine-tab-btn.active i { color: #050510; }

.panel-cosmic {
  border-radius: 20px;
  border: 1px solid rgba(251, 191, 36, 0.2);
  background: rgba(8, 12, 22, 0.75);
  backdrop-filter: blur(15px);
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(251, 191, 36, 0.03);
}

.animate-fadeIn { animation: fadeIn 0.4s ease-out; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .tasks-page-cosmic { padding: 1rem; }
  .panel-cosmic { padding: 20px; border-radius: 16px; }
  .game-tabs-divine { gap: 10px; margin-top: 20px; }
}

@media (max-width: 720px) {
  .game-tabs-divine { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .divine-tab-btn { height: 48px; font-size: 0.85rem; }
}
</style>
