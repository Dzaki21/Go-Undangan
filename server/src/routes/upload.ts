import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/auth';
import { uploadMiddleware } from '../middlewares/upload';
import cloudinary from '../lib/cloudinary';
import { Readable } from 'stream';

const router = Router();

// POST /api/upload - Mengunggah media (gambar / audio) ke Cloudinary
router.post(
  '/',
  authenticateToken,
  uploadMiddleware.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'File tidak ditemukan dalam request (gunakan key form-data "file")' });
        return;
      }

      const file = req.file;
      const isAudio =
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'audio/mp3';

      // Stream buffer langsung ke Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: isAudio ? 'video' : 'image', // Cloudinary menangani audio via resource_type: 'video'
          folder: 'undangan_pernikahan',
          format: isAudio ? 'mp3' : undefined,
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            res.status(500).json({
              success: false,
              message: 'Gagal mengunggah media ke Cloudinary',
              error: error?.message,
            });
            return;
          }

          res.status(200).json({
            success: true,
            message: 'File berhasil diunggah',
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              resourceType: result.resource_type,
              format: result.format,
              bytes: result.bytes,
            },
          });
        }
      );

      // Konversi buffer menjadi readable stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    } catch (error: any) {
      console.error('Upload exception:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat proses upload', error: error.message });
    }
  }
);

export default router;
