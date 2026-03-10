import { ref, computed } from 'vue';
import axios from '@/utils/axios';
import { useAppToast } from './useAppToast';
import { useUserStore } from '@/modules/user/user.store';
import type { InventoryItem, ShopItem } from '@/types/shop';

export function useGamification() {
  const { showSuccessToast, showErrorToast } = useAppToast();
  const userStore = useUserStore();

  const userPoints = ref<any>(null);
  const currentLevel = ref<any>(null);
  const tasks = ref<any[]>([]);
  const rewards = ref<any[]>([]);
  const userRewards = ref<any[]>([]);
  const mailbox = ref<any[]>([]);
  const badges = ref<any[]>([]);
  const shopItems = ref<ShopItem[]>([]);
  const inventoryItems = ref<InventoryItem[]>([]);
  const shopTransactions = ref<any[]>([]);
  const userCurrency = ref(0);
  const loading = ref(false);

  const fetchUserPoints = async (userId: number) => {
    try {
      const res = await axios.get(`/api/points/${userId}`);
      userPoints.value = res.data.data;
    } catch (e) {
      console.error('fetchUserPoints:', e);
    }
  };

  const fetchCurrentLevel = async (userId: number) => {
    try {
      const res = await axios.get(`/api/levels/history/${userId}?limit=1`);
      if (res.data.data?.length > 0) currentLevel.value = res.data.data[0];
    } catch (e) {
      console.error('fetchCurrentLevel:', e);
    }
  };

  const upgradeLevel = async (userId: number) => {
    loading.value = true;
    try {
      const res = await axios.post('/api/levels/history/upgrade');
      showSuccessToast(res.data.message || 'Thang cap thanh cong!');

      if (userId) {
        await Promise.all([
          fetchUserPoints(userId),
          fetchCurrentLevel(userId),
          fetchMailbox(),
          fetchInventoryBadges(),
          fetchInventoryItems(),
          fetchUserCurrency(),
          userStore.fetchUserProfile(),
        ]);
      }
      return res.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi thang cap');
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchTasks = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/api/tasks');
      tasks.value = res.data.data || [];
    } catch (e) {
      tasks.value = [];
    } finally {
      loading.value = false;
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      await axios.post('/api/tasks/complete', { task_id: taskId });
      showSuccessToast('Hoan thanh nhiem vu! +Diem');
      await fetchTasks();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi hoan thanh nhiem vu');
      throw e;
    }
  };

  const fetchRewards = async (page = 1, limit = 10) => {
    loading.value = true;
    try {
      const res = await axios.get(`/api/rewards?page=${page}&limit=${limit}`);
      rewards.value = res.data.data || [];
      return res.data.pagination;
    } catch (e) {
      rewards.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchMailbox = async () => {
    try {
      const res = await axios.get('/api/user-rewards/mailbox');
      mailbox.value = res.data.data || [];
    } catch (e) {
      console.error('fetchMailbox:', e);
      mailbox.value = [];
    }
  };

  const claimFromMailbox = async (userRewardId: number) => {
    try {
      const res = await axios.post('/api/user-rewards/claim', { userRewardId });
      showSuccessToast(res.data.message || 'Nhan qua thanh cong!');
      await Promise.all([
        fetchMailbox(),
        fetchInventoryBadges(),
        fetchInventoryItems(),
        fetchUserCurrency(),
        userStore.fetchUserProfile(),
      ]);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi nhan qua');
      throw e;
    }
  };

  const fetchInventoryBadges = async () => {
    try {
      const res = await axios.get('/api/inventory/badges');
      badges.value = res.data.data || [];
    } catch (e) {
      console.error('fetchInventoryBadges:', e);
      badges.value = [];
    }
  };

  const equipBadge = async (rewardId: number) => {
    try {
      await axios.post('/api/inventory/equip', { rewardId });
      showSuccessToast('Deo huy hieu thanh cong!');
      await Promise.all([fetchInventoryBadges(), userStore.fetchUserProfile()]);
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi deo huy hieu');
      throw e;
    }
  };

  const fetchShopItems = async (itemType?: string) => {
    try {
      const res = await axios.get('/api/shop/items', { params: itemType ? { itemType } : {} });
      shopItems.value = res.data.data || [];
      return shopItems.value;
    } catch (e) {
      console.error('fetchShopItems:', e);
      shopItems.value = [];
      return [];
    }
  };

  const buyShopItem = async (itemId: number, quantity = 1) => {
    try {
      const res = await axios.post('/api/shop/buy', { itemId, quantity });
      showSuccessToast(res.data.message || 'Mua vat pham thanh cong!');
      await Promise.all([
        fetchInventoryItems(),
        fetchUserCurrency(),
        fetchShopTransactions(),
        userStore.fetchUserProfile(),
      ]);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi mua vat pham');
      throw e;
    }
  };

  const fetchInventoryItems = async (itemType?: string, includeExpired = false) => {
    try {
      const params: Record<string, string> = {};
      if (itemType) params.itemType = itemType;
      if (includeExpired) params.includeExpired = 'true';
      const res = await axios.get('/api/inventory/items', { params });
      inventoryItems.value = res.data.data || [];
      return inventoryItems.value;
    } catch (e) {
      console.error('fetchInventoryItems:', e);
      inventoryItems.value = [];
      return [];
    }
  };

  const equipInventoryItem = async (inventoryId: number) => {
    try {
      const res = await axios.post('/api/inventory/equip-item', { inventoryId });
      showSuccessToast(res.data.message || 'Trang bi vat pham thanh cong!');
      
      const userId = userStore.profile?.id;
      const tasks = [fetchInventoryItems(), userStore.fetchUserProfile()];
      if (res.data.data?.consumed && userId) {
        tasks.push(fetchUserPoints(userId));
      }
      
      await Promise.all(tasks);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi trang bi vat pham');
      throw e;
    }
  };

  const fetchShopTransactions = async (limit = 20) => {
    try {
      const res = await axios.get('/api/shop/transactions', { params: { limit } });
      shopTransactions.value = res.data.data || [];
      return shopTransactions.value;
    } catch (e) {
      console.error('fetchShopTransactions:', e);
      shopTransactions.value = [];
      return [];
    }
  };

  const fetchUserCurrency = async () => {
    try {
      const res = await axios.get('/api/currency/balance');
      userCurrency.value = res.data.data?.balance ?? 0;
    } catch (e) {
      console.error('fetchUserCurrency:', e);
    }
  };

  const levelProgress = computed(() => {
    if (!userPoints.value || !currentLevel.value || !currentLevel.value.next_level_points) return 0;
    const exp = userPoints.value.total_exp || 0;
    const next = currentLevel.value.next_level_points;
    return Math.min(100, Math.floor((exp / next) * 100));
  });

  return {
    userPoints,
    currentLevel,
    tasks,
    rewards,
    userRewards,
    mailbox,
    badges,
    shopItems,
    inventoryItems,
    shopTransactions,
    userCurrency,
    loading,
    levelProgress,
    fetchUserPoints,
    fetchCurrentLevel,
    upgradeLevel,
    fetchTasks,
    completeTask,
    fetchRewards,
    fetchMailbox,
    claimFromMailbox,
    fetchInventoryBadges,
    equipBadge,
    fetchShopItems,
    buyShopItem,
    fetchInventoryItems,
    equipInventoryItem,
    fetchShopTransactions,
    fetchUserCurrency,
  };
}

