import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type UserRole = 'USER' | 'ADMIN';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware untuk memverifikasi JWT token dari header Authorization: Bearer <token>
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi tidak ditemukan' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Sesi tidak valid atau telah kedaluwarsa' });
    return;
  }
};

// Alias untuk menjaga kompatibilitas dengan route yang telah ada
export const authenticateToken = authenticate;

/**
 * Middleware otorisasi khusus role ADMIN
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Autentikasi diperlukan' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Akses ditolak: Anda tidak memiliki hak akses Administrator (Forbidden)',
    });
    return;
  }

  next();
};
