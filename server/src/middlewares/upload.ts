import multer from 'multer';

// Menggunakan memoryStorage agar buffer file langsung di-stream ke Cloudinary
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // Maksimal 15 MB (cukup untuk audio .mp3 dan foto kualitas tinggi)
  },
  fileFilter: (_req, file, cb) => {
    // Izinkan image (jpeg, png, webp, heic) dan audio (mp3, wav, mpeg, ogg)
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'audio/mp3'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung! Hanya file gambar dan audio yang diizinkan.'));
    }
  },
});
