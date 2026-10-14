import React, { useState } from 'react';
import { DoctorProfile } from '../../types/doctor';
import { getTheme } from '../../utils/theme';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { AppointmentModal } from './AppointmentModal';
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
  Stethoscope
} from 'lucide-react';

interface DoctorWebsiteViewProps {
  doctor: DoctorProfile;
  isPreviewMode?: boolean;
  onEditDoctor?: () => void;
  onBackToDashboard?: () => void;
}

export const DoctorWebsiteView: React.FC<DoctorWebsiteViewProps> = ({
  doctor,
  isPreviewMode = false,
  onEditDoctor,
  onBackToDashboard
}) => {
  const theme = getTheme(doctor.themeColor);
  const [activeFaq, setActiveFaq] = useState<string | null>(doctor.faqs[0]?.id || null);
  const [selectedArticle, setSelectedArticle] = useState<typeof doctor.articles[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white" dir="rtl">
      
      {/* Admin Preview Toolbar if opened from builder */}
      {isPreviewMode && (
        <aside aria-label="شريط معاينة المسؤول" className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold">وضع المعاينة الحية لصفحة الطبيب</span>
            <span className="text-slate-400 hidden sm:inline">({doctor.status === 'published' ? 'منشور متاح للعامة' : 'مسودة خاصة'})</span>
          </div>
          <div className="flex items-center gap-2">
            {onEditDoctor && (
              <button
                onClick={onEditDoctor}
                className="px-3 py-1 bg-teal-800 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                العودة للمحرر
              </button>
            )}
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                لوحة التحكم
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Website Top Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Clinic Brand */}
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ background: theme.primary }}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base block leading-tight">
                {doctor.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs block">
                {doctor.clinic.name}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyLink}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="نسخ رابط الموقع للمشاركة"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">مشاركة الرابط</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${theme.buttonClass}`}
            >
              حجز موعد
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      {config.hero && (
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-12 lg:pt-16 lg:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Doctor Details */}
              <div className="lg:col-span-7 space-y-5 text-right">
                
                {/* Accreditation & License Kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-800">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>مرخص ومعتمد رسمياً</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>رقم التسجيل: {doctor.licenseNumber}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{doctor.clinic.city}</span>
                </div>

                {/* Main Headline */}
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {doctor.name}
                  </h1>
                  {doctor.nameEn && (
                    <p className="text-sm font-medium text-slate-600 mt-1 font-mono tracking-wide">
                      {doctor.nameEn}
                    </p>
                  )}
                  <h2 className="text-base sm:text-lg font-semibold text-slate-700 mt-2">
                    {doctor.title}
                  </h2>
                </div>

                {/* Subspecialties unboxed text */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{doctor.specialty}</span>
                  {doctor.subspecialties?.map((sub, i) => (
                    <React.Fragment key={i}>
                      <span aria-hidden="true" className="text-slate-300">/</span>
                      <span>{sub}</span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Personal Statement / Doctor's Mission */}
                {doctor.statement && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed relative">
                    <p className="italic font-medium">"{doctor.statement}"</p>
                  </div>
                )}

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className={`px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${theme.buttonClass}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>حجز موعد استشارة</span>
                  </button>

                  <a
                    href="#clinic-schedule"
                    className="px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>ساعات العمل والعيادة</span>
                  </a>
                </div>

              </div>

              {/* Doctor Portrait Card */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm">
                  {/* Decorative backdrop glow */}
                  <div 
                    className="absolute -inset-2 rounded-3xl opacity-20 blur-xl pointer-events-none"
                    style={{ background: theme.primary }}
                  ></div>

                  <div className="relative bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-md">
                    <DoctorAvatar
                      name={doctor.name}
                      avatarUrl={doctor.avatarUrl}
                      themeColor={doctor.themeColor}
                      size="2xl"
                      className="w-full h-80 sm:h-96 rounded-2xl"
                    />

                    {/* Quick Badge Under Avatar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">{doctor.rating.toFixed(2)}</span>
                        <span className="text-slate-600 font-normal">({doctor.reviewCount} تقييم موثق)</span>
                      </div>
                      <span className="text-slate-600 font-medium">خبرة {doctor.experienceYears} عاماً</span>
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
                <p className="text-xs text-slate-500 mt-0.5">سنوات خبرة سريرية متخصصة</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  %{Math.round(doctor.rating * 20)}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">نسبة رضا المرضى والمراجعين</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {doctor.qualifications?.length || 3}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">بورد وزمالات طبية دولية</p>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {doctor.services?.length || 4}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">خدمات وإجراءات تخصصية</p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* About & Biography */}
      {config.about && (
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                السيرة الطبية والتخصصية
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                عن {doctor.name}
              </h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {doctor.bio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Qualifications & Career Experience */}
      {(config.qualifications || config.experience) && (
        <section className="py-14 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Qualifications */}
              {config.qualifications && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-800" />
                    <h3 className="text-xl font-bold text-slate-900">المؤهلات والزمالات الطبية</h3>
                  </div>

                  <div className="space-y-3">
                    {doctor.qualifications?.map((q) => (
                      <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.degree}</h4>
                          <span className="text-xs font-mono text-slate-600 tabular-nums">{q.year}</span>
                        </div>
                        <p className="text-xs text-slate-600">{q.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Timeline */}
              {config.experience && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-800" />
                    <h3 className="text-xl font-bold text-slate-900">المناصب والخبرات الإكلينيكية</h3>
                  </div>

                  <div className="space-y-3">
                    {doctor.experience?.map((exp) => (
                      <div key={exp.id} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{exp.role}</h4>
                          <span className="text-xs font-mono text-slate-600 tabular-nums">{exp.period}</span>
                        </div>
                        <p className="text-xs font-medium text-teal-800">{exp.hospital}</p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
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
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">الرعاية التخصصية</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">الخدمات والإجراءات الطبية</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  نقدم باقة متكاملة من الفحوصات والإجراءات العلاجية بأحدث المعايير الطبية المعتمدة.
                </p>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors self-start shrink-0"
              >
                استفسر عن توفر الخدمة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.services?.map((service) => (
                <div 
                  key={service.id} 
                  className="p-5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{service.name}</h4>
                      {service.price && (
                        <span className="text-xs font-bold font-mono text-teal-800 shrink-0">
                          {service.price} ر.س
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {service.durationMinutes && (
                        <span>المدة: {service.durationMinutes} دقيقة</span>
                      )}
                      {service.insuranceAccepted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-800 font-medium">مشمول بالتأمين</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="font-bold text-teal-800 hover:text-teal-900 underline text-xs"
                    >
                      طلب موعد
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Clinic Details & Schedule */}
      {config.clinic && (
        <section id="clinic-schedule" className="py-14 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">معلومات الزيارة</span>
                <h3 className="text-2xl font-bold text-slate-900">{doctor.clinic.name}</h3>
                
                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{doctor.clinic.city}</p>
                      <p className="text-slate-600">{doctor.clinic.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-teal-800 shrink-0" />
                    <span className="font-mono text-slate-800">{doctor.clinic.phone}</span>
                  </div>

                  {doctor.clinic.emergencyPhone && (
                    <div className="flex items-center gap-2.5 text-rose-800">
                      <span className="font-bold">خط الطوارئ:</span>
                      <span className="font-mono">{doctor.clinic.emergencyPhone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {doctor.clinic.googleMapsUrl && (
                    <a
                      href={doctor.clinic.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>فتح الموقع على خرائط Google</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 mr-1" />
                    </a>
                  )}

                  <a
                    href={`https://wa.me/${doctor.clinic.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة واتساب العيادة</span>
                  </a>
                </div>
              </div>

              {/* Working Hours Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-800" />
                  <span>جدول مواعيد العيادة والاستشارات</span>
                </h4>

                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {doctor.clinic.workingHours?.map((wh, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{wh.days}</span>
                      <span className="font-mono text-slate-600">{wh.hours}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>* يُفضل الحجز المسبق لتجنب أوقات الانتظار.</span>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="text-teal-800 hover:text-teal-900 font-bold"
                  >
                    حجز موعد الآن ←
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* Health Articles & Patient Education */}
      {config.articles && doctor.articles?.length > 0 && (
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">التثقيف الطبي</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">مقالات ونصائح صحية بقلم الطبيب</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.articles.map((art) => (
                <div 
                  key={art.id} 
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{art.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>قراءة {art.readTimeMinutes} دقائق</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{art.publishedDate}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">{art.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{art.excerpt}</p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="mt-4 text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 self-start"
                  >
                    <span>قراءة المقال كاملاً</span>
                    <ChevronDown className="w-3.5 h-3.5 rotate-270" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Patient FAQs */}
      {config.faqs && doctor.faqs?.length > 0 && (
        <section className="py-14 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">إجابات وتوضيحات</span>
              <h3 className="text-2xl font-bold text-slate-900">الأسئلة الأكثر شيوعاً</h3>
            </div>

            <div className="space-y-3">
              {doctor.faqs.map((faq) => {
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
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials && doctor.testimonials?.length > 0 && (
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">تجارب حقيقية</span>
              <h3 className="text-2xl font-bold text-slate-900">آراء وتقييمات المرضى</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.testimonials.map((test) => (
                <div key={test.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">{test.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{test.comment}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-900">{test.patientName}</span>
                    {test.treatmentType && (
                      <span className="text-teal-800">{test.treatmentType}</span>
                    )}
                  </div>
                </div>
              ))}
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
                <h4 className="text-xl font-bold">{doctor.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{doctor.title} · {doctor.clinic.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doctor.clinic.address}، {doctor.clinic.city}</p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${doctor.clinic.phone.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span>اتصال بالعيادة</span>
                </a>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${theme.buttonClass}`}
                >
                  حجز موعد كشف
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>رقم الترخيص الطبي: {doctor.licenseNumber} · جميع الحقوق محفوظة {new Date().getFullYear()}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>تم إنشاء هذا الموقع بواسطة</span>
                <span className="text-slate-400 font-bold">MedFrame Studio</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-teal-800">{selectedArticle.category}</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedArticle.title}</h3>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>بقلم {doctor.name}</span>
                <span>·</span>
                <span>نُشر في {selectedArticle.publishedDate}</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2">
                {selectedArticle.content}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 text-left">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                إغلاق المقال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentModal
        doctor={doctor}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Mobile Sticky Quick-Action Bar (< 15% viewport height per frontend constitution) */}
      <aside aria-label="شريط الحجز السريع للجوال" className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <a
          href={`https://wa.me/${doctor.clinic.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>واتساب</span>
        </a>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center shadow-sm ${theme.buttonClass}`}
        >
          حجز موعد
        </button>
      </aside>

    </div>
  );
};
