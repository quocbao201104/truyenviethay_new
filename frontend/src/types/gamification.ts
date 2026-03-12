/**
 * Gamification types – tương thích backend sau Phase 1–5
 */

/** User mailbox message (new domain-separated model) */
export interface MailboxItem {
  id: number;
  subject: string;
  body: string | null;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  mail_type: 'reward' | 'announcement' | 'compensation' | 'system';
  is_claimable: boolean;
  is_claimed: boolean;
  sent_at: string;
  expires_at: string | null;
  read_at: string | null;
  claimed_at: string | null;
  attachments?: MailboxAttachment[];
}

export interface MailboxAttachment {
  id: number;
  mail_id: number;
  attachment_type: 'reward' | 'item' | 'currency' | 'points';
  reward_id: number | null;
  item_id: number | null;
  quantity: number;
  status: 'pending' | 'claimed' | 'expired';
  reward_name?: string;
  reward_type?: string;
  reward_icon?: string;
}

/** Task với status từ user_tasks */
export interface TaskItem {
  user_task_id?: number | null;
  task_id: number;
  task_name: string;
  description: string | null;
  points_awarded: number;
  status: 'pending' | 'in_progress' | 'completed' | 'claimed' | 'expired' | null;
  level_id?: number;
  repeat_type?: string;
  progress_current?: number;
  progress_target?: number;
  completed_at?: string | null;
  claimed_at?: string | null;
  is_claimable?: boolean;
}
