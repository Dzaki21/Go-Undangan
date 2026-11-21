import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import invitationRoutes from './routes/invitations';
import uploadRoutes from './routes/upload';
import deployRoutes from './routes/deploy';
import publicWishesRoutes from './routes/publicWishes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Aktifkan CORS terbuka agar frontend hasil generate di domain vercel.app dapat mengakses API
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Wedding Invitation Automation Server',
  });
});

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/invitations', deployRoutes); // Menyediakan POST /api/invitations/:id/publish dan GET /api/invitations/:id/deploy-status
app.use('/api/public/wishes', publicWishesRoutes); // Menyediakan GET & POST /api/public/wishes/:invitationId

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server jika dijalankan secara langsung
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log(`✨ Health check: http://localhost:${port}/health`);
  });
}

export default app;
