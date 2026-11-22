import { ThemeType } from '../themes';

export interface PersonProfile {
  fullName: string;
  nickName: string;
  parents: string; // contoh: "Putra dari Bpk. Ahmad & Ibu Siti"
  instagramUrl?: string;
  instagramUsername?: string;
  photoUrl: string;
}

export interface EventDetail {
  title: string;
  dayName: string;
  dateFormatted: string; // e.g. "Sabtu, 28 Desember 2026"
  timeFormatted: string; // e.g. "08.00 - 10.00 WIB"
  locationName: string; // e.g. "Masjid Agung Al-Azhar"
  address: string;
  googleMapsUrl: string;
}

export interface LoveStoryItem {
  yearOrDate: string;
  title: string;
  story: string;
  photoUrl?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
}

export interface PhysicalGift {
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  note?: string;
}

export interface RsvpComment {
  id: string;
  name: string;
  attendance: 'hadir' | 'ragu' | 'tidak_hadir';
  guestCount?: number;
  message: string;
  createdAt: string;
}

export interface InvitationData {
  theme?: ThemeType;
  meta: {
    title: string;
    description: string;
  };
  eventDateIso: string; // ISO string for Countdown, e.g. "2026-12-28T09:00:00+07:00"
  music: {
    audioUrl: string;
    title?: string;
  };
  quote: {
    text: string;
    source: string;
  };
  groom: PersonProfile;
  bride: PersonProfile;
  events: {
    akad: EventDetail;
    resepsi?: EventDetail & { enabled: boolean };
  };
  loveStory?: LoveStoryItem[];
  gallery?: string[];
  gifts?: {
    accounts: BankAccount[];
    physicalGift?: PhysicalGift;
  };
  defaultComments?: RsvpComment[];
  invitationId?: string;
  slug?: string;
  apiBaseUrl?: string;
}
