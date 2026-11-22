import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/public/wishes/:invitationId - Daftar ucapan doa tamu untuk undangan tertentu
router.get('/:invitationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const invitationId = req.params.invitationId as string;

    // Verifikasi apakah invitation ada
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, slug: true },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const wishes = await prisma.guestWish.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Batasi 100 ucapan terbaru
    });

    res.json({
      success: true,
      data: wishes,
    });
  } catch (error: any) {
    console.error('Error get public wishes:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ucapan tamu', error: error.message });
  }
});

// POST /api/public/wishes/:invitationId - Kirim RSVP & ucapan tamu baru
router.post('/:invitationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const invitationId = req.params.invitationId as string;
    const { guestName, attendance = 'hadir', guestCount = 1, message } = req.body;

    if (!guestName || !message) {
      res.status(400).json({ success: false, message: 'Nama tamu dan pesan ucapan wajib diisi' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const wish = await prisma.guestWish.create({
      data: {
        invitationId,
        guestName: guestName.trim(),
        attendance: ['hadir', 'ragu', 'tidak_hadir'].includes(attendance) ? attendance : 'hadir',
        guestCount: attendance === 'hadir' ? Number(guestCount) || 1 : null,
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Ucapan dan konfirmasi kehadiran berhasil dikirim',
      data: wish,
    });
  } catch (error: any) {
    console.error('Error post public wish:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim ucapan', error: error.message });
  }
});

export default router;
