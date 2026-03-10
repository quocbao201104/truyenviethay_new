export interface AvatarFrame {
  inventory_id: number;
  item_id: number;
  name: string;
  description?: string | null;
  image_url: string | null;
  css_class: string | null;
}

export type ShopItemType = 'avatar_frame' | 'badge' | 'consumable' | 'chat_color';

export interface ShopItem {
  id: number;
  name: string;
  description: string | null;
  item_type: ShopItemType;
  price: number;
  duration_days: number | null;
  image_url: string | null;
  css_class: string | null;
  status: 'active' | 'hidden';
  created_at: string;
}

export interface InventoryItem {
  inventory_id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  is_equipped: boolean;
  expires_at: string | null;
  acquired_from: 'shop_buy' | 'gacha' | 'quest_reward' | 'admin_gift';
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  item_type: ShopItemType;
  price: number;
  duration_days: number | null;
  image_url: string | null;
  css_class: string | null;
  status: 'active' | 'hidden';
  is_expired?: boolean;
}

