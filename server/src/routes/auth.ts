import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middlewares/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar. Silakan login.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Otomatis terdaftar dengan role USER
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT berisi payload { userId, email, role }
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error saat register:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Email atau password salah' });
      return;
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Email atau password salah' });
      return;
    }

    // Generate JWT token yang menyimpan payload { userId, email, role }
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Error saat login:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error saat get /me:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data profil', error: error.message });
  }
});

export default router;
