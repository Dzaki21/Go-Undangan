import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/master/presets
// Mengambil daftar PresetSong dan TemplateCatalog yang berstatus isActive: true
// untuk digunakan oleh pengguna saat membuat undangan
router.get('/presets', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [songs, templates] = await Promise.all([
      prisma.presetSong.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          audioUrl: true,
        },
      }),
      prisma.templateCatalog.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          templateKey: true,
          name: true,
          description: true,
          thumbnailUrl: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        songs,
        templates,
      },
    });
  } catch (error: any) {
    console.error('Error get master presets:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data preset master',
      error: error.message,
    });
  }
});

export default router;
