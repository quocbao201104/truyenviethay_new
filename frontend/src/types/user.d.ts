// frontend/src/types/user.d.ts
import type { Badge } from './badge';
import type { AvatarFrame } from './shop';

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    role: 'user' | 'author' | 'admin';
    gender: 'male' | 'female' | 'other';
    created_at: string;
    status: 'active' | 'blocked';
    ban_until: string | null;
    level_id?: number | null;
    badge?: Badge | null;
    equipped_frame?: AvatarFrame | null;
}

export interface UpdateUserPayload {
    full_name?: string;
    email?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    avatar?: File | string | null;
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}

export interface UserPaginationResponse {
    message: string;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats?: {
        totalUsers: number;
        activeUsers: number;
        blockedUsers: number;
        authorUsers: number;
    };
}

export interface AuthorApplicationPayload {
    pen_name: string;
    bio: string;
    experience: string;
}

