import React from 'react';
import {
  Stethoscope, HeartPulse, Baby, Bone, Brain, Eye, Smile, Pill, Syringe, Microscope, FlaskConical, TestTube,
  Droplet, Activity, Ambulance, Hospital, ShieldCheck, Clock, CalendarCheck, CalendarClock, Home, FileText,
  MessageCircle, Phone, MapPin, Navigation, Star, Award, Sparkles, Users, UserRound, Heart, Leaf, Sun,
  Thermometer, Scan, Dna, Ear, Hand, Wallet, BadgeCheck, Zap, Search, Check, Building2, Car, Wifi, Accessibility,
} from 'lucide-react';

export const ICONS: Record<string, { c: React.ComponentType<any>; label: string }> = {
  stethoscope: { c: Stethoscope, label: 'سماعة' },
  heart: { c: HeartPulse, label: 'قلب' },
  baby: { c: Baby, label: 'أطفال' },
  bone: { c: Bone, label: 'عظام' },
  brain: { c: Brain, label: 'مخ وأعصاب' },
  eye: { c: Eye, label: 'عيون' },
  smile: { c: Smile, label: 'أسنان / ابتسامة' },
  ear: { c: Ear, label: 'أنف وأذن' },
  pill: { c: Pill, label: 'دواء' },
  syringe: { c: Syringe, label: 'حقنة' },
  microscope: { c: Microscope, label: 'ميكروسكوب' },
  flask: { c: FlaskConical, label: 'معمل' },
  tube: { c: TestTube, label: 'أنبوبة' },
  drop: { c: Droplet, label: 'نقطة دم' },
  dna: { c: Dna, label: 'DNA' },
  activity: { c: Activity, label: 'نبض' },
  thermometer: { c: Thermometer, label: 'حرارة' },
  scan: { c: Scan, label: 'أشعة' },
  ambulance: { c: Ambulance, label: 'إسعاف' },
  hospital: { c: Hospital, label: 'مستشفى' },
  building: { c: Building2, label: 'مبنى' },
  shield: { c: ShieldCheck, label: 'أمان' },
  badge: { c: BadgeCheck, label: 'اعتماد' },
  award: { c: Award, label: 'جائزة' },
  star: { c: Star, label: 'نجمة' },
  sparkles: { c: Sparkles, label: 'تجميل' },
  hand: { c: Hand, label: 'رعاية' },
  leaf: { c: Leaf, label: 'تغذية' },
  sun: { c: Sun, label: 'جلدية' },
  clock: { c: Clock, label: 'مواعيد' },
  calendar: { c: CalendarCheck, label: 'حجز' },
  calendarClock: { c: CalendarClock, label: 'ميعاد' },
  home: { c: Home, label: 'منزلي' },
  file: { c: FileText, label: 'نتيجة' },
  chat: { c: MessageCircle, label: 'واتساب' },
  phone: { c: Phone, label: 'تليفون' },
  pin: { c: MapPin, label: 'عنوان' },
  nav: { c: Navigation, label: 'اتجاهات' },
  users: { c: Users, label: 'فريق' },
  user: { c: UserRound, label: 'دكتور' },
  love: { c: Heart, label: 'اهتمام' },
  wallet: { c: Wallet, label: 'أسعار' },
  zap: { c: Zap, label: 'سرعة' },
  search: { c: Search, label: 'بحث' },
  check: { c: Check, label: 'صح' },
  car: { c: Car, label: 'جراج' },
  wifi: { c: Wifi, label: 'واي فاي' },
  access: { c: Accessibility, label: 'ذوي الهمم' },
};

export function Icon({ name, className = '', size }: { name?: string; className?: string; size?: number }) {
  const I = (name && ICONS[name]?.c) || Stethoscope;
  return <I className={className} width={size} height={size} aria-hidden="true" strokeWidth={1.8} />;
}

export function WhatsAppGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.4 11.4 0 0 1-4.5-4c-.3-.5-1-1.5-1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5-.3.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2a7 7 0 0 0 2.2 1.3c.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.4.2.5.3 0 .1 0 .6-.3 1.2z" />
    </svg>
  );
}
