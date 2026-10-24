import React, { useState, useEffect } from 'react';
import { DoctorProfile, PatientTestimonial, DoctorPhoto, SectionBgStyle } from '../../types/doctor';
import { getTheme } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import '@fontsource-variable/alexandria';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import { AppointmentModal } from './AppointmentModal';
import { AddReviewModal } from './AddReviewModal';
import { Reveal, CornerFrame, PlusField, PulseLine, SectionHead, ArchPortrait, QuoteMark, ChatGlyph, fmtIndex } from './site/Ornaments';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Share2,
  Check,
  Globe,
  Plus,
  Minus,
  Lock,
  ArrowUpLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X as CloseIcon,
  Navigation,
  BadgeCheck
} from 'lucide-react';

interface DoctorWebsiteViewProps {
  doctor: DoctorProfile;
  isPreviewMode?: boolean;
  onEditDoctor?: () => void;
  onBackToDashboard?: () => void;
  onUpdateDoctor?: (updated: DoctorProfile) => void;
  onOpenAdminLogin?: () => void;
}

/* Section surface, honouring the builder's per-section style choice. */
const tone = (style: SectionBgStyle | undefined, fallback: SectionBgStyle): { cls: string; dark: boolean } => {
  switch (style || fallback) {
    case 'dark': return { cls: 'bg-[var(--night)] text-white', dark: true };
    case 'tinted': return { cls: 'bg-[color-mix(in_srgb,var(--accent)_6%,var(--paper))]', dark: false };
    case 'subtle': return { cls: 'bg-[var(--paper-2)]', dark: false };
    case 'white': return { cls: 'bg-white', dark: false };
    case 'glass': return { cls: 'bg-white/60', dark: false };
    default: return { cls: 'bg-[var(--paper)]', dark: false };
  }
};

const countryFromPhone = (phone?: string) => {
  const p = (phone || '').replace(/[^0-9+]/g, '');
  if (p.startsWith('+20') || p.startsWith('0020') || /^01[0125]/.test(p)) return 'EG';
  if (p.startsWith('+966')) return 'SA';
  if (p.startsWith('+971')) return 'AE';
  if (p.startsWith('+965')) return 'KW';
  return undefined;
};

export const DoctorWebsiteView: React.FC<DoctorWebsiteViewProps> = ({
  doctor,
  isPreviewMode = false,
  onEditDoctor,
  onBackToDashboard,
  onUpdateDoctor,
  onOpenAdminLogin
}) => {
  const { isAdmin } = useAuth();
  const theme = getTheme(doctor?.themeColor || 'teal');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isEn = lang === 'en';
  const t = (ar: string, en: string) => (isEn ? en : ar);
  const pick = (ar?: string, en?: string) => (isEn ? (en || ar || '') : (ar || ''));

  const faqs = doctor?.faqs || [];
  const articles = doctor?.articles || [];
  const services = doctor?.services || [];
  const qualifications = doctor?.qualifications || [];
  const experience = doctor?.experience || [];
  const photos = doctor?.photos || [];
  const clinic = doctor?.clinic || { name: '', city: '', address: '', phone: '', whatsapp: '', workingHours: [] };
  const subspecialties = (isEn && doctor.subspecialtiesEn?.length ? doctor.subspecialtiesEn : doctor.subspecialties) || [];

  const [activeFaq, setActiveFaq] = useState<string | null>(faqs[0]?.id || null);
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDoctorPhotoZoomed, setIsDoctorPhotoZoomed] = useState(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<DoctorPhoto | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [scrolled, setScrolled] = useState(false);
  const [testimonials, setTestimonials] = useState<PatientTestimonial[]>(doctor?.testimonials || []);

  useEffect(() => { setTestimonials(doctor?.testimonials || []); }, [doctor?.testimonials]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const photoCategories = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All' },
    { id: 'clinic', nameAr: 'العيادة', nameEn: 'Clinic' },
    { id: 'equipment', nameAr: 'الأجهزة', nameEn: 'Technology' },
    { id: 'certificates', nameAr: 'الشهادات', nameEn: 'Certificates' },
    { id: 'cases', nameAr: 'حالات', nameEn: 'Cases' },
    { id: 'general', nameAr: 'عام', nameEn: 'General' },
  ];
  const getCategoryLabel = (cat?: string) => {
    const match = photoCategories.find(c => c.id === cat);
    return match ? (isEn ? match.nameEn : match.nameAr) : t('طبي', 'Medical');
  };
  const filteredPhotos = photos.filter(p => p && p.url && (galleryFilter === 'all' || p.category === galleryFilter));
  const availableCategories = photoCategories.filter(cat => cat.id === 'all' || photos.some(p => p.category === cat.id));

  /* ---------- SEO / OpenGraph / Schema.org ---------- */
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = isEn
      ? (doctor.seo?.metaTitleEn || `${doctor.nameEn || doctor.name} | ${doctor.titleEn || doctor.title}`)
      : (doctor.seo?.metaTitle || `${doctor.name} | ${doctor.title}`);
    document.title = pageTitle;
    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, key); document.head.appendChild(meta); }
      meta.setAttribute('content', content);
    };
    const metaDesc = isEn ? (doctor.seo?.metaDescriptionEn || doctor.bioEn || doctor.bio) : (doctor.seo?.metaDescription || doctor.bio);
    if (metaDesc) { setMetaTag('name', 'description', metaDesc); setMetaTag('property', 'og:description', metaDesc); setMetaTag('name', 'twitter:description', metaDesc); }
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    const shareImage = doctor.seo?.ogImage || doctor.avatarUrl;
    if (shareImage) { setMetaTag('property', 'og:image', shareImage); setMetaTag('name', 'twitter:image', shareImage); }
    if (doctor.seo?.keywords?.length) setMetaTag('name', 'keywords', doctor.seo.keywords.join(', '));

    const scriptId = 'doctor-seo-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (doctor.seo?.structuredDataEnabled !== false) {
      if (!scriptTag) { scriptTag = document.createElement('script'); scriptTag.id = scriptId; scriptTag.type = 'application/ld+json'; document.head.appendChild(scriptTag); }
      scriptTag.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: doctor.name,
        alternateName: doctor.nameEn || undefined,
        image: shareImage || undefined,
        description: doctor.bio,
        medicalSpecialty: doctor.specialty,
        telephone: doctor.clinic?.phone,
        address: { '@type': 'PostalAddress', streetAddress: doctor.clinic?.address, addressLocality: doctor.clinic?.city, addressCountry: countryFromPhone(doctor.clinic?.phone) }
      });
    }
    return () => { document.title = originalTitle; document.getElementById(scriptId)?.remove(); };
  }, [doctor, isEn]);

  const config = doctor.sectionsConfig || { hero: true, about: true, qualifications: true, experience: true, services: true, clinic: true, articles: true, faqs: true, testimonials: true, contact: true };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/doctor/${doctor.slug}`;
    navigator.clipboard.writeText(shareUrl).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); });
  };

  const handleAddPatientReview = (newRev: PatientTestimonial) => {
    const updatedReviews = [newRev, ...testimonials];
    setTestimonials(updatedReviews);
    onUpdateDoctor?.({ ...doctor, testimonials: updatedReviews, reviewCount: (doctor.reviewCount || 0) + 1 });
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ---------- styling inputs from the builder ---------- */
  const styles = doctor.customStyles || {};
  const accent = styles.customHexPrimary || theme.primary;
  const accentDark = styles.customHexSecondary || theme.primaryDark;
  const cssVars = {
    '--accent': accent,
    '--accent-dark': accentDark,
    '--accent-soft': theme.primaryLight,
  } as React.CSSProperties;

  const pageBgOverride: React.CSSProperties = {
    ...(styles.pageBgColor ? { background: styles.pageBgColor } : {}),
    ...(styles.pageBgImage ? { backgroundImage: `url(${styles.pageBgImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' } : {})
  };

  const heroT = tone(styles.heroBg, 'default');
  const aboutT = tone(styles.aboutBg, 'default');
  const qualT = tone(styles.qualificationsBg, 'subtle');
  const servT = tone(styles.servicesBg, 'default');
  const clinicT = tone(styles.clinicBg, 'default');
  const galleryT = tone(styles.galleryBg, 'default');
  const testiT = tone(styles.testimonialsBg, 'tinted');
  const artT = tone(styles.articlesBg, 'default');
  const faqT = tone(styles.faqsBg, 'subtle');

  const portraitHeights: Record<string, string> = {
    md: 'h-[380px] sm:h-[440px]', lg: 'h-[420px] sm:h-[500px]', xl: 'h-[440px] sm:h-[540px]',
    '2xl': 'h-[460px] sm:h-[580px]', '3xl': 'h-[480px] sm:h-[620px]', full: 'h-[500px] sm:h-[660px]'
  };
  const portraitH = portraitHeights[doctor.avatarSize || '2xl'] || portraitHeights['2xl'];

  const waNumber = (clinic.whatsapp || '').replace(/[^0-9]/g, '');
  const telNumber = (clinic.phone || '').replace(/[^0-9+]/g, '');
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(isEn ? `Hello, I would like to book an appointment with ${doctor.nameEn || doctor.name}.` : `السلام عليكم، حابب أحجز ميعاد مع ${doctor.name}.`)}` : '';
  const Arrow = isEn ? ArrowUpRight : ArrowUpLeft;
  const hasReviews = (doctor.reviewCount || 0) > 0 && (doctor.rating || 0) > 0;

  /* navigation anchors (only for sections that exist) */
  const navItems = [
    config.about && { id: 'about', label: t('نبذة', 'About') },
    config.services && services.length > 0 && { id: 'services', label: t('الخدمات', 'Services') },
    config.clinic && { id: 'clinic-schedule', label: t('العيادة', 'Clinic') },
    config.testimonials && testimonials.length > 0 && { id: 'reviews', label: t('آراء المرضى', 'Reviews') },
    config.faqs && faqs.length > 0 && { id: 'faq', label: t('أسئلة', 'FAQ') },
  ].filter(Boolean) as { id: string; label: string }[];

  let sectionIndex = 0;
  const nextIndex = () => ++sectionIndex;

  const btnPrimary = 'inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--ink)] px-7 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[var(--accent-dark)] hover:shadow-[0_12px_30px_-12px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] cursor-pointer';
  const btnGhost = 'inline-flex items-center justify-center gap-2.5 rounded-full border border-[var(--line-strong)] px-6 py-[15px] text-[15px] font-semibold text-[var(--ink)] transition-colors duration-300 hover:border-[var(--ink)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] cursor-pointer';

  return (
    <div className="mf-site relative min-h-screen overflow-x-clip" style={{ ...cssVars, ...pageBgOverride }} dir={isEn ? 'ltr' : 'rtl'} lang={isEn ? 'en' : 'ar'}>

      {styles.pageBgPattern === 'dots' && <div className="pointer-events-none fixed inset-0 z-0 opacity-25" style={{ backgroundImage: 'radial-gradient(var(--line-strong) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />}
      {styles.pageBgPattern === 'grid' && <div className="pointer-events-none fixed inset-0 z-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />}

      {/* ===== Admin-only bars (unchanged behaviour) ===== */}
      {isAdmin && isPreviewMode && (
        <aside aria-label="Admin Preview Toolbar" className="sticky top-0 z-50 flex items-center justify-between bg-[var(--night)] px-4 py-2.5 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-semibold">{t('وضع المعاينة الحية لصفحة الطبيب', 'Live Doctor Website Preview')}</span>
            <span className="hidden text-white/50 sm:inline">({doctor.status === 'published' ? t('منشور متاح للعامة', 'Published Online') : t('مسودة خاصة', 'Private Draft')})</span>
          </div>
          <div className="flex items-center gap-2">
            {onEditDoctor && <button onClick={onEditDoctor} className="cursor-pointer rounded-lg bg-white/10 px-3 py-1 font-medium hover:bg-white/20">{t('العودة للمحرر', 'Return to Builder')}</button>}
            {onBackToDashboard && <button onClick={onBackToDashboard} className="cursor-pointer rounded-lg px-3 py-1 text-white/70 hover:bg-white/10">{t('لوحة التحكم', 'Dashboard')}</button>}
          </div>
        </aside>
      )}
      {isAdmin && !isPreviewMode && doctor.status === 'draft' && (
        <aside aria-label="Draft Notice" className="flex flex-wrap items-center justify-between gap-2 bg-amber-300 px-4 py-2.5 text-xs font-semibold text-slate-950">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0" />
            <span>هذا الموقع محفوظ حالياً كـ (مسودة خاصة Draft) ولا يمكن لعامة الزوار تصفحه حتى تقوم بنشره.</span>
          </div>
          {onUpdateDoctor && (
            <button onClick={() => onUpdateDoctor({ ...doctor, status: 'published', updatedAt: new Date().toISOString() })} className="cursor-pointer rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black">
              نشر الموقع أونلاين للعامة الآن
            </button>
          )}
        </aside>
      )}

      {/* ===== Header ===== */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}>
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex min-w-0 items-center gap-3 text-start cursor-pointer">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <CornerFrame inset={0} size={10} />
              <span className="font-display text-[15px] font-semibold text-[var(--accent-dark)]">
                {(pick(doctor.name, doctor.nameEn).replace(/^(د\.?|الدكتور|الدكتورة|Dr\.?)\s+/i, '').trim()[0]) || '+'}
              </span>
            </span>
            <span className="min-w-0">
              <span className="font-display block truncate text-[15px] font-semibold leading-tight text-[var(--ink)]">{pick(doctor.name, doctor.nameEn)}</span>
              <span className="block truncate text-[12.5px] text-[var(--muted)]">{pick(doctor.specialty, doctor.specialtyEn)}</span>
            </span>
          </button>

          <nav aria-label={t('أقسام الصفحة', 'Page sections')} className="hidden items-center gap-7 text-[14px] text-[var(--ink-2)] lg:flex">
            {navItems.map(n => (
              <button key={n.id} type="button" onClick={() => scrollTo(n.id)} className="mf-link cursor-pointer pb-0.5 hover:text-[var(--ink)]">{n.label}</button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => setLang(isEn ? 'ar' : 'en')} className="flex h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[var(--ink-2)] hover:bg-black/5 cursor-pointer" aria-label={t('Switch to English', 'التبديل إلى العربية')}>
              <Globe className="h-4 w-4" />
              <span>{isEn ? 'عربي' : 'EN'}</span>
            </button>
            <button onClick={handleCopyLink} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-black/5 cursor-pointer" aria-label={t('نسخ رابط الموقع', 'Copy link')} title={t('نسخ رابط الموقع', 'Copy link')}>
              {linkCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsBookingModalOpen(true)} className="hidden h-11 items-center rounded-full bg-[var(--ink)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] sm:flex cursor-pointer">
              {t('احجز موعد', 'Book a visit')}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      {config.hero && (
        <section className={`mf-grain relative -mt-[72px] overflow-hidden pt-[72px] ${heroT.cls}`} aria-label={t('التعريف بالطبيب', 'Introduction')}>
          <PlusField className="inset-0" opacity={heroT.dark ? 0.25 : 0.7} />
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10%] h-[620px] w-[620px] rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 22%, transparent), transparent)' }} />

          <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-20">
            <div className="lg:col-span-7">
              <Reveal>
                <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] ${heroT.dark ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                  <span className="inline-flex items-center gap-2 font-medium text-[var(--accent-dark)]">
                    <BadgeCheck className="h-[18px] w-[18px]" />
                    {pick(doctor.heroBadgeText, doctor.heroBadgeTextEn) || t('طبيب مرخّص', 'Licensed physician')}
                  </span>
                  {(clinic.city || clinic.cityEn) && <><span className="h-1 w-1 rounded-full bg-current opacity-40" /><span>{pick(clinic.city, clinic.cityEn)}</span></>}
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className={`font-display mt-6 text-[44px] font-semibold leading-[1.15] sm:text-[60px] lg:text-[72px] ${heroT.dark ? 'text-white' : 'text-[var(--ink)]'}`}>
                  {pick(doctor.name, doctor.nameEn)}
                </h1>
              </Reveal>
              <Reveal delay={0.14}>
                <p dir="auto" className={`mt-5 max-w-[34ch] text-[19px] leading-[1.7] sm:text-[21px] ${heroT.dark ? 'text-white/80' : 'text-[var(--ink-2)]'}`}>
                  {pick(doctor.title, doctor.titleEn)}
                </p>
              </Reveal>

              {subspecialties.length > 0 && (
                <Reveal delay={0.2}>
                  <ul className="mt-7 flex flex-wrap gap-2" aria-label={t('التخصصات الدقيقة', 'Subspecialties')}>
                    {subspecialties.map((s, i) => (
                      <li key={i} dir="auto" className={`rounded-full border px-4 py-1.5 text-[13.5px] ${heroT.dark ? 'border-white/20 text-white/80' : 'border-[var(--line-strong)] text-[var(--ink-2)]'}`}>{s}</li>
                    ))}
                  </ul>
                </Reveal>
              )}

              <Reveal delay={0.26}>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <button onClick={() => setIsBookingModalOpen(true)} className={btnPrimary}>
                    {t('احجز استشارتك', 'Book a consultation')}
                    <Arrow className="h-4 w-4" />
                  </button>
                  {waHref ? (
                    <a href={waHref} target="_blank" rel="noreferrer" className={`${btnGhost} ${heroT.dark ? 'border-white/30 text-white hover:bg-white/10 hover:border-white' : ''}`}>
                      <ChatGlyph className="h-[18px] w-[18px]" />
                      {t('تواصل على واتساب', 'Message on WhatsApp')}
                    </a>
                  ) : (
                    <button onClick={() => scrollTo('clinic-schedule')} className={btnGhost}>
                      <Clock className="h-4 w-4" />{t('المواعيد والعنوان', 'Hours & location')}
                    </button>
                  )}
                </div>
              </Reveal>

              {/* facts: only what the doctor entered */}
              <Reveal delay={0.32}>
                <dl className={`mt-12 grid max-w-xl grid-cols-2 gap-6 border-t pt-7 sm:grid-cols-3 ${heroT.dark ? 'border-white/15' : 'border-[var(--line)]'}`}>
                  {doctor.experienceYears > 0 && (
                    <div>
                      <dt className={`text-[13px] ${heroT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{t('سنوات الخبرة', 'Years of practice')}</dt>
                      <dd className="font-display mt-1 text-[30px] font-semibold tabular-nums">{doctor.experienceYears}<span className="text-[var(--accent)]">+</span></dd>
                    </div>
                  )}
                  {hasReviews && (
                    <div>
                      <dt className={`text-[13px] ${heroT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{t(`من ${doctor.reviewCount} تقييم`, `From ${doctor.reviewCount} reviews`)}</dt>
                      <dd className="font-display mt-1 flex items-center gap-1.5 text-[30px] font-semibold tabular-nums">
                        {doctor.rating.toFixed(1)}<Star className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
                      </dd>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="col-span-2 sm:col-span-1">
                      <dt className={`text-[13px] ${heroT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{t('رقم الترخيص', 'License no.')}</dt>
                      <dd className="mt-2 font-mono text-[15px] tracking-tight" dir="ltr">{doctor.licenseNumber}</dd>
                    </div>
                  )}
                </dl>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.1} className="relative mx-auto max-w-[420px] lg:ms-auto lg:me-0">
                <ArchPortrait name={pick(doctor.name, doctor.nameEn)} avatarUrl={doctor.avatarUrl} isEn={isEn} onOpen={() => setIsDoctorPhotoZoomed(true)} heightClass={portraitH} />
                {/* floating clinic note */}
                {(clinic.workingHours?.length > 0 || clinic.name) && (
                  <div className="absolute -bottom-8 start-[-12px] z-10 w-[min(290px,80%)] rounded-2xl border border-[var(--line)] bg-white/95 p-4 text-[var(--ink)] shadow-[0_24px_60px_-28px_rgba(16,24,40,.45)] backdrop-blur sm:start-[-40px]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-dark)]"><MapPin className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold">{pick(clinic.name, clinic.nameEn)}</p>
                        {clinic.workingHours?.[0] && (
                          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                            {pick(clinic.workingHours[0].days, clinic.workingHours[0].daysEn)} · <span className="tabular-nums">{pick(clinic.workingHours[0].hours, clinic.workingHours[0].hoursEn)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ===== Statement (pull quote) ===== */}
      {(doctor.statement || doctor.statementEn) && (
        <section className="relative bg-[var(--night)] text-white" aria-label={t('رسالة الطبيب', "Doctor's statement")}>
          <div className="mx-auto max-w-[1000px] px-5 py-20 text-center sm:px-8 sm:py-24">
            <Reveal>
              <QuoteMark className="mx-auto h-10 w-12 text-[var(--accent)]" />
              <blockquote className="font-display mt-8 text-[24px] font-light leading-[1.75] sm:text-[32px]">
                {pick(doctor.statement, doctor.statementEn)}
              </blockquote>
              <p className="mt-8 text-[14px] text-white/60">— {pick(doctor.name, doctor.nameEn)}</p>
            </Reveal>
          </div>
          <PulseLine className="absolute inset-x-0 bottom-0 h-10 w-full opacity-60" />
        </section>
      )}

      {/* ===== About ===== */}
      {config.about && (
        <section id="about" className={`scroll-mt-20 ${aboutT.cls}`}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead index={nextIndex()} isEn={isEn} dark={aboutT.dark} kicker={t('نبذة', 'About')} title={isEn ? `Meet ${doctor.nameEn || doctor.name}` : `تعرّف على ${doctor.name}`} />
            <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <p className={`whitespace-pre-line text-[18px] leading-[2] sm:text-[19px] ${aboutT.dark ? 'text-white/80' : 'text-[var(--ink-2)]'}`}>{pick(doctor.bio, doctor.bioEn)}</p>
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-5">
                <dl className={`divide-y rounded-[24px] border p-2 ${aboutT.dark ? 'divide-white/10 border-white/15' : 'divide-[var(--line)] border-[var(--line)] bg-white/70'}`}>
                  {[
                    { k: t('التخصص', 'Specialty'), v: pick(doctor.specialty, doctor.specialtyEn) },
                    { k: t('العيادة', 'Clinic'), v: pick(clinic.name, clinic.nameEn) },
                    { k: t('المدينة', 'City'), v: pick(clinic.city, clinic.cityEn) },
                    { k: t('سنوات الخبرة', 'Experience'), v: doctor.experienceYears ? (isEn ? `${doctor.experienceYears} years` : `${doctor.experienceYears} سنة`) : '' },
                  ].filter(r => r.v).map((r, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-6 px-5 py-4">
                      <dt className={`text-[14px] ${aboutT.dark ? 'text-white/55' : 'text-[var(--muted)]'}`}>{r.k}</dt>
                      <dd className="text-end text-[15px] font-semibold">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ===== Credentials ===== */}
      {((config.qualifications && qualifications.length > 0) || (config.experience && experience.length > 0)) && (
        <section className={qualT.cls}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead index={nextIndex()} isEn={isEn} dark={qualT.dark} kicker={t('المؤهلات والخبرة', 'Credentials')} title={t('تعليم وخبرة تقدر تثق فيها', 'Training and experience you can trust')} />
            <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
              {config.qualifications && qualifications.length > 0 && (
                <div>
                  <h3 className={`text-[15px] font-semibold ${qualT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{t('المؤهلات والزمالات', 'Qualifications & fellowships')}</h3>
                  <ol className={`relative mt-8 space-y-10 border-s ps-8 ${qualT.dark ? 'border-white/15' : 'border-[var(--line-strong)]'}`}>
                    {qualifications.map((q, i) => (
                      <Reveal as="li" key={q.id} delay={i * 0.06} className="relative">
                        <span aria-hidden="true" className="absolute -start-[37px] top-2 h-[9px] w-[9px] rounded-full border-2 border-[var(--accent)] bg-[var(--paper)]" />
                        <p className="font-mono text-[13px] tabular-nums text-[var(--accent-dark)]">{q.year}</p>
                        <h4 className="mt-1.5 text-[17px] font-semibold leading-[1.6]">{pick(q.degree, q.degreeEn)}</h4>
                        <p className={`mt-1 text-[15px] ${qualT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{pick(q.institution, q.institutionEn)}</p>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              )}
              {config.experience && experience.length > 0 && (
                <div>
                  <h3 className={`text-[15px] font-semibold ${qualT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{t('الخبرة المهنية', 'Clinical experience')}</h3>
                  <ol className={`relative mt-8 space-y-10 border-s ps-8 ${qualT.dark ? 'border-white/15' : 'border-[var(--line-strong)]'}`}>
                    {experience.map((e, i) => (
                      <Reveal as="li" key={e.id} delay={i * 0.06} className="relative">
                        <span aria-hidden="true" className="absolute -start-[37px] top-2 h-[9px] w-[9px] rounded-full bg-[var(--accent)]" />
                        <p className="font-mono text-[13px] tabular-nums text-[var(--accent-dark)]">{pick(e.period, e.periodEn)}</p>
                        <h4 className="mt-1.5 text-[17px] font-semibold leading-[1.6]">{pick(e.role, e.roleEn)}</h4>
                        <p className={`mt-1 text-[15px] ${qualT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{pick(e.hospital, e.hospitalEn)}</p>
                        {(e.description || e.descriptionEn) && <p className={`mt-3 text-[15px] leading-[1.85] ${qualT.dark ? 'text-white/70' : 'text-[var(--ink-2)]'}`}>{pick(e.description, e.descriptionEn)}</p>}
                      </Reveal>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== Services (editorial index) ===== */}
      {config.services && services.length > 0 && (
        <section id="services" className={`scroll-mt-20 ${servT.cls}`}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead
              index={nextIndex()} isEn={isEn} dark={servT.dark}
              kicker={t('الخدمات', 'Services')}
              title={t('الكشف والإجراءات', 'Consultations & procedures')}
              aside={<Reveal><button onClick={() => setIsBookingModalOpen(true)} className={servT.dark ? `${btnGhost} border-white/30 text-white hover:bg-white/10` : btnGhost}>{t('احجز خدمة', 'Book a service')}<Arrow className="h-4 w-4" /></button></Reveal>}
            />
            <ul className={`mt-14 border-t ${servT.dark ? 'border-white/15' : 'border-[var(--line-strong)]'}`}>
              {services.map((svc, i) => (
                <Reveal as="li" key={svc.id} delay={Math.min(i, 6) * 0.04}>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className={`group grid w-full grid-cols-[auto_1fr] items-start gap-x-6 gap-y-3 border-b py-8 text-start transition-colors duration-300 sm:grid-cols-[64px_1fr_auto] sm:items-center cursor-pointer ${servT.dark ? 'border-white/15 hover:bg-white/[.03]' : 'border-[var(--line)] hover:bg-white/60'}`}
                  >
                    <span className="font-display pt-1 text-[15px] tabular-nums text-[var(--accent)] sm:pt-0 sm:ps-2">{fmtIndex(i + 1, isEn)}</span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-display text-[21px] font-semibold leading-[1.5] sm:text-[24px]">{pick(svc.name, svc.nameEn)}</span>
                        {(svc.category || svc.categoryEn) && <span className={`text-[13px] ${servT.dark ? 'text-white/50' : 'text-[var(--muted)]'}`}>{pick(svc.category, svc.categoryEn)}</span>}
                      </span>
                      <span className={`mt-2 block max-w-[62ch] text-[15.5px] leading-[1.85] ${servT.dark ? 'text-white/70' : 'text-[var(--muted)]'}`}>{pick(svc.description, svc.descriptionEn)}</span>
                    </span>
                    <span className="col-start-2 flex items-center gap-5 text-[14px] sm:col-start-3 sm:pe-2">
                      {svc.durationMinutes ? <span className={`tabular-nums ${servT.dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{svc.durationMinutes} {t('دقيقة', 'min')}</span> : null}
                      {svc.price ? <span className="font-semibold tabular-nums">{svc.price.toLocaleString('en-US')} {isEn ? (svc.currency && /[a-z]/i.test(svc.currency) ? svc.currency : 'EGP') : (svc.currency || 'جنيه')}</span> : null}
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white ${servT.dark ? 'border-white/25' : 'border-[var(--line-strong)]'}`}>
                        <Arrow className="h-4 w-4" />
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ===== Clinic & hours ===== */}
      {config.clinic && (
        <section id="clinic-schedule" className={`scroll-mt-20 ${clinicT.cls}`}>
          <div className={`mx-auto max-w-[1200px] px-5 pb-24 sm:px-8 sm:pb-32 ${config.services && services.length > 0 && clinicT.cls === servT.cls ? 'pt-4 sm:pt-8' : 'pt-24 sm:pt-32'}`}>
            <SectionHead index={nextIndex()} isEn={isEn} dark={clinicT.dark} kicker={t('العيادة', 'The clinic')} title={pick(clinic.name, clinic.nameEn) || t('العيادة', 'The clinic')} />
            <Reveal className="mt-14">
              <div className="relative overflow-hidden rounded-[32px] bg-[var(--night)] text-white">
                <PlusField className="inset-0" opacity={0.18} />
                <div className="relative grid grid-cols-1 lg:grid-cols-12">
                  <div className="p-8 sm:p-12 lg:col-span-5">
                    <p className="text-[14px] text-white/55">{t('العنوان', 'Address')}</p>
                    <p className="mt-3 text-[19px] leading-[1.8]">
                      {pick(clinic.address, clinic.addressEn)}{(clinic.address || clinic.addressEn) && (clinic.city || clinic.cityEn) ? '، ' : ''}{pick(clinic.city, clinic.cityEn)}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      {telNumber && (
                        <a href={`tel:${telNumber}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)]">
                          <Phone className="h-4 w-4" /><span dir="ltr" className="tabular-nums">{clinic.phone}</span>
                        </a>
                      )}
                      {waHref && (
                        <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-semibold transition-colors hover:bg-white/10">
                          <ChatGlyph className="h-[18px] w-[18px]" />{t('واتساب', 'WhatsApp')}
                        </a>
                      )}
                      {clinic.googleMapsUrl && (
                        <a href={clinic.googleMapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-semibold transition-colors hover:bg-white/10">
                          <Navigation className="h-4 w-4" />{t('الاتجاهات', 'Directions')}
                        </a>
                      )}
                    </div>
                    {clinic.emergencyPhone && (
                      <p className="mt-8 text-[14px] text-white/60">{t('للطوارئ', 'Emergencies')}: <a href={`tel:${clinic.emergencyPhone.replace(/[^0-9+]/g, '')}`} dir="ltr" className="mf-link tabular-nums text-white">{clinic.emergencyPhone}</a></p>
                    )}
                  </div>
                  <div className="border-t border-white/10 p-8 sm:p-12 lg:col-span-7 lg:border-s lg:border-t-0">
                    <p className="flex items-center gap-2 text-[14px] text-white/55"><Clock className="h-4 w-4" />{t('مواعيد العيادة', 'Opening hours')}</p>
                    <ul className="mt-4 divide-y divide-white/10">
                      {clinic.workingHours?.map((wh, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-6 py-4 text-[16px]">
                          <span className="font-medium">{pick(wh.days, wh.daysEn)}</span>
                          <span className="tabular-nums text-white/75">{pick(wh.hours, wh.hoursEn)}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => setIsBookingModalOpen(true)} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-6 text-[15px] font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer">
                      {t('احجز موعدك', 'Book your visit')}<Arrow className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===== Gallery ===== */}
      {config.gallery !== false && photos.length > 0 && (
        <section id="clinic-gallery" className={galleryT.cls}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead
              index={nextIndex()} isEn={isEn} dark={galleryT.dark}
              kicker={t('جولة مصوّرة', 'A look inside')}
              title={t('من داخل العيادة', 'Inside the clinic')}
              aside={availableCategories.length > 1 ? (
                <div role="tablist" aria-label={t('تصنيف الصور', 'Filter photos')} className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => (
                    <button key={cat.id} role="tab" aria-selected={galleryFilter === cat.id} onClick={() => setGalleryFilter(cat.id)}
                      className={`h-10 rounded-full px-4 text-[14px] transition-colors cursor-pointer ${galleryFilter === cat.id ? 'bg-[var(--ink)] text-white' : 'border border-[var(--line-strong)] text-[var(--ink-2)] hover:border-[var(--ink)]'}`}>
                      {isEn ? cat.nameEn : cat.nameAr}
                    </button>
                  ))}
                </div>
              ) : undefined}
            />
            <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 sm:auto-rows-[260px] lg:grid-cols-4">
              {filteredPhotos.map((photo, i) => (
                <button key={photo.id || i} type="button" onClick={() => setSelectedGalleryPhoto(photo)}
                  className={`group relative overflow-hidden rounded-[22px] bg-[var(--paper-2)] text-start cursor-zoom-in ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img src={photo.url} alt={pick(photo.title, photo.titleEn) || t('صورة من العيادة', 'Clinic photo')} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-12 text-white opacity-90">
                    <span className="block text-[12px] text-white/70">{getCategoryLabel(photo.category)}</span>
                    <span className="block truncate text-[15px] font-semibold">{pick(photo.title, photo.titleEn)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Testimonials ===== */}
      {config.testimonials && (
        <section id="reviews" className={`scroll-mt-20 ${testiT.cls}`}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead
              index={nextIndex()} isEn={isEn} dark={testiT.dark}
              kicker={t('آراء المرضى', 'Patient voices')}
              title={t('بيقولوا إيه بعد الزيارة', 'What patients say')}
              lead={hasReviews ? (isEn ? `Rated ${doctor.rating.toFixed(1)} out of 5 across ${doctor.reviewCount} reviews.` : `تقييم ${doctor.rating.toFixed(1)} من 5 في ${doctor.reviewCount} تقييم.`) : undefined}
              aside={<Reveal><button onClick={() => setIsAddReviewModalOpen(true)} className={btnGhost}><Plus className="h-4 w-4" />{t('اكتب تقييمك', 'Write a review')}</button></Reveal>}
            />
            {testimonials.length > 0 ? (
              <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
                {testimonials.map((r, i) => (
                  <Reveal key={r.id} delay={Math.min(i, 4) * 0.06}>
                    <figure className={`flex h-full flex-col rounded-[26px] border p-8 sm:p-10 ${testiT.dark ? 'border-white/10 bg-white/[.04]' : 'border-[var(--line)] bg-white'}`}>
                      <div className="flex items-center justify-between">
                        <QuoteMark className="h-7 w-9 text-[var(--accent)] opacity-80" />
                        <span className="flex items-center gap-0.5" aria-label={isEn ? `${r.rating} out of 5` : `${r.rating} من 5`}>
                          {[...Array(5)].map((_, s) => <Star key={s} aria-hidden="true" className={`h-4 w-4 ${s < Math.round(Number(r.rating) || 5) ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--line-strong)]'}`} />)}
                        </span>
                      </div>
                      <blockquote className="mt-6 flex-1 text-[17px] leading-[1.95]">{pick(r.comment, r.commentEn)}</blockquote>
                      <figcaption className={`mt-8 flex items-center justify-between gap-4 border-t pt-5 text-[14px] ${testiT.dark ? 'border-white/10' : 'border-[var(--line)]'}`}>
                        <span className="font-semibold">{pick(r.patientName, r.patientNameEn)}</span>
                        <span className={testiT.dark ? 'text-white/55' : 'text-[var(--muted)]'}>{pick(r.treatmentType, r.treatmentTypeEn) || r.date}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="mt-12 text-[16px] text-[var(--muted)]">{t('لسه مفيش تقييمات. كن أول من يكتب تجربته.', 'No reviews yet. Be the first to share your experience.')}</p>
            )}
          </div>
        </section>
      )}

      {/* ===== Articles ===== */}
      {config.articles && articles.length > 0 && (
        <section className={artT.cls}>
          <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
            <SectionHead index={nextIndex()} isEn={isEn} dark={artT.dark} kicker={t('مقالات', 'Articles')} title={t('من مكتب الطبيب', "From the doctor's desk")} />
            <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
              {articles.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 4) * 0.06}>
                  <button type="button" onClick={() => setSelectedArticle(a)} className={`group block w-full border-t py-8 text-start cursor-pointer ${artT.dark ? 'border-white/15' : 'border-[var(--line-strong)]'}`}>
                    <span className={`flex items-center gap-3 text-[13px] ${artT.dark ? 'text-white/55' : 'text-[var(--muted)]'}`}>
                      <span className="text-[var(--accent-dark)]">{pick(a.category, a.categoryEn)}</span>
                      <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                      <span>{isEn ? `${a.readTimeMinutes} min read` : `${a.readTimeMinutes} دقايق قراءة`}</span>
                    </span>
                    <span className="font-display mt-3 block text-[22px] font-semibold leading-[1.55] group-hover:text-[var(--accent-dark)] transition-colors">{pick(a.title, a.titleEn)}</span>
                    <span className={`mt-3 block text-[15.5px] leading-[1.85] ${artT.dark ? 'text-white/70' : 'text-[var(--muted)]'}`}>{pick(a.excerpt, a.excerptEn)}</span>
                    <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold"><span className="mf-link">{t('اقرأ المقال', 'Read article')}</span><Arrow className="h-4 w-4" /></span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {config.faqs && faqs.length > 0 && (
        <section id="faq" className={`scroll-mt-20 ${faqT.cls}`}>
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead index={nextIndex()} isEn={isEn} dark={faqT.dark} kicker={t('أسئلة شائعة', 'FAQ')} title={t('قبل ما تيجي', 'Before your visit')} />
            </div>
            <div className="lg:col-span-8">
              <ul className={`border-t ${faqT.dark ? 'border-white/15' : 'border-[var(--line-strong)]'}`}>
                {faqs.map((faq) => {
                  const open = activeFaq === faq.id;
                  return (
                    <li key={faq.id} className={`border-b ${faqT.dark ? 'border-white/15' : 'border-[var(--line)]'}`}>
                      <h3>
                        <button type="button" aria-expanded={open} aria-controls={`faq-${faq.id}`} onClick={() => setActiveFaq(open ? null : faq.id)} className="flex w-full items-center justify-between gap-6 py-6 text-start cursor-pointer">
                          <span className="text-[18px] font-semibold leading-[1.6]">{pick(faq.question, faq.questionEn)}</span>
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${open ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : faqT.dark ? 'border-white/25' : 'border-[var(--line-strong)]'}`}>
                            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </span>
                        </button>
                      </h3>
                      <div id={`faq-${faq.id}`} hidden={!open} className={`max-w-[65ch] pb-7 text-[16px] leading-[1.95] ${faqT.dark ? 'text-white/75' : 'text-[var(--ink-2)]'}`}>
                        {pick(faq.answer, faq.answerEn)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ===== Closing CTA + footer ===== */}
      {config.contact && (
        <footer className="relative overflow-hidden bg-[var(--night)] text-white">
          <PulseLine className="absolute inset-x-0 top-10 h-16 w-full opacity-40" />
          <div className="relative mx-auto max-w-[1200px] px-5 pb-28 pt-28 sm:px-8 sm:pb-12">
            <Reveal className="max-w-3xl">
              <p className="text-[14px] text-white/55">{pick(clinic.name, clinic.nameEn)}</p>
              <h2 className="font-display mt-4 text-[36px] font-semibold leading-[1.3] sm:text-[56px]">{t('خطوتك الجاية؟ ميعاد واحد.', 'Your next step is one appointment.')}</h2>
              <div className="mt-10 flex flex-wrap gap-3">
                <button onClick={() => setIsBookingModalOpen(true)} className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)] cursor-pointer">
                  {t('احجز استشارتك', 'Book a consultation')}<Arrow className="h-4 w-4" />
                </button>
                {telNumber && (
                  <a href={`tel:${telNumber}`} className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-[15px] text-[15px] font-semibold transition-colors hover:bg-white/10">
                    <Phone className="h-4 w-4" />{t('اتصل بالعيادة', 'Call the clinic')}
                  </a>
                )}
              </div>
            </Reveal>

            <div className="mt-24 flex flex-col gap-6 border-t border-white/10 pt-8 text-[13.5px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-white/80">{pick(doctor.name, doctor.nameEn)}</span>
                <span>{pick(clinic.address, clinic.addressEn)}{(clinic.city || clinic.cityEn) ? ` · ${pick(clinic.city, clinic.cityEn)}` : ''}</span>
                {doctor.licenseNumber && <span>{t('رقم الترخيص', 'License no.')} <span dir="ltr" className="font-mono">{doctor.licenseNumber}</span> · © {new Date().getFullYear()}</span>}
              </div>
              <div className="flex items-center gap-4">
                {!isAdmin && onOpenAdminLogin && (
                  <button onClick={onOpenAdminLogin} className="flex h-11 items-center gap-1.5 hover:text-white cursor-pointer" aria-label={t('دخول الإدارة', 'Admin login')}>
                    <Lock className="h-3.5 w-3.5" /><span>{t('دخول المشرف', 'Admin')}</span>
                  </button>
                )}
                <span>{t('تصميم وتطوير', 'Crafted by')} <span className="font-semibold text-white/80">MedFrame Studio</span></span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* ===== Doctor photo lightbox ===== */}
      {isDoctorPhotoZoomed && (
        <div role="dialog" aria-modal="true" aria-label={pick(doctor.name, doctor.nameEn)} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,14,24,.88)] p-4 backdrop-blur-md" onClick={() => setIsDoctorPhotoZoomed(false)}>
          <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-white" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsDoctorPhotoZoomed(false)} className="absolute end-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black cursor-pointer" aria-label={t('إغلاق', 'Close')}><CloseIcon className="h-5 w-5" /></button>
            <div className="h-[70vh] max-h-[640px]">
              <ArchPortrait name={pick(doctor.name, doctor.nameEn)} avatarUrl={doctor.avatarUrl} isEn={isEn} heightClass="h-full" />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display text-[17px] font-semibold text-[var(--ink)]">{pick(doctor.name, doctor.nameEn)}</p>
                <p className="text-[14px] text-[var(--muted)]">{pick(doctor.title, doctor.titleEn)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Gallery lightbox ===== */}
      {selectedGalleryPhoto && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,14,24,.9)] p-4 backdrop-blur-md" onClick={() => setSelectedGalleryPhoto(null)}>
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedGalleryPhoto(null)} className="absolute end-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black cursor-pointer" aria-label={t('إغلاق', 'Close')}><CloseIcon className="h-5 w-5" /></button>
            {filteredPhotos.length > 1 && (
              <>
                <button onClick={() => { const c = filteredPhotos.findIndex(p => p.id === selectedGalleryPhoto.id); setSelectedGalleryPhoto(filteredPhotos[(c - 1 + filteredPhotos.length) % filteredPhotos.length]); }} className="absolute start-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black cursor-pointer" aria-label={t('السابق', 'Previous')}>{isEn ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}</button>
                <button onClick={() => { const c = filteredPhotos.findIndex(p => p.id === selectedGalleryPhoto.id); setSelectedGalleryPhoto(filteredPhotos[(c + 1) % filteredPhotos.length]); }} className="absolute end-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black cursor-pointer" aria-label={t('التالي', 'Next')}>{isEn ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button>
              </>
            )}
            <img src={selectedGalleryPhoto.url} alt={pick(selectedGalleryPhoto.title, selectedGalleryPhoto.titleEn)} className="mx-auto max-h-[78vh] w-auto rounded-[22px] object-contain" />
            <div className="mt-4 text-center text-white">
              <p className="text-[16px] font-semibold">{pick(selectedGalleryPhoto.title, selectedGalleryPhoto.titleEn)}</p>
              {(selectedGalleryPhoto.caption || selectedGalleryPhoto.captionEn) && <p className="mx-auto mt-1 max-w-2xl text-[14px] text-white/70">{pick(selectedGalleryPhoto.caption, selectedGalleryPhoto.captionEn)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===== Article reader ===== */}
      {selectedArticle && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,14,24,.6)] p-4 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}>
          <article className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[var(--paper)] p-8 sm:p-12" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-[var(--accent-dark)]">{pick(selectedArticle.category, selectedArticle.categoryEn)}</span>
              <button onClick={() => setSelectedArticle(null)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 cursor-pointer" aria-label={t('إغلاق المقال', 'Close article')}><CloseIcon className="h-5 w-5" /></button>
            </div>
            <h2 className="font-display mt-4 text-[28px] font-semibold leading-[1.45] text-[var(--ink)]">{pick(selectedArticle.title, selectedArticle.titleEn)}</h2>
            <p className="mt-3 text-[14px] text-[var(--muted)]">{isEn ? `By ${doctor.nameEn || doctor.name}` : `بقلم ${doctor.name}`} · {selectedArticle.publishedDate}</p>
            <div className="mt-8 whitespace-pre-line text-[17px] leading-[2] text-[var(--ink-2)]">{pick(selectedArticle.content, selectedArticle.contentEn)}</div>
          </article>
        </div>
      )}

      <AppointmentModal doctor={doctor} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      <AddReviewModal isOpen={isAddReviewModalOpen} onClose={() => setIsAddReviewModalOpen(false)} doctorName={pick(doctor.name, doctor.nameEn)} themeColor={doctor.themeColor} onAddReview={handleAddPatientReview} />

      {/* ===== Mobile action bar ===== */}
      <aside aria-label={t('إجراءات سريعة', 'Quick actions')} className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:hidden">
        {waHref && (
          <a href={waHref} target="_blank" rel="noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] text-[15px] font-semibold text-[var(--ink)]">
            <ChatGlyph className="h-[18px] w-[18px]" />{t('واتساب', 'WhatsApp')}
          </a>
        )}
        <button onClick={() => setIsBookingModalOpen(true)} className="flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--ink)] text-[15px] font-semibold text-white cursor-pointer">
          {t('احجز موعد', 'Book a visit')}
        </button>
      </aside>
    </div>
  );
};
