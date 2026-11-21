import React, { useState } from 'react';
import { Send, MessageSquareQuote, CheckCircle2, Heart } from 'lucide-react';
import { RsvpComment } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface RsvpSectionProps {
  defaultComments?: RsvpComment[];
  groomNick: string;
  brideNick: string;
  themeConfig: ThemeConfig;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  defaultComments = [],
  groomNick,
  brideNick,
  themeConfig,
}) => {
  const [comments, setComments] = useState<RsvpComment[]>(defaultComments);
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'ragu' | 'tidak_hadir'>('hadir');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newComment: RsvpComment = {
      id: Date.now().toString(),
      name: name.trim(),
      attendance,
      guestCount: attendance === 'hadir' ? guestCount : undefined,
      message: message.trim(),
      createdAt: 'Baru saja',
    };

    setComments([newComment, ...comments]);
    setName('');
    setMessage('');
    setGuestCount(1);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const getBadgeStyle = (status: RsvpComment['attendance']) => {
    switch (status) {
      case 'hadir':
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'ragu':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'tidak_hadir':
        return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
    }
  };

  const getBadgeLabel = (status: RsvpComment['attendance']) => {
    switch (status) {
      case 'hadir':
        return 'Hadir';
      case 'ragu':
        return 'Ragu-ragu';
      case 'tidak_hadir':
        return 'Tidak Hadir';
    }
  };

  return (
    <section className={`py-16 px-6 relative ${themeConfig.containerBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Konfirmasi & Doa
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            RSVP & Ucapan Tamu
          </h2>
          <div className={`w-16 h-0.5 mx-auto mt-2 ${themeConfig.dividerColor}`} />
          <p className={`text-xs sm:text-sm font-light max-w-md mx-auto pt-2 ${themeConfig.mutedText}`}>
            Mohon kesediaan Anda untuk mengonfirmasi kehadiran dan memberikan ucapan serta doa restu.
          </p>
        </div>

        {/* RSVP Form */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${themeConfig.cardBg} ${themeConfig.cardBorder}`}>
          {isSubmitted && (
            <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 rounded-2xl flex items-center gap-3 text-xs sm:text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Terima kasih! Konfirmasi kehadiran dan ucapan Anda berhasil dikirim.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeConfig.bodyText}`}>
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 text-sm ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.bodyText}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeConfig.bodyText}`}>
                  Konfirmasi Kehadiran *
                </label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as any)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 text-sm cursor-pointer ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.bodyText}`}
                >
                  <option value="hadir" className="bg-stone-900 text-stone-100">Hadir</option>
                  <option value="ragu" className="bg-stone-900 text-stone-100">Ragu-ragu</option>
                  <option value="tidak_hadir" className="bg-stone-900 text-stone-100">Tidak Hadir</option>
                </select>
              </div>

              {attendance === 'hadir' && (
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeConfig.bodyText}`}>
                    Jumlah Tamu
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 text-sm cursor-pointer ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.bodyText}`}
                  >
                    <option value={1} className="bg-stone-900 text-stone-100">1 Orang</option>
                    <option value={2} className="bg-stone-900 text-stone-100">2 Orang</option>
                    <option value={3} className="bg-stone-900 text-stone-100">3 Orang</option>
                    <option value={4} className="bg-stone-900 text-stone-100">4 Orang</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeConfig.bodyText}`}>
                Ucapan & Doa Restu *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 text-sm resize-none ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.bodyText}`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 font-semibold text-sm rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${themeConfig.primaryBtn}`}
            >
              <Send className="w-4 h-4" />
              <span>Kirim Konfirmasi & Ucapan</span>
            </button>
          </form>
        </div>

        {/* Comments Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`font-serif text-lg font-bold flex items-center gap-2 ${themeConfig.titleColor}`}>
              <MessageSquareQuote className={`w-5 h-5 ${themeConfig.accentText}`} />
              <span>Doa & Ucapan ({comments.length})</span>
            </h3>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-2xl p-4 sm:p-5 border shadow-sm space-y-2 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${themeConfig.titleColor}`}>{comment.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                        comment.attendance
                      )}`}
                    >
                      {getBadgeLabel(comment.attendance)}
                      {comment.guestCount ? ` (${comment.guestCount} orang)` : ''}
                    </span>
                  </div>
                  <span className={`text-[11px] ${themeConfig.mutedText}`}>{comment.createdAt}</span>
                </div>
                <p className={`text-xs sm:text-sm font-light leading-relaxed ${themeConfig.bodyText}`}>
                  {comment.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Penutup */}
        <footer className={`pt-12 pb-6 text-center space-y-4 border-t border-stone-200/20`}>
          <div className="flex items-center justify-center gap-2">
            <Heart className={`w-5 h-5 fill-current ${themeConfig.ornamentColor}`} />
          </div>
          <p className={`text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed ${themeConfig.mutedText}`}>
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
          </p>
          <div className="pt-2">
            <p className={`font-serif italic text-base ${themeConfig.bodyText}`}>
              Kami yang berbahagia,
            </p>
            <h4 className={`font-serif text-2xl font-bold mt-1 ${themeConfig.titleColor}`}>
              {groomNick} & {brideNick}
            </h4>
          </div>
          <p className={`text-[10px] pt-6 ${themeConfig.mutedText}`}>
            © {new Date().getFullYear()} Undangan Digital. Built with React, Vite & Tailwind CSS.
          </p>
        </footer>
      </div>
    </section>
  );
};
