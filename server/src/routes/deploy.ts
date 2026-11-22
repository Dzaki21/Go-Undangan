import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/auth';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = Router();

// POST /api/invitations/:id/publish - Auto-deploy ke Vercel via Vercel REST API
router.post('/:id/publish', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId },
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
      return;
    }

    // Validasi Pembayaran & Konfirmasi Admin sebelum bisa Publish/Deploy ke Vercel
    if (invitation.paymentStatus !== 'approved') {
      res.status(403).json({
        success: false,
        message: 'Undangan belum disetujui (approved) oleh Admin. Silakan lakukan pembayaran dan tunggu konfirmasi Admin sebelum publish.',
        paymentStatus: invitation.paymentStatus,
      });
      return;
    }

    // Validasi Masa Aktif Deployment (Expired Check)
    if (invitation.deploymentExpiresAt && new Date(invitation.deploymentExpiresAt) < new Date()) {
      res.status(403).json({
        success: false,
        message: 'Masa aktif penayangan undangan ini telah berakhir. Silakan hubungi admin untuk perpanjangan masa aktif.',
        deploymentExpiresAt: invitation.deploymentExpiresAt,
      });
      return;
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // format: owner/repo
    const githubRepoId = process.env.GITHUB_REPO_ID;
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

    if (!vercelToken || !githubRepo) {
      res.status(500).json({
        success: false,
        message: 'Konfigurasi VERCEL_TOKEN atau GITHUB_REPO belum diset pada environment server.',
      });
      return;
    }

    // Cek apakah undangan sudah memiliki project Vercel yang pernah dibuat sebelumnya
    let vercelProjectId = invitation.vercelProjectId;
    let projectName = invitation.vercelProjectName;

    // Jika belum pernah punya project, tentukan nama project permanen: undangan-{slug}
    if (!projectName) {
      projectName = `undangan-${invitation.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 95);
    }

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

    let projectData: any = null;

    // 1. Buat project baru jika belum ada, ATAU perbarui environment variable jika project sudah ada
    if (!vercelProjectId) {
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

      projectData = (await createProjectRes.json()) as any;

      if (!createProjectRes.ok) {
        // Jika project dengan nama tersebut sudah ada di Vercel (misal dari sisa publish lama), coba ambil ID-nya
        if (projectData.error?.code === 'conflict' || projectData.error?.message?.includes('already exists')) {
          const getProj = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
            headers: { Authorization: `Bearer ${vercelToken}` },
          });
          if (getProj.ok) {
            projectData = await getProj.json();
            vercelProjectId = projectData.id;
          }
        }

        if (!vercelProjectId) {
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
      } else {
        vercelProjectId = projectData.id;
      }
    } else {
      // Jika project sudah ada di Vercel, perbarui / upsert environment variable VITE_INVITATION_DATA
      try {
        await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env?upsert=true`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'VITE_INVITATION_DATA',
            target: ['production', 'preview', 'development'],
            type: 'plain',
            value: stringifiedClientData,
          }),
        });
      } catch (err) {
        console.warn('Gagal upsert env Vercel:', err);
      }
    }

    const deploymentUrl = `https://${projectName}.vercel.app`;

    // 2. Trigger deployment (POST https://api.vercel.com/v13/deployments)
    const gitSourcePayload: any = {
      type: 'github',
      ref: 'main', // Default branch
    };

    if (githubRepoId) {
      gitSourcePayload.repoId = githubRepoId;
    } else if (projectData?.link?.repoId) {
      gitSourcePayload.repoId = projectData.link.repoId;
    } else {
      gitSourcePayload.repo = githubRepo;
    }

    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        project: vercelProjectId,
        target: 'production',
        gitSource: gitSourcePayload,
      }),
    });

    const deployData = (await deployRes.json()) as any;

    if (!deployRes.ok) {
      console.error('Gagal mentrigger deploy Vercel:', deployData);
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { deployStatus: 'failed' },
      });
      res.status(502).json({
        success: false,
        message: 'Gagal memicu deployment di Vercel: ' + (deployData.error?.message || 'Error tidak diketahui'),
        error: deployData,
      });
      return;
    }
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
    const id = req.params.id as string;

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

        // Pastikan domain utama dialiaskan ke deployment production ini
        if (invitation.deploymentUrl) {
          const domainName = invitation.deploymentUrl.replace('https://', '').replace('/', '');
          try {
            await fetch(`https://api.vercel.com/v13/deployments/${invitation.latestDeploymentId}/aliases`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ alias: domainName }),
            });
          } catch (aliasErr) {
            console.warn('Gagal assign alias domain Vercel:', aliasErr);
          }
        }
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
