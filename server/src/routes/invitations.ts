import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Semua rute undangan memerlukan autentikasi JWT
router.use(authenticateToken);

// POST /api/invitations - Buat draf undangan baru
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { slug, templateKey = 'minimalist', contentJson } = req.body;

    if (!slug || !contentJson) {
      res.status(400).json({ success: false, message: 'Slug dan contentJson wajib diisi' });
      return;
    }

    // Normalisasi slug: huruf kecil, ganti spasi/karakter spesial dengan dash
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // Cek apakah slug sudah digunakan
    const existing = await prisma.invitation.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      res.status(409).json({ success: false, message: `Slug '${cleanSlug}' sudah digunakan. Silakan gunakan nama/slug lain.` });
      return;
    }

    const invitation = await prisma.invitation.create({
      data: {
        userId,
        slug: cleanSlug,
        templateKey,
        contentJson,
        deployStatus: 'draft',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Draf undangan berhasil dibuat',
      data: invitation,
    });
  } catch (error: any) {
    console.error('Error create invitation:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat undangan', error: error.message });
  }
});

// GET /api/invitations - Ambil semua undangan milik pengguna login
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const invitations = await prisma.invitation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        templateKey: true,
        deployStatus: true,
        deploymentUrl: true,
        vercelProjectName: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('Error list invitations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar undangan', error: error.message });
  }
});

// GET /api/invitations/:id - Detail lengkap satu undangan
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
      include: {
        wishes: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error: any) {
    console.error('Error get invitation detail:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail undangan', error: error.message });
  }
});

// PUT /api/invitations/:id - Update data draf undangan
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { slug, templateKey, contentJson } = req.body;

    const existing = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const updateData: any = {};
    if (templateKey) updateData.templateKey = templateKey;
    if (contentJson) updateData.contentJson = contentJson;

    if (slug && slug !== existing.slug) {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const slugUsed = await prisma.invitation.findUnique({ where: { slug: cleanSlug } });
      if (slugUsed && slugUsed.id !== id) {
        res.status(409).json({ success: false, message: `Slug '${cleanSlug}' sudah digunakan pengguna lain.` });
        return;
      }
      updateData.slug = cleanSlug;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Undangan berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error update invitation:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui undangan', error: error.message });
  }
});

// POST /api/invitations/:id/submit-payment - User mengirim bukti transfer pembayaran
router.post('/:id/submit-payment', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { paymentProofUrl } = req.body;

    if (!paymentProofUrl) {
      res.status(400).json({ success: false, message: 'Bukti pembayaran (URL gambar) wajib disertakan' });
      return;
    }

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        paymentProofUrl,
        paymentStatus: 'pending_approval',
      },
    });

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil dikirim! Menunggu konfirmasi dan persetujuan dari Admin.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error submit payment:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim bukti pembayaran', error: error.message });
  }
});

export default router;
