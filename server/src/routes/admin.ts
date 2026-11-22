import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { uploadMiddleware } from '../middlewares/upload';
import cloudinary from '../lib/cloudinary';
import { Readable } from 'stream';

const router = Router();

// Proteksi seluruh route admin dengan authenticate dan requireAdmin
router.use(authenticate, requireAdmin);

// ==========================================
// 1. STATISTIK ADMIN
// GET /api/admin/stats
// ==========================================
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalInvitations, readyInvitations, failedInvitations, buildingInvitations] =
      await Promise.all([
        prisma.user.count(),
        prisma.invitation.count(),
        prisma.invitation.count({ where: { deployStatus: 'ready' } }),
        prisma.invitation.count({ where: { deployStatus: 'failed' } }),
        prisma.invitation.count({ where: { deployStatus: 'building' } }),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalInvitations,
        readyInvitations,
        buildingInvitations,
        failedInvitations,
      },
    });
  } catch (error: any) {
    console.error('Error get admin stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik', error: error.message });
  }
});

// ==========================================
// 2. DAFTAR SELURUH UNDANGAN DARI SEMUA USER
// GET /api/admin/invitations
// ==========================================
router.get('/invitations', async (_req: Request, res: Response): Promise<void> => {
  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { wishes: true },
        },
      },
    });

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error: any) {
    console.error('Error get all invitations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar undangan', error: error.message });
  }
});

// ==========================================
// 2b. APPROVE / REJECT PEMBAYARAN OLEH ADMIN
// PATCH /api/admin/invitations/:id/payment-status
// ==========================================
router.patch('/invitations/:id/payment-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // 'approved' | 'rejected' | 'unpaid'

    if (!['approved', 'rejected', 'unpaid', 'pending_approval'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status pembayaran tidak valid' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const updateData: any = {
      paymentStatus: status,
      paymentApprovedAt: status === 'approved' ? new Date() : null,
    };

    // Default masa aktif 3 bulan jika diapprove pertama kali dan belum ada expired date
    if (status === 'approved' && !invitation.deploymentExpiresAt) {
      const defaultExpires = new Date();
      defaultExpires.setMonth(defaultExpires.getMonth() + 3);
      updateData.deploymentExpiresAt = defaultExpires;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: `Status pembayaran berhasil diubah menjadi '${status}'.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error update payment status:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status pembayaran', error: error.message });
  }
});

// ==========================================
// 2c. SET MASA AKTIF DEPLOYMENT (DURASI EXPIRATION)
// PATCH /api/admin/invitations/:id/duration
// ==========================================
router.patch('/invitations/:id/duration', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { durationDays, customExpiryDate } = req.body;
    // durationDays: 7 (1 minggu), 14 (2 minggu), 30 (1 bulan), 90 (3 bulan), atau 0/null (selamanya/unlimited)

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    let targetExpiry: Date | null = null;

    if (customExpiryDate) {
      targetExpiry = new Date(customExpiryDate);
    } else if (typeof durationDays === 'number' && durationDays > 0) {
      targetExpiry = new Date();
      targetExpiry.setDate(targetExpiry.getDate() + durationDays);
    } else if (durationDays === null || durationDays === 0) {
      targetExpiry = null; // Unlimited / Tanpa Batas Waktu
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        deploymentExpiresAt: targetExpiry,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: targetExpiry
        ? `Masa aktif berhasil diset hingga ${targetExpiry.toLocaleDateString('id-ID')}`
        : 'Masa aktif berhasil diset menjadi Tanpa Batas Waktu (Selamanya)',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error update duration:', error);
    res.status(500).json({ success: false, message: 'Gagal mengatur masa aktif undangan', error: error.message });
  }
});

// ==========================================
// 2d. HAPUS UNDANGAN BESERTA PROJECT VERCEL
// DELETE /api/admin/invitations/:id
// ==========================================
router.delete('/invitations/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    // 1. Hapus Project di Vercel jika pernah dibuat
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTarget = invitation.vercelProjectId || invitation.vercelProjectName;

    if (vercelToken && vercelTarget) {
      try {
        console.log(`[Admin Delete] Menghapus project Vercel: ${vercelTarget}`);
        const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${vercelTarget}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        });
        if (vercelRes.ok) {
          console.log(`[Admin Delete] Sukses menghapus project Vercel ${vercelTarget}`);
        } else {
          const errData = await vercelRes.json();
          console.warn(`[Admin Delete] Vercel delete warning/failed:`, errData);
        }
      } catch (vErr) {
        console.warn(`[Admin Delete] Error calling Vercel API:`, vErr);
      }
    }

    // 2. Hapus Guest Wishes terkait (jika tidak cascade)
    await prisma.guestWish.deleteMany({ where: { invitationId: id } });

    // 3. Hapus Undangan dari Database
    await prisma.invitation.delete({ where: { id } });

    res.json({
      success: true,
      message: `Undangan /${invitation.slug} beserta project deployment Vercel telah berhasil dihapus permanen.`,
    });
  } catch (error: any) {
    console.error('Error delete invitation by admin:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus undangan', error: error.message });
  }
});

// ==========================================
// 3. DAFTAR SELURUH USER
// GET /api/admin/users
// ==========================================
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { invitations: true },
        },
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error get all users:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar pengguna', error: error.message });
  }
});

// ==========================================
// 4. CRUD PRESET SONGS
// ==========================================

// GET /api/admin/preset-songs - Ambil semua preset song (aktif maupun non-aktif)
router.get('/preset-songs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const songs = await prisma.presetSong.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: songs });
  } catch (error: any) {
    console.error('Error get preset songs:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil lagu preset', error: error.message });
  }
});

// POST /api/admin/preset-songs - Tambah preset song (dapat menyertakan upload file .mp3 atau langsung audioUrl)
router.post(
  '/preset-songs',
  uploadMiddleware.single('audioFile'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, artist, audioUrl, isActive } = req.body;

      if (!title) {
        res.status(400).json({ success: false, message: 'Judul lagu (title) wajib diisi' });
        return;
      }

      let finalAudioUrl = audioUrl;

      // Jika admin mengupload file mp3 via form-data
      if (req.file) {
        const file = req.file;
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video', // Audio handled via 'video' di Cloudinary
              folder: 'undangan_preset_songs',
              format: 'mp3',
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          const stream = Readable.from(file.buffer);
          stream.pipe(uploadStream);
        });

        finalAudioUrl = uploadResult.secure_url;
      }

      if (!finalAudioUrl) {
        res.status(400).json({
          success: false,
          message: 'File audio mp3 (audioFile) atau link audioUrl wajib disertakan',
        });
        return;
      }

      const song = await prisma.presetSong.create({
        data: {
          title,
          artist: artist || null,
          audioUrl: finalAudioUrl,
          isActive: isActive === undefined ? true : String(isActive) === 'true',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Lagu preset berhasil ditambahkan',
        data: song,
      });
    } catch (error: any) {
      console.error('Error add preset song:', error);
      res.status(500).json({ success: false, message: 'Gagal menambahkan lagu preset', error: error.message });
    }
  }
);

// PUT /api/admin/preset-songs/:id - Update preset song
router.put('/preset-songs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, artist, audioUrl, isActive } = req.body;

    const existing = await prisma.presetSong.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lagu preset tidak ditemukan' });
      return;
    }

    const updated = await prisma.presetSong.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        artist: artist !== undefined ? artist : existing.artist,
        audioUrl: audioUrl !== undefined ? audioUrl : existing.audioUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    res.json({
      success: true,
      message: 'Lagu preset berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error update preset song:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui lagu preset', error: error.message });
  }
});

// DELETE /api/admin/preset-songs/:id - Hapus preset song
router.delete('/preset-songs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.presetSong.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lagu preset tidak ditemukan' });
      return;
    }

    await prisma.presetSong.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Lagu preset berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error delete preset song:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus lagu preset', error: error.message });
  }
});

// ==========================================
// 5. CRUD/UPDATE TEMPLATE CATALOG
// ==========================================

// GET /api/admin/templates - Ambil semua katalog tema
router.get('/templates', async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await prisma.templateCatalog.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: templates });
  } catch (error: any) {
    console.error('Error get admin templates:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil katalog tema', error: error.message });
  }
});

// PATCH /api/admin/templates/:id - Update status aktif / detail katalog tema
router.patch('/templates/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, thumbnailUrl, isActive } = req.body;

    const existing = await prisma.templateCatalog.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
      return;
    }

    const updated = await prisma.templateCatalog.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnailUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    res.json({
      success: true,
      message: 'Template catalog berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error patch template:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui katalog tema', error: error.message });
  }
});

export default router;
