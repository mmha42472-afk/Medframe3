import React, { useState } from 'react';
import { 
  DoctorProfile, 
  ThemeColor, 
  DoctorStatus,
  MedicalQualification,
  CareerMilestone,
  MedicalService,
  MedicalArticle,
  PatientFAQ,
  PatientTestimonial,
  SectionBgStyle
} from '../../types/doctor';
import { THEME_PALETTES, getTheme } from '../../utils/theme';
import { translateDoctorProfileToEnglish } from '../../utils/translator';
import { DoctorWebsiteView } from '../Preview/DoctorWebsiteView';
import { DoctorPhotoUploader } from './DoctorPhotoUploader';
import { DoctorSEOSection } from './DoctorSEOSection';
import { 
  ArrowRight, 
  Save, 
  Globe, 
  Lock, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Palette,
  User,
  GraduationCap,
  Building,
  Briefcase,
  FileText,
  HelpCircle,
  Share2,
  Search,
  Star,
  MessageSquare,
  Languages
} from 'lucide-react';

interface DoctorBuilderProps {
  initialDoctor: DoctorProfile;
  onSave: (doctor: DoctorProfile) => Promise<void>;
  onBackToDashboard: () => void;
  onOpenPublicSite: (slug: string) => void;
}

type TabType = 
  | 'branding' 
  | 'bio' 
  | 'credentials' 
  | 'clinic' 
  | 'services' 
  | 'reviews'
  | 'articles' 
  | 'faqs' 
  | 'seo' 
  | 'sections';

export const DoctorBuilder: React.FC<DoctorBuilderProps> = ({
  initialDoctor,
  onSave,
  onBackToDashboard,
  onOpenPublicSite
}) => {
  const [doctor, setDoctor] = useState<DoctorProfile>(initialDoctor);
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoTranslateNotice, setAutoTranslateNotice] = useState<string | null>(null);

  // Subspecialty tag input helper
  const [subspecialtyInput, setSubspecialtyInput] = useState('');

  const currentTheme = getTheme(doctor.themeColor);

  const handleFieldChange = <K extends keyof DoctorProfile>(field: K, value: DoctorProfile[K]) => {
    setDoctor(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomStyleChange = (field: keyof NonNullable<DoctorProfile['customStyles']>, value: any) => {
    setDoctor(prev => ({
      ...prev,
      customStyles: {
        ...(prev.customStyles || {}),
        [field]: value
      }
    }));
  };

  const handleClinicChange = (field: keyof DoctorProfile['clinic'], value: any) => {
    setDoctor(prev => ({
      ...prev,
      clinic: {
        ...prev.clinic,
        [field]: value
      }
    }));
  };

  const handleSEOChange = (field: keyof DoctorProfile['seo'], value: any) => {
    setDoctor(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleSocialChange = (field: keyof DoctorProfile['socialLinks'], value: any) => {
    setDoctor(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const handleSectionToggle = (sectionKey: keyof DoctorProfile['sectionsConfig']) => {
    setDoctor(prev => ({
      ...prev,
      sectionsConfig: {
        ...prev.sectionsConfig,
        [sectionKey]: !prev.sectionsConfig[sectionKey]
      }
    }));
  };

  // Subspecialty tags
  const handleAddSubspecialty = () => {
    if (!subspecialtyInput.trim()) return;
    if (!doctor.subspecialties.includes(subspecialtyInput.trim())) {
      setDoctor(prev => ({
        ...prev,
        subspecialties: [...prev.subspecialties, subspecialtyInput.trim()]
      }));
    }
    setSubspecialtyInput('');
  };

  const handleRemoveSubspecialty = (index: number) => {
    setDoctor(prev => ({
      ...prev,
      subspecialties: prev.subspecialties.filter((_, i) => i !== index)
    }));
  };

  // Qualifications helpers
  const handleAddQualification = () => {
    const newQ: MedicalQualification = {
      id: `q-${Date.now()}`,
      degree: 'زمالة أو شهادة تخصص جديدة',
      institution: 'الهيئة أو الجامعة الطبية',
      year: new Date().getFullYear().toString()
    };
    setDoctor(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQ]
    }));
  };

  const handleUpdateQualification = (index: number, field: keyof MedicalQualification, value: any) => {
    const list = [...doctor.qualifications];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, qualifications: list }));
  };

  const handleRemoveQualification = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q.id !== id)
    }));
  };

  // Experience helpers
  const handleAddExperience = () => {
    const newExp: CareerMilestone = {
      id: `exp-${Date.now()}`,
      role: 'استشاري أو رئيس وحدة',
      hospital: 'المستشفى أو المركز الطبي',
      period: '2020 - الآن',
      description: ''
    };
    setDoctor(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof CareerMilestone, value: any) => {
    const list = [...doctor.experience];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, experience: list }));
  };

  const handleRemoveExperience = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  // Services helpers
  const handleAddService = () => {
    const newService: MedicalService = {
      id: `s-${Date.now()}`,
      name: 'اسم الفحص أو الإجراء الطبي الجديد',
      description: 'وصف موجز لأهمية الإجراء الطبي والتقنيات المستخدمة...',
      price: 500,
      durationMinutes: 30,
      insuranceAccepted: true,
      category: 'عام'
    };
    setDoctor(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const handleUpdateService = (index: number, field: keyof MedicalService, value: any) => {
    const list = [...doctor.services];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, services: list }));
  };

  const handleRemoveService = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
  };

  // Testimonials / Reviews helpers
  const handleAddReview = () => {
    const newRev: PatientTestimonial = {
      id: `rev-${Date.now()}`,
      patientName: 'اسم المراجع',
      patientNameEn: 'Patient Name',
      rating: 5,
      comment: 'تجربة علاجية ممتازة ورعاية طبية فائقة المستوى.',
      commentEn: 'Outstanding medical care and great professionalism.',
      treatmentType: 'استشارة طبية',
      treatmentTypeEn: 'Consultation',
      date: new Date().toISOString().slice(0, 10),
      verified: true
    };
    setDoctor(prev => ({
      ...prev,
      testimonials: [newRev, ...(prev.testimonials || [])],
      reviewCount: (prev.reviewCount || 0) + 1
    }));
  };

  const handleUpdateReview = (index: number, field: keyof PatientTestimonial, value: any) => {
    const list = [...(doctor.testimonials || [])];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, testimonials: list }));
  };

  const handleRemoveReview = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter(t => t.id !== id),
      reviewCount: Math.max(0, (prev.reviewCount || 1) - 1)
    }));
  };

  // FAQs helpers
  const handleAddFaq = () => {
    const newFaq: PatientFAQ = {
      id: `faq-${Date.now()}`,
      question: 'سؤال طبي يتردد من المرضى؟',
      answer: 'الإجابة الطبية والتوضيح الشامل للمريض...'
    };
    setDoctor(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFaq]
    }));
  };

  const handleUpdateFaq = (index: number, field: keyof PatientFAQ, value: any) => {
    const list = [...doctor.faqs];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, faqs: list }));
  };

  const handleRemoveFaq = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id)
    }));
  };

  // Articles helpers
  const handleAddArticle = () => {
    const newArticle: MedicalArticle = {
      id: `art-${Date.now()}`,
      title: 'عنوان المقال التثقيفي الجديد',
      excerpt: 'مقدمة موجزة تلخص أهمية الموضوع للمريض...',
      content: 'نص المقال الطبي الكامل والإرشادات السريرية للمراجعين...',
      category: 'تثقيف صحي',
      readTimeMinutes: 4,
      publishedDate: new Date().toISOString().slice(0, 10)
    };
    setDoctor(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle]
    }));
  };

  const handleUpdateArticle = (index: number, field: keyof MedicalArticle, value: any) => {
    const list = [...doctor.articles];
    list[index] = { ...list[index], [field]: value };
    setDoctor(prev => ({ ...prev, articles: list }));
  };

  const handleRemoveArticle = (id: string) => {
    setDoctor(prev => ({
      ...prev,
      articles: prev.articles.filter(a => a.id !== id)
    }));
  };

  // Automatic Translation to English
  const handleAutoTranslate = () => {
    const translated = translateDoctorProfileToEnglish(doctor);
    setDoctor(translated);
    setAutoTranslateNotice('تمت ترجمة كافة بيانات الطبيب إلى الإنجليزية تلقائياً بنجاح! تم ملء الأسماء، التخصصات، النبذة، العيادة، الخدمات، والمقالات.');
    setTimeout(() => setAutoTranslateNotice(null), 4500);
  };

  // Save handler
  const handleSave = async (statusOverride?: DoctorStatus) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = {
        ...doctor,
        status: statusOverride || doctor.status
      };
      setDoctor(updated);
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      
      {/* Auto Translate Celebratory Toast */}
      {autoTranslateNotice && (
        <div className="p-3.5 bg-gradient-to-r from-teal-900 to-indigo-950 text-white rounded-2xl shadow-xl border border-teal-500/40 flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{autoTranslateNotice}</span>
          </div>
          <button 
            onClick={() => setAutoTranslateNotice(null)}
            className="text-white/70 hover:text-white text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10"
          >
            حسناً
          </button>
        </div>
      )}

      {/* Builder Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="الرجوع للوحة التحكم"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{doctor.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                doctor.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {doctor.status === 'published' ? 'منشور أونلاين' : 'مسودة'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono dir-ltr text-right">
              /doctor/{doctor.slug}
            </p>
          </div>
        </div>

        {/* Viewport switch and Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* AI Auto-Translate Button */}
          <button
            type="button"
            onClick={handleAutoTranslate}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            title="ترجمة جميع بيانات الطبيب للغة الإنجليزية تلقائياً للمرضى الأجانب"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ترجمة للإنجليزية تلقائياً (AI Translate)</span>
          </button>

          {/* Device toggle (for live preview) */}
          {showLivePreview && (
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-white shadow-2xs text-teal-800' : 'text-slate-500 hover:text-slate-800'}`}
                title="عرض سطح المكتب (1440px)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'tablet' ? 'bg-white shadow-2xs text-teal-800' : 'text-slate-500 hover:text-slate-800'}`}
                title="عرض التابلت (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-white shadow-2xs text-teal-800' : 'text-slate-500 hover:text-slate-800'}`}
                title="عرض الجوال (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toggle preview split */}
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors hidden lg:flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'إخفاء المعاينة' : 'إظهار المعاينة الحية'}</span>
          </button>

          {/* Direct Public Page */}
          <button
            onClick={() => onOpenPublicSite(doctor.slug)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="فتح الموقع كما يظهر للزوار"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>عرض الموقع الحي</span>
          </button>

          {/* Publish / Draft Switch */}
          {doctor.status === 'published' ? (
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تحويل إلى مسودة</span>
            </button>
          ) : (
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>نشر الموقع أونلاين</span>
            </button>
          )}

          {/* Primary Save */}
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              saveSuccess ? 'bg-emerald-600' : 'bg-teal-800 hover:bg-teal-900'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Editor & Viewport Split View */}
      <div className={`grid grid-cols-1 ${showLivePreview ? 'lg:grid-cols-12' : ''} gap-5 items-start`}>
        
        {/* Editor Form Columns */}
        <div className={`${showLivePreview ? 'lg:col-span-6 xl:col-span-5' : 'max-w-4xl mx-auto w-full'} bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden`}>
          
          {/* Editor Tabs Navigation */}
          <div className="border-b border-slate-200 bg-slate-50/70 p-2 overflow-x-auto flex items-center gap-1">
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'branding' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>الهوية والصورة والألوان</span>
            </button>

            <button
              onClick={() => setActiveTab('bio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'bio' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>النبذة والرسالة</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'credentials' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>المؤهلات ({doctor.qualifications?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('clinic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'clinic' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>العيادة والمواعيد</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'services' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>الخدمات ({doctor.services?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>التقييمات ({doctor.testimonials?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'articles' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>المقالات ({doctor.articles?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'faqs' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>الأسئلة الشائعة</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'seo' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>السيو والتواصل</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'sections' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>الأقسام والخلفيات</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-5 max-h-[75vh] overflow-y-auto space-y-6">
            
            {/* TAB 1: BRANDING & THEME */}
            {activeTab === 'branding' && (
              <div className="space-y-5">
                
                {/* Doctor Photo Uploader */}
                <DoctorPhotoUploader
                  currentAvatarUrl={doctor.avatarUrl}
                  doctorName={doctor.name}
                  themeColor={doctor.themeColor}
                  onChangeAvatar={(url) => handleFieldChange('avatarUrl', url)}
                />

                {/* Theme Palette Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    النمط اللوني المعتمد للموقع (8 ألوان طبية فاخرة)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(THEME_PALETTES) as ThemeColor[]).map((themeKey) => {
                      const pal = THEME_PALETTES[themeKey];
                      const isSelected = doctor.themeColor === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => handleFieldChange('themeColor', themeKey)}
                          className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                            isSelected 
                              ? 'border-teal-700 bg-teal-50/50 shadow-xs ring-1 ring-teal-700' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                            style={{ background: pal.primary }}
                          ></span>
                          <div className="overflow-hidden">
                            <span className="block text-[11px] font-bold text-slate-900 truncate">{pal.nameAr.split('(')[0]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doctor Names & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      اسم الطبيب باللغة العربية *
                    </label>
                    <input
                      type="text"
                      value={doctor.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="مثال: د. سارة المنصوري"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      الاسم باللغة الإنجليزية (English Name)
                    </label>
                    <input
                      type="text"
                      value={doctor.nameEn || ''}
                      onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                      placeholder="Dr. Sara Al-Mansouri"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none text-left font-mono"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    رابط الموقع المباشر (URL Slug) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={doctor.slug}
                      onChange={(e) => handleFieldChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="w-full pl-3 pr-20 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none dir-ltr text-left font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">/doctor/</span>
                  </div>
                </div>

                {/* Professional Title & Primary Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      المسمى الوظيفي والأكاديمي *
                    </label>
                    <input
                      type="text"
                      value={doctor.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="استشارية جراحة القلب والقسطرة"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      المسمى بالإنجليزية (Title in English)
                    </label>
                    <input
                      type="text"
                      value={doctor.titleEn || ''}
                      onChange={(e) => handleFieldChange('titleEn', e.target.value)}
                      placeholder="Consultant Cardiac Surgeon"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none text-left font-mono"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      التخصص الرئيسي *
                    </label>
                    <input
                      type="text"
                      value={doctor.specialty}
                      onChange={(e) => handleFieldChange('specialty', e.target.value)}
                      placeholder="جراحة القلب والأوعية الدموية"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      التخصص بالإنجليزية (Specialty in English)
                    </label>
                    <input
                      type="text"
                      value={doctor.specialtyEn || ''}
                      onChange={(e) => handleFieldChange('specialtyEn', e.target.value)}
                      placeholder="Cardiovascular Surgery"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none text-left font-mono"
                    />
                  </div>
                </div>

                {/* Subspecialties Tag Manager */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    التخصصات الدقيقة والاهتمامات السريرية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subspecialtyInput}
                      onChange={(e) => setSubspecialtyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubspecialty();
                        }
                      }}
                      placeholder="اكتب التخصص ثم اضغط إضافة..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubspecialty}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doctor.subspecialties?.map((sub, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubspecialty(idx)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* License & Experience */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      رقم الترخيص الطبي *
                    </label>
                    <input
                      type="text"
                      value={doctor.licenseNumber}
                      onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      سنوات الخبرة السريرية
                    </label>
                    <input
                      type="number"
                      value={doctor.experienceYears}
                      onChange={(e) => handleFieldChange('experienceYears', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: BIO & STATEMENT */}
            {activeTab === 'bio' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    الرسالة الشخصية والوعد الطبي للمرضى (Arabic Statement)
                  </label>
                  <input
                    type="text"
                    value={doctor.statement}
                    onChange={(e) => handleFieldChange('statement', e.target.value)}
                    placeholder="رعاية قلبية متكاملة بروح إنسانية وتقنيات تشخيصية حديثة"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    الرسالة بالإنجليزية (English Statement)
                  </label>
                  <input
                    type="text"
                    value={doctor.statementEn || ''}
                    onChange={(e) => handleFieldChange('statementEn', e.target.value)}
                    placeholder="Comprehensive cardiac care with compassion and state-of-the-art diagnostics."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    السيرة الذاتية والمسيرة المهنية (Arabic Bio)
                  </label>
                  <textarea
                    rows={6}
                    value={doctor.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    placeholder="اكتب نبذة شاملة عن مسيرة الطبيب ومجالات تخصصه..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    السيرة الذاتية بالإنجليزية (English Bio)
                  </label>
                  <textarea
                    rows={5}
                    value={doctor.bioEn || ''}
                    onChange={(e) => handleFieldChange('bioEn', e.target.value)}
                    placeholder="Write a comprehensive biography in English..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-left"
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB 3: CREDENTIALS */}
            {activeTab === 'credentials' && (
              <div className="space-y-6">
                
                {/* Qualifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">المؤهلات العلمية والشهادات</h3>
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="px-3 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مؤهل</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {doctor.qualifications?.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={q.degree}
                            onChange={(e) => handleUpdateQualification(idx, 'degree', e.target.value)}
                            placeholder="الدرجة العلمية (مثال: البورد الكندي)"
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQualification(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={q.institution}
                            onChange={(e) => handleUpdateQualification(idx, 'institution', e.target.value)}
                            placeholder="الجامعة أو المستشفى"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            value={q.year}
                            onChange={(e) => handleUpdateQualification(idx, 'year', e.target.value)}
                            placeholder="سنة التخرج (مثال: 2018)"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">المسيرة والمناصب الطبية</h3>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منصب</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {doctor.experience?.map((exp, idx) => (
                      <div key={exp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                            placeholder="المسمى الوظيفي (مثال: رئيس قسم الجراحة)"
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={exp.hospital}
                            onChange={(e) => handleUpdateExperience(idx, 'hospital', e.target.value)}
                            placeholder="المستشفى أو المركز الطبي"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            value={exp.period}
                            onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                            placeholder="الفترة الزمنية (مثال: 2019 - الآن)"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: CLINIC & HOURS */}
            {activeTab === 'clinic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">اسم العيادة أو المركز</label>
                    <input
                      type="text"
                      value={doctor.clinic?.name || ''}
                      onChange={(e) => handleClinicChange('name', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">المدينة</label>
                    <input
                      type="text"
                      value={doctor.clinic?.city || ''}
                      onChange={(e) => handleClinicChange('city', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={doctor.clinic?.address || ''}
                    onChange={(e) => handleClinicChange('address', e.target.value)}
                    placeholder="طريق الملك فهد، برج العيادات التخصصية"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">هاتف العيادة</label>
                    <input
                      type="text"
                      value={doctor.clinic?.phone || ''}
                      onChange={(e) => handleClinicChange('phone', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">رقم واتساب للحجز</label>
                    <input
                      type="text"
                      value={doctor.clinic?.whatsapp || ''}
                      onChange={(e) => handleClinicChange('whatsapp', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-left"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SERVICES */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">الخدمات والفحوصات الطبية</h3>
                    <p className="text-[11px] text-slate-500">حدد الإجراءات والخدمات التي تقدمها في عيادتك مع أسعارها ومدتها.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة خدمة</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {doctor.services?.map((svc, idx) => (
                    <div key={svc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={svc.name}
                          onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                          placeholder="اسم الخدمة أو الفحص"
                          className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveService(svc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={(e) => handleUpdateService(idx, 'description', e.target.value)}
                        placeholder="وصف تفصيلي للخدمة الطبية..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      ></textarea>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-500">السعر (ريال)</label>
                          <input
                            type="number"
                            value={svc.price || ''}
                            onChange={(e) => handleUpdateService(idx, 'price', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg tabular-nums"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500">المدة (بالدقائق)</label>
                          <input
                            type="number"
                            value={svc.durationMinutes || ''}
                            onChange={(e) => handleUpdateService(idx, 'durationMinutes', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg tabular-nums"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`insurance-${svc.id}`}
                            checked={Boolean(svc.insuranceAccepted)}
                            onChange={(e) => handleUpdateService(idx, 'insuranceAccepted', e.target.checked)}
                            className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700"
                          />
                          <label htmlFor={`insurance-${svc.id}`} className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                            تأمين
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REVIEWS / TESTIMONIALS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">تقييمات وتجارب المرضى (Patient Reviews)</h3>
                    <p className="text-[11px] text-slate-500">يمكنك إضافة أو تعديل أو حذف تقييمات المراجعين المعروضة في موقع الطبيب.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="px-3 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تقييم</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {doctor.testimonials?.map((t, idx) => (
                    <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={t.patientName}
                          onChange={(e) => handleUpdateReview(idx, 'patientName', e.target.value)}
                          placeholder="اسم المريض"
                          className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleUpdateReview(idx, 'rating', star)}
                              className="p-0.5"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  t.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReview(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={t.treatmentType || ''}
                          onChange={(e) => handleUpdateReview(idx, 'treatmentType', e.target.value)}
                          placeholder="نوع العلاج / الإجراء"
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          value={t.date}
                          onChange={(e) => handleUpdateReview(idx, 'date', e.target.value)}
                          placeholder="التاريخ"
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-left"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={t.comment}
                        onChange={(e) => handleUpdateReview(idx, 'comment', e.target.value)}
                        placeholder="نص التقييم ورأي المريض..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg leading-relaxed text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: ARTICLES */}
            {activeTab === 'articles' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">المقالات والتثقيف الطبي للمرضى</h3>
                    <p className="text-[11px] text-slate-500">نشر المقالات يعزز ثقة المرضى وظهور الموقع في محركات البحث.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddArticle}
                    className="px-3 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مقال</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {doctor.articles?.map((art, idx) => (
                    <div key={art.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={art.title}
                          onChange={(e) => handleUpdateArticle(idx, 'title', e.target.value)}
                          placeholder="عنوان المقال التثقيفي"
                          className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArticle(art.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={art.excerpt}
                        onChange={(e) => handleUpdateArticle(idx, 'excerpt', e.target.value)}
                        placeholder="مقدمة أو ملخص موجز للمقال..."
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600"
                      />

                      <textarea
                        rows={4}
                        value={art.content}
                        onChange={(e) => handleUpdateArticle(idx, 'content', e.target.value)}
                        placeholder="نص المقال الطبي الكامل..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed"
                      ></textarea>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={art.category}
                          onChange={(e) => handleUpdateArticle(idx, 'category', e.target.value)}
                          placeholder="التصنيف (مثال: صحة القلب)"
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="number"
                          value={art.readTimeMinutes}
                          onChange={(e) => handleUpdateArticle(idx, 'readTimeMinutes', Number(e.target.value))}
                          placeholder="وقت القراءة بالدقائق"
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg tabular-nums"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: FAQS */}
            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">الأسئلة الشائعة وإجاباتها للمرضى</h3>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-3 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة سؤال</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {doctor.faqs?.map((faq, idx) => (
                    <div key={faq.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                          placeholder="نص السؤال المتكرر من المراجعين"
                          className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(faq.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        placeholder="إجابة الطبيب الواضحة والشاملة..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: SEO & SOCIAL */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <DoctorSEOSection
                  doctor={doctor}
                  onChange={(newSEO) => setDoctor(prev => ({ ...prev, seo: newSEO }))}
                  onUpdateDoctorField={(field, val) => setDoctor(prev => ({ ...prev, [field]: val }))}
                />

                {/* Social media links */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Globe className="w-4 h-4 text-teal-800" />
                    <h4 className="text-xs font-bold text-slate-900">روابط منصات التواصل والموقع الرسمي (Social Profiles)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">حساب منصة X (تويتر)</label>
                      <input
                        type="url"
                        value={doctor.socialLinks?.twitter || ''}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="https://x.com/dr_username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl dir-ltr text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">لينكد إن (LinkedIn)</label>
                      <input
                        type="url"
                        value={doctor.socialLinks?.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/dr_username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl dir-ltr text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">إنستغرام (Instagram)</label>
                      <input
                        type="url"
                        value={doctor.socialLinks?.instagram || ''}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="https://instagram.com/dr_username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl dir-ltr text-left font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">قناة يوتيوب (YouTube)</label>
                      <input
                        type="url"
                        value={doctor.socialLinks?.youtube || ''}
                        onChange={(e) => handleSocialChange('youtube', e.target.value)}
                        placeholder="https://youtube.com/@dr_channel"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl dir-ltr text-left font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: SECTIONS CONFIG & BACKGROUND COLORS */}
            {activeTab === 'sections' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">إدارة الأقسام وتخصيص ألوان الخلفيات</h3>
                  <p className="text-[11px] text-slate-500">
                    تحكم في إظهار أو إخفاء أي قسم، وتخصيص خلفية ولون كل قسم على حدة.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'hero', label: 'قسم الواجهة الترحيبية (Hero)', bgKey: 'heroBg' },
                    { key: 'about', label: 'نبذة الطبيب والرسالة (About)', bgKey: 'aboutBg' },
                    { key: 'qualifications', label: 'المؤهلات والزمالات (Qualifications)', bgKey: 'qualificationsBg' },
                    { key: 'services', label: 'الخدمات والإجراءات الطبية (Services)', bgKey: 'servicesBg' },
                    { key: 'clinic', label: 'موقع العيادة والمواعيد (Clinic & Hours)', bgKey: 'clinicBg' },
                    { key: 'testimonials', label: 'آراء وتقييمات المرضى (Reviews)', bgKey: 'testimonialsBg' },
                    { key: 'articles', label: 'مقالات التثقيف الصحي (Articles)', bgKey: 'articlesBg' },
                    { key: 'faqs', label: 'الأسئلة الشائعة (FAQs)', bgKey: 'faqsBg' },
                    { key: 'contact', label: 'شريط التواصل والترخيص (Contact)' }
                  ].map(({ key, label, bgKey }) => {
                    const isVisible = doctor.sectionsConfig?.[key as keyof DoctorProfile['sectionsConfig']] !== false;
                    const currentBg = bgKey ? ((doctor.customStyles as any)?.[bgKey] || 'default') : undefined;

                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{label}</span>
                          <button
                            type="button"
                            onClick={() => handleSectionToggle(key as keyof DoctorProfile['sectionsConfig'])}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                              isVisible ? 'bg-teal-50 text-teal-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isVisible ? 'ظاهر بالموقع' : 'مخفي'}
                          </button>
                        </div>

                        {/* Background Style Selector for this section */}
                        {bgKey && isVisible && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-medium">لون خلفية القسم:</span>
                            <div className="flex flex-wrap gap-1">
                              {(['default', 'white', 'subtle', 'tinted', 'dark', 'glass'] as SectionBgStyle[]).map((styleName) => (
                                <button
                                  key={styleName}
                                  type="button"
                                  onClick={() => handleCustomStyleChange(bgKey as any, styleName)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    currentBg === styleName 
                                      ? 'bg-teal-800 text-white shadow-2xs' 
                                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                >
                                  {styleName === 'default' ? 'افتراضي' :
                                   styleName === 'white' ? 'أبيض ناصع' :
                                   styleName === 'subtle' ? 'رمادي هادئ' :
                                   styleName === 'tinted' ? 'ملون بالهوية' :
                                   styleName === 'dark' ? 'داكن ليلي' : 'زجاجي'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Live Responsive Viewport Column */}
        {showLivePreview && (
          <div className="lg:col-span-6 xl:col-span-7 bg-slate-100 rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-inner flex flex-col items-center">
            
            {/* Viewport simulation container */}
            <div 
              className={`transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300/80 ${
                previewDevice === 'mobile' 
                  ? 'w-[375px] max-w-full' 
                  : previewDevice === 'tablet' 
                  ? 'w-[768px] max-w-full' 
                  : 'w-full'
              }`}
            >
              {/* Device Frame Header */}
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="mr-2 font-mono text-[10px] text-slate-400">
                    {previewDevice === 'mobile' ? '375 × 667 (Mobile)' : previewDevice === 'tablet' ? '768 × 1024 (Tablet)' : '1440 × 900 (Desktop)'}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[10px] dir-ltr">
                  https://medframe.studio/doctor/{doctor.slug}
                </span>
              </div>

              {/* Real-time Website Renderer */}
              <div className="max-h-[75vh] overflow-y-auto">
                <DoctorWebsiteView
                  doctor={doctor}
                  isPreviewMode={false}
                  onUpdateDoctor={(up) => setDoctor(up)}
                />
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
