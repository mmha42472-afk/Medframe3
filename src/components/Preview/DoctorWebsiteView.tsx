import React, { useState, useEffect } from 'react';
import { DoctorProfile, PatientTestimonial, DoctorPhoto } from '../../types/doctor';
import { getTheme, getSectionBgClasses } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { MedicalHeroIcon } from '../Common/MedicalHeroIcon';
import { AppointmentModal } from './AppointmentModal';
import { AddReviewModal } from './AddReviewModal';
import { 
  Medical3DDNA, 
  Medical3DHeartPulse, 
  Medical3DShield, 
  FloatingMedicalParticles 
} from '../Common/Medical3DVectors';
import { 
  Award, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Star, 
  ChevronDown, 
  Share2, 
  CheckCircle, 
  Building2, 
  FileText, 
  HeartHandshake, 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  HelpCircle, 
  ExternalLink, 
  Check, 
  Stethoscope,
  Globe,
  Plus,
  Sparkles,
  Lock,
  Maximize2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X as CloseIcon,
  ZoomIn
} from 'lucide-react';

interface DoctorWebsiteViewProps {
  doctor: DoctorProfile;
  isPreviewMode?: boolean;
  onEditDoctor?: () => void;
  onBackToDashboard?: () => void;
  onUpdateDoctor?: (updated: DoctorProfile) => void;
  onOpenAdminLogin?: () => void;
}

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
  const faqs = doctor?.faqs || [];
  const articles = doctor?.articles || [];
  const services = doctor?.services || [];
  const qualifications = doctor?.qualifications || [];
  const experience = doctor?.experience || [];
  const photos = doctor?.photos || [];
  const clinic = doctor?.clinic || {
    name: 'العيادة الطبية',
    city: 'الرياض',
    address: '',
    phone: '',
    whatsapp: '',
    workingHours: []
  };

  const [activeFaq, setActiveFaq] = useState<string | null>(faqs[0]?.id || null);
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Doctor photo zoom lightbox state
  const [isDoctorPhotoZoomed, setIsDoctorPhotoZoomed] = useState(false);

  // Gallery photo lightbox and category filter
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<DoctorPhoto | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');

  // Photo gallery categories & filters
  const photoCategories = [
    { id: 'all', nameAr: 'كل الصور', nameEn: 'All Photos' },
    { id: 'clinic', nameAr: 'صور العيادة والاستقبال', nameEn: 'Clinic & Rooms' },
    { id: 'equipment', nameAr: 'الأجهزة والتقنيات', nameEn: 'Medical Tech' },
    { id: 'certificates', nameAr: 'الشهادات والاعتماد', nameEn: 'Certificates' },
    { id: 'cases', nameAr: 'حالات طبية وسريرية', nameEn: 'Clinical Cases' },
    { id: 'general', nameAr: 'صور عامة', nameEn: 'General' },
  ];

  const getCategoryLabel = (cat?: string, isEnglish = false) => {
    const match = photoCategories.find(c => c.id === cat);
    if (!match) return isEnglish ? 'Medical' : 'طبي';
    return isEnglish ? match.nameEn : match.nameAr;
  };

  const filteredPhotos = (photos || []).filter(p => {
    if (!p || !p.url) return false;
    if (galleryFilter === 'all') return true;
    return p.category === galleryFilter;
  });

  // Calculate unique categories present in doctor's photos
  const availableCategories = photoCategories.filter(cat => {
    if (cat.id === 'all') return true;
    return (photos || []).some(p => p.category === cat.id);
  });

  // Local testimonials state for immediate review addition
  const [testimonials, setTestimonials] = useState<PatientTestimonial[]>(doctor?.testimonials || []);

  const isEn = lang === 'en';

  // Dynamic SEO & OpenGraph & Schema.org injection
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = isEn
      ? (doctor.seo?.metaTitleEn || `${doctor.nameEn || doctor.name} | Medical Clinic`)
      : (doctor.seo?.metaTitle || `${doctor.name} | ${doctor.title}`);
    document.title = pageTitle;

    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const metaDesc = isEn 
      ? (doctor.seo?.metaDescriptionEn || doctor.bioEn || doctor.bio)
      : (doctor.seo?.metaDescription || doctor.bio);
    if (metaDesc) {
      setMetaTag('name', 'description', metaDesc);
      setMetaTag('property', 'og:description', metaDesc);
      setMetaTag('name', 'twitter:description', metaDesc);
    }

    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    const shareImage = doctor.seo?.ogImage || doctor.avatarUrl;
    if (shareImage) {
      setMetaTag('property', 'og:image', shareImage);
      setMetaTag('name', 'twitter:image', shareImage);
    }

    if (doctor.seo?.keywords && doctor.seo.keywords.length > 0) {
      setMetaTag('name', 'keywords', doctor.seo.keywords.join(', '));
    }

    // Schema.org Physician JSON-LD
    const scriptId = 'doctor-seo-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (doctor.seo?.structuredDataEnabled !== false) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Physician',
        'name': doctor.name,
        'alternateName': doctor.nameEn || undefined,
        'image': shareImage || undefined,
        'description': doctor.bio,
        'medicalSpecialty': doctor.specialty,
        'telephone': doctor.clinic?.phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': doctor.clinic?.address,
          'addressLocality': doctor.clinic?.city,
          'addressCountry': 'SA'
        }
      });
    }

    return () => {
      document.title = originalTitle;
      const jsonLd = document.getElementById(scriptId);
      if (jsonLd) jsonLd.remove();
    };
  }, [doctor, isEn]);

  const config = doctor.sectionsConfig || {
    hero: true,
    about: true,
    qualifications: true,
    experience: true,
    services: true,
    clinic: true,
    articles: true,
    faqs: true,
    testimonials: true,
    contact: true
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/doctor/${doctor.slug}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const handleAddPatientReview = (newRev: PatientTestimonial) => {
    const updatedReviews = [newRev, ...testimonials];
    setTestimonials(updatedReviews);
    if (onUpdateDoctor) {
      onUpdateDoctor({
        ...doctor,
        testimonials: updatedReviews,
        reviewCount: (doctor.reviewCount || 0) + 1
      });
    }
  };

  // Section style classes
  const styles = doctor.customStyles || {};
  const heroStyle = getSectionBgClasses(styles.heroBg, doctor.themeColor);
  const aboutStyle = getSectionBgClasses(styles.aboutBg, doctor.themeColor);
  const servicesStyle = getSectionBgClasses(styles.servicesBg, doctor.themeColor);
  const qualificationsStyle = getSectionBgClasses(styles.qualificationsBg, doctor.themeColor);
  const clinicStyle = getSectionBgClasses(styles.clinicBg, doctor.themeColor);
  const galleryStyle = getSectionBgClasses(styles.galleryBg, doctor.themeColor);
  const articlesStyle = getSectionBgClasses(styles.articlesBg, doctor.themeColor);
  const faqsStyle = getSectionBgClasses(styles.faqsBg, doctor.themeColor);
  const testimonialsStyle = getSectionBgClasses(styles.testimonialsBg, doctor.themeColor);

  // Dynamic avatar size mapping for hero portrait
  const avatarSize = doctor.avatarSize || '2xl';
  const avatarSizes: Record<string, { container: string; height: string; avatarProp: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' }> = {
    md: { container: 'max-w-xs', height: 'h-64 sm:h-72', avatarProp: 'xl' },
    lg: { container: 'max-w-sm', height: 'h-72 sm:h-80', avatarProp: '2xl' },
    xl: { container: 'max-w-md', height: 'h-80 sm:h-96', avatarProp: '2xl' },
    '2xl': { container: 'max-w-lg', height: 'h-96 sm:h-[440px]', avatarProp: '3xl' },
    '3xl': { container: 'max-w-xl', height: 'h-[440px] sm:h-[540px]', avatarProp: '3xl' },
    full: { container: 'max-w-2xl', height: 'h-[500px] sm:h-[620px]', avatarProp: 'full' }
  };
  const activeAvatarSize = avatarSizes[avatarSize] || avatarSizes['2xl'];

  // Overall Page Background styling
  const pageBgThemeClasses: Record<string, string> = {
    default: 'bg-slate-50 text-slate-900',
    white: 'bg-white text-slate-900',
    slate: 'bg-slate-100 text-slate-900',
    cream: 'bg-stone-50 text-stone-900',
    cool: 'bg-sky-50/50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100'
  };
  const pageBgClass = styles.pageBgTheme && pageBgThemeClasses[styles.pageBgTheme]
    ? pageBgThemeClasses[styles.pageBgTheme]
    : 'bg-slate-50 text-slate-900';

  const customPageBgStyle: React.CSSProperties = {
    ...(styles.pageBgColor ? { backgroundColor: styles.pageBgColor } : {}),
    ...(styles.pageBgImage ? { backgroundImage: `url(${styles.pageBgImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' } : {})
  };

  return (
    <div 
      className={`min-h-screen ${pageBgClass} selection:bg-teal-500 selection:text-white relative overflow-x-hidden`}
      style={customPageBgStyle}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      
      {/* Background Pattern Overlay if configured */}
      {styles.pageBgPattern === 'dots' && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-25 z-0"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      )}
      {styles.pageBgPattern === 'grid' && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      )}
      
      {/* Admin Preview Toolbar ONLY if user is logged in as Admin */}
      {isAdmin && isPreviewMode && (
        <aside aria-label="Admin Preview Toolbar" className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold">{isEn ? 'Live Doctor Website Preview' : 'وضع المعاينة الحية لصفحة الطبيب'}</span>
            <span className="text-slate-400 hidden sm:inline">
              ({doctor.status === 'published' ? (isEn ? 'Published Online' : 'منشور متاح للعامة') : (isEn ? 'Private Draft' : 'مسودة خاصة')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onEditDoctor && (
              <button
                onClick={onEditDoctor}
                className="px-3 py-1 bg-teal-800 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? 'Return to Builder' : 'العودة للمحرر'}
              </button>
            )}
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? 'Dashboard' : 'لوحة التحكم'}
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Draft Notification Banner ONLY for Admin */}
      {isAdmin && !isPreviewMode && doctor.status === 'draft' && (
        <aside aria-label="Draft Notice" className="bg-amber-400 text-slate-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-slate-900" />
            <span>هذا الموقع محفوظ حالياً كـ (مسودة خاصة Draft) ولا يمكن لعامة الزوار تصفحه حتى تقوم بنشره.</span>
          </div>
          {onUpdateDoctor && (
            <button
              onClick={() => onUpdateDoctor({ ...doctor, status: 'published', updatedAt: new Date().toISOString() })}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              نشر الموقع أونلاين للعامة الآن
            </button>
          )}
        </aside>
      )}

      {/* Website Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Clinic Brand */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ background: theme.primary }}
            >
              <MedicalHeroIcon iconId={doctor.heroIcon || 'stethoscope'} className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base block leading-tight">
                {isEn ? (doctor.nameEn || doctor.name) : doctor.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs block">
                {isEn ? (doctor.clinic.nameEn || doctor.clinic.name) : doctor.clinic.name}
              </span>
            </div>
          </div>

          {/* Quick Actions & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Bilingual Switcher */}
            <button
              onClick={() => setLang(isEn ? 'ar' : 'en')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>{isEn ? 'العربية' : 'English'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="نسخ رابط الموقع للمشاركة"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">{isEn ? 'Copied' : 'تم النسخ'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{isEn ? 'Share' : 'مشاركة الرابط'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${theme.buttonClass}`}
            >
              {isEn ? 'Book Appointment' : 'حجز موعد'}
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section with 3D DNA Vector and Particle Aura */}
      {config.hero && (
        <section className={`relative overflow-hidden border-b border-slate-200/80 pt-10 pb-12 lg:pt-16 lg:pb-20 ${heroStyle.sectionBg}`}>
          <FloatingMedicalParticles />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Doctor Details */}
              <div className="lg:col-span-7 space-y-5 text-right">
                
                {/* Accreditation & License Kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-teal-800">
                    <MedicalHeroIcon iconId={doctor.heroIcon || 'shield'} className="w-4 h-4 text-teal-700" />
                    <span>
                      {isEn 
                        ? (doctor.heroBadgeTextEn || (doctor.heroBadgeText ? doctor.heroBadgeText : 'Officially Licensed & Certified')) 
                        : (doctor.heroBadgeText || 'مرخص ومعتمد رسمياً')}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{isEn ? 'License No:' : 'رقم التسجيل:'} {doctor.licenseNumber}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{isEn ? (doctor.clinic.cityEn || doctor.clinic.city) : doctor.clinic.city}</span>
                </div>

                {/* Main Headline */}
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {isEn ? (doctor.nameEn || doctor.name) : doctor.name}
                  </h1>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-700 mt-2">
                    {isEn ? (doctor.titleEn || doctor.title) : doctor.title}
                  </h2>
                </div>

                {/* Subspecialties unboxed text */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {isEn ? (doctor.specialtyEn || doctor.specialty) : doctor.specialty}
                  </span>
                  {(isEn && doctor.subspecialtiesEn ? doctor.subspecialtiesEn : doctor.subspecialties)?.map((sub, i) => (
                    <React.Fragment key={i}>
                      <span aria-hidden="true" className="text-slate-300">/</span>
                      <span>{sub}</span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Personal Statement / Doctor's Mission */}
                {(doctor.statement || doctor.statementEn) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed relative">
                    <p className="italic font-medium">
                      "{isEn ? (doctor.statementEn || doctor.statement) : doctor.statement}"
                    </p>
                  </div>
                )}

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className={`px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${theme.buttonClass}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{isEn ? 'Book Consultation' : 'حجز موعد استشارة'}</span>
                  </button>

                  {/* Smooth Scroll to Clinic Hours without breaking URL */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('clinic-schedule');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{isEn ? 'Clinic & Hours' : 'ساعات العمل والعيادة'}</span>
                  </button>
                </div>

              </div>

              {/* Doctor Portrait Card with 3D DNA Vector Backdrop and Enlargeable Avatar */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
                
                {/* 3D DNA Floating Vector in background */}
                <div className="absolute -top-12 -left-8 w-32 h-64 opacity-40 pointer-events-none hidden sm:block">
                  <Medical3DDNA themeColor={doctor.themeColor} />
                </div>

                <div className={`relative w-full ${activeAvatarSize.container} z-10 transition-all duration-300`}>
                  <div className="relative bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xl group">
                    
                    {/* Enlarge / Zoom Button on Avatar */}
                    <button
                      type="button"
                      onClick={() => setIsDoctorPhotoZoomed(true)}
                      className="absolute top-6 left-6 z-20 px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-md backdrop-blur-xs transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold border border-slate-200/80 cursor-pointer"
                      title={isEn ? 'Enlarge Doctor Photo' : 'تكبير صورة الطبيب'}
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-teal-800" />
                      <span>{isEn ? 'Zoom' : 'تكبير الصورة'}</span>
                    </button>

                    <div 
                      onClick={() => setIsDoctorPhotoZoomed(true)} 
                      className="cursor-pointer"
                      title={isEn ? 'Click to enlarge doctor photo' : 'انقر لتكبير صورة الطبيب بالحجم الكامل'}
                    >
                      <DoctorAvatar
                        name={doctor.name}
                        avatarUrl={doctor.avatarUrl}
                        themeColor={doctor.themeColor}
                        size={activeAvatarSize.avatarProp}
                        className={`w-full ${activeAvatarSize.height} rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]`}
                      />
                    </div>

                    {/* Quick Badge Under Avatar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">{doctor.rating.toFixed(2)}</span>
                        <span className="text-slate-600 font-normal">
                          ({doctor.reviewCount} {isEn ? 'verified reviews' : 'تقييم موثق'})
                        </span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        {isEn ? `${doctor.experienceYears} Years Experience` : `خبرة ${doctor.experienceYears} عاماً`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Full-width KPI Proof strip below Hero */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {doctor.experienceYears}+
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{isEn ? 'Years Clinical Experience' : 'سنوات خبرة سريرية متخصصة'}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  %{Math.round(doctor.rating * 20)}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{isEn ? 'Patient Satisfaction Rate' : 'نسبة رضا المرضى والمراجعين'}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {doctor.qualifications?.length || 3}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{isEn ? 'Board Certifications' : 'بورد وزمالات طبية دولية'}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {doctor.services?.length || 4}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{isEn ? 'Specialized Procedures' : 'خدمات وإجراءات تخصصية'}</p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* About & Biography */}
      {config.about && (
        <section className={`py-14 border-b border-slate-200/80 ${aboutStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {isEn ? 'About the Doctor' : 'نبذة عن الطبيب'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {isEn ? `The Medical Journey of ${doctor.nameEn || doctor.name}` : `المسيرة الطبية لـ ${doctor.name}`}
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {isEn ? (doctor.bioEn || doctor.bio) : doctor.bio}
                </div>
              </div>

              {/* 3D Heart Pulse / Card Info */}
              <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <Medical3DHeartPulse themeColor={doctor.themeColor} className="h-28" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{isEn ? 'Specialty' : 'التخصص الدقيق'}:</span>
                    <span className="font-bold text-slate-900">{isEn ? (doctor.specialtyEn || doctor.specialty) : doctor.specialty}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{isEn ? 'License' : 'ترخيص الهيئة'}:</span>
                    <span className="font-mono text-slate-900">{doctor.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{isEn ? 'Clinic' : 'المركز الطبي'}:</span>
                    <span className="font-bold text-slate-900">{isEn ? (doctor.clinic.nameEn || doctor.clinic.name) : doctor.clinic.name}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Qualifications & Experience */}
      {(config.qualifications || config.experience) && (
        <section className={`py-14 border-b border-slate-200/80 ${qualificationsStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Qualifications */}
              {config.qualifications && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Award className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {isEn ? 'Qualifications & Fellowships' : 'المؤهلات والزمالات الطبية'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {doctor.qualifications?.map((q) => (
                      <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {isEn ? (q.degreeEn || q.degree) : q.degree}
                          </h4>
                          <span className="font-mono text-slate-500">{q.year}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {isEn ? (q.institutionEn || q.institution) : q.institution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {config.experience && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Building2 className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {isEn ? 'Professional Experience' : 'الخبرات والمناصب السريرية'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {doctor.experience?.map((exp) => (
                      <div key={exp.id} className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {isEn ? (exp.roleEn || exp.role) : exp.role}
                          </h4>
                          <span className="font-mono text-slate-500">
                            {isEn ? (exp.periodEn || exp.period) : exp.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {isEn ? (exp.hospitalEn || exp.hospital) : exp.hospital}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {isEn ? (exp.descriptionEn || exp.description) : exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Medical Services */}
      {config.services && (
        <section className={`py-14 border-b border-slate-200/80 ${servicesStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {isEn ? 'Clinical Services' : 'الخدمات الطبية'}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isEn ? 'Procedures & Specialized Care' : 'الفحوصات والإجراءات التخصصية'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctor.services?.map((svc) => (
                <div 
                  key={svc.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-700/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800">
                        {isEn ? (svc.categoryEn || svc.category || 'Clinical') : (svc.category || 'عام')}
                      </span>
                      {svc.price && (
                        <span className="text-xs font-bold text-slate-900">
                          {svc.price} {isEn ? (svc.currency || 'EGP') : (svc.currency || 'جنيه')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {isEn ? (svc.nameEn || svc.name) : svc.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isEn ? (svc.descriptionEn || svc.description) : svc.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {svc.durationMinutes ? `${svc.durationMinutes} ${isEn ? 'mins' : 'دقيقة'}` : ''}
                    </span>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="text-teal-800 hover:text-teal-900 font-bold"
                    >
                      {isEn ? 'Book Now →' : 'طلب حجز ←'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinic & Schedule */}
      {config.clinic && (
        <section id="clinic-schedule" className={`py-14 border-b border-slate-200/80 ${clinicStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Clinic Info */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {isEn ? 'Clinic Location' : 'موقع العيادة'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  {isEn ? (doctor.clinic.nameEn || doctor.clinic.name) : doctor.clinic.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
                  <span>
                    {isEn ? (doctor.clinic.addressEn || doctor.clinic.address) : doctor.clinic.address}، {isEn ? (doctor.clinic.cityEn || doctor.clinic.city) : doctor.clinic.city}
                  </span>
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={`tel:${doctor.clinic.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-700" />
                    <span>{doctor.clinic.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${doctor.clinic.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>

              {/* Working Hours Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-800" />
                  <span>{isEn ? 'Working Hours & Schedule' : 'جدول مواعيد العيادة والاستشارات'}</span>
                </h4>

                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {doctor.clinic.workingHours?.map((wh, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {isEn ? (wh.daysEn || wh.days) : wh.days}
                      </span>
                      <span className="font-mono text-slate-600">
                        {isEn ? (wh.hoursEn || wh.hours) : wh.hours}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{isEn ? '* Advance booking is recommended.' : '* يُفضل الحجز المسبق لتجنب أوقات الانتظار.'}</span>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="text-teal-800 hover:text-teal-900 font-bold"
                  >
                    {isEn ? 'Book Appointment →' : 'حجز موعد الآن ←'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      {config.gallery !== false && photos.length > 0 && (
        <section id="clinic-gallery" className={`py-14 border-b border-slate-200/80 ${galleryStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {isEn ? 'Visual Tour' : 'جولة مصورة بالعيادة'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {isEn ? 'Clinic & Case Gallery' : 'معرض صور العيادة والتجهيزات الطبية'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn ? 'Explore our modern facilities, medical technology, and clinic ambiance' : 'شاهد غرف الكشف، أحدث الأجهزة والتقنيات الطبية المعتمدة، وشهادات التقدير'}
                </p>
              </div>

              {/* Gallery Filter Tabs */}
              {availableCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5 p-1 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
                  {availableCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setGalleryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        galleryFilter === cat.id
                          ? 'bg-teal-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {isEn ? cat.nameEn : cat.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPhotos.map((photo, pIdx) => (
                <div
                  key={photo.id || pIdx}
                  onClick={() => setSelectedGalleryPhoto(photo)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-teal-700/60 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                    <img
                      src={photo.url}
                      alt={photo.title || 'صورة العيادة'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <ZoomIn className="w-4 h-4" />
                        <span>{isEn ? 'View Full Size' : 'عرض الصورة بحجم كامل'}</span>
                      </span>
                      <Maximize2 className="w-4 h-4 text-teal-300" />
                    </div>

                    {photo.category && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-xs shadow-xs border border-white/60">
                        {getCategoryLabel(photo.category, isEn)}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1 bg-white">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-900 transition-colors">
                      {isEn ? (photo.titleEn || photo.title) : photo.title}
                    </h4>
                    {(photo.caption || photo.captionEn) && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {isEn ? (photo.captionEn || photo.caption) : photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Patient Testimonials & Interactive Review Submission */}
      {config.testimonials && (
        <section className={`py-14 border-b border-slate-200/80 ${testimonialsStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {isEn ? 'Verified Experiences' : 'تجارب حقيقية'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {isEn ? 'Patient Reviews & Ratings' : 'آراء وتقييمات المرضى والمراجعين'}
                </h3>
              </div>

              {/* Add Review Button */}
              <button
                onClick={() => setIsAddReviewModalOpen(true)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${theme.buttonClass}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? 'Add Your Review' : 'أضف تقييمك كـ مريض'}</span>
              </button>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((test) => (
                <div key={test.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(Math.max(1, Math.min(5, Math.round(Number(test.rating) || 5))))].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{test.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{isEn ? (test.commentEn || test.comment) : test.comment}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-900">
                      {isEn ? (test.patientNameEn || test.patientName) : test.patientName}
                    </span>
                    {test.treatmentType && (
                      <span className="text-teal-800">
                        {isEn ? (test.treatmentTypeEn || test.treatmentType) : test.treatmentType}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Health Articles */}
      {config.articles && doctor.articles?.length > 0 && (
        <section className={`py-14 border-b border-slate-200/80 ${articlesStyle.sectionBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {isEn ? 'Health Education' : 'التثقيف الطبي'}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isEn ? 'Medical Insights & Articles' : 'مقالات ونصائح صحية بقلم الطبيب'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <div 
                  key={art.id} 
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{isEn ? (art.categoryEn || art.category) : art.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{isEn ? `${art.readTimeMinutes} mins read` : `قراءة ${art.readTimeMinutes} دقائق`}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">
                      {isEn ? (art.titleEn || art.title) : art.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isEn ? (art.excerptEn || art.excerpt) : art.excerpt}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="mt-4 text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 self-start"
                  >
                    <span>{isEn ? 'Read Full Article' : 'قراءة المقال كاملاً'}</span>
                    <ChevronDown className="w-3.5 h-3.5 rotate-270" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Patient FAQs */}
      {config.faqs && faqs.length > 0 && (
        <section className={`py-14 border-b border-slate-200/80 ${faqsStyle.sectionBg}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {isEn ? 'Questions & Answers' : 'إجابات وتوضيحات'}
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                {isEn ? 'Frequently Asked Questions' : 'الأسئلة الأكثر شيوعاً'}
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="w-full text-right p-4 font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-3"
                    >
                      <span>{isEn ? (faq.questionEn || faq.question) : faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {isEn ? (faq.answerEn || faq.answer) : faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {config.contact && (
        <section className="py-12 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
              <div>
                <h4 className="text-xl font-bold">{isEn ? (doctor.nameEn || doctor.name) : doctor.name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isEn ? (doctor.titleEn || doctor.title) : doctor.title} · {isEn ? (doctor.clinic.nameEn || doctor.clinic.name) : doctor.clinic.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEn ? (doctor.clinic.addressEn || doctor.clinic.address) : doctor.clinic.address}، {isEn ? (doctor.clinic.cityEn || doctor.clinic.city) : doctor.clinic.city}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${doctor.clinic.phone.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span>{isEn ? 'Call Clinic' : 'اتصال بالعيادة'}</span>
                </a>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${theme.buttonClass}`}
                >
                  {isEn ? 'Book Consultation' : 'حجز موعد كشف'}
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>
                {isEn ? `Medical License No: ${doctor.licenseNumber} · All Rights Reserved` : `رقم الترخيص الطبي: ${doctor.licenseNumber} · جميع الحقوق محفوظة`} {new Date().getFullYear()}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                {!isAdmin && onOpenAdminLogin && (
                  <button
                    onClick={onOpenAdminLogin}
                    className="hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title={isEn ? 'Admin Login' : 'تسجيل دخول الإدارة'}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isEn ? 'Admin Access' : 'دخول المشرف'}</span>
                  </button>
                )}
                <span>·</span>
                <span>{isEn ? 'Powered by' : 'تم إنشاء هذا الموقع بواسطة'}</span>
                <span className="text-slate-400 font-bold">MedFrame Studio</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modals */}

      {/* 1. Doctor Photo Zoom Lightbox */}
      {isDoctorPhotoZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Close Button */}
            <button
              onClick={() => setIsDoctorPhotoZoomed(false)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all cursor-pointer shadow-lg"
              title={isEn ? 'Close' : 'إغلاق'}
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] overflow-hidden bg-slate-950 flex items-center justify-center">
              {doctor.avatarUrl ? (
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              ) : (
                <div className="py-24 text-center text-white">
                  <DoctorAvatar
                    name={doctor.name}
                    avatarUrl={doctor.avatarUrl}
                    themeColor={doctor.themeColor}
                    size="3xl"
                    className="mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{isEn ? (doctor.nameEn || doctor.name) : doctor.name}</h4>
                <p className="text-xs text-slate-500">{isEn ? (doctor.titleEn || doctor.title) : doctor.title} · {isEn ? (doctor.specialtyEn || doctor.specialty) : doctor.specialty}</p>
              </div>
              <button
                onClick={() => setIsDoctorPhotoZoomed(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isEn ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Gallery Photo Lightbox with Next / Previous navigation */}
      {selectedGalleryPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Close Button */}
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all cursor-pointer shadow-lg"
              title={isEn ? 'Close' : 'إغلاق'}
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Nav Arrows */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const curIdx = filteredPhotos.findIndex(p => p.id === selectedGalleryPhoto.id);
                    const prevIdx = (curIdx - 1 + filteredPhotos.length) % filteredPhotos.length;
                    setSelectedGalleryPhoto(filteredPhotos[prevIdx]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all cursor-pointer shadow-lg"
                  title={isEn ? 'Previous' : 'السابق'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    const curIdx = filteredPhotos.findIndex(p => p.id === selectedGalleryPhoto.id);
                    const nextIdx = (curIdx + 1) % filteredPhotos.length;
                    setSelectedGalleryPhoto(filteredPhotos[nextIdx]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all cursor-pointer shadow-lg"
                  title={isEn ? 'Next' : 'التالي'}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="max-h-[70vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedGalleryPhoto.url}
                alt={selectedGalleryPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">
                    {isEn ? (selectedGalleryPhoto.titleEn || selectedGalleryPhoto.title) : selectedGalleryPhoto.title}
                  </h4>
                  {selectedGalleryPhoto.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800">
                      {getCategoryLabel(selectedGalleryPhoto.category, isEn)}
                    </span>
                  )}
                </div>
                {(selectedGalleryPhoto.caption || selectedGalleryPhoto.captionEn) && (
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {isEn ? (selectedGalleryPhoto.captionEn || selectedGalleryPhoto.caption) : selectedGalleryPhoto.caption}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedGalleryPhoto(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold self-end sm:self-auto cursor-pointer"
              >
                {isEn ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-teal-800">
                {isEn ? (selectedArticle.categoryEn || selectedArticle.category) : selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                {isEn ? (selectedArticle.titleEn || selectedArticle.title) : selectedArticle.title}
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>{isEn ? `By ${doctor.nameEn || doctor.name}` : `بقلم ${doctor.name}`}</span>
                <span>·</span>
                <span>{selectedArticle.publishedDate}</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2">
                {isEn ? (selectedArticle.contentEn || selectedArticle.content) : selectedArticle.content}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 text-left">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                {isEn ? 'Close' : 'إغلاق المقال'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppointmentModal
        doctor={doctor}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <AddReviewModal
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        doctorName={isEn ? (doctor.nameEn || doctor.name) : doctor.name}
        themeColor={doctor.themeColor}
        onAddReview={handleAddPatientReview}
      />

      {/* Mobile Sticky Action Bar */}
      <aside aria-label="Mobile Quick Action" className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <a
          href={`https://wa.me/${doctor.clinic.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isEn ? 'WhatsApp' : 'واتساب'}</span>
        </a>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center shadow-sm ${theme.buttonClass}`}
        >
          {isEn ? 'Book Appointment' : 'حجز موعد'}
        </button>
      </aside>

    </div>
  );
};
