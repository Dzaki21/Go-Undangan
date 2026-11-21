# Backend Platform Undangan Pernikahan Otomatis

Backend REST API menggunakan **Node.js**, **Express**, **TypeScript**, dan **Prisma ORM** (PostgreSQL) untuk platform pembuat undangan pernikahan otomatis yang terhubung ke Vercel API & Cloudinary.

---

## 🏗️ Arsitektur & Struktur Folder

```
server/
├── prisma/
│   └── schema.prisma        # Skema database (User, Invitation, GuestWish)
├── src/
│   ├── lib/
│   │   ├── prisma.ts        # Prisma Client singleton
│   │   └── cloudinary.ts    # Konfigurasi Cloudinary SDK
│   ├── middlewares/
│   │   ├── auth.ts          # Middleware JWT Bearer token
│   │   └── upload.ts        # Middleware Multer memory storage
│   ├── routes/
│   │   ├── auth.ts          # /api/auth/register, /api/auth/login
│   │   ├── invitations.ts   # CRUD draf undangan
│   │   ├── upload.ts        # Upload media gambar & audio ke Cloudinary
│   │   ├── deploy.ts        # Auto-Deploy Vercel & Check status
│   │   └── publicWishes.ts  # Endpoint publik RSVP & ucapan tamu (CORS *)
│   └── index.ts             # Express App entrypoint
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗄️ Skema Database (Prisma ORM)

1. **`User`**:
   - `id`: String (UUID)
   - `name`: String
   - `email`: String (Unique)
   - `passwordHash`: String (bcrypt)
   - `createdAt`: DateTime
   - Relasi: `invitations` (1-to-many ke `Invitation`)

2. **`Invitation`**:
   - `id`: String (UUID)
   - `userId`: String (Foreign Key)
   - `slug`: String (Unique, e.g. `radit-aulia`)
   - `templateKey`: String (`minimalist` | `floral` | `dark-luxury`)
   - `contentJson`: Json (seluruh 8 bagian undangan + config musik)
   - `vercelProjectId`: String (Nullable)
   - `vercelProjectName`: String (Nullable)
   - `latestDeploymentId`: String (Nullable)
   - `deploymentUrl`: String (Nullable, e.g. `https://undangan-radit-aulia-abcd.vercel.app`)
   - `deployStatus`: Enum (`draft` | `building` | `ready` | `failed`)
   - `publishedAt`: DateTime (Nullable)
   - `createdAt` & `updatedAt`: DateTime
   - Relasi: `wishes` (1-to-many ke `GuestWish`)

3. **`GuestWish`**:
   - `id`: String (UUID)
   - `invitationId`: String (Foreign Key)
   - `guestName`: String
   - `attendance`: Enum (`hadir` | `ragu` | `tidak_hadir`)
   - `guestCount`: Int (Nullable, default: 1)
   - `message`: String
   - `createdAt`: DateTime

---

## 📡 Daftar REST API Endpoints

### 1. Autentikasi (`/api/auth`)
- **`POST /api/auth/register`**:
  - Request body: `{ "name": "Budi", "email": "budi@example.com", "password": "password123" }`
  - Response: Data user dan JWT token.
- **`POST /api/auth/login`**:
  - Request body: `{ "email": "budi@example.com", "password": "password123" }`
  - Response: Data user dan JWT token.

### 2. CRUD Draf Undangan (`/api/invitations`) [Memerlukan Header: `Authorization: Bearer <token>`]
- **`POST /api/invitations`**: Buat draf undangan baru.
  - Body: `{ "slug": "radit-aulia", "templateKey": "floral", "contentJson": { ...8 bagian data... } }`
- **`GET /api/invitations`**: Mengambil semua daftar undangan milik user yang login.
- **`GET /api/invitations/:id`**: Mengambil detail lengkap draf undangan termasuk ucapan tamu.
- **`PUT /api/invitations/:id`**: Mengubah isi konten/template/slug draf undangan.

### 3. Upload Media (`POST /api/upload`) [Memerlukan Header: `Authorization: Bearer <token>`]
- Multipart form-data dengan key: `file` (Mendukung gambar: JPG, PNG, WebP dan file audio `.mp3`).
- File langsung di-stream ke Cloudinary (`folder: 'undangan_pernikahan'`).
- Mengembalikan `secure_url` yang siap dimasukkan ke `photoUrl`, `gallery`, atau `music.audioUrl`.

### 4. Auto-Deploy Vercel (`/api/invitations`) [Memerlukan Header: `Authorization: Bearer <token>`]
- **`POST /api/invitations/:id/publish`**:
  1. Membuat project baru di Vercel: `POST https://api.vercel.com/v10/projects` dengan nama `undangan-{slug}-{random4char}` yang terhubung ke repositori GitHub `GITHUB_REPO`.
  2. Menyuntikkan environment variable `VITE_INVITATION_DATA` (berisi JSON konten undangan + `theme` + `invitationId` + `apiBaseUrl`).
  3. Memanggil `POST https://api.vercel.com/v13/deployments` untuk memicu build otomatis.
  4. Menyimpan `vercelProjectId`, `vercelProjectName`, `latestDeploymentId`, dan `deploymentUrl` (`https://{projectName}.vercel.app`) ke database PostgreSQL, serta mengubah status menjadi `building`.
- **`GET /api/invitations/:id/deploy-status`**:
  - Melakukan polling langsung ke Vercel API (`GET https://api.vercel.com/v13/deployments/:latestDeploymentId`).
  - Mengupdate status lokal ke database (`ready`, `building`, atau `failed`) dan mengembalikan status kesiapan web kepada pemanggil.

### 5. Endpoint Publik RSVP & Ucapan (`/api/public/wishes`) [CORS Terbuka `*`]
- **`GET /api/public/wishes/:invitationId`**: Mengambil daftar ucapan dan konfirmasi tamu.
- **`POST /api/public/wishes/:invitationId`**: Mengirim ucapan & konfirmasi kehadiran baru dari web undangan hasil build Vercel:
  - Body: `{ "guestName": "Dimas", "attendance": "hadir", "guestCount": 2, "message": "Selamat menempuh hidup baru!" }`

---

## ⚙️ Petunjuk Setup & Menjalankan

1. Masuk ke direktori server:
   ```bash
   cd server
   ```

2. Salin dan sesuaikan variabel lingkungan:
   ```bash
   cp .env.example .env
   ```
   Isi konfigurasi Anda:
   - `DATABASE_URL`: URL PostgreSQL (misal dari Supabase, Neon, atau Docker lokal).
   - `JWT_SECRET`: Kunci enkripsi token JWT.
   - `CLOUDINARY_*`: Kredensial akun Cloudinary.
   - `VERCEL_TOKEN`: Vercel Personal Access Token.
   - `GITHUB_REPO`: `username/repo-name` dari repositori frontend ini.

3. Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Jalankan server backend:
   ```bash
   # Mode Development dengan Hot Reload
   npm run dev

   # Mode Production
   npm run build
   npm start
   ```
