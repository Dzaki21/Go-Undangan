export type Role = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserProfile;
    token: string;
  };
}

export interface InvitationListItem {
  id: string;
  slug: string;
  templateKey: 'minimalist' | 'floral' | 'dark-luxury' | 'royal-vintage';
  deployStatus: 'draft' | 'building' | 'ready' | 'failed';
  deploymentUrl?: string;
  vercelProjectName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    wishes: number;
  };
}

export interface GuestWishItem {
  id: string;
  invitationId: string;
  guestName: string;
  attendance: 'hadir' | 'ragu' | 'tidak_hadir';
  guestCount?: number;
  message: string;
  createdAt: string;
}

export interface PresetSongItem {
  id: string;
  title: string;
  artist?: string | null;
  audioUrl: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface TemplateCatalogItem {
  id: string;
  templateKey: 'minimalist' | 'floral' | 'dark-luxury' | 'royal-vintage';
  name: string;
  description: string;
  thumbnailUrl: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface MasterPresetsResponse {
  success: boolean;
  data: {
    songs: PresetSongItem[];
    templates: TemplateCatalogItem[];
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    totalInvitations: number;
    readyInvitations: number;
    buildingInvitations: number;
    failedInvitations: number;
  };
}
