import { ThemeColor } from '../types/doctor';

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
    nameAr: 'تركوازي طبي (Teal)',
    nameEn: 'Medical Teal',
    primary: '#0d9488',
    primaryLight: '#ccfbf1',
    primaryDark: '#115e59',
    bgSubtle: 'bg-teal-50/60',
    textPrimary: 'text-teal-700',
    buttonClass: 'bg-teal-700 hover:bg-teal-800 text-white',
    accentBorder: 'border-teal-600',
    heroGradient: 'from-teal-900 via-teal-800 to-slate-900',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800'
  },
  navy: {
    id: 'navy',
    nameAr: 'أزرق كلاسيكي (Navy)',
    nameEn: 'Royal Navy',
    primary: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryDark: '#1e3a8a',
    bgSubtle: 'bg-blue-50/60',
    textPrimary: 'text-blue-700',
    buttonClass: 'bg-blue-800 hover:bg-blue-900 text-white',
    accentBorder: 'border-blue-600',
    heroGradient: 'from-slate-900 via-blue-950 to-slate-900',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800'
  },
  emerald: {
    id: 'emerald',
    nameAr: 'زمردي صحي (Emerald)',
    nameEn: 'Health Emerald',
    primary: '#059669',
    primaryLight: '#d1fae5',
    primaryDark: '#064e3b',
    bgSubtle: 'bg-emerald-50/60',
    textPrimary: 'text-emerald-700',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    accentBorder: 'border-emerald-600',
    heroGradient: 'from-emerald-950 via-emerald-900 to-slate-900',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800'
  },
  rose: {
    id: 'rose',
    nameAr: 'وردي جلدي وتجميلي (Rose)',
    nameEn: 'Clinical Rose',
    primary: '#e11d48',
    primaryLight: '#ffe4e6',
    primaryDark: '#9f1239',
    bgSubtle: 'bg-rose-50/60',
    textPrimary: 'text-rose-700',
    buttonClass: 'bg-rose-700 hover:bg-rose-800 text-white',
    accentBorder: 'border-rose-600',
    heroGradient: 'from-rose-950 via-slate-900 to-slate-950',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800'
  },
  plum: {
    id: 'plum',
    nameAr: 'بنفسجي راقٍ (Plum)',
    nameEn: 'Executive Plum',
    primary: '#7e22ce',
    primaryLight: '#f3e8ff',
    primaryDark: '#581c87',
    bgSubtle: 'bg-purple-50/60',
    textPrimary: 'text-purple-700',
    buttonClass: 'bg-purple-800 hover:bg-purple-900 text-white',
    accentBorder: 'border-purple-600',
    heroGradient: 'from-slate-950 via-purple-950 to-slate-900',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800'
  }
};

export function getTheme(color: ThemeColor = 'teal'): ThemeStyles {
  return THEME_PALETTES[color] || THEME_PALETTES.teal;
}
