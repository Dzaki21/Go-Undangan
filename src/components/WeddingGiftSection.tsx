import React, { useState } from 'react';
import { Copy, Check, Gift, CreditCard, MapPin } from 'lucide-react';
import { InvitationData } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface WeddingGiftSectionProps {
  gifts?: InvitationData['gifts'];
  themeConfig: ThemeConfig;
}

export const WeddingGiftSection: React.FC<WeddingGiftSectionProps> = ({ gifts, themeConfig }) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyToClipboard = (accountNumber: string, label: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    setToastMessage(`Nomor rekening ${label} berhasil disalin!`);

    setTimeout(() => {
      setCopiedAccount(null);
      setToastMessage(null);
    }, 3000);
  };

  const hasAccounts = gifts?.accounts && gifts.accounts.length > 0;
  const hasPhysical = !!gifts?.physicalGift;

  if (!hasAccounts && !hasPhysical) {
    return null;
  }

  return (
    <section className={`py-16 px-6 relative ${themeConfig.subtleBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 text-xs sm:text-sm px-5 py-3 rounded-full shadow-2xl border border-gold-500/40 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Tanda Kasih
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            Amplop Digital
          </h2>
          <div className={`w-16 h-0.5 mx-auto mt-2 ${themeConfig.dividerColor}`} />
          <p className={`text-xs sm:text-sm font-light max-w-md mx-auto pt-2 ${themeConfig.mutedText}`}>
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih secara digital, Anda dapat melalui nomor rekening berikut:
          </p>
        </div>

        {/* Bank & E-Wallet Accounts */}
        {hasAccounts && (
          <div className="space-y-4">
            {gifts!.accounts.map((acc, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-5 sm:p-6 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <CreditCard className={`w-4 h-4 ${themeConfig.accentText}`} />
                    <span className={`font-bold text-base ${themeConfig.titleColor}`}>{acc.bankName}</span>
                  </div>
                  <p className={`font-mono text-lg font-semibold tracking-wider ${themeConfig.titleColor}`}>
                    {acc.accountNumber}
                  </p>
                  <p className={`text-xs ${themeConfig.mutedText}`}>
                    a.n. <span className={`font-medium ${themeConfig.bodyText}`}>{acc.accountHolder}</span>
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(acc.accountNumber, acc.bankName)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    copiedAccount === acc.accountNumber
                      ? 'bg-emerald-600 text-white'
                      : themeConfig.primaryBtn
                  }`}
                >
                  {copiedAccount === acc.accountNumber ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Physical Gift Option */}
        {hasPhysical && gifts?.physicalGift && (
          <div
            className={`mt-8 border border-dashed rounded-2xl p-6 text-center space-y-3 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${themeConfig.badgeBg} ${themeConfig.badgeText}`}
            >
              <Gift className="w-5 h-5" />
            </div>
            <h3 className={`font-serif text-lg font-bold ${themeConfig.titleColor}`}>
              Kirim Kado Fisik
            </h3>
            <p className={`text-xs sm:text-sm font-medium ${themeConfig.bodyText}`}>
              Penerima: {gifts.physicalGift.recipientName} ({gifts.physicalGift.phoneNumber})
            </p>
            <div className={`flex items-start justify-center gap-1.5 text-xs max-w-md mx-auto ${themeConfig.mutedText}`}>
              <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${themeConfig.accentText}`} />
              <span>{gifts.physicalGift.fullAddress}</span>
            </div>
            {gifts.physicalGift.note && (
              <p className={`text-[11px] italic max-w-sm mx-auto ${themeConfig.mutedText}`}>
                *{gifts.physicalGift.note}
              </p>
            )}
            <button
              onClick={() => copyToClipboard(gifts.physicalGift!.fullAddress, 'Alamat Kirim')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-colors cursor-pointer ${themeConfig.secondaryBtn}`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Alamat</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
