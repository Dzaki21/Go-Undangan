export interface UserProfile {
  id: string;
  name: string;
  email: string;
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
  templateKey: 'minimalist' | 'floral' | 'dark-luxury';
  deployStatus: 'draft' | 'building' | 'ready' | 'failed';
  deploymentUrl?: string;
  vercelProjectName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
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
