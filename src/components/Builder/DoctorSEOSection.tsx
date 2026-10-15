import React, { useState } from 'react';
import { DoctorProfile, DoctorSEO } from '../../types/doctor';
import { 
  Search, 
  Globe, 
  Sparkles, 
  Share2, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Tag,
  Plus,
  X,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

interface DoctorSEOSectionProps {
  doctor: DoctorProfile;
  onChange: (updatedSEO: DoctorSEO) => void;
  onUpdateDoctorField: (field: keyof DoctorProfile, value: any) => void;
}

export const DoctorSEOSection: React.FC<DoctorSEOSectionProps> = ({ 
  doctor, 
  onChange,
  onUpdateDoctorField
}) => {
  const seo = doctor.seo || {
    metaTitle: '',
    metaTitleEn: '',
    metaDescription: '',
    metaDescriptionEn: '',
    keywords: [],
    ogImage: '',
    canonicalUrl: '',
    indexing: 'all',
    structuredDataEnabled: true,
    author: ''
  };

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'twitter'>('facebook');
  const [keywordInput, setKeywordInput] = useState('');
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);
  const [autoGenSuccess, setAutoGenSuccess] = useState(false);

  // Field update helper
  const handleFieldChange = (field: keyof DoctorSEO, value: any) => {
    onChange({
      ...seo,
      [field]: value
    });
  };

  // Keyword tags handling
  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const word = keywordInput.trim();
    if (!seo.keywords?.includes(word)) {
      handleFieldChange('keywords', [...(seo.keywords || []), word]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    handleFieldChange('keywords', (seo.keywords || []).filter((_, i) => i !== index));
  };

  const handleAddSuggestedKeyword = (word: string) => {
    if (!seo.keywords?.includes(word)) {
      handleFieldChange('keywords', [...(seo.keywords || []), word]);
    }
  };

  // Auto-Generate SEO from profile
  const handleAutoGenerateSEO = () => {
    const docName = doctor.name || 'دكتور معتمد';
    const docTitle = doctor.title || 'استشاري تخصصي';
    const city = doctor.clinic?.city || 'المملكة';
    const specialty = doctor.specialty || 'الطب العام';

    const generatedTitleAr = `${docName} | ${docTitle} في ${city} - حجز مواعيد واستشارات`;
    const generatedTitleEn = `${doctor.nameEn || docName} | ${doctor.titleEn || docTitle} in ${doctor.clinic?.cityEn || city}`;

    const topServices = doctor.services?.slice(0, 3).map(s => s.name).join('، ');
    const generatedDescAr = `احجز موعدك الطبي مع ${docName}، ${docTitle} في ${city}. رعاية طبية متكاملة تشمل: ${topServices || 'الفحوصات والاستشارات الطبية المتخصصة'}. اتصل الآن: ${doctor.clinic?.phone || ''}`;
    const generatedDescEn = `Book an appointment with ${doctor.nameEn || docName}, ${doctor.titleEn || docTitle} in ${doctor.clinic?.cityEn || city}. Specialized healthcare and clinic consultations.`;

    const generatedKeywords = Array.from(new Set([
      docName,
      docTitle,
      specialty,
      `طبيب في ${city}`,
      'حجز كشف طبي',
      'عيادة تخصصية',
      'استشارة طبية',
      ...(doctor.subspecialties || []),
      ...(doctor.services?.slice(0, 4).map(s => s.name) || [])
    ]));

    onChange({
      ...seo,
      metaTitle: generatedTitleAr,
      metaTitleEn: generatedTitleEn,
      metaDescription: generatedDescAr,
      metaDescriptionEn: generatedDescEn,
      keywords: generatedKeywords,
      ogImage: seo.ogImage || doctor.avatarUrl,
      author: docName,
      structuredDataEnabled: true,
      indexing: 'all'
    });

    setAutoGenSuccess(true);
    setTimeout(() => setAutoGenSuccess(false), 3500);
  };

  // Live Schema.org JSON-LD Generation (Physician / MedicalBusiness)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://medframe.studio';
  const siteUrl = `${currentOrigin}/#/doctor/${doctor.slug}`;
  const displayTitle = previewLang === 'en' ? (seo.metaTitleEn || seo.metaTitle) : (seo.metaTitle || doctor.name);
  const displayDesc = previewLang === 'en' ? (seo.metaDescriptionEn || seo.metaDescription) : (seo.metaDescription || doctor.bio);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    'name': doctor.name,
    'alternateName': doctor.nameEn || undefined,
    'image': doctor.avatarUrl || seo.ogImage || undefined,
    'description': doctor.bio,
    'url': siteUrl,
    'telephone': doctor.clinic?.phone,
    'medicalSpecialty': doctor.specialty,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': doctor.clinic?.address,
      'addressLocality': doctor.clinic?.city,
      'addressCountry': 'SA'
    },
    'aggregateRating': (doctor.testimonials && doctor.testimonials.length > 0) ? {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': doctor.testimonials.length.toString(),
      'bestRating': '5'
    } : undefined,
    'openingHoursSpecification': doctor.clinic?.workingHours?.map(wh => ({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': wh.days,
      'opens': wh.hours.split('-')[0]?.trim() || '09:00',
      'closes': wh.hours.split('-')[1]?.trim() || '21:00'
    }))
  };

  const jsonLdString = JSON.stringify(jsonLdData, null, 2);

  const handleCopyJsonLd = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopiedJsonLd(true);
    setTimeout(() => setCopiedJsonLd(false), 2500);
  };

  // SEO Health calculation
  const titleLen = (seo.metaTitle || '').length;
  const descLen = (seo.metaDescription || '').length;
  const keywordsCount = (seo.keywords || []).length;
  const hasOgImage = Boolean(seo.ogImage || doctor.avatarUrl);
  const isStructuredData = seo.structuredDataEnabled !== false;

  let seoScore = 0;
  if (titleLen >= 25 && titleLen <= 70) seoScore += 25;
  else if (titleLen > 0) seoScore += 10;

  if (descLen >= 80 && descLen <= 170) seoScore += 25;
  else if (descLen > 0) seoScore += 10;

  if (keywordsCount >= 3) seoScore += 20;
  else if (keywordsCount > 0) seoScore += 10;

  if (hasOgImage) seoScore += 15;
  if (isStructuredData) seoScore += 15;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header and Smart Optimization Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 rounded-2xl border border-teal-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-teal-800" />
              <span>تهيئة وتحسين محركات البحث والظهور الرقمي (SEO & Social Cards)</span>
            </h3>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              SaaS Grade
            </span>
          </div>
          <p className="text-xs text-slate-600">
            تخصيص كامل لعناوين Google، وسوم OpenGraph لمنصات التواصل، والبيانات المنظمة Schema.org.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerateSEO}
          className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>توليد وتحسين SEO تلقائياً</span>
        </button>
      </div>

      {autoGenSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم توليد عنوان ميتا ووصف دقيق وكلمات مفتاحية مستهدفة بناءً على تخصص وعيادة الطبيب!</span>
        </div>
      )}

      {/* SEO Score & Audit Checklist */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">مؤشر جودة الـ SEO (SEO Health Score):</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              seoScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
              seoScore >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {seoScore}% {seoScore >= 80 ? 'ممتاز' : seoScore >= 50 ? 'متوسط' : 'بحاجة لتحسين'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Google & Social Standards</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${seoScore}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            {titleLen >= 25 && titleLen <= 70 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span>طول عنوان الصفحة ({titleLen} حرف)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            {descLen >= 80 && descLen <= 170 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span>طول الوصف التعريفي ({descLen} حرف)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            {keywordsCount >= 3 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span>الكلمات المفتاحية ({keywordsCount} كلمات)</span>
          </div>
        </div>
      </div>

      {/* LIVE GOOGLE SERP PREVIEW */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px] font-bold">
              G
            </div>
            <h4 className="text-xs font-bold text-slate-900">معاينة مباشرة في نتائج بحث Google (SERP Preview)</h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Lang switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewLang('ar')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  previewLang === 'ar' ? 'bg-teal-800 text-white' : 'text-slate-600'
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  previewLang === 'en' ? 'bg-teal-800 text-white' : 'text-slate-600'
                }`}
              >
                English
              </button>
            </div>

            {/* Device switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}
                title="معاينة كمبيوتر"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}
                title="معاينة هاتف"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* The Google Card Box */}
        <div 
          className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 transition-all ${
            previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
          }`}
          dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-slate-600 font-sans">
            <div className="w-4 h-4 rounded-full bg-teal-800 text-white flex items-center justify-center text-[9px] shrink-0">
              ⚕
            </div>
            <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-semibold text-slate-800">{previewLang === 'en' ? 'MedFrame Clinic' : 'ميدفريم كلينك'}</span>
              <span>›</span>
              <span className="text-slate-500 font-mono text-[11px]">doctor/{doctor.slug}</span>
            </div>
          </div>

          {/* Title in Google Link Blue */}
          <h5 className="text-[#1a0dab] hover:underline font-medium text-base leading-snug cursor-pointer font-sans">
            {displayTitle || (previewLang === 'en' ? 'Doctor Profile | Specialized Medical Clinic' : `${doctor.name} | استشاري الطب التخصصي`)}
          </h5>

          {/* Snippet Description */}
          <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2 font-sans">
            {displayDesc || 'احجز موعدك الآن مع الاستشاري وتعرف على الخدمات الطبية والمؤهلات وموقع العيادة ومواعيد العمل الرسمية.'}
          </p>
        </div>
      </div>

      {/* METADATA INPUT FORMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Arabic Meta Tags */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-800"></span>
            <h4 className="text-xs font-bold text-slate-900">وسوم الميتا باللغة العربية (Arabic SEO)</h4>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">عنوان الصفحة (Meta Title)</label>
              <span className={`text-[11px] font-mono ${
                titleLen > 65 ? 'text-rose-600 font-bold' : titleLen >= 30 ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {titleLen}/65 حرف
              </span>
            </div>
            <input
              type="text"
              value={seo.metaTitle || ''}
              onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
              placeholder="د. سارة المنصوري | استشارية جراحة القلب بالرياض"
              className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">الوصف التعريفي (Meta Description)</label>
              <span className={`text-[11px] font-mono ${
                descLen > 165 ? 'text-rose-600 font-bold' : descLen >= 120 ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {descLen}/160 حرف
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
              placeholder="الموقع الرسمي لحجز المواعيد والاستشارات الطبية مع الاستشاري في الرياض..."
              className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700 leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* English Meta Tags */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h4 className="text-xs font-bold text-slate-900">English Meta Tags (International SEO)</h4>
          </div>

          <div className="space-y-1" dir="ltr">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Meta Title (English)</label>
              <span className="text-[11px] font-mono text-slate-400">
                {(seo.metaTitleEn || '').length}/65 chars
              </span>
            </div>
            <input
              type="text"
              value={seo.metaTitleEn || ''}
              onChange={(e) => handleFieldChange('metaTitleEn', e.target.value)}
              placeholder="Dr. Sarah Al-Mansouri | Consultant Cardiologist in Riyadh"
              className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-sans"
            />
          </div>

          <div className="space-y-1" dir="ltr">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Meta Description (English)</label>
              <span className="text-[11px] font-mono text-slate-400">
                {(seo.metaDescriptionEn || '').length}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.metaDescriptionEn || ''}
              onChange={(e) => handleFieldChange('metaDescriptionEn', e.target.value)}
              placeholder="Official medical booking and consultation portal for Dr. Sarah Al-Mansouri..."
              className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-sans leading-relaxed"
            ></textarea>
          </div>
        </div>
      </div>

      {/* TARGET KEYWORDS SYSTEM */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-800" />
            <h4 className="text-xs font-bold text-slate-900">الكلمات المفتاحية المستهدفة (Focus Meta Keywords)</h4>
          </div>
          <span className="text-[11px] text-slate-500">{(seo.keywords || []).length} كلمات مضافة</span>
        </div>

        {/* Existing keywords chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-xl border border-slate-200">
          {(seo.keywords || []).map((word, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-xs"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(idx)}
                className="text-slate-400 hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(seo.keywords || []).length === 0 && (
            <span className="text-xs text-slate-400 italic">لا توجد كلمات مفتاحية بعد. أضف كلمات بالأسفل أو اضغط "توليد تلقائي".</span>
          )}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            placeholder="اكتب كلمة مفتاحية واضغط Enter (مثال: عيادة قلب بالرياض)"
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة</span>
          </button>
        </div>

        {/* Quick Suggested Keywords */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 mb-1.5">اقتراحات سريعة بنقرة واحدة:</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'حجز موعد طبي',
              'استشارات أونلاين',
              'طبيب معتمد',
              'كشف عيادة',
              'أفضل دكتور تخصصي',
              'تأمين صحي معتمد',
              doctor.specialty || 'تخصص طبي'
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddSuggestedKeyword(sug)}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 rounded-md transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SOCIAL MEDIA OPENGRAPH & TWITTER CARD */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-800" />
            <h4 className="text-xs font-bold text-slate-900">بطاقات المشاركة على منصات التواصل (Social Share Cards)</h4>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSocialPlatform('facebook')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                socialPlatform === 'facebook' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              WhatsApp / LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setSocialPlatform('twitter')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                socialPlatform === 'twitter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              X (Twitter Card)
            </button>
          </div>
        </div>

        {/* Social Preview Visual Card */}
        <div className="max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-44 bg-slate-200 relative overflow-hidden flex items-center justify-center">
            {seo.ogImage || doctor.avatarUrl ? (
              <img 
                src={seo.ogImage || doctor.avatarUrl} 
                alt="OG Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-1.5 text-xs">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span>صورة بطاقة المشاركة الاجتماعية</span>
              </div>
            )}
            <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
              og:image · 1200x630
            </span>
          </div>

          <div className="p-3.5 space-y-1 bg-white">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              {typeof window !== 'undefined' ? window.location.hostname : 'medframe.studio'}
            </span>
            <h5 className="font-bold text-slate-900 text-xs line-clamp-1">
              {displayTitle || doctor.name}
            </h5>
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {displayDesc || doctor.bio}
            </p>
          </div>
        </div>

        {/* OG Image custom input */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            رابط صورة المشاركة الاجتماعية (OpenGraph Image URL)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={seo.ogImage || ''}
              onChange={(e) => handleFieldChange('ogImage', e.target.value)}
              placeholder="https://example.com/share-card.jpg أو اترك فارغاً لاستخدام صورة الطبيب"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none dir-ltr text-left font-mono"
            />
            {doctor.avatarUrl && (
              <button
                type="button"
                onClick={() => handleFieldChange('ogImage', doctor.avatarUrl)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                استخدام صورة الطبيب
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SCHEMA.ORG STRUCTURED DATA (JSON-LD) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-800" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">البيانات المنظمة Schema.org (JSON-LD Physician)</h4>
              <p className="text-[11px] text-slate-500">تمكن جوجل من إظهار كارت العيادة، التقييمات، وساعات العمل كـ Rich Snippets.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJsonLd}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              {copiedJsonLd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJsonLd ? 'تم النسخ!' : 'نسخ كود JSON-LD'}</span>
            </button>
          </div>
        </div>

        {/* JSON-LD Code Preview */}
        <div className="relative">
          <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed dir-ltr text-left">
            <code>{jsonLdString}</code>
          </pre>
          <span className="absolute bottom-2 right-2 bg-slate-800/80 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
            @type: Physician / MedicalBusiness
          </span>
        </div>
      </div>

      {/* ADVANCED ROBOTS & CANONICAL DIRECTIVES */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Sliders className="w-4 h-4 text-teal-800" />
          <h4 className="text-xs font-bold text-slate-900">توجيهات الروبوتات والرابط الأصلي (Advanced Robots Directives)</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">تعليمات فهرسة محركات البحث (Robots Meta)</label>
            <select
              value={seo.indexing || 'all'}
              onChange={(e) => handleFieldChange('indexing', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">مفهرس ومتبع للروابط (index, follow - مستحسن)</option>
              <option value="noindex">منع الفهرسة في نتائج البحث (noindex, follow)</option>
              <option value="nofollow">فهرسة بدون تتبع الروابط (index, nofollow)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">الرابط المرجعي الأصلي (Canonical URL)</label>
            <input
              type="url"
              value={seo.canonicalUrl || ''}
              onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
              placeholder={siteUrl}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none dir-ltr text-left font-mono"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
