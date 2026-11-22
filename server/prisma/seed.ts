import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai database seeding...');

  // 1. Buat default ADMIN
  const adminEmail = 'admin@goundangan.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('AdminPassword123!', salt);

    const admin = await prisma.user.create({
      data: {
        name: 'Super Administrator',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Default admin dibuat: ${admin.email} (Role: ${admin.role})`);
  } else {
    // Pastikan rolenya ADMIN jika sudah ada
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Role akun ${adminEmail} diperbarui menjadi ADMIN`);
    } else {
      console.log(`ℹ️ Akun admin (${adminEmail}) sudah ada.`);
    }
  }

  // 2. Seeding 3 Template Catalog
  const templates = [
    {
      templateKey: 'minimalist',
      name: 'Minimalist Warm',
      description: 'Dominan putih dan krem hangat dengan tipografi serif klasik yang lapang, elegan, dan estetik.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80',
      isActive: true,
    },
    {
      templateKey: 'floral',
      name: 'Soft Floral Sage',
      description: 'Nuansa botanical sage green dan ornamen floral dedaunan lembut yang asri dan romantis.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
      isActive: true,
    },
    {
      templateKey: 'dark-luxury',
      name: 'Dark Luxury & Gold',
      description: 'Latar belakang hitam & charcoal malam dengan kilau emas mewah (*gold accent*) berkelas istimewa.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80',
      isActive: true,
    },
  ];

  for (const t of templates) {
    await prisma.templateCatalog.upsert({
      where: { templateKey: t.templateKey },
      update: {
        name: t.name,
        description: t.description,
        thumbnailUrl: t.thumbnailUrl,
        isActive: t.isActive,
      },
      create: t,
    });
    console.log(`✅ Template catalog siap: ${t.name} (${t.templateKey})`);
  }

  // 3. Optional: Seeding initial Preset Songs jika kosong
  const songCount = await prisma.presetSong.count();
  if (songCount === 0) {
    const initialSongs = [
      {
        title: 'Acoustic Wedding Harmony',
        artist: 'Wedding Studio',
        audioUrl: '/audio/wedding-song.mp3',
        isActive: true,
      },
      {
        title: 'Romantic Piano Ballad',
        artist: 'Wedding Studio',
        audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
        isActive: true,
      },
      {
        title: 'Dreamy Ambient Love',
        artist: 'Wedding Studio',
        audioUrl: '/audio/wedding-song.mp3',
        isActive: true,
      },
    ];

    for (const song of initialSongs) {
      await prisma.presetSong.create({ data: song });
    }
    console.log(`✅ Berhasil menambahkan ${initialSongs.length} preset songs awal.`);
  }

  console.log('🎉 Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
