import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/auth';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = Router();

// POST /api/invitations/:id/publish - Auto-deploy ke Vercel via Vercel REST API
router.post('/:id/publish', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // format: owner/repo
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

    if (!vercelToken || !githubRepo) {
      res.status(500).json({
        success: false,
        message: 'Konfigurasi VERCEL_TOKEN atau GITHUB_REPO belum diset pada environment server.',
      });
      return;
    }

    // Buat nama project Vercel: undangan-{slug}-{random4char}
    const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4 karakter heksadesimal
    const projectName = `undangan-${invitation.slug}-${randomSuffix}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 95);

    // Siapkan data VITE_INVITATION_DATA yang akan disuntikkan ke environment variable Vercel
    const content = typeof invitation.contentJson === 'string'
      ? JSON.parse(invitation.contentJson)
      : invitation.contentJson;

    const payloadForClient = {
      ...content,
      theme: invitation.templateKey,
      invitationId: invitation.id,
      apiBaseUrl,
    };
    const stringifiedClientData = JSON.stringify(payloadForClient);

    // Update status db menjadi building
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { deployStatus: 'building' },
    });

    // 1. Buat Vercel Project baru (POST https://api.vercel.com/v10/projects)
    const createProjectRes = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        framework: 'vite',
        gitRepository: {
          type: 'github',
          repo: githubRepo,
        },
        environmentVariables: [
          {
            key: 'VITE_INVITATION_DATA',
            target: ['production', 'preview', 'development'],
            type: 'plain',
            value: stringifiedClientData,
          },
        ],
      }),
    });

    const projectData = (await createProjectRes.json()) as any;

    if (!createProjectRes.ok) {
      console.error('Gagal membuat project Vercel:', projectData);
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { deployStatus: 'failed' },
      });
      res.status(502).json({
        success: false,
        message: 'Gagal membuat project di Vercel',
        error: projectData,
      });
      return;
    }

    const vercelProjectId = projectData.id;
    const deploymentUrl = `https://${projectName}.vercel.app`;

    // 2. Trigger deployment (POST https://api.vercel.com/v13/deployments)
    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        project: vercelProjectId,
        gitSource: {
          type: 'github',
          repo: githubRepo,
          ref: 'main', // Default branch
        },
      }),
    });

    const deployData = (await deployRes.json()) as any;
    const latestDeploymentId = deployData.id || null;

    // 3. Simpan state deployment ke database
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        vercelProjectId,
        vercelProjectName: projectName,
        latestDeploymentId,
        deploymentUrl,
        deployStatus: 'building',
        publishedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Proses deploy ke Vercel berhasil dipicu',
      data: {
        invitationId: updatedInvitation.id,
        vercelProjectId,
        vercelProjectName: projectName,
        latestDeploymentId,
        deploymentUrl,
        deployStatus: 'building',
      },
    });
  } catch (error: any) {
    console.error('Error saat publish ke Vercel:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat proses publikasi',
      error: error.message,
    });
  }
});

// GET /api/invitations/:id/deploy-status - Cek status kesiapan deployment Vercel
router.get('/:id/deploy-status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    if (!invitation.latestDeploymentId) {
      res.json({
        success: true,
        data: {
          deployStatus: invitation.deployStatus,
          deploymentUrl: invitation.deploymentUrl,
          message: 'Undangan belum pernah dipublish.',
        },
      });
      return;
    }

    const vercelToken = process.env.VERCEL_TOKEN;

    if (!vercelToken) {
      res.json({
        success: true,
        data: {
          deployStatus: invitation.deployStatus,
          deploymentUrl: invitation.deploymentUrl,
        },
      });
      return;
    }

    // Query status langsung ke Vercel API
    const vercelCheckRes = await fetch(`https://api.vercel.com/v13/deployments/${invitation.latestDeploymentId}`, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (vercelCheckRes.ok) {
      const deployInfo = (await vercelCheckRes.json()) as any;
      let newStatus: 'building' | 'ready' | 'failed' = 'building';

      if (deployInfo.readyState === 'READY') {
        newStatus = 'ready';
      } else if (deployInfo.readyState === 'ERROR' || deployInfo.readyState === 'CANCELED') {
        newStatus = 'failed';
      }

      if (newStatus !== invitation.deployStatus) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { deployStatus: newStatus },
        });
      }

      res.json({
        success: true,
        data: {
          deployStatus: newStatus,
          deploymentUrl: invitation.deploymentUrl,
          readyState: deployInfo.readyState,
          createdAt: deployInfo.createdAt,
          ready: newStatus === 'ready',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        deployStatus: invitation.deployStatus,
        deploymentUrl: invitation.deploymentUrl,
      },
    });
  } catch (error: any) {
    console.error('Error cek deploy status:', error);
    res.status(500).json({ success: false, message: 'Gagal mengecek status deploy', error: error.message });
  }
});

export default router;
