# Backend Platform Undangan Pernikahan Otomatis

Backend REST API menggunakan **Node.js**, **Express**, **TypeScript**, dan **Prisma ORM** (PostgreSQL) dengan sistem autentikasi & otorisasi Role-Based Access Control (RBAC: `USER` & `ADMIN`).

---

## 🏗️ Struktur & Modul Baru

```
server/
├── prisma/
│   ├── schema.prisma        # Model User (Role USER/ADMIN), Invitation, GuestWish, PresetSong, TemplateCatalog
│   └── seed.ts              # Seeder admin default & 3 template catalog
├── src/
│   ├── lib/
│   │   ├── prisma.ts        # Prisma Client singleton
│   │   └── cloudinary.ts    # Konfigurasi Cloudinary SDK
│   ├── middlewares/
│   │   ├── auth.ts          # Middleware authenticate & requireAdmin
│   │   └── upload.ts        # Middleware Multer upload audio/gambar
│   ├── routes/
│   │   ├── auth.ts          # /api/auth (register role USER, login JWT + role, me)
│   │   ├── admin.ts         # /api/admin (stats, all invitations, all users, CRUD songs & templates)
│   │   ├── master.ts        # /api/master/presets (publik/user: list active songs & templates)
│   │   ├── invitations.ts   # CRUD draf undangan milik user
│   │   ├── upload.ts        # Upload media mandiri Cloudinary
│   │   ├── deploy.ts        # Auto-Deploy Vercel & Check status
│   │   └── publicWishes.ts  # Endpoint publik RSVP & ucapan tamu (CORS *)
│   └── index.ts             # Express App entrypoint
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗄️ Model Database (Prisma ORM)

1. **`User`**:
   - `id`: String (UUID)
   - `name`: String
   - `email`: String (Unique)
   - `passwordHash`: String
   - `role`: Enum `Role` (`USER` | `ADMIN`, default: `USER`)
   - `createdAt`: DateTime
   - Relasi: `invitations` ke `Invitation`

2. **`Invitation`**:
   - `id`: String (UUID)
   - `userId`: String (Foreign Key)
   - `slug`: String (Unique)
   - `templateKey`: String (`minimalist` | `floral` | `dark-luxury`)
   - `contentJson`: Json
   - `vercelProjectId`: String?
   - `vercelProjectName`: String?
   - `latestDeploymentId`: String?
   - `deploymentUrl`: String?
   - `deployStatus`: Enum `DeployStatus` (`draft` | `building` | `ready` | `failed`)
   - `publishedAt`: DateTime?
   - `createdAt` & `updatedAt`: DateTime
   - Relasi: `wishes` ke `GuestWish`

3. **`GuestWish`**:
   - `id`: String (UUID)
   - `invitationId`: String (Foreign Key)
   - `guestName`: String
   - `attendance`: Enum `Attendance` (`hadir` | `ragu` | `tidak_hadir`)
   - `guestCount`: Int?
   - `message`: String
   - `createdAt`: DateTime

4. **`PresetSong` (Tabel Master)**:
   - `id`: String (UUID)
   - `title`: String
   - `artist`: String?
   - `audioUrl`: String
   - `isActive`: Boolean (default: true)
   - `createdAt`: DateTime

5. **`TemplateCatalog` (Tabel Master)**:
   - `id`: String (UUID)
   - `templateKey`: String (Unique: `minimalist` | `floral` | `dark-luxury`)
   - `name`: String
   - `description`: String
   - `thumbnailUrl`: String
   - `isActive`: Boolean (default: true)
   - `createdAt`: DateTime

---

## 🔑 Endpoint Autentikasi & Otorisasi

### 1. Autentikasi (`/api/auth`)
- **`POST /api/auth/register`**:
  - Otomatis mendaftar dengan role `USER`.
  - Mengembalikan objek user (dengan role `USER`) dan JWT Token.
- **`POST /api/auth/login`**:
  - Mengembalikan objek user lengkap dengan rolenya dan JWT Token berisikan payload `{ userId, email, role }`.
- **`GET /api/auth/me`** *(Header: `Authorization: Bearer <token>`)*:
  - Mengembalikan profil dan role user yang sedang aktif.

### 2. Endpoint Khusus Admin (`/api/admin`) *(Header: `Authorization: Bearer <token>` + Role `ADMIN`)*
- **`GET /api/admin/stats`**:
  - Mengembalikan total user, total undangan, undangan status `ready`, `building`, dan `failed`.
- **`GET /api/admin/invitations`**:
  - Menampilkan seluruh undangan dari semua user lengkap dengan nama pembuat, slug, `deployStatus`, dan `deploymentUrl`.
- **`GET /api/admin/users`**:
  - Menampilkan seluruh daftar user dan jumlah undangan yang dibuatnya.
- **CRUD `PresetSong`**:
  - `GET /api/admin/preset-songs`: Daftar semua lagu preset.
  - `POST /api/admin/preset-songs`: Tambah lagu preset (bisa via link `audioUrl` atau upload file `.mp3` langsung via multipart `audioFile` yang otomatis di-upload ke Cloudinary).
  - `PUT /api/admin/preset-songs/:id`: Update data judul, artis, link audio, atau status `isActive`.
  - `DELETE /api/admin/preset-songs/:id`: Menghapus lagu preset.
- **CRUD/Update `TemplateCatalog`**:
  - `GET /api/admin/templates`: Daftar semua katalog tema template.
  - `PATCH /api/admin/templates/:id`: Mengubah status aktif `isActive`, judul nama, deskripsi, atau thumbnail template.

### 3. Endpoint Publik/User Presets (`/api/master`)
- **`GET /api/master/presets`**:
  - Endpoint publik untuk mengambil daftar lagu preset dan template tema yang statusnya `isActive: true` untuk ditampilkan pada pilihan form builder user.

---

## 🛠️ Menjalankan Database Seeder

Untuk mengisi default Administrator (`admin@goundangan.com` / `AdminPassword123!`) dan 3 katalog template awal:
```bash
cd server
npm run seed
```
