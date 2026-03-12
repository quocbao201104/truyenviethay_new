<template>
  <div class="tasks-page">
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

    <section class="game-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="game-tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i class="fas" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <div class="content-area">
      <section v-show="activeTab === 'tasks'" class="panel animate-fadeIn">
        <QuestList
          :tasks="orderedTasks"
          :loading="loading.tasks"
          :processingTaskId="processingTask"
          @claim="handleClaimTask"
        />
      </section>

      <section v-show="activeTab === 'mailbox'" class="panel animate-fadeIn">
        <MailboxList :mailbox="mailbox" :processingId="processingMailbox" @claim="handleClaimMailbox" />
      </section>

      <section v-show="activeTab === 'shop'" class="panel animate-fadeIn">
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

      <section v-show="activeTab === 'inventory'" class="panel animate-fadeIn">
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
    HeroPanel,
    QuestList,
    MailboxList,
    ShopZone,
    InventoryGrid,
    TransactionModal,
  },
  setup() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const chatStore = useChatStore();

    const {
      userPoints,
      currentLevel,
      tasks,
      mailbox,
      badges,
      shopItems,
      inventoryItems,
      userCurrency,
      levelProgress,
      fetchUserPoints,
      fetchCurrentLevel,
      fetchTasks,
      claimTask,
      fetchUserCurrency,
      fetchMailbox,
      fetchInventoryBadges,
      fetchShopItems,
      fetchInventoryItems,
      claimFromMailbox,
      equipBadge,
      buyShopItem,
      equipInventoryItem,
      upgradeLevel,
    } = useGamification();

    const tabs = [
      { id: 'tasks', label: 'Nhiệm vụ', icon: 'fa-scroll' },
      { id: 'mailbox', label: 'Thư Tín', icon: 'fa-envelope-open-text' },
      { id: 'shop', label: 'Thương Hội', icon: 'fa-store' },
      { id: 'inventory', label: 'Túi Đồ', icon: 'fa-ring' },
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

    const heroName = computed(() => authStore.user?.full_name || authStore.user?.full_name || 'Đạo Hữu');
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
          color: shopBadge.css_class || '#34d399',
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
        phap_bao: ['avatar_frame', 'chat_color'],
        ky_vat: ['badge'],
        vat_pham: ['consumable'],
      };

      const allowedTypes = zoneMapping[activeShopZone.value] || [];

      return items
        .filter((item) => allowedTypes.includes(item.item_type))
        .map((item) => {
          let isOwned = false;
          if (item.item_type === 'badge') {
            isOwned =
              ownedBadgeIds.includes(item.id) ||
              (badges.value || []).some((badge) => badge.badge_name === item.name);
          } else if (item.item_type !== 'consumable') {
            isOwned = inventory.some((invItem) => invItem.item_id === item.id || invItem.name === item.name);
          }
          return { ...item, isOwned };
        });
    });

    const orderedTasks = computed(() => {
      const safeTasks = tasks.value || [];
      return [
        ...safeTasks.filter((task) => task.status === 'completed'),
        ...safeTasks.filter((task) => task.status !== 'completed'),
      ];
    });

    const remainingLifespan = computed(() => {
      if (!currentLevel.value || !currentLevel.value.end_date) return null;
      const endDate = new Date(currentLevel.value.end_date);
      const now = new Date();
      const diffMs = endDate.getTime() - now.getTime();
      if (diffMs <= 0) return 'Sap can kiet';
      return `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} ngay`;
    });

    const canEquipItem = (itemType) => ['avatar_frame', 'badge', 'chat_color', 'consumable'].includes(itemType);

    const getItemTypeLabel = (itemType) => {
      const labels = {
        avatar_frame: 'Khung Avatar',
        badge: 'Ky Vat',
        consumable: 'Vat Pham',
        chat_color: 'Sac Thai',
      };
      return labels[itemType] || 'Vat Pham';
    };

    const formatInventoryExpiry = (expiresAt) => {
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime())) return 'Sap het han';
      return `Han den ${date.toLocaleDateString('vi-VN')}`;
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
        closeBuyModal(true); // pass force=true
      } finally {
        processingBuy.value = null;
      }
    };

    const handleClaimMailbox = async (userRewardId) => {
      processingMailbox.value = userRewardId;
      try {
        await claimFromMailbox(userRewardId);
        await Promise.all([fetchMailbox(), fetchInventoryBadges(), fetchInventoryItems(), fetchUserCurrency()]);
      } finally {
        processingMailbox.value = null;
      }
    };

    const handleClaimTask = async (taskId) => {
      processingTask.value = taskId;
      try {
        await claimTask(taskId);
      } finally {
        processingTask.value = null;
      }
    };

    const handleEquipBadge = async (rewardId) => {
      processingEquip.value = rewardId;
      try {
        await equipBadge(rewardId);
      } finally {
        processingEquip.value = null;
      }
    };

    const handleUseInventoryItem = async (item) => {
      if (!item || !canEquipItem(item.item_type)) return;

      try {
        // Special case: Loa Truyền Âm (shop_item_id = 3) → open chat in megaphone mode
        if (Number(item.item_id) === 3) {
          chatStore.openWithMegaphone();
          return;
        }

        processingInventoryItem.value = item.inventory_id;
        await equipInventoryItem(item.inventory_id);
      } catch (e) {
        console.error('[handleUseInventoryItem]', e);
      } finally {
        processingInventoryItem.value = null;
      }
    };

    const handleUpgradeLevel = async () => {
      processingUpgrade.value = true;
      try {
        await upgradeLevel(authStore.user.id);
        await userStore.fetchUserProfile();
      } finally {
        processingUpgrade.value = false;
      }
    };

    onMounted(async () => {
      if (!authStore.user?.id) return;

      loading.value.tasks = true;
      await Promise.all([
        fetchUserPoints(authStore.user.id),
        fetchCurrentLevel(authStore.user.id),
        fetchUserCurrency(),
        fetchTasks().finally(() => {
          loading.value.tasks = false;
        }),
        fetchMailbox(),
        fetchInventoryBadges(),
        fetchShopItems(),
        fetchInventoryItems(),
      ]);
    });

    return {
      tabs,
      shopZones,
      tasks,
      mailbox,
      badges,
      shopItems,
      inventoryItems,
      userPoints,
      currentLevel,
      userCurrency,
      levelProgress,
      loading,
      activeTab,
      activeShopZone,
      orderedTasks,
      remainingLifespan,
      heroName,
      heroAvatarUrl,
      heroEquippedFrame,
      equippedBadge,
      processingMailbox,
      processingTask,
      processingEquip,
      processingUpgrade,
      processingBuy,
      processingInventoryItem,
      isBuyModalOpen,
      buyModalItem,
      filteredShopItems,
      handleClaimMailbox,
      handleClaimTask,
      handleEquipBadge,
      handleUseInventoryItem,
      handleUpgradeLevel,
      handleConfirmBuy,
      openBuyModal,
      closeBuyModal,
      getItemTypeLabel,
      canEquipItem,
      formatInventoryExpiry,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

.tasks-page {
  min-height: 100vh;
  padding: 1.6rem;
  color: #e8f2ff;
  font-family: 'Be Vietnam Pro', sans-serif;
  background:
    radial-gradient(44rem 22rem at 8% -6%, rgba(34, 197, 94, 0.12), transparent 65%),
    radial-gradient(38rem 22rem at 95% 0%, rgba(56, 189, 248, 0.15), transparent 72%),
    linear-gradient(180deg, #060d1a, #0a1120 45%, #0b1323);
}

.game-tabs,
.panel {
  width: min(1120px, 100%);
  margin-inline: auto;
}

.game-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.68rem;
  margin-top: 1.15rem;
  margin-bottom: 1rem;
}

.game-tab-btn {
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  background: rgba(7, 16, 34, 0.64);
  color: #9ab0ca;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.52rem;
  transition: all 0.22s ease;
}

.game-tab-btn:hover {
  transform: translateY(-1px);
  color: #e2f3ff;
  border-color: rgba(125, 211, 252, 0.5);
}

.game-tab-btn.active {
  color: #eefcff;
  border-color: rgba(45, 212, 191, 0.72);
  background: linear-gradient(140deg, rgba(45, 212, 191, 0.18), rgba(56, 189, 248, 0.2));
  box-shadow: 0 0 22px rgba(45, 212, 191, 0.2);
}

.panel {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(13, 24, 42, 0.68);
  backdrop-filter: blur(12px);
  padding: 1.2rem;
  box-shadow: 0 14px 36px rgba(2, 8, 23, 0.5);
}

.animate-fadeIn {
  animation: fadeIn 0.26s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .tasks-page {
    padding: 1rem;
  }

  .panel {
    border-radius: 15px;
    padding: 1rem;
  }

  .game-tabs {
    margin-top: 0.9rem;
  }
}

@media (max-width: 720px) {
  .game-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.58rem;
  }

  .game-tab-btn {
    height: 42px;
    font-size: 0.84rem;
  }
}
</style>
