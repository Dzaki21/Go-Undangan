import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, XCircle, Rocket, Copy, Check, ExternalLink } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface DeployProgressModalProps {
  invitationId: string;
  onClose: () => void;
  onDone: () => void;
}

type DeployPhase = 'saving' | 'creating' | 'building' | 'ready' | 'failed';

const phaseConfig: Record<DeployPhase, { label: string; description: string }> = {
  saving: { label: 'Menyimpan Data', description: 'Menyimpan data undangan ke server...' },
  creating: { label: 'Membuat Project di Vercel', description: 'Menginisialisasi project dan environment variable...' },
  building: { label: 'Membangun Website', description: 'Vercel sedang menjalankan build production...' },
  ready: { label: 'Selesai!', description: 'Undangan digital Anda telah online dan siap disebarkan.' },
  failed: { label: 'Gagal', description: 'Terjadi kesalahan saat proses deploy. Silakan coba lagi.' },
};

export const DeployProgressModal: React.FC<DeployProgressModalProps> = ({
  invitationId,
  onClose,
  onDone,
}) => {
  const [phase, setPhase] = useState<DeployPhase>('saving');
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startDeploySequence();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startDeploySequence = async () => {
    try {
      // Phase 1: Saving (already done before this modal opened)
      setPhase('saving');
      await new Promise(r => setTimeout(r, 800));

      // Phase 2: Creating project + triggering deploy
      setPhase('creating');
      const publishRes = await apiRequest(`/api/invitations/${invitationId}/publish`, { method: 'POST' });

      if (!publishRes.success) {
        throw new Error(publishRes.message || 'Gagal membuat project Vercel');
      }

      setDeploymentUrl(publishRes.data?.deploymentUrl || null);

      // Phase 3: Building — start polling
      setPhase('building');
      startPolling();
    } catch (err: any) {
      console.error('Deploy error:', err);
      setErrorMsg(err.message);
      setPhase('failed');
    }
  };

  const startPolling = () => {
    let attempts = 0;
    const maxAttempts = 90; // ~3 menit (2s interval)

    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const statusRes = await apiRequest(`/api/invitations/${invitationId}/deploy-status`);
        const status = statusRes.data?.deployStatus;

        if (statusRes.data?.deploymentUrl) {
          setDeploymentUrl(statusRes.data.deploymentUrl);
        }

        if (status === 'ready') {
          setPhase('ready');
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (status === 'failed') {
          setPhase('failed');
          setErrorMsg('Build gagal di Vercel. Periksa konfigurasi repositori GitHub.');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Ignore transient polling errors
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPhase('failed');
        setErrorMsg('Timeout: Build Vercel memakan waktu terlalu lama. Periksa di dashboard Vercel secara manual.');
      }
    }, 2000);
  };

  const handleCopy = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const allPhases: DeployPhase[] = ['saving', 'creating', 'building', 'ready'];
  const currentIdx = allPhases.indexOf(phase === 'failed' ? 'building' : phase);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-lg ${
            phase === 'ready' ? 'bg-emerald-500 text-white' : phase === 'failed' ? 'bg-rose-500 text-white' : 'bg-gradient-to-r from-gold-600 to-gold-400 text-stone-950'
          }`}>
            {phase === 'ready' ? <CheckCircle2 className="w-7 h-7" /> :
             phase === 'failed' ? <XCircle className="w-7 h-7" /> :
             <Rocket className="w-7 h-7 animate-bounce" />}
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {phase === 'ready' ? '🎉 Undangan Berhasil Dipublish!' :
             phase === 'failed' ? 'Proses Gagal' : 'Mempublikasikan Undangan...'}
          </h2>
        </div>

        {/* Phase Steps */}
        <div className="space-y-3">
          {allPhases.map((p, idx) => {
            const isActive = phase !== 'failed' && idx === currentIdx;
            const isDone = phase !== 'failed' && idx < currentIdx;
            const isFailed = phase === 'failed' && idx === currentIdx;

            return (
              <div key={p} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isActive ? 'bg-gold-50 border-gold-300 shadow-sm' :
                isDone ? 'bg-emerald-50 border-emerald-200' :
                isFailed ? 'bg-rose-50 border-rose-200' :
                'bg-stone-50 border-stone-200 opacity-50'
              }`}>
                <div className="flex-shrink-0">
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                   isFailed ? <XCircle className="w-5 h-5 text-rose-600" /> :
                   isActive ? <Loader2 className="w-5 h-5 text-gold-600 animate-spin" /> :
                   <div className="w-5 h-5 rounded-full border-2 border-stone-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? 'text-emerald-800' : isFailed ? 'text-rose-800' : isActive ? 'text-gold-800' : 'text-stone-500'}`}>
                    {phaseConfig[p].label}
                  </p>
                  {(isActive || isFailed) && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isFailed && errorMsg ? errorMsg : phaseConfig[p].description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Result: URL Card */}
        {phase === 'ready' && deploymentUrl && (
          <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-3">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Link Undangan Anda</p>
            <div className="flex items-center gap-2">
              <a href={deploymentUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 font-mono text-sm text-gold-300 hover:text-gold-100 underline underline-offset-2 truncate">
                {deploymentUrl}
              </a>
              <button onClick={handleCopy}
                className="flex-shrink-0 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg border border-stone-700 cursor-pointer flex items-center gap-1.5">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
              </button>
            </div>
            <a href={deploymentUrl} target="_blank" rel="noopener noreferrer"
              className="w-full py-2.5 bg-gold-600 hover:bg-gold-500 text-stone-950 font-semibold text-sm rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <ExternalLink className="w-4 h-4" /> Buka Undangan
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {(phase === 'ready' || phase === 'failed') && (
            <button onClick={() => { onDone(); onClose(); }}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-full cursor-pointer">
              {phase === 'ready' ? 'Ke Dashboard' : 'Tutup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
