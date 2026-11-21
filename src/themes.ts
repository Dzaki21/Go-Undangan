export type ThemeType = 'minimalist' | 'floral' | 'dark-luxury';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  // Page container & background
  pageBg: string;
  containerBg: string;
  containerBorder: string;
  bodyText: string;
  mutedText: string;
  accentText: string;
  subtleBg: string;
  cardBg: string;
  cardBorder: string;
  
  // Header / Titles
  headingFont: string;
  titleColor: string;
  sectionSubtitleColor: string;
  dividerColor: string;

  // Buttons & Badges
  primaryBtn: string;
  secondaryBtn: string;
  badgeBg: string;
  badgeText: string;
  
  // Ornaments & Decor
  showFloralDecor: boolean;
  ornamentColor: string;
  
  // Floating Music Button
  musicBtnBg: string;
  musicBtnBorder: string;
  musicBtnIcon: string;

  // Cover Specific
  coverOverlay: string;
  coverGreetingBox: string;
  coverButton: string;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist Warm',
    pageBg: 'bg-[#faf8f5]',
    containerBg: 'bg-[#fdfcf9]',
    containerBorder: 'border-stone-200/60',
    bodyText: 'text-stone-700',
    mutedText: 'text-stone-500',
    accentText: 'text-[#9c7b4c]',
    subtleBg: 'bg-[#f5f1eb]',
    cardBg: 'bg-white',
    cardBorder: 'border-stone-200/80',

    headingFont: 'font-serif',
    titleColor: 'text-stone-800',
    sectionSubtitleColor: 'text-[#9c7b4c]',
    dividerColor: 'bg-[#9c7b4c]',

    primaryBtn: 'bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-md',
    secondaryBtn: 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300/80',
    badgeBg: 'bg-[#f4efe8]',
    badgeText: 'text-[#876537]',

    showFloralDecor: false,
    ornamentColor: 'text-[#b08d57]',

    musicBtnBg: 'bg-white/90 text-stone-800 shadow-stone-300/50',
    musicBtnBorder: 'border-stone-300',
    musicBtnIcon: 'text-stone-800',

    coverOverlay: 'bg-stone-900/40',
    coverGreetingBox: 'bg-white/85 backdrop-blur-md border border-stone-200 text-stone-900 shadow-xl',
    coverButton: 'bg-stone-900 hover:bg-stone-800 text-stone-100 ring-2 ring-stone-400/40',
  },

  floral: {
    id: 'floral',
    name: 'Soft Floral Sage',
    pageBg: 'bg-[#f0f4f1]',
    containerBg: 'bg-[#fbfcfb]',
    containerBorder: 'border-emerald-900/10',
    bodyText: 'text-[#35433a]',
    mutedText: 'text-[#5e7165]',
    accentText: 'text-[#4d7159]',
    subtleBg: 'bg-[#e7eee9]',
    cardBg: 'bg-white/95',
    cardBorder: 'border-[#c7d9cc]/70',

    headingFont: 'font-serif',
    titleColor: 'text-[#243429]',
    sectionSubtitleColor: 'text-[#486b53]',
    dividerColor: 'bg-[#5e8369]',

    primaryBtn: 'bg-[#3b5943] text-emerald-50 hover:bg-[#2f4736] shadow-md shadow-emerald-900/15',
    secondaryBtn: 'bg-[#e5ede7] text-[#2c3d31] hover:bg-[#d6e3d9] border border-[#bed2c4]',
    badgeBg: 'bg-[#e2ede4]',
    badgeText: 'text-[#30533b]',

    showFloralDecor: true,
    ornamentColor: 'text-[#4d7159]',

    musicBtnBg: 'bg-[#3b5943]/90 text-emerald-100 shadow-emerald-900/30',
    musicBtnBorder: 'border-[#a9c9b1]',
    musicBtnIcon: 'text-emerald-100',

    coverOverlay: 'bg-emerald-950/45',
    coverGreetingBox: 'bg-[#f7faf8]/90 backdrop-blur-md border border-[#c1d6c6] text-[#283b2e] shadow-xl',
    coverButton: 'bg-[#3b5943] hover:bg-[#304a37] text-white ring-2 ring-emerald-300/40',
  },

  'dark-luxury': {
    id: 'dark-luxury',
    name: 'Dark Luxury & Gold',
    pageBg: 'bg-[#0d0d0f]',
    containerBg: 'bg-[#151518]',
    containerBorder: 'border-gold-500/25',
    bodyText: 'text-stone-300',
    mutedText: 'text-stone-400',
    accentText: 'text-gold-400',
    subtleBg: 'bg-[#1b1b20]',
    cardBg: 'bg-[#1e1e24]',
    cardBorder: 'border-gold-500/20',

    headingFont: 'font-serif',
    titleColor: 'text-gold-200',
    sectionSubtitleColor: 'text-gold-400',
    dividerColor: 'bg-gold-500',

    primaryBtn: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-semibold shadow-lg shadow-gold-900/50',
    secondaryBtn: 'bg-stone-800 text-gold-300 hover:bg-stone-700 border border-gold-500/30',
    badgeBg: 'bg-gold-950/70 border border-gold-500/30',
    badgeText: 'text-gold-300',

    showFloralDecor: false,
    ornamentColor: 'text-gold-400',

    musicBtnBg: 'bg-stone-900/90 text-gold-400 shadow-gold-500/20',
    musicBtnBorder: 'border-gold-400',
    musicBtnIcon: 'text-gold-400',

    coverOverlay: 'bg-stone-950/75',
    coverGreetingBox: 'bg-stone-900/85 backdrop-blur-md border border-gold-500/40 text-stone-100 shadow-2xl',
    coverButton: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-medium ring-2 ring-gold-300/30',
  },
};
