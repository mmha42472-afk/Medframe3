/* ------------------------------------------------------------------
   MedFrame Site Studio — data model
   A site is an ordered list of sections. Every section has
   `content` (what it says) and `style` (how it looks and moves),
   so each block can be resized, recoloured, made transparent,
   animated or given a 3D layer independently.
   ------------------------------------------------------------------ */

export type SiteKind = 'polyclinic' | 'lab' | 'doctor' | 'blank';

export type SectionType =
  | 'header'
  | 'hero'
  | 'marquee'
  | 'cards'
  | 'highlight'
  | 'textImage'
  | 'stats'
  | 'steps'
  | 'team'
  | 'tests'
  | 'packages'
  | 'gallery'
  | 'cta'
  | 'booking'
  | 'location'
  | 'faq'
  | 'footer';

export type BgMode = 'default' | 'solid' | 'gradient' | 'image' | 'transparent' | 'glass';
export type AnimName = 'none' | 'fade-up' | 'fade' | 'zoom' | 'slide' | 'blur' | 'flip';
export type DecorName = 'none' | 'dots' | 'grid' | 'glow' | 'aurora' | 'rings' | 'grain' | 'waves';
export type Bg3D = 'none' | 'dna' | 'orbs' | 'cells' | 'particles';

export interface SectionStyle {
  bgMode: BgMode;
  bgColor: string;
  bgColor2: string;
  bgAngle: number;
  bgOpacity: number;      // 0–100, applies to solid / gradient / glass
  bgImage: string;
  bgOverlay: number;      // 0–90, dark veil over a background image
  bgFixed: boolean;       // parallax-like fixed background image
  tone: 'auto' | 'light' | 'dark'; // text colour: auto picks from background
  titleScale: number;     // 0.6 – 1.8
  textScale: number;      // 0.8 – 1.4
  pad: 'none' | 's' | 'm' | 'l' | 'xl';
  width: 'narrow' | 'normal' | 'wide' | 'full';
  align: 'start' | 'center';
  decor: DecorName;
  anim: AnimName;
  stagger: boolean;
  speed: 'fast' | 'normal' | 'slow';
  tilt: boolean;          // 3D tilt on cards
  float: boolean;         // gentle floating on decorative elements
  bg3d: Bg3D;             // WebGL layer behind the content
  bg3dOpacity: number;    // 0–100
  radius: 'theme' | 'none' | 's' | 'm' | 'l' | 'xl';
  hideMobile: boolean;
  hideDesktop: boolean;
}

export interface Section {
  id: string;
  type: SectionType;
  anchor: string;         // used for in-page links (#anchor)
  label: string;          // name shown in the editor + nav
  visible: boolean;
  inNav: boolean;
  content: Record<string, any>;
  style: SectionStyle;
}

export interface SiteTheme {
  primary: string;
  primaryDark: string;
  accent: string;
  ink: string;
  muted: string;
  paper: string;
  card: string;
  night: string;
  fontDisplay: string;
  fontBody: string;
  radius: number;         // px
  hlStyle: 'color' | 'gradient' | 'marker'; // how *highlighted* words look
  baseSize: number;       // px, body text
  pageBgMode: 'solid' | 'gradient' | 'image';
  pageBg: string;
  pageBg2: string;
  pageBgImage: string;
}

export interface SiteSettings {
  whatsapp: string;       // digits only, international (e.g. 201127298983)
  phone: string;          // display form
  floatingWhatsapp: boolean;
  mobileBar: boolean;
  mobileBarSecondaryLabel: string;
  mobileBarSecondaryHref: string;
  demoRibbon: boolean;
  demoRibbonText: string;
  lang: 'ar' | 'en';
  metaTitle: string;
  metaDescription: string;
  noindex: boolean;
}

export interface Site {
  id: string;
  name: string;
  slug: string;
  kind: SiteKind;
  theme: SiteTheme;
  settings: SiteSettings;
  sections: Section[];
  publish?: { slug: string; url: string; at: string };
  sourceDoctorId?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Inspector field schema ---------- */
export type FieldDef =
  | { key: string; label: string; type: 'text' | 'textarea' | 'url' | 'color'; placeholder?: string; help?: string; rows?: number }
  | { key: string; label: string; type: 'toggle'; help?: string }
  | { key: string; label: string; type: 'number'; min?: number; max?: number; step?: number }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'icon' }
  | { key: string; label: string; type: 'image'; help?: string }
  | { key: string; label: string; type: 'images'; help?: string }
  | { key: string; label: string; type: 'lines'; placeholder?: string; help?: string }
  | { key: string; label: string; type: 'list'; itemLabel: string; titleKey: string; fields: FieldDef[]; newItem: () => Record<string, any> };
