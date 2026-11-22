import React, { useState, useEffect } from 'react';
import {
  Users, Layers, Music, Globe, CheckCircle2, AlertCircle, Clock,
  Play, Pause, Trash2, Plus, Upload, ExternalLink, LogOut, Heart
} from 'lucide-react';
import { apiRequest, uploadMedia } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AdminStatsResponse, InvitationListItem, PresetSongItem, TemplateCatalogItem } from '../types/api';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

interface AdminDashboardPageProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

type TabKey = 'overview' | 'songs' | 'templates' | 'invitations';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  onNavigateHome,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Stats state
  const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Invitations state
  const [allInvitations, setAllInvitations] = useState<InvitationListItem[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Preset songs state
  const [songs, setSongs] = useState<PresetSongItem[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // New song form
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadingSong, setUploadingSong] = useState(false);
  const [songError, setSongError] = useState<string | null>(null);
  const [songSuccess, setSongSuccess] = useState<string | null>(null);

  // Template catalogs state
  const [templates, setTemplates] = useState<TemplateCatalogItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchSongs();
    fetchTemplates();
    fetchInvitations();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiRequest<AdminStatsResponse>('/api/admin/stats');
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await apiRequest<{ success: boolean; data: InvitationListItem[] }>('/api/admin/invitations');
      if (res.data) setAllInvitations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleUpdatePaymentStatus = async (invitationId: string, status: 'approved' | 'rejected' | 'unpaid') => {
    try {
      await apiRequest(`/api/admin/invitations/${invitationId}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchInvitations();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pembayaran');
    }
  };

  const fetchSongs = async () => {
    setLoadingSongs(true);
    try {
      const res = await apiRequest<{ success: boolean; data: PresetSongItem[] }>('/api/admin/preset-songs');
      if (res.data) setSongs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSongs(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await apiRequest<{ success: boolean; data: TemplateCatalogItem[] }>('/api/admin/templates');
      if (res.data) setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Toggle Song Active
  const handleToggleSongActive = async (song: PresetSongItem) => {
    try {
      await apiRequest(`/api/admin/preset-songs/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !song.isActive }),
      });
      fetchSongs();
    } catch (err) {
      alert('Gagal mengubah status lagu');
    }
  };

  // Delete Song
  const handleDeleteSong = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lagu preset ini?')) return;
    try {
      await apiRequest(`/api/admin/preset-songs/${id}`, { method: 'DELETE' });
      fetchSongs();
    } catch (err) {
      alert('Gagal menghapus lagu');
    }
  };

  // Create Song
  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setSongError(null);
    setSongSuccess(null);

    if (!newTitle.trim()) {
      setSongError('Judul lagu wajib diisi');
      return;
    }

    if (!audioFile && !newAudioUrl.trim()) {
      setSongError('Silakan upload file mp3 atau masukkan URL audio');
      return;
    }

    setUploadingSong(true);
    try {
      let finalAudioUrl = newAudioUrl.trim();

      if (audioFile) {
        finalAudioUrl = await uploadMedia(audioFile);
      }

      await apiRequest('/api/admin/preset-songs', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          artist: newArtist.trim() || undefined,
          audioUrl: finalAudioUrl,
          isActive: true,
        }),
      });

      setSongSuccess('Lagu preset berhasil ditambahkan!');
      setNewTitle('');
      setNewArtist('');
      setNewAudioUrl('');
      setAudioFile(null);
      fetchSongs();
    } catch (err: any) {
      setSongError(err.message || 'Gagal menambahkan lagu preset');
    } finally {
      setUploadingSong(false);
    }
  };

  // Toggle Template Active
  const handleToggleTemplateActive = async (template: TemplateCatalogItem) => {
    try {
      await apiRequest(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      fetchTemplates();
    } catch (err) {
      alert('Gagal mengubah status template');
    }
  };

  // Toggle audio preview
  const handleToggleAudio = (id: string, url: string) => {
    if (playingSongId === id) {
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
      setPlayingSongId(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'building':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'failed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <audio ref={audioRef} onEnded={() => setPlayingSongId(null)} />

      {/* Top Navbar */}
      <header className="bg-stone-900 text-white px-6 py-4 border-b border-stone-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500 text-stone-950 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold">GoUndangan Admin Portal</h1>
            <p className="text-[11px] text-stone-400">Selamat datang, {user?.name || 'Administrator'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 text-xs text-stone-300 hover:text-white border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Lihat Beranda
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer font-semibold shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-stone-200/80 p-4 space-y-1.5 shadow-sm h-fit sticky top-24">
          <div className="px-3 py-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Menu Administrator
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Statistik</span>
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'songs'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Kelola Lagu Preset ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Katalog Template ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'invitations'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Monitoring Undangan ({allInvitations.length})</span>
          </button>

          <div className="pt-4 mt-4 border-t border-stone-200">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Ringkasan Platform</h2>
                <p className="text-xs text-stone-500 mt-1">Status dan aktivitas seluruh platform GoUndangan</p>
              </div>

              {loadingStats ? (
                <div className="p-8 text-center text-xs text-stone-500">Memuat statistik...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-stone-900">{stats?.totalUsers || 0}</span>
                      <p className="text-xs text-stone-500">Total User Terdaftar</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-stone-900">{stats?.totalInvitations || 0}</span>
                      <p className="text-xs text-stone-500">Total Undangan Dibuat</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-stone-900">{stats?.readyInvitations || 0}</span>
                      <p className="text-xs text-stone-500">Total Domain Aktif (Ready)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Status Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Distribusi Status Deploy Undangan</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-emerald-800">{stats?.readyInvitations || 0}</span>
                    <p className="text-xs text-emerald-700">Online / Ready</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <Clock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-amber-800">{stats?.buildingInvitations || 0}</span>
                    <p className="text-xs text-amber-700">Dalam Proses Build</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-rose-800">{stats?.failedInvitations || 0}</span>
                    <p className="text-xs text-rose-700">Gagal / Error</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET SONGS */}
          {activeTab === 'songs' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Kelola Lagu Preset</h2>
                <p className="text-xs text-stone-500 mt-1">Daftar lagu latar yang dapat dipilih oleh pengguna saat membuat undangan</p>
              </div>

              {/* Form Tambah Lagu */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gold-600" />
                  <span>Tambah Lagu Preset Baru</span>
                </h3>

                {songError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    {songError}
                  </div>
                )}
                {songSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">
                    {songSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateSong} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Judul Lagu *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Contoh: Romantic Acoustic Wedding"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Penyanyi / Artis</label>
                      <input
                        type="text"
                        value={newArtist}
                        onChange={(e) => setNewArtist(e.target.value)}
                        placeholder="Contoh: Pixabay Artist"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Upload File .mp3</label>
                      <input
                        type="file"
                        accept="audio/*,.mp3"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-stone-100 file:font-medium hover:file:bg-stone-200 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Atau Gunakan Direct Audio URL</label>
                      <input
                        type="url"
                        value={newAudioUrl}
                        onChange={(e) => setNewAudioUrl(e.target.value)}
                        placeholder="https://example.com/audio.mp3"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingSong}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-gold-700 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingSong ? 'Mengunggah & Menyimpan...' : 'Simpan Lagu Preset'}</span>
                  </button>
                </form>
              </div>

              {/* Tabel Daftar Lagu */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-stone-200 font-semibold text-xs text-stone-700">
                  Daftar Lagu Preset ({songs.length})
                </div>

                {loadingSongs ? (
                  <div className="p-6 text-center text-xs text-stone-500">Memuat data lagu...</div>
                ) : songs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500">Belum ada lagu preset yang ditambahkan.</div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {songs.map((song) => (
                      <div key={song.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleAudio(song.id, song.audioUrl)}
                            className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 hover:bg-gold-600 transition-colors cursor-pointer"
                          >
                            {playingSongId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-stone-900 truncate">{song.title}</h4>
                            <p className="text-[11px] text-stone-500 truncate">{song.artist || 'Unknown Artist'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleToggleSongActive(song)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              song.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-stone-100 text-stone-500 border-stone-300'
                            }`}
                          >
                            {song.isActive ? 'AKTIF ✓' : 'NON-AKTIF'}
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Katalog Template Desain</h2>
                <p className="text-xs text-stone-500 mt-1">Kelola visibilitas tema desain untuk pembuatan undangan</p>
              </div>

              {loadingTemplates ? (
                <div className="p-8 text-center text-xs text-stone-500">Memuat katalog tema...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-stone-100 relative">
                        <img
                          src={tmpl.thumbnailUrl}
                          alt={tmpl.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                              tmpl.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-stone-800 text-stone-300 border-stone-700'
                            }`}
                          >
                            {tmpl.isActive ? 'Tersedia' : 'Dinonaktifkan'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                            Key: {tmpl.templateKey}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-stone-900 mt-0.5">{tmpl.name}</h4>
                          <p className="text-xs text-stone-600 font-light mt-1 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-xs text-stone-500">Status Tema:</span>
                          <button
                            onClick={() => handleToggleTemplateActive(tmpl)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              tmpl.isActive
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300'
                            }`}
                          >
                            {tmpl.isActive ? 'Aktif' : 'Non-Aktif'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MONITORING UNDANGAN */}
          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Monitoring Seluruh Undangan</h2>
                <p className="text-xs text-stone-500 mt-1">Daftar undangan yang dibuat oleh semua pengguna di platform</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
                {loadingInvitations ? (
                  <div className="p-8 text-center text-xs text-stone-500">Memuat seluruh undangan...</div>
                ) : allInvitations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">Belum ada undangan yang dibuat.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 border-b border-stone-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-stone-700">Slug & Domain</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Pembuat (User)</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Tema</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Status Pembayaran</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Bukti Transfer</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Status Deploy</th>
                          <th className="px-4 py-3 font-semibold text-stone-700">Konfirmasi Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {allInvitations.map((inv) => (
                          <tr key={inv.id} className="hover:bg-stone-50">
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-stone-900">/{inv.slug}</span>
                              {inv.deploymentUrl && (
                                <p className="font-mono text-[11px] text-stone-400 truncate max-w-xs">
                                  {inv.deploymentUrl}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-stone-900">{inv.user?.name || '-'}</span>
                              <p className="text-[11px] text-stone-400">{inv.user?.email || '-'}</p>
                            </td>
                            <td className="px-4 py-3 capitalize text-stone-700">
                              {inv.templateKey}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                  inv.paymentStatus === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : inv.paymentStatus === 'pending_approval'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    : inv.paymentStatus === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                {inv.paymentStatus === 'approved'
                                  ? '✅ Lunas / Approved'
                                  : inv.paymentStatus === 'pending_approval'
                                  ? '⏳ Menunggu Konfirmasi'
                                  : inv.paymentStatus === 'rejected'
                                  ? '❌ Ditolak'
                                  : 'Belum Bayar'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {inv.paymentProofUrl ? (
                                <a
                                  href={inv.paymentProofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 hover:text-gold-900 underline"
                                >
                                  <span>Lihat Bukti</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-stone-400 text-[11px] italic">Tidak ada</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                  inv.deployStatus
                                )}`}
                              >
                                {inv.deployStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {inv.paymentStatus !== 'approved' ? (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(inv.id, 'approved')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer shadow-sm"
                                    title="Setujui Pembayaran dan izinkan deploy"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(inv.id, 'unpaid')}
                                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] transition-colors cursor-pointer"
                                    title="Batalkan approval"
                                  >
                                    Batal Approve
                                  </button>
                                )}
                                {inv.paymentStatus === 'pending_approval' && (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(inv.id, 'rejected')}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        title="Keluar dari Portal Admin"
        description="Apakah Anda yakin ingin keluar dari sesi Administrator? Anda perlu login kembali untuk mengakses panel kontrol ini."
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout();
        }}
      />
    </div>
  );
};
