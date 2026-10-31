import type { DoctorProfile } from '../types/doctor';
import type { Site } from './types';
import { defaultSettings, defaultTheme, makeSection } from './schema';
import { getTheme } from '../utils/theme';
import { digits, mix, slugify, uid } from './utils';

/** Egyptian local numbers (01xxxxxxxxx) → international (201xxxxxxxxx) for wa.me links */
function toIntl(n?: string) {
  const d = digits(n || '');
  if (!d) return '';
  if (d.startsWith('00')) return d.slice(2);
  if (d.startsWith('0') && d.length === 11) return `2${d}`;
  return d;
}
const firstSentence = (t?: string) => (t || '').split(/(?<=[.!؟?])\s+/)[0] || '';

/** Turn an existing MedFrame doctor profile into an editable Studio site. */
export function doctorToSite(d: DoctorProfile): Site {
  const pal = getTheme(d.themeColor);
  const primary = d.customStyles?.customHexPrimary || pal.primary;
  const theme = {
    ...defaultTheme(),
    primary, primaryDark: pal.primaryDark || mix(primary, '#000000', 0.28),
    accent: d.customStyles?.customHexSecondary || '#C9A227',
    ink: '#14202E', muted: '#5A6573', paper: '#F7F5F0', pageBg: '#F7F5F0', night: mix(pal.primaryDark || primary, '#000000', 0.55),
    fontDisplay: 'El Messiri', hlStyle: 'marker' as const,
  };
  const clinic = d.clinic || ({} as DoctorProfile['clinic']);
  const services = (d.services || []).filter(s => s.name);
  const hours = (clinic.workingHours || []).map(h => [h.days, h.hours].filter(Boolean).join(': ')).filter(Boolean).join(' · ');
  const photos = (d.photos || []).filter(p => p.url);
  const stats = [
    d.experienceYears ? { value: `+${d.experienceYears}`, label: 'سنة خبرة' } : null,
    d.reviewCount ? { value: `+${d.reviewCount}`, label: 'تقييم من المرضى' } : null,
    services.length ? { value: String(services.length), label: 'خدمة طبية' } : null,
  ].filter(Boolean) as { value: string; label: string }[];
  const night = theme.night;

  const sections = [
    makeSection('header', { brand: d.name, tagline: d.title || d.specialty, markIcon: 'user', ctaLabel: 'احجز كشف', ctaTarget: '#booking' }),
    makeSection('hero', {
      badge: [d.specialty, d.experienceYears ? `خبرة +${d.experienceYears} سنة` : ''].filter(Boolean).join(' · '),
      title: `${d.name}\n*${d.title || d.specialty}*`,
      lead: d.statement || firstSentence(d.bio),
      btn1Label: 'احجز كشف', btn1Target: '#booking', btn1Icon: 'calendar',
      btn2Label: clinic.address ? 'عنوان العيادة' : '', btn2Target: '#location', btn2Icon: 'pin',
      stats: stats.slice(0, 3),
      visual: d.avatarUrl ? 'image' : 'art', image: d.avatarUrl || '', imageShape: 'arch',
      artWord: d.name.replace(/^(د\.?|الدكتور|الدكتورة)\s*/, '').split(/\s+/)[0] || d.name, artSub: d.specialtyEn || d.specialty,
      chips: (d.subspecialties || []).slice(0, 2).map(s => ({ icon: 'badge', title: s, text: '' })),
      quick: [],
    }, { bgMode: 'default', decor: 'grain' }),
  ];

  if (d.bio) sections.push(makeSection('textImage', {
    kicker: 'عن الدكتور', title: `${d.title || 'خبرة'} *بتفرق*`, text: d.bio,
    checks: (d.subspecialties || []).slice(0, 5), image: photos[0]?.url || '', imageShape: 'rounded', imageSide: 'start', btnLabel: 'احجز كشف', btnTarget: '#booking',
  }));
  if (stats.length >= 2) sections.push(makeSection('stats', { columns: String(Math.min(4, stats.length)), items: stats }, { bgMode: 'solid', bgColor: night }));
  if (services.length) sections.push(makeSection('cards', {
    kicker: 'الخدمات', title: 'إيه اللي بنقدمه', lead: '', columns: services.length % 4 === 0 ? '4' : '3', showNumbers: true,
    items: services.map(s => ({ icon: 'stethoscope', title: s.name, text: s.description || '', tag: s.price ? `${s.price} ${s.currency || 'جنيه'}` : '', image: '' })),
  }, { tilt: true }, { label: 'الخدمات' }));
  if ((d.qualifications || []).length) sections.push(makeSection('steps', {
    kicker: 'المؤهلات', title: 'شهادات وخبرة *موثّقة*', lead: '', columns: String(Math.min(4, d.qualifications.length)), line: true,
    items: d.qualifications.map(q => ({ icon: q.isFellowship ? 'award' : 'badge', title: q.degree, text: [q.institution, q.year].filter(Boolean).join(' · ') })),
  }, {}, { anchor: 'qualifications', label: 'المؤهلات', inNav: true }));
  if ((d.experience || []).length) sections.push(makeSection('cards', {
    kicker: 'الخبرة', title: 'رحلة مهنية', lead: '', variant: 'numbered', columns: String(Math.min(3, d.experience.length)), showNumbers: false,
    items: d.experience.map(x => ({ icon: 'hospital', title: x.role, text: [x.hospital, x.period].filter(Boolean).join(' · '), tag: '', image: '' })),
  }, {}, { anchor: 'experience', label: 'الخبرة', inNav: false }));
  if (photos.length) sections.push(makeSection('gallery', {
    kicker: 'العيادة', title: 'من جوه العيادة', columns: photos.length >= 3 ? '3' : String(photos.length),
    items: photos.map(p => ({ image: p.url, caption: p.title || '' })),
  }));
  sections.push(makeSection('booking', {
    intro: `السلام عليكم، عايز أحجز مع ${d.name}.`, selectLabel: services.length ? 'الخدمة' : 'نوع الزيارة',
    selectOptions: services.length ? services.map(s => s.name) : ['كشف جديد', 'إعادة', 'استشارة'],
  }));
  sections.push(makeSection('location', {
    title: clinic.name || 'العيادة', address: [clinic.address, clinic.city].filter(Boolean).join('، ') || 'اكتب العنوان',
    hours, mapQuery: [clinic.address, clinic.city].filter(Boolean).join(' '), mapLink: clinic.googleMapsUrl || '', embed: true,
  }));
  if ((d.faqs || []).length) sections.push(makeSection('faq', { items: d.faqs.map(f => ({ q: f.question, a: f.answer })) }));
  sections.push(makeSection('footer', { brand: d.name, text: d.title || d.specialty, copyright: `© ${new Date().getFullYear()} ${d.name}` }, { bgColor: night }));

  const now = new Date().toISOString();
  return {
    id: uid('site'), name: d.name, slug: d.slug || slugify(d.name), kind: 'doctor', theme,
    settings: {
      ...defaultSettings(),
      whatsapp: toIntl(clinic.whatsapp || clinic.phone), phone: clinic.phone || clinic.whatsapp || '',
      metaTitle: d.seo?.metaTitle || `${d.name} — ${d.specialty}`, metaDescription: d.seo?.metaDescription || firstSentence(d.bio),
    },
    sections, createdAt: now, updatedAt: now,
  };
}
