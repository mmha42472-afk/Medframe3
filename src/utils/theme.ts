import { ThemeColor, SectionBgStyle } from '../types/doctor';

export interface ThemeStyles {
  id: ThemeColor;
  nameAr: string;
  nameEn: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  bgSubtle: string;
  textPrimary: string;
  buttonClass: string;
  accentBorder: string;
  heroGradient: string;
  badgeBg: string;
  badgeText: string;
}

export const THEME_PALETTES: Record<ThemeColor, ThemeStyles> = {
  teal: {
    id: 'teal',
    nameAr: 'تركوازي طبي (Medical Teal)',
    nameEn: 'Medical Teal',
    primary: '#0d9488',
    primaryLight: '#ccfbf1',
    primaryDark: '#115e59',
    bgSubtle: 'bg-teal-50/70',
    textPrimary: 'text-teal-700',
    buttonClass: 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 shadow-md',
    accentBorder: 'border-teal-600',
    heroGradient: 'from-teal-950 via-teal-900 to-slate-900',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/80',
    badgeText: 'text-teal-800'
  },
  navy: {
    id: 'navy',
    nameAr: 'أزرق ملكي (Royal Navy)',
    nameEn: 'Royal Navy',
    primary: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryDark: '#1e3a8a',
    bgSubtle: 'bg-blue-50/70',
    textPrimary: 'text-blue-700',
    buttonClass: 'bg-blue-800 hover:bg-blue-900 text-white shadow-blue-800/20 shadow-md',
    accentBorder: 'border-blue-600',
    heroGradient: 'from-slate-950 via-blue-950 to-slate-900',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/80',
    badgeText: 'text-blue-800'
  },
  emerald: {
    id: 'emerald',
    nameAr: 'زمردي صحي (Health Emerald)',
    nameEn: 'Health Emerald',
    primary: '#059669',
    primaryLight: '#d1fae5',
    primaryDark: '#064e3b',
    bgSubtle: 'bg-emerald-50/70',
    textPrimary: 'text-emerald-700',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 shadow-md',
    accentBorder: 'border-emerald-600',
    heroGradient: 'from-emerald-950 via-emerald-900 to-slate-900',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    badgeText: 'text-emerald-800'
  },
  rose: {
    id: 'rose',
    nameAr: 'وردي جلدي وتجميلي (Clinical Rose)',
    nameEn: 'Clinical Rose',
    primary: '#e11d48',
    primaryLight: '#ffe4e6',
    primaryDark: '#9f1239',
    bgSubtle: 'bg-rose-50/70',
    textPrimary: 'text-rose-700',
    buttonClass: 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-700/20 shadow-md',
    accentBorder: 'border-rose-600',
    heroGradient: 'from-rose-950 via-slate-900 to-slate-950',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/80',
    badgeText: 'text-rose-800'
  },
  plum: {
    id: 'plum',
    nameAr: 'بنفسجي راقٍ (Executive Plum)',
    nameEn: 'Executive Plum',
    primary: '#7e22ce',
    primaryLight: '#f3e8ff',
    primaryDark: '#581c87',
    bgSubtle: 'bg-purple-50/70',
    textPrimary: 'text-purple-700',
    buttonClass: 'bg-purple-800 hover:bg-purple-900 text-white shadow-purple-800/20 shadow-md',
    accentBorder: 'border-purple-600',
    heroGradient: 'from-slate-950 via-purple-950 to-slate-900',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
    badgeText: 'text-purple-800'
  },
  amethyst: {
    id: 'amethyst',
    nameAr: 'جمشت فخم (Royal Amethyst)',
    nameEn: 'Royal Amethyst',
    primary: '#9333ea',
    primaryLight: '#f3e8ff',
    primaryDark: '#6b21a8',
    bgSubtle: 'bg-fuchsia-50/70',
    textPrimary: 'text-purple-700',
    buttonClass: 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-700/20 shadow-md',
    accentBorder: 'border-purple-500',
    heroGradient: 'from-slate-950 via-fuchsia-950 to-slate-900',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/80',
    badgeText: 'text-purple-800'
  },
  obsidian: {
    id: 'obsidian',
    nameAr: 'حجري فاحم (Modern Obsidian)',
    nameEn: 'Modern Obsidian',
    primary: '#334155',
    primaryLight: '#f1f5f9',
    primaryDark: '#0f172a',
    bgSubtle: 'bg-slate-100/70',
    textPrimary: 'text-slate-800',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 shadow-md',
    accentBorder: 'border-slate-700',
    heroGradient: 'from-slate-950 via-slate-900 to-zinc-950',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-800'
  },
  bronze: {
    id: 'bronze',
    nameAr: 'برونزي دافئ (Warm Bronze)',
    nameEn: 'Warm Bronze',
    primary: '#b45309',
    primaryLight: '#fef3c7',
    primaryDark: '#78350f',
    bgSubtle: 'bg-amber-50/70',
    textPrimary: 'text-amber-800',
    buttonClass: 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/20 shadow-md',
    accentBorder: 'border-amber-600',
    heroGradient: 'from-stone-950 via-amber-950 to-neutral-900',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'text-amber-900'
  }
};

export function getTheme(color: ThemeColor = 'teal'): ThemeStyles {
  return THEME_PALETTES[color] || THEME_PALETTES.teal;
}

export function getSectionBgClasses(style?: SectionBgStyle, themeColor: ThemeColor = 'teal'): {
  sectionBg: string;
  cardBg: string;
  isDark: boolean;
  borderClass: string;
} {
  const theme = getTheme(themeColor);
  
  switch (style) {
    case 'dark':
      return {
        sectionBg: 'bg-slate-950 text-white',
        cardBg: 'bg-slate-900/90 border-slate-800 text-slate-100',
        isDark: true,
        borderClass: 'border-slate-800'
      };
    case 'tinted':
      return {
        sectionBg: theme.bgSubtle,
        cardBg: 'bg-white/95 border-slate-200/80 shadow-sm',
        isDark: false,
        borderClass: 'border-slate-200'
      };
    case 'glass':
      return {
        sectionBg: 'bg-gradient-to-b from-white/60 to-slate-100/60 backdrop-blur-xl',
        cardBg: 'bg-white/80 backdrop-blur-md border-white/60 shadow-lg',
        isDark: false,
        borderClass: 'border-white/50'
      };
    case 'subtle':
      return {
        sectionBg: 'bg-slate-100/80',
        cardBg: 'bg-white border-slate-200/90 shadow-xs',
        isDark: false,
        borderClass: 'border-slate-200'
      };
    case 'white':
    default:
      return {
        sectionBg: 'bg-white',
        cardBg: 'bg-slate-50/80 border-slate-200/70 shadow-xs',
        isDark: false,
        borderClass: 'border-slate-200/80'
      };
  }
}
