import { InvitationData } from './types/invitation';

export const fallbackInvitationData: InvitationData = {
  theme: 'minimalist',
  meta: {
    title: "The Wedding of Radit & Aulia",
    description: "Undangan Pernikahan Raditya Bagas & Aulia Rahma",
  },
  eventDateIso: "2026-12-28T08:00:00+07:00",
  music: {
    // Royalty-free acoustic romantic melody
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c97698a3c8.mp3?filename=acoustic-guitars-ambient-uplifting-112191.mp3",
    title: "Acoustic Wedding Harmony",
  },
  quote: {
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21",
  },
  groom: {
    fullName: "Raditya Bagas Pratama, S.Kom.",
    nickName: "Radit",
    parents: "Putra pertama dari Bpk. Ir. Bambang Hermanto & Ibu Sri Wahyuni",
    instagramUsername: "radityabagas",
    instagramUrl: "https://instagram.com/radityabagas",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
  },
  bride: {
    fullName: "Aulia Rahma Safitri, S.Ds.",
    nickName: "Aulia",
    parents: "Putri kedua dari Bpk. Drs. H. Suryono & Ibu Hj. Ratna Juwita",
    instagramUsername: "auliarahma",
    instagramUrl: "https://instagram.com/auliarahma",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
  },
  events: {
    akad: {
      title: "Akad Nikah",
      dayName: "Sabtu",
      dateFormatted: "28 Desember 2026",
      timeFormatted: "08.00 - 10.00 WIB",
      locationName: "Grand Ballroom Hotel Mulia",
      address: "Jl. Asia Afrika Senayan, Gelora, Jakarta Pusat, DKI Jakarta",
      googleMapsUrl: "https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta",
    },
    resepsi: {
      enabled: true,
      title: "Resepsi Pernikahan",
      dayName: "Sabtu",
      dateFormatted: "28 Desember 2026",
      timeFormatted: "11.00 - 14.00 WIB",
      locationName: "Grand Ballroom Hotel Mulia",
      address: "Jl. Asia Afrika Senayan, Gelora, Jakarta Pusat, DKI Jakarta",
      googleMapsUrl: "https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta",
    },
  },
  loveStory: [
    {
      yearOrDate: "2019",
      title: "Pertama Bertemu",
      story: "Kami pertama kali dipertemukan dalam sebuah seminar teknologi di kampus. Obrolan singkat mengenai hobi dan buku ternyata menjadi awal dari kisah kami.",
      photoUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    },
    {
      yearOrDate: "2022",
      title: "Komitmen Bersama",
      story: "Setelah melewati berbagai perjalanan suka dan duka dalam saling mengenal kepribadian masing-masing, kami sepakat untuk melangkah ke jenjang yang lebih serius.",
      photoUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80",
    },
    {
      yearOrDate: "2025",
      title: "Hari Lamaran",
      story: "Di hadapan kedua keluarga besar, kami mengikrarkan janji suci pertunangan dan memohon restu untuk menyatukan dua keluarga dalam ikatan pernikahan.",
      photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
  ],
  gifts: {
    accounts: [
      {
        bankName: "BCA",
        accountNumber: "8410293819",
        accountHolder: "Raditya Bagas Pratama",
      },
      {
        bankName: "Bank Mandiri",
        accountNumber: "1370019283741",
        accountHolder: "Aulia Rahma Safitri",
      },
      {
        bankName: "GoPay / Dana",
        accountNumber: "081298765432",
        accountHolder: "Aulia Rahma",
      },
    ],
    physicalGift: {
      recipientName: "Raditya Bagas & Aulia Rahma",
      phoneNumber: "0812-9876-5432",
      fullAddress: "Apartemen Senayan City Tower Dahlia Unit 12B, Jl. Asia Afrika No. 19, RT 01 / RW 03, Gelora, Tanah Abang, Jakarta Pusat 10270",
      note: "Mohon sertakan nama pengirim pada label paket agar kami dapat menyampaikan ucapan terima kasih secara personal.",
    },
  },
  defaultComments: [
    {
      id: "1",
      name: "Dimas & Sarah",
      attendance: "hadir",
      guestCount: 2,
      message: "Selamat menempuh hidup baru Radit & Aulia! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu sampai kakek nenek!",
      createdAt: "1 jam yang lalu",
    },
    {
      id: "2",
      name: "Rizky Firmansyah",
      attendance: "hadir",
      guestCount: 1,
      message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khoir. Lancar sampai hari H bro Radit!",
      createdAt: "3 jam yang lalu",
    },
    {
      id: "3",
      name: "Maya Anggraini",
      attendance: "ragu",
      guestCount: 1,
      message: "Happy Wedding Aulia sayang! Cantik banget prewednya. Aku usahakan hadir yaa, semoga acaranya lancar tanpa halangan.",
      createdAt: "5 jam yang lalu",
    },
  ],
};

/**
 * Membaca data undangan dari environment variable VITE_INVITATION_DATA (JSON string).
 * Jika tidak tersedia atau terjadi error parsing, mengembalikan fallbackInvitationData.
 */
export function getInvitationData(): InvitationData {
  const envRaw = import.meta.env.VITE_INVITATION_DATA;

  if (!envRaw || typeof envRaw !== 'string' || envRaw.trim() === '') {
    return fallbackInvitationData;
  }

  try {
    const parsed = JSON.parse(envRaw);
    return {
      ...fallbackInvitationData,
      ...parsed,
      theme: parsed.theme || fallbackInvitationData.theme,
      quote: { ...fallbackInvitationData.quote, ...(parsed.quote || {}) },
      groom: { ...fallbackInvitationData.groom, ...(parsed.groom || {}) },
      bride: { ...fallbackInvitationData.bride, ...(parsed.bride || {}) },
      events: {
        akad: { ...fallbackInvitationData.events.akad, ...(parsed.events?.akad || {}) },
        resepsi: parsed.events?.resepsi
          ? { ...fallbackInvitationData.events.resepsi, ...parsed.events.resepsi }
          : fallbackInvitationData.events.resepsi,
      },
      gifts: {
        accounts: parsed.gifts?.accounts ?? fallbackInvitationData.gifts?.accounts ?? [],
        physicalGift: parsed.gifts?.physicalGift ?? fallbackInvitationData.gifts?.physicalGift,
      },
    };
  } catch (error) {
    console.warn("Gagal mem-parse VITE_INVITATION_DATA, menggunakan fallback data:", error);
    return fallbackInvitationData;
  }
}
