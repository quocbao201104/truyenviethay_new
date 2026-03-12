import { ref, computed } from 'vue';
import axios from '@/utils/axios';
import { useAppToast } from './useAppToast';
import { useUserStore } from '@/modules/user/user.store';
import type { InventoryItem, ShopItem } from '@/types/shop';
import type { MailboxItem, TaskItem } from '@/types/gamification';

export function useGamification() {
  const { showSuccessToast, showErrorToast } = useAppToast();
  const userStore = useUserStore();

  const userPoints = ref<any>(null);
  const currentLevel = ref<any>(null);
  const tasks = ref<TaskItem[]>([]);
  const rewards = ref<any[]>([]);
  const userRewards = ref<any[]>([]);
  const mailbox = ref<MailboxItem[]>([]);
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
      const res = await axios.post('/api/tasks/complete', { task_id: taskId });
      showSuccessToast(res.data.message || 'Cap nhat nhiem vu thanh cong');
      await fetchTasks();
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi hoan thanh nhiem vu');
      throw e;
    }
  };

  const claimTask = async (taskId: number) => {
    try {
      const res = await axios.post('/api/tasks/claim', { task_id: taskId });
      showSuccessToast(res.data.message || 'Nhan thuong thanh cong!');
      await Promise.all([
        fetchTasks(),
        fetchUserCurrency(),
        userStore.fetchUserProfile(),
      ]);
      const userId = userStore.profile?.id;
      if (userId) {
        await Promise.all([
          fetchUserPoints(userId),
          fetchCurrentLevel(userId),
        ]);
      } else {
        await fetchTasks();
      }
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi nhan thuong nhiem vu');
      await fetchTasks();
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
      const res = await axios.get('/api/mailbox');
      mailbox.value = res.data.data || [];
    } catch (e) {
      console.error('fetchMailbox:', e);
      mailbox.value = [];
    }
  };

  const readMail = async (mailId: number) => {
    try {
      const res = await axios.get(`/api/mailbox/${mailId}`);
      return res.data.data;
    } catch (e) {
      console.error('readMail:', e);
      return null;
    }
  };

  const claimFromMailbox = async (mailId: number) => {
    try {
      const res = await axios.post(`/api/mailbox/${mailId}/claim`);
      showSuccessToast(res.data.message || 'Nhận quà thành công!');
      await Promise.all([
        fetchMailbox(),
        fetchInventoryBadges(),
        fetchInventoryItems(),
        fetchUserCurrency(),
        userStore.fetchUserProfile(),
      ]);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi khi nhận quà');
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
      showSuccessToast('Thao tác huy hiệu thành công!');
      await Promise.all([
        fetchInventoryBadges(),
        fetchInventoryItems(),
        userStore.fetchUserProfile()
      ]);
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

  const fetchInventoryItems = async (
    itemType?: string,
    includeExpired = false,
    options?: { limit?: number; offset?: number }
  ) => {
    try {
      const params: Record<string, string | number> = {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
      };
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
      const consumed = res.data.data?.consumed;
      showSuccessToast(consumed ? 'Sử dụng vật phẩm thành công!' : 'Trang bị vật phẩm thành công!');
      
      const userId = userStore.profile?.id;
      const tasks: Promise<any>[] = [fetchInventoryItems(), userStore.fetchUserProfile()];
      
      const itemData = res.data.data;
      
      // If equipping a badge, we MUST refresh reward badges too for sync
      if (itemData?.item_type === 'badge') {
        tasks.push(fetchInventoryBadges());
      }

      if (consumed && userId) {
        tasks.push(fetchUserPoints(userId));
      }
      
      await Promise.all(tasks);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Loi khi trang bi vat pham');
      throw e;
    }
  };

  const fetchShopTransactions = async (limit = 50, offset = 0) => {
    try {
      const res = await axios.get('/api/shop/transactions', {
        params: { limit, offset },
      });
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
    claimTask,
    fetchRewards,
    fetchMailbox,
    readMail,
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
