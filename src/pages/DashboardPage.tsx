import React, { useEffect, useState } from 'react';
import {
  Heart, LogOut, Plus, ExternalLink, Edit3, Copy, Check,
  Users, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Link2, Send,
  CreditCard
} from 'lucide-react';
import { apiRequest, removeAuthToken, getStoredUser } from '../lib/api';
import { InvitationListItem, GuestWishItem } from '../types/api';
import { PaymentModal } from '../components/PaymentModal';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

interface DashboardPageProps {
  onNavigateLanding: () => void;
  onCreateNew: () => void;
  onEditInvitation: (id: string) => void;
  onDeployInvitation?: (id: string) => void;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateLanding,
  onCreateNew,
  onEditInvitation,
  onDeployInvitation,
  onLogout,
}) => {
  const user = getStoredUser();
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Record<string, GuestWishItem[]>>({});
  const [wishesLoading, setWishesLoading] = useState<Record<string, boolean>>({});
  const [guestLinkInputs, setGuestLinkInputs] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payingInvitation, setPayingInvitation] = useState<InvitationListItem | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/invitations');
      setInvitations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishes = async (invitationId: string) => {
    setWishesLoading(prev => ({ ...prev, [invitationId]: true }));
    try {
      const res = await apiRequest(`/api/public/wishes/${invitationId}`);
      setWishes(prev => ({ ...prev, [invitationId]: res.data || [] }));
    } catch (err) {
      console.error(err);
    } finally {
      setWishesLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!wishes[id]) fetchWishes(id);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      removeAuthToken();
      onNavigateLanding();
    }
  };

  const copyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const generateGuestLink = (baseUrl: string, guestName: string) => {
    if (!guestName.trim()) return baseUrl;
    return `${baseUrl}?to=${encodeURIComponent(guestName.trim())}`;
  };

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'pending_approval': return 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-300';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getPaymentLabel = (status?: string) => {
    switch (status) {
      case 'approved': return '✓ Bayar Disetujui';
      case 'pending_approval': return '⏳ Menunggu Admin';
      case 'rejected': return '✕ Bayar Ditolak';
      default: return 'Belum Bayar';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'building': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Online ✓';
      case 'building': return 'Building...';
      case 'failed': return 'Gagal';
      default: return 'Draf';
    }
  };

  const getAttendanceBadge = (a: string) => {
    switch (a) {
      case 'hadir': return 'bg-emerald-100 text-emerald-700';
      case 'ragu': return 'bg-amber-100 text-amber-700';
      default: return 'bg-rose-100 text-rose-700';
    }
  };

  const getAttendanceLabel = (a: string) => {
    switch (a) {
      case 'hadir': return 'Hadir';
      case 'ragu': return 'Ragu-ragu';
      default: return 'Tidak Hadir';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">GoUndangan</span>
              {user && <span className="text-[11px] text-stone-500 block -mt-0.5">Halo, {user.name}!</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 text-xs font-semibold rounded-full shadow-md cursor-pointer flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Buat Baru
            </button>
            <button onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-full border border-rose-200/80 transition-colors cursor-pointer"
              title="Keluar dari akun">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">Dashboard Undangan</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">Kelola, pantau RSVP, dan sebarkan undangan digital Anda.</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 mt-3">Memuat data undangan...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="font-serif text-xl font-bold text-stone-800">Belum Ada Undangan</h3>
            <p className="text-xs text-stone-500 mt-2 mb-6">Mulai buat undangan digital pertama Anda sekarang juga.</p>
            <button onClick={onCreateNew}
              className="px-6 py-3 bg-stone-900 hover:bg-gold-700 text-white text-sm font-semibold rounded-full cursor-pointer">
              <Plus className="w-4 h-4 inline mr-1.5" /> Buat Undangan Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map(inv => {
              const isExpanded = expandedId === inv.id;
              const invWishes = wishes[inv.id] || [];
              const guestInput = guestLinkInputs[inv.id] || '';
              const guestLink = inv.deploymentUrl ? generateGuestLink(inv.deploymentUrl, guestInput) : '';

              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif text-lg font-bold text-stone-900 truncate">/{inv.slug}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(inv.deployStatus)}`}>
                            {getStatusLabel(inv.deployStatus)}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPaymentBadge(inv.paymentStatus)}`}>
                            {getPaymentLabel(inv.paymentStatus)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 capitalize">
                            {inv.templateKey}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Dibuat: {new Date(inv.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {inv._count?.wishes !== undefined && <span className="ml-3"><MessageSquare className="w-3 h-3 inline mr-0.5" />{inv._count.wishes} ucapan</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {inv.paymentStatus !== 'approved' && (
                          <button
                            onClick={() => setPayingInvitation(inv)}
                            className="px-3 py-1.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 text-xs font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {inv.paymentStatus === 'pending_approval' ? 'Cek Status Bayar' : 'Bayar Sekarang'}
                          </button>
                        )}
                        <button onClick={() => onEditInvitation(inv.id)}
                          className="p-2 text-stone-500 hover:text-gold-700 cursor-pointer" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        {inv.deploymentUrl && (
                          <a href={inv.deploymentUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-stone-500 hover:text-emerald-700" title="Buka"><ExternalLink className="w-4 h-4" /></a>
                        )}
                      </div>
                    </div>

                    {/* Deployment URL */}
                    {inv.deploymentUrl && (
                      <div className="mt-4 bg-stone-50 rounded-xl p-3 flex items-center gap-2 border border-stone-200/80">
                        <Link2 className="w-4 h-4 text-gold-600 flex-shrink-0" />
                        <span className="font-mono text-xs text-stone-700 truncate flex-1">{inv.deploymentUrl}</span>
                        <button onClick={() => copyText(inv.deploymentUrl!, `url-${inv.id}`)}
                          className="flex-shrink-0 px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold rounded-lg cursor-pointer flex items-center gap-1">
                          {copiedField === `url-${inv.id}` ? <><Check className="w-3 h-3 text-emerald-600" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                        </button>
                      </div>
                    )}

                    {/* Guest Link Generator */}
                    {inv.deploymentUrl && inv.deployStatus === 'ready' && (
                      <div className="mt-3 bg-gold-50 rounded-xl p-4 border border-gold-200/80 space-y-2.5">
                        <p className="text-xs font-semibold text-gold-800 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5" /> Generator Link Tamu untuk WhatsApp
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={guestInput}
                            onChange={e => setGuestLinkInputs(prev => ({ ...prev, [inv.id]: e.target.value }))}
                            placeholder="Ketik nama tamu, misal: Bapak Joko"
                            className="flex-1 px-3 py-2 rounded-lg border border-gold-200 focus:outline-none focus:border-gold-500 text-xs bg-white"
                          />
                          <button onClick={() => { if (guestLink) copyText(guestLink, `guest-${inv.id}`); }}
                            disabled={!guestInput.trim()}
                            className="px-3 py-2 bg-stone-900 hover:bg-gold-700 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0">
                            {copiedField === `guest-${inv.id}` ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin Link</>}
                          </button>
                        </div>
                        {guestInput.trim() && (
                          <p className="font-mono text-[11px] text-gold-700 break-all">{guestLink}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expand RSVP Section */}
                  <button onClick={() => toggleExpand(inv.id)}
                    className="w-full px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs font-semibold text-stone-600 flex items-center justify-center gap-1.5 hover:bg-stone-100 cursor-pointer transition-colors">
                    <Users className="w-3.5 h-3.5" />
                    <span>Rekap RSVP & Ucapan Tamu</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-200 p-5 sm:p-6 bg-stone-50/50 space-y-4">
                      {wishesLoading[inv.id] ? (
                        <div className="text-center py-6">
                          <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
                          <p className="text-xs text-stone-500 mt-2">Memuat ucapan tamu...</p>
                        </div>
                      ) : invWishes.length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-6">Belum ada ucapan tamu yang masuk.</p>
                      ) : (
                        <>
                          {/* Summary Stats */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                              <p className="text-xl font-bold text-emerald-700">{invWishes.filter(w => w.attendance === 'hadir').length}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold uppercase">Hadir</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                              <p className="text-xl font-bold text-amber-700">{invWishes.filter(w => w.attendance === 'ragu').length}</p>
                              <p className="text-[10px] text-amber-600 font-semibold uppercase">Ragu-ragu</p>
                            </div>
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
                              <p className="text-xl font-bold text-rose-700">{invWishes.filter(w => w.attendance === 'tidak_hadir').length}</p>
                              <p className="text-[10px] text-rose-600 font-semibold uppercase">Tidak Hadir</p>
                            </div>
                          </div>

                          {/* Wishes Table */}
                          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-100">
                                <tr>
                                  <th className="px-4 py-2.5 font-semibold text-stone-700">Nama Tamu</th>
                                  <th className="px-4 py-2.5 font-semibold text-stone-700">Kehadiran</th>
                                  <th className="px-4 py-2.5 font-semibold text-stone-700">Jml</th>
                                  <th className="px-4 py-2.5 font-semibold text-stone-700">Ucapan / Doa</th>
                                  <th className="px-4 py-2.5 font-semibold text-stone-700">Waktu</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {invWishes.map(w => (
                                  <tr key={w.id} className="hover:bg-stone-50">
                                    <td className="px-4 py-3 font-medium text-stone-800 whitespace-nowrap">{w.guestName}</td>
                                    <td className="px-4 py-3">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getAttendanceBadge(w.attendance)}`}>
                                        {getAttendanceLabel(w.attendance)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-stone-600">{w.guestCount || '-'}</td>
                                    <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{w.message}</td>
                                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                                      {new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingInvitation && (
        <PaymentModal
          invitationId={payingInvitation.id}
          slug={payingInvitation.slug}
          paymentStatus={payingInvitation.paymentStatus || 'unpaid'}
          paymentProofUrl={payingInvitation.paymentProofUrl}
          onClose={() => setPayingInvitation(null)}
          onSuccessSubmitted={() => {
            fetchInvitations();
            alert('Bukti pembayaran berhasil dikirim! Menunggu konfirmasi Admin.');
          }}
          onStartDeploy={() => {
            const id = payingInvitation.id;
            setPayingInvitation(null);
            if (onDeployInvitation) {
              onDeployInvitation(id);
            } else {
              onEditInvitation(id);
            }
          }}
        />
      )}
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
      />
    </div>
  );
};
