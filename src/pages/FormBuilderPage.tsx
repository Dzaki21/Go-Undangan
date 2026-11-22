import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Save, Rocket,
  Music, Upload, Play, Pause, Plus, X, Image as ImageIcon,
  Check, MapPin, Heart, Calendar, CreditCard
} from 'lucide-react';
import { ThemeType } from '../themes';
import { apiRequest, uploadMedia } from '../lib/api';
import { MasterPresetsResponse, PresetSongItem, TemplateCatalogItem } from '../types/api';

// ─── FALLBACK PRESET MUSIC LIST (jika backend offline) ───
const fallbackMusicList: PresetSongItem[] = [
  { id: 'preset-1', title: 'Acoustic Wedding Harmony', audioUrl: '/audio/wedding-song.mp3' },
  { id: 'preset-2', title: 'Romantic Piano Ballad', audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3' },
  { id: 'preset-3', title: 'Dreamy Ambient Love', audioUrl: '/audio/wedding-song.mp3' },
];

const fallbackTemplates: TemplateCatalogItem[] = [
  { id: '1', templateKey: 'minimalist', name: 'Minimalist Warm', description: 'Dominan putih/krem hangat.', thumbnailUrl: '' },
  { id: '2', templateKey: 'floral', name: 'Soft Floral Sage', description: 'Nuansa sage green & dedaunan.', thumbnailUrl: '' },
  { id: '3', templateKey: 'dark-luxury', name: 'Dark Luxury & Gold', description: 'Latar hitam dengan kilau emas.', thumbnailUrl: '' },
  { id: '4', templateKey: 'royal-vintage', name: 'Royal Vintage Burgundy', description: 'Tirai maroon beludru & chandelier emas.', thumbnailUrl: '' },
];

// ─── STEP DEFINITIONS ───
const STEPS = [
  { key: 'basic', label: 'Pengaturan Dasar', icon: '⚙️' },
  { key: 'cover', label: 'Cover Pembuka', icon: '📩' },
  { key: 'quote', label: 'Salam & Kutipan', icon: '✨' },
  { key: 'couple', label: 'Profil Mempelai', icon: '💑' },
  { key: 'events', label: 'Waktu & Lokasi', icon: '📍' },
  { key: 'story', label: 'Love Story', icon: '💕' },
  { key: 'gallery', label: 'Galeri Foto', icon: '📸' },
  { key: 'gift', label: 'Amplop & Penutup', icon: '🎁' },
];

// ─── DEFAULT FORM STATE ───
function createDefaultForm(templateKey: ThemeType) {
  return {
    slug: '',
    templateKey,
    music: { audioUrl: fallbackMusicList[0].audioUrl, title: fallbackMusicList[0].title },
    meta: { title: '', description: '' },
    eventDateIso: '',
    quote: { text: '', source: '' },
    groom: { fullName: '', nickName: '', parents: '', instagramUsername: '', instagramUrl: '', photoUrl: '' },
    bride: { fullName: '', nickName: '', parents: '', instagramUsername: '', instagramUrl: '', photoUrl: '' },
    events: {
      akad: { title: 'Akad Nikah', dayName: '', dateFormatted: '', timeFormatted: '', locationName: '', address: '', googleMapsUrl: '' },
      resepsi: { enabled: true, title: 'Resepsi Pernikahan', dayName: '', dateFormatted: '', timeFormatted: '', locationName: '', address: '', googleMapsUrl: '' },
    },
    loveStory: [] as { yearOrDate: string; title: string; story: string; photoUrl?: string }[],
    gallery: [] as string[],
    gifts: {
      accounts: [{ bankName: '', accountNumber: '', accountHolder: '' }] as { bankName: string; accountNumber: string; accountHolder: string }[],
      physicalGift: { recipientName: '', phoneNumber: '', fullAddress: '', note: '' },
    },
  };
}

type FormData = ReturnType<typeof createDefaultForm>;

interface FormBuilderPageProps {
  initialTemplate: ThemeType;
  editInvitationId?: string;
  onBack: () => void;
  onPublished: (invitationId: string) => void;
  onSaved: () => void;
}

// ─── HELPER: Section Card wrapper ───
const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5 sm:p-6 space-y-4">
    <div>
      <h3 className="font-serif text-lg font-bold text-stone-900">{title}</h3>
      {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
    {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const TextInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }> = ({ value, onChange, placeholder, required, type = 'text' }) => (
  <input type={type} value={value} required={required} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm bg-stone-50/50 placeholder:text-stone-400" />
);

const TextArea: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }> = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm bg-stone-50/50 resize-none placeholder:text-stone-400" />
);

// ─── PHOTO UPLOAD BUTTON ───
const PhotoUploadButton: React.FC<{ currentUrl: string; onUploaded: (url: string) => void; label?: string }> = ({ currentUrl, onUploaded, label = 'Upload Foto' }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      onUploaded(url);
    } catch (err) {
      alert('Gagal upload foto. Pastikan backend dan Cloudinary sudah terkonfigurasi.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img src={currentUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-stone-200 shadow-sm" />
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 transition-colors cursor-pointer disabled:opacity-50">
          <Upload className="w-3 h-3" />
          <span>{uploading ? 'Uploading...' : label}</span>
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export const FormBuilderPage: React.FC<FormBuilderPageProps> = ({
  initialTemplate,
  editInvitationId,
  onBack,
  onPublished,
  onSaved,
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(createDefaultForm(initialTemplate));
  const [saving, setSaving] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(editInvitationId || null);

  // Dynamic presets from /api/master/presets
  const [presetSongs, setPresetSongs] = useState<PresetSongItem[]>(fallbackMusicList);
  const [templateCatalogs, setTemplateCatalogs] = useState<TemplateCatalogItem[]>(fallbackTemplates);
  const [loadingPresets, setLoadingPresets] = useState<boolean>(true);

  // Music preview
  const [musicTab, setMusicTab] = useState<'preset' | 'custom'>('preset');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Master Presets
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await apiRequest<MasterPresetsResponse>('/api/master/presets');
        if (res.data?.songs && res.data.songs.length > 0) {
          setPresetSongs(res.data.songs);
        }
        if (res.data?.templates && res.data.templates.length > 0) {
          setTemplateCatalogs(res.data.templates);
        }
      } catch (err) {
        console.warn('Gagal memuat preset master, menggunakan fallback lokal:', err);
      } finally {
        setLoadingPresets(false);
      }
    };

    fetchPresets();
  }, []);

  // Load existing data if editing
  useEffect(() => {
    if (editInvitationId) {
      apiRequest(`/api/invitations/${editInvitationId}`).then(res => {
        if (res.data) {
          const inv = res.data;
          const content = typeof inv.contentJson === 'string' ? JSON.parse(inv.contentJson) : inv.contentJson;
          setForm({
            slug: inv.slug,
            templateKey: inv.templateKey,
            ...content,
          });
        }
      }).catch(console.error);
    }
  }, [editInvitationId]);

  // Shortcut updaters
  const updateForm = (patch: Partial<FormData>) => setForm(prev => ({ ...prev, ...patch }));
  const updateGroom = (patch: Partial<FormData['groom']>) => setForm(prev => ({ ...prev, groom: { ...prev.groom, ...patch } }));
  const updateBride = (patch: Partial<FormData['bride']>) => setForm(prev => ({ ...prev, bride: { ...prev.bride, ...patch } }));
  const updateAkad = (patch: Partial<FormData['events']['akad']>) => setForm(prev => ({ ...prev, events: { ...prev.events, akad: { ...prev.events.akad, ...patch } } }));
  const updateResepsi = (patch: Partial<FormData['events']['resepsi']>) => setForm(prev => ({ ...prev, events: { ...prev.events, resepsi: { ...prev.events.resepsi, ...patch } } }));

  // Build contentJson
  const buildContentJson = () => {
    const { slug: _s, templateKey: _t, ...rest } = form;
    rest.meta = {
      title: `The Wedding of ${form.groom.nickName || '...'} & ${form.bride.nickName || '...'}`,
      description: `Undangan Pernikahan ${form.groom.fullName || '...'} & ${form.bride.fullName || '...'}`,
    };
    return rest;
  };

  // ── SAVE DRAFT ──
  const handleSaveDraft = async () => {
    if (!form.slug) { alert('Slug URL wajib diisi.'); setStep(0); return; }
    setSaving(true);
    try {
      const payload = { slug: form.slug, templateKey: form.templateKey, contentJson: buildContentJson() };
      if (invitationId) {
        await apiRequest(`/api/invitations/${invitationId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await apiRequest('/api/invitations', { method: 'POST', body: JSON.stringify(payload) });
        setInvitationId(res.data.id);
      }
      onSaved();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan draf.');
    } finally {
      setSaving(false);
    }
  };

  // ── PUBLISH ──
  const handlePublish = async () => {
    if (!form.slug) { alert('Slug URL wajib diisi.'); setStep(0); return; }
    setSaving(true);
    try {
      const payload = { slug: form.slug, templateKey: form.templateKey, contentJson: buildContentJson() };
      let currentId = invitationId;
      if (currentId) {
        await apiRequest(`/api/invitations/${currentId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await apiRequest('/api/invitations', { method: 'POST', body: JSON.stringify(payload) });
        currentId = res.data.id;
        setInvitationId(currentId);
      }
      onPublished(currentId!);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan sebelum publish.');
    } finally {
      setSaving(false);
    }
  };

  // ── Preview Music Toggle ──
  const togglePreview = (id: string, url: string) => {
    if (previewingId === id) {
      audioPreviewRef.current?.pause();
      setPreviewingId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(() => {});
      }
      setPreviewingId(id);
    }
  };

  // ── Custom Music Upload ──
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMedia(file);
      updateForm({ music: { audioUrl: url, title: file.name.replace(/\.[^.]+$/, '') } });
      setMusicTab('custom');
    } catch {
      alert('Gagal upload file audio.');
    }
  };

  // Gallery helpers
  const addGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMedia(file);
      setForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
    } catch {
      alert('Gagal upload foto galeri.');
    }
  };

  const removeGalleryPhoto = (idx: number) => {
    setForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
  };

  // LoveStory helpers
  const addStoryItem = () => {
    setForm(prev => ({ ...prev, loveStory: [...prev.loveStory, { yearOrDate: '', title: '', story: '' }] }));
  };
  const updateStoryItem = (idx: number, patch: Partial<FormData['loveStory'][0]>) => {
    setForm(prev => ({ ...prev, loveStory: prev.loveStory.map((s, i) => i === idx ? { ...s, ...patch } : s) }));
  };
  const removeStoryItem = (idx: number) => {
    setForm(prev => ({ ...prev, loveStory: prev.loveStory.filter((_, i) => i !== idx) }));
  };

  // Bank account helpers
  const addBankAccount = () => {
    setForm(prev => ({
      ...prev, gifts: { ...prev.gifts, accounts: [...prev.gifts.accounts, { bankName: '', accountNumber: '', accountHolder: '' }] }
    }));
  };
  const updateBankAccount = (idx: number, patch: Partial<FormData['gifts']['accounts'][0]>) => {
    setForm(prev => ({
      ...prev, gifts: {
        ...prev.gifts, accounts: prev.gifts.accounts.map((a, i) => i === idx ? { ...a, ...patch } : a)
      }
    }));
  };
  const removeBankAccount = (idx: number) => {
    setForm(prev => ({ ...prev, gifts: { ...prev.gifts, accounts: prev.gifts.accounts.filter((_, i) => i !== idx) } }));
  };

  // ═══════════════════════════════════════
  // ─── STEP RENDERERS ───────────────────
  // ═══════════════════════════════════════
  const renderStep = () => {
    switch (step) {

      // ── STEP 0: BASIC SETTINGS ──
      case 0:
        return (
          <div className="space-y-6">
            <SectionCard title="Slug URL Undangan" subtitle="Slug akan menjadi bagian dari domain: undangan-{slug}-xxxx.vercel.app">
              <div>
                <FieldLabel label="Slug URL" required />
                <TextInput value={form.slug} onChange={v => updateForm({ slug: v })} placeholder="radit-aulia" required />
                {form.slug && (
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Preview domain: <span className="font-mono text-gold-700">undangan-{form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-xxxx.vercel.app</span>
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Pilihan Tema Desain" subtitle="Daftar tema aktif dari katalog sistem">
              {loadingPresets ? (
                <div className="p-4 text-center text-xs text-stone-400">Memuat katalog tema...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {templateCatalogs.map(t => (
                    <button
                      key={t.templateKey}
                      type="button"
                      onClick={() => updateForm({ templateKey: t.templateKey })}
                      className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                        form.templateKey === t.templateKey
                          ? 'border-gold-500 bg-gold-50 shadow-md'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 border ${
                        t.templateKey === 'minimalist'
                          ? 'bg-amber-50 border-stone-300'
                          : t.templateKey === 'floral'
                          ? 'bg-emerald-100 border-emerald-400'
                          : 'bg-stone-900 border-gold-400'
                      }`} />
                      <span className="text-xs font-semibold text-stone-800 block">{t.name}</span>
                      <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{t.description}</p>
                      {form.templateKey === t.templateKey && <Check className="w-4 h-4 text-gold-600 mx-auto mt-1" />}
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Musik Latar" subtitle="Pilih lagu preset dari katalog atau upload file .mp3 kustom">
              <audio ref={audioPreviewRef} preload="none" />
              <div className="flex border-b border-stone-200 mb-4">
                <button type="button" onClick={() => setMusicTab('preset')}
                  className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${musicTab === 'preset' ? 'border-b-2 border-gold-500 text-gold-700' : 'text-stone-500 hover:text-stone-700'}`}>
                  <Music className="w-3.5 h-3.5 inline mr-1.5" />Daftar Lagu Preset ({presetSongs.length})
                </button>
                <button type="button" onClick={() => setMusicTab('custom')}
                  className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${musicTab === 'custom' ? 'border-b-2 border-gold-500 text-gold-700' : 'text-stone-500 hover:text-stone-700'}`}>
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />Upload MP3 Custom
                </button>
              </div>

              {musicTab === 'preset' ? (
                <div className="space-y-2">
                  {presetSongs.map(m => (
                    <div key={m.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${form.music.audioUrl === m.audioUrl ? 'border-gold-500 bg-gold-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button type="button" onClick={() => togglePreview(m.id, m.audioUrl)}
                          className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gold-700 transition-colors">
                          {previewingId === m.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm text-stone-800 font-medium block truncate">{m.title}</span>
                          {m.artist && <span className="text-[10px] text-stone-400 block truncate">{m.artist}</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => { updateForm({ music: { audioUrl: m.audioUrl, title: m.title } }); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${form.music.audioUrl === m.audioUrl ? 'bg-gold-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                        {form.music.audioUrl === m.audioUrl ? 'Terpilih ✓' : 'Pilih'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="file" accept="audio/*,.mp3" onChange={handleMusicUpload}
                    className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                  {form.music.audioUrl && !presetSongs.some(p => p.audioUrl === form.music.audioUrl) && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>File custom terpasang: <strong>{form.music.title || 'custom audio'}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        );

      // ── STEP 1: COVER ──
      case 1:
        return (
          <SectionCard title="Cover Pembuka" subtitle="Informasi yang tampil di halaman awal undangan">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><FieldLabel label="Nama Panggilan Pria" required /><TextInput value={form.groom.nickName} onChange={v => updateGroom({ nickName: v })} placeholder="Radit" required /></div>
              <div><FieldLabel label="Nama Panggilan Wanita" required /><TextInput value={form.bride.nickName} onChange={v => updateBride({ nickName: v })} placeholder="Aulia" required /></div>
            </div>
            <div>
              <FieldLabel label="Tanggal Utama Acara (ISO)" required />
              <TextInput type="datetime-local" value={form.eventDateIso ? form.eventDateIso.slice(0, 16) : ''} onChange={v => updateForm({ eventDateIso: v + ':00+07:00' })} required />
            </div>
          </SectionCard>
        );

      // ── STEP 2: QUOTE ──
      case 2:
        return (
          <SectionCard title="Salam Pembuka & Kutipan" subtitle="Kata sambutan dan ayat/quote singkat di kartu ucapan">
            <div>
              <FieldLabel label="Kutipan Utama" required />
              <TextArea value={form.quote.text} onChange={v => updateForm({ quote: { ...form.quote, text: v } })} placeholder="Dan di antara tanda-tanda kebesaran-Nya..." rows={4} />
            </div>
            <div>
              <FieldLabel label="Sumber Kutipan" required />
              <TextInput value={form.quote.source} onChange={v => updateForm({ quote: { ...form.quote, source: v } })} placeholder="QS. Ar-Rum: 21" />
            </div>
          </SectionCard>
        );

      // ── STEP 3: COUPLE PROFILE ──
      case 3:
        return (
          <div className="space-y-6">
            {/* Groom */}
            <SectionCard title="Mempelai Pria">
              <PhotoUploadButton currentUrl={form.groom.photoUrl} onUploaded={url => updateGroom({ photoUrl: url })} label="Upload Foto Pria" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div><FieldLabel label="Nama Lengkap + Gelar" required /><TextInput value={form.groom.fullName} onChange={v => updateGroom({ fullName: v })} placeholder="Raditya Bagas Pratama, S.Kom." /></div>
                <div><FieldLabel label="Putra/Putri dari" required /><TextInput value={form.groom.parents} onChange={v => updateGroom({ parents: v })} placeholder="Putra dari Bpk. Ahmad & Ibu Siti" /></div>
                <div><FieldLabel label="Username Instagram" /><TextInput value={form.groom.instagramUsername} onChange={v => updateGroom({ instagramUsername: v, instagramUrl: v ? `https://instagram.com/${v}` : '' })} placeholder="radityabagas" /></div>
              </div>
            </SectionCard>
            {/* Bride */}
            <SectionCard title="Mempelai Wanita">
              <PhotoUploadButton currentUrl={form.bride.photoUrl} onUploaded={url => updateBride({ photoUrl: url })} label="Upload Foto Wanita" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div><FieldLabel label="Nama Lengkap + Gelar" required /><TextInput value={form.bride.fullName} onChange={v => updateBride({ fullName: v })} placeholder="Aulia Rahma Safitri, S.Ds." /></div>
                <div><FieldLabel label="Putri dari" required /><TextInput value={form.bride.parents} onChange={v => updateBride({ parents: v })} placeholder="Putri dari Bpk. Suryono & Ibu Ratna" /></div>
                <div><FieldLabel label="Username Instagram" /><TextInput value={form.bride.instagramUsername} onChange={v => updateBride({ instagramUsername: v, instagramUrl: v ? `https://instagram.com/${v}` : '' })} placeholder="auliarahma" /></div>
              </div>
            </SectionCard>
          </div>
        );

      // ── STEP 4: EVENTS ──
      case 4: {
        const renderEventForm = (_prefix: string, data: FormData['events']['akad'], update: (p: any) => void) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><FieldLabel label="Hari" required /><TextInput value={data.dayName} onChange={v => update({ dayName: v })} placeholder="Sabtu" /></div>
            <div><FieldLabel label="Tanggal" required /><TextInput value={data.dateFormatted} onChange={v => update({ dateFormatted: v })} placeholder="28 Desember 2026" /></div>
            <div><FieldLabel label="Waktu" required /><TextInput value={data.timeFormatted} onChange={v => update({ timeFormatted: v })} placeholder="08.00 - 10.00 WIB" /></div>
            <div><FieldLabel label="Nama Lokasi" required /><TextInput value={data.locationName} onChange={v => update({ locationName: v })} placeholder="Grand Ballroom Hotel Mulia" /></div>
            <div className="sm:col-span-2"><FieldLabel label="Alamat Lengkap" /><TextInput value={data.address} onChange={v => update({ address: v })} placeholder="Jl. Asia Afrika Senayan, Jakarta" /></div>
            <div className="sm:col-span-2"><FieldLabel label="Link Google Maps" /><TextInput value={data.googleMapsUrl} onChange={v => update({ googleMapsUrl: v })} placeholder="https://maps.google.com/?q=..." /></div>
          </div>
        );
        return (
          <div className="space-y-6">
            <SectionCard title="Akad Nikah / Pemberkatan">
              {renderEventForm('akad', form.events.akad, updateAkad)}
            </SectionCard>
            <SectionCard title="Resepsi Pernikahan">
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" id="resepsi-toggle" checked={form.events.resepsi.enabled}
                  onChange={e => updateResepsi({ enabled: e.target.checked })} className="accent-gold-600 w-4 h-4 cursor-pointer" />
                <label htmlFor="resepsi-toggle" className="text-xs font-semibold text-stone-700 cursor-pointer">Aktifkan Sesi Resepsi</label>
              </div>
              {form.events.resepsi.enabled && renderEventForm('resepsi', form.events.resepsi, updateResepsi)}
            </SectionCard>
          </div>
        );
      }

      // ── STEP 5: LOVE STORY ──
      case 5:
        return (
          <SectionCard title="Love Story Timeline" subtitle="Opsional — Bagian ini otomatis disembunyikan jika kosong.">
            <div className="space-y-4">
              {form.loveStory.map((item, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative">
                  <button type="button" onClick={() => removeStoryItem(idx)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <div><FieldLabel label="Tahun / Tanggal" /><TextInput value={item.yearOrDate} onChange={v => updateStoryItem(idx, { yearOrDate: v })} placeholder="2019" /></div>
                    <div><FieldLabel label="Judul Momen" /><TextInput value={item.title} onChange={v => updateStoryItem(idx, { title: v })} placeholder="Pertama Bertemu" /></div>
                  </div>
                  <div><FieldLabel label="Cerita Singkat" /><TextArea value={item.story} onChange={v => updateStoryItem(idx, { story: v })} placeholder="Kisah momen ini..." rows={2} /></div>
                </div>
              ))}
              <button type="button" onClick={addStoryItem}
                className="w-full py-2.5 border-2 border-dashed border-stone-300 hover:border-gold-500 rounded-xl text-xs font-semibold text-stone-600 hover:text-gold-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Tambah Momen Baru
              </button>
            </div>
          </SectionCard>
        );

      // ── STEP 6: GALLERY ──
      case 6:
        return (
          <SectionCard title="Galeri Foto Pre-Wedding" subtitle="Opsional — Bagian ini otomatis disembunyikan jika kosong.">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.gallery.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                  <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGalleryPhoto(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-rose-600/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-gold-500 flex flex-col items-center justify-center cursor-pointer transition-colors text-stone-500 hover:text-gold-700">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-semibold">Tambah Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={addGalleryPhoto} />
              </label>
            </div>
          </SectionCard>
        );

      // ── STEP 7: GIFT + CLOSING ──
      case 7:
        return (
          <div className="space-y-6">
            <SectionCard title="Amplop Digital / Wedding Gift" subtitle="Daftar rekening bank / e-wallet untuk hadiah digital">
              <div className="space-y-4">
                {form.gifts.accounts.map((acc, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative">
                    <button type="button" onClick={() => removeBankAccount(idx)}
                      className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer"><X className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><FieldLabel label="Nama Bank / E-Wallet" /><TextInput value={acc.bankName} onChange={v => updateBankAccount(idx, { bankName: v })} placeholder="BCA" /></div>
                      <div><FieldLabel label="No. Rekening" /><TextInput value={acc.accountNumber} onChange={v => updateBankAccount(idx, { accountNumber: v })} placeholder="8410293819" /></div>
                      <div><FieldLabel label="Atas Nama" /><TextInput value={acc.accountHolder} onChange={v => updateBankAccount(idx, { accountHolder: v })} placeholder="Raditya Bagas" /></div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addBankAccount}
                  className="w-full py-2.5 border-2 border-dashed border-stone-300 hover:border-gold-500 rounded-xl text-xs font-semibold text-stone-600 hover:text-gold-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Tambah Rekening
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Alamat Kirim Kado Fisik" subtitle="Opsional — Isi jika ingin menerima kado fisik">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><FieldLabel label="Penerima" /><TextInput value={form.gifts.physicalGift.recipientName} onChange={v => setForm(p => ({ ...p, gifts: { ...p.gifts, physicalGift: { ...p.gifts.physicalGift, recipientName: v } } }))} placeholder="Radit & Aulia" /></div>
                <div><FieldLabel label="No. HP Penerima" /><TextInput value={form.gifts.physicalGift.phoneNumber} onChange={v => setForm(p => ({ ...p, gifts: { ...p.gifts, physicalGift: { ...p.gifts.physicalGift, phoneNumber: v } } }))} placeholder="0812-9876-5432" /></div>
                <div className="sm:col-span-2"><FieldLabel label="Alamat Lengkap" /><TextArea value={form.gifts.physicalGift.fullAddress} onChange={v => setForm(p => ({ ...p, gifts: { ...p.gifts, physicalGift: { ...p.gifts.physicalGift, fullAddress: v } } }))} placeholder="Jl. Contoh No. 123, RT 01/02, Kel, Kec, Kota, Kode Pos" /></div>
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  // ═══════════════════════════════════════
  // ─── LIVE PREVIEW PANEL ───────────────
  // ═══════════════════════════════════════
  const renderLivePreview = () => {
    const themeLabel = form.templateKey === 'minimalist' ? 'Minimalist' : form.templateKey === 'floral' ? 'Floral Sage' : form.templateKey === 'royal-vintage' ? 'Royal Vintage' : 'Dark Luxury';
    const themeBg = form.templateKey === 'dark-luxury' ? 'bg-stone-900 text-stone-200' : form.templateKey === 'floral' ? 'bg-[#f0f4f1] text-stone-800' : form.templateKey === 'royal-vintage' ? 'bg-[#fdfaf5] text-[#442b2d]' : 'bg-[#faf8f5] text-stone-800';
    const themeAccent = form.templateKey === 'dark-luxury' ? 'text-gold-400' : form.templateKey === 'floral' ? 'text-emerald-700' : form.templateKey === 'royal-vintage' ? 'text-[#8b1e2f]' : 'text-[#9c7b4c]';

    return (
      <div className={`rounded-2xl border border-stone-200 shadow-inner overflow-hidden ${themeBg} p-5 text-center space-y-5 h-full min-h-[400px] flex flex-col justify-between`}>
        <div className="space-y-3">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${themeAccent}`}>
            Live Preview — {themeLabel}
          </span>
          <h3 className="font-serif text-2xl font-bold leading-tight">
            {form.groom.nickName || '...'} <span className={`font-script ${themeAccent}`}>&</span> {form.bride.nickName || '...'}
          </h3>
          {form.eventDateIso && (
            <p className="text-xs opacity-70 flex items-center justify-center gap-1.5">
              <Calendar className="w-3 h-3" /> {form.events.akad.dateFormatted || new Date(form.eventDateIso).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Mini sections */}
        <div className="flex-1 space-y-3 text-left text-xs opacity-80">
          {form.quote.text && <p className="italic font-serif text-center text-[11px] border-t border-current/10 pt-3">"{form.quote.text.slice(0, 80)}..."</p>}

          <div className="flex items-center gap-3 justify-center">
            {form.groom.photoUrl && <img src={form.groom.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-current/20" />}
            {form.groom.photoUrl && form.bride.photoUrl && <Heart className={`w-3 h-3 ${themeAccent}`} />}
            {form.bride.photoUrl && <img src={form.bride.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-current/20" />}
          </div>

          {form.events.akad.locationName && (
            <p className="text-center"><MapPin className={`w-3 h-3 inline mr-1 ${themeAccent}`} />{form.events.akad.locationName}</p>
          )}

          {form.loveStory.length > 0 && <p className="text-center"><Heart className="w-3 h-3 inline mr-1" />{form.loveStory.length} momen kisah cinta</p>}
          {form.gallery.length > 0 && <p className="text-center"><ImageIcon className="w-3 h-3 inline mr-1" />{form.gallery.length} foto galeri</p>}
          {form.gifts.accounts.filter(a => a.bankName).length > 0 && <p className="text-center"><CreditCard className="w-3 h-3 inline mr-1" />{form.gifts.accounts.filter(a => a.bankName).length} rekening digital</p>}
          {form.music.title && <p className="text-center"><Music className="w-3 h-3 inline mr-1" />{form.music.title}</p>}
        </div>

        <p className="text-[10px] opacity-50">undangan-{form.slug || '...'}.vercel.app</p>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // ─── MAIN RENDER ──────────────────────
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-stone-100 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <div className="hidden sm:block text-center">
            <h2 className="text-sm font-bold text-stone-900">
              {editInvitationId ? 'Edit Undangan' : 'Buat Undangan Baru'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveDraft} disabled={saving}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-full border border-stone-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Simpan Draf
            </button>
            <button onClick={handlePublish} disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 text-xs font-semibold rounded-full shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> Publish & Generate
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: Stepper + Form */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Stepper Nav */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {STEPS.map((s, idx) => (
                  <button key={s.key} onClick={() => setStep(idx)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${step === idx ? 'bg-stone-900 text-white shadow-sm' : idx < step ? 'bg-gold-50 text-gold-800' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
                    <span>{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step Header */}
            <div className="px-1">
              <h3 className="text-lg font-bold text-stone-900">
                Langkah {step + 1}: {STEPS[step].label}
              </h3>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Step Nav Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-full hover:bg-stone-50 cursor-pointer disabled:opacity-30 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5">
                  Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={handlePublish} disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 text-xs font-semibold rounded-full shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5" /> Publish & Generate Domain
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Live Preview (Desktop) */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 sticky top-20 self-start">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 px-1">
              Pratinjau Langsung
            </h4>
            {renderLivePreview()}
          </div>
        </div>
      </div>
    </div>
  );
};
