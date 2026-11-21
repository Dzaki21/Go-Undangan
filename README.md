# Go Undangan - Frontend Undangan Pernikahan Digital

Aplikasi web undangan pernikahan digital responsif (mobile-first) menggunakan **React**, **Vite**, **TypeScript**, dan **Tailwind CSS**. Didesain secara modular untuk auto-deployment (misalnya di Vercel, Netlify, Cloudflare Pages, atau CI/CD automation) dengan konfigurasi dinamis berbasis Environment Variable.

---

## 🚀 Fitur Utama

1. **Auto-Deployment Ready**: Membaca data undangan secara otomatis dari variabel lingkungan `VITE_INVITATION_DATA` (JSON string). Jika tidak diset, sistem akan otomatis menggunakan data dummy fallback yang lengkap.
2. **8 Bagian Konten Lengkap**:
   - **Cover Pembuka**: Nama panggilan kedua mempelai, tanggal hari H, sapaan nama tamu personal dari query URL `?to=Nama+Tamu` (default: "Tamu Undangan"), serta tombol *"Buka Undangan"* yang membuka kunci scroll.
   - **Salam Pembuka & Kutipan**: Ucapan salam islami/formal dan kartu kutipan suci / quote.
   - **Profil Kedua Mempelai**: Foto avatar, nama lengkap & gelar, nama orang tua, serta tombol link akun Instagram.
   - **Detail Waktu & Lokasi**: Countdown timer real-time (hari, jam, menit, detik) menuju hari H, sesi Akad Nikah, sesi Resepsi (dapat diaktifkan/dinonaktifkan lewat config), dan tombol *"Buka Google Maps"*.
   - **Love Story**: Timeline perjalanan kisah cinta (otomatis disembunyikan jika kosong).
   - **Galeri Foto**: Grid foto pre-wedding dengan Lightbox popup preview (otomatis disembunyikan jika kosong).
   - **Amplop Digital / Wedding Gift**: Daftar rekening & e-wallet dengan fitur salin rekening satu-klik (*copy to clipboard* + notifikasi toast) serta alamat kirim kado fisik.
   - **RSVP & Ucapan**: Formulir konfirmasi kehadiran (Hadir, Ragu-ragu, Tidak Hadir), jumlah tamu, ucapan/doa restu, feed daftar ucapan tamu, dan footer ucapan terima kasih.
3. **Background Music Auto-Play**: Musik latar otomatis berputar begitu tombol *"Buka Undangan"* ditekan, dilengkapi tombol floating melayang yang berputar (*rotating vinyl disc effect*) di pojok layar untuk kontrol play/pause.
4. **Desain Elegan & Mobile-First**: Palet warna gold & stone bernuansa mewah, tipografi Serif & Sans yang anggun, serta layout yang optimal pada layar smartphone maupun desktop.

---

## 🛠️ Panduan Penggunaan & Konfigurasi

### 1. Menjalankan di Localhost

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Buka browser di http://localhost:5173/?to=Budi+Santoso
```

### 2. Konfigurasi `VITE_INVITATION_DATA`

Untuk auto-deployment atau kustomisasi tanpa perlu mengubah kode, Anda cukup mendefinisikan environment variable `VITE_INVITATION_DATA` pada dashboard platform hosting (Vercel / Netlify / GitHub Secrets) dengan JSON yang sudah di-*stringify*:

Contoh format JSON:
```json
{
  "theme": "floral",
  "meta": {
    "title": "The Wedding of Romeo & Juliet",
    "description": "Undangan Pernikahan Romeo & Juliet"
  },
  "eventDateIso": "2026-12-28T08:00:00+07:00",
  "music": {
    "audioUrl": "https://example.com/wedding-song.mp3",
    "title": "Acoustic Wedding Harmony"
  },
  "quote": {
    "text": "Dan di antara tanda-tanda kebesaran-Nya...",
    "source": "QS. Ar-Rum: 21"
  },
  "groom": {
    "fullName": "Romeo Montague, S.T.",
    "nickName": "Romeo",
    "parents": "Putra dari Bpk. Montague & Ibu Lady Montague",
    "instagramUsername": "romeo",
    "instagramUrl": "https://instagram.com/romeo",
    "photoUrl": "https://images.unsplash.com/photo-..."
  },
  "bride": {
    "fullName": "Juliet Capulet, S.Ked.",
    "nickName": "Juliet",
    "parents": "Putri dari Bpk. Capulet & Ibu Lady Capulet",
    "instagramUsername": "juliet",
    "instagramUrl": "https://instagram.com/juliet",
    "photoUrl": "https://images.unsplash.com/photo-..."
  },
  "events": {
    "akad": {
      "title": "Akad Nikah",
      "dayName": "Sabtu",
      "dateFormatted": "28 Desember 2026",
      "timeFormatted": "08.00 - 10.00 WIB",
      "locationName": "Masjid Raya",
      "address": "Jl. Protokol No. 1",
      "googleMapsUrl": "https://maps.google.com"
    },
    "resepsi": {
      "enabled": true,
      "title": "Resepsi Pernikahan",
      "dayName": "Sabtu",
      "dateFormatted": "28 Desember 2026",
      "timeFormatted": "11.00 - 14.00 WIB",
      "locationName": "Ballroom Hotel",
      "address": "Jl. Protokol No. 2",
      "googleMapsUrl": "https://maps.google.com"
    }
  },
  "loveStory": [
    {
      "yearOrDate": "2020",
      "title": "Awal Jumpa",
      "story": "Kisah pertama kali bertemu..."
    }
  ],
  "gallery": [
    "https://images.unsplash.com/photo-..."
  ],
  "gifts": {
    "accounts": [
      {
        "bankName": "BCA",
        "accountNumber": "1234567890",
        "accountHolder": "Romeo"
      }
    ],
    "physicalGift": {
      "recipientName": "Romeo & Juliet",
      "phoneNumber": "08123456789",
      "fullAddress": "Jl. Mawar No. 10, Jakarta",
      "note": "Sertakan nama pengirim"
    }
  }
}
```

### 3. URL Query Nama Tamu

Untuk mengundang tamu secara personal, gunakan query string `?to=`:
- `https://domain-anda.com/?to=Bapak+Joko+Widodo`
- `https://domain-anda.com/?to=Siti+Aisyah,+M.Sc`
Jika parameter `?to` kosong, otomatis menampilkan `"Tamu Undangan"`.
