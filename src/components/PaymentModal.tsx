import React, { useState } from 'react';
import { CreditCard, UploadCloud, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, X, ExternalLink } from 'lucide-react';
import { apiRequest, uploadMedia } from '../lib/api';
import { PaymentStatus } from '../types/api';

interface PaymentModalProps {
  invitationId: string;
  slug: string;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string | null;
  onClose: () => void;
  onSuccessSubmitted: () => void;
  onStartDeploy: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invitationId,
  slug,
  paymentStatus,
  paymentProofUrl,
  onClose,
  onSuccessSubmitted,
  onStartDeploy,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(paymentProofUrl || null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmitProof = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg('Pilih file struk/bukti transfer terlebih dahulu.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    try {
      let finalUrl = previewUrl;
      if (selectedFile) {
        finalUrl = await uploadMedia(selectedFile);
      }

      const res = await apiRequest(`/api/invitations/${invitationId}/submit-payment`, {
        method: 'POST',
        body: JSON.stringify({ paymentProofUrl: finalUrl }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Gagal mengirim bukti pembayaran');
      }

      onSuccessSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengupload bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-8 space-y-6 animate-fade-in relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-gold-100 text-gold-700 shadow-inner">
            <CreditCard className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Aktivasi & Publikasi Undangan
          </h2>
          <p className="text-xs text-stone-500">
            Undangan <span className="font-semibold text-stone-800">/{slug}</span> membutuhkan pembayaran satu kali sebelum online di Vercel.
          </p>
        </div>

        {/* Status Indicator */}
        {paymentStatus === 'approved' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Pembayaran Disetujui Admin!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Undangan Anda telah diverifikasi oleh tim admin dan siap untuk dipublikasikan langsung ke internet.
              </p>
              <button
                onClick={onStartDeploy}
                className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Lanjutkan Generate Deployment Sekarang →
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'pending_approval' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Menunggu Konfirmasi Admin</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Bukti transfer Anda sudah diterima sistem. Admin kami sedang memverifikasi pembayaran Anda.
              </p>
              {paymentProofUrl && (
                <a
                  href={paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Lihat Bukti yang Terkirim
                </a>
              )}
            </div>
          </div>
        )}

        {paymentStatus === 'rejected' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">Pembayaran Ditolak Admin</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Bukti transfer tidak valid atau dana belum masuk. Silakan periksa kembali dan upload ulang bukti transfer yang benar.
              </p>
            </div>
          </div>
        )}

        {/* Bank & Payment Info Box */}
        {paymentStatus !== 'approved' && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Biaya Aktivasi Undangan</span>
              <span className="text-base font-bold text-stone-900">Rp 99.000 <span className="text-[10px] text-stone-400 font-normal">/ selamanya</span></span>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-semibold text-stone-800">Silakan transfer ke rekening resmi GoUndangan:</p>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex justify-between items-center">
                <div>
                  <span className="font-bold text-stone-800 block">Bank Central Asia (BCA)</span>
                  <span className="font-mono text-stone-700">829-0123-4567</span>
                  <span className="text-[10px] text-stone-500 block">a.n. PT GOUNDANGAN INDONESIA</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('82901234567');
                    alert('Nomor rekening BCA disalin!');
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                >
                  Salin
                </button>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex justify-between items-center">
                <div>
                  <span className="font-bold text-stone-800 block">Bank Mandiri</span>
                  <span className="font-mono text-stone-700">137-00-1928374-1</span>
                  <span className="text-[10px] text-stone-500 block">a.n. PT GOUNDANGAN INDONESIA</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('1370019283741');
                    alert('Nomor rekening Mandiri disalin!');
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Proof Section */}
        {paymentStatus !== 'approved' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-800">
              Upload Bukti Transfer (Struk / Screenshot):
            </label>
            <div className="border-2 border-dashed border-stone-200 hover:border-gold-400 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-stone-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Bukti Transfer"
                    className="max-h-36 mx-auto rounded-lg object-contain shadow-sm border border-stone-200"
                  />
                  <p className="text-[11px] text-stone-500">Klik di sini untuk mengganti foto bukti transfer</p>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <UploadCloud className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-xs font-medium text-stone-700">Pilih foto atau drag & drop file struk</p>
                  <p className="text-[10px] text-stone-400">JPG, PNG, WebP (Maks 5MB)</p>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errorMsg}
              </p>
            )}

            <button
              onClick={handleSubmitProof}
              disabled={uploading || (!selectedFile && !previewUrl)}
              className="w-full py-3 bg-stone-900 hover:bg-gold-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengirim Bukti Pembayaran...
                </>
              ) : paymentStatus === 'pending_approval' ? (
                'Upload Ulang Bukti Transfer'
              ) : (
                'Kirim Bukti Pembayaran'
              )}
            </button>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-600 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
