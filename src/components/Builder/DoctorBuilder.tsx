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
  PatientTestimonial
} from '../../types/doctor';
import { THEME_PALETTES, getTheme } from '../../utils/theme';
import { DoctorWebsiteView } from '../Preview/DoctorWebsiteView';
import { firebaseConfig, isFirebaseReady } from '../../firebase/config';
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
  Settings2,
  Cloud,
  X,
  ImagePlus
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
  const [showFirebaseSettings, setShowFirebaseSettings] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Subspecialty tag input helper
  const [subspecialtyInput, setSubspecialtyInput] = useState('');

  const currentTheme = getTheme(doctor.themeColor);

  const handleFieldChange = <K extends keyof DoctorProfile>(field: K, value: DoctorProfile[K]) => {
    setDoctor(prev => ({ ...prev, [field]: value }));
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
    <div className="space-y-4 studio-enter" dir="rtl">
      
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

          <button type="button" onClick={() => setShowFirebaseSettings(true)} className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5" title="إعدادات Firebase">
            <Settings2 className="w-3.5 h-3.5 text-slate-500" /><span>إعدادات المنصة</span>
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
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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

      {/* Main Split: Editor on Left/Right, Live Responsive Viewport on the other */}
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
              <span>الهوية والتصميم</span>
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
              <span>الأسئلة والآراء</span>
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
              <span>ظهور الأقسام</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-5 max-h-[75vh] overflow-y-auto space-y-6">
            
            {/* TAB 1: BRANDING & THEME */}
            {activeTab === 'branding' && (
              <div className="space-y-4">
                
                {/* Theme Palette Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    النمط اللوني المعتمد للموقع (Theme Palette)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(THEME_PALETTES) as ThemeColor[]).map((themeKey) => {
                      const pal = THEME_PALETTES[themeKey];
                      const isSelected = doctor.themeColor === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => handleFieldChange('themeColor', themeKey)}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                            isSelected 
                              ? 'border-teal-700 bg-teal-50/50 shadow-2xs ring-1 ring-teal-700' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span 
                            className="w-5 h-5 rounded-full shrink-0 shadow-xs" 
                            style={{ background: pal.primary }}
                          ></span>
                          <div className="overflow-hidden">
                            <span className="block text-xs font-bold text-slate-900 truncate">{pal.nameAr}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{pal.nameEn}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doctor Names & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label htmlFor="builder-doctor-name" className="block text-xs font-semibold text-slate-700">
                      اسم الطبيب باللغة العربية *
                    </label>
                    <input
                      id="builder-doctor-name"
                      type="text"
                      value={doctor.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="مثال: د. سارة المنصوري"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-doctor-name-en" className="block text-xs font-semibold text-slate-700">
                      الاسم باللغة الإنجليزية
                    </label>
                    <input
                      id="builder-doctor-name-en"
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
                  <label htmlFor="builder-doctor-slug" className="block text-xs font-semibold text-slate-700">
                    رابط الموقع المباشر (URL Slug) *
                  </label>
                  <div className="relative">
                    <input
                      id="builder-doctor-slug"
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
                    <label htmlFor="builder-doctor-title" className="block text-xs font-semibold text-slate-700">
                      المسمى الوظيفي والأكاديمي *
                    </label>
                    <input
                      id="builder-doctor-title"
                      type="text"
                      value={doctor.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="استشارية جراحة القلب والقسطرة"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-doctor-specialty" className="block text-xs font-semibold text-slate-700">
                      التخصص الرئيسي *
                    </label>
                    <input
                      id="builder-doctor-specialty"
                      type="text"
                      value={doctor.specialty}
                      onChange={(e) => handleFieldChange('specialty', e.target.value)}
                      placeholder="جراحة القلب والأوعية الدموية"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Subspecialties Tag Manager */}
                <div className="space-y-1.5">
                  <label htmlFor="builder-subspecialty-input" className="block text-xs font-semibold text-slate-700">
                    التخصصات الدقيقة والاهتمامات السريرية
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="builder-subspecialty-input"
                      type="text"
                      value={subspecialtyInput}
                      onChange={(e) => setSubspecialtyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubspecialty();
                        }
                      }}
                      placeholder="اكتب التخصص الدقيق واضغط إضافة..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubspecialty}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doctor.subspecialties?.map((sub, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubspecialty(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* License & Experience */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="builder-license-number" className="block text-xs font-semibold text-slate-700">
                      رقم الترخيص الطبي المعتمد
                    </label>
                    <input
                      id="builder-license-number"
                      type="text"
                      value={doctor.licenseNumber}
                      onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                      placeholder="SCHS-2015-XXXXX"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none font-mono dir-ltr text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-experience-years" className="block text-xs font-semibold text-slate-700">
                      سنوات الخبرة السريرية
                    </label>
                    <input
                      id="builder-experience-years"
                      type="number"
                      min={1}
                      max={60}
                      value={doctor.experienceYears}
                      onChange={(e) => handleFieldChange('experienceYears', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none tabular-nums"
                    />
                  </div>
                </div>

                {/* Doctor Avatar URL */}
                <div className="space-y-1">
                  <label htmlFor="builder-avatar-url" className="block text-xs font-semibold text-slate-700">
                    رابط صورة الطبيب (Avatar URL)
                  </label>
                  <input
                    id="builder-avatar-url"
                    type="url"
                    value={doctor.avatarUrl || ''}
                    onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                    placeholder="اتركه فارغاً ليتم إنشاء مونوغرام طبي أنيق تلقائياً"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none dir-ltr text-left"
                  />
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 px-4 py-3 text-xs font-bold text-teal-900 transition hover:bg-teal-50">
                    <ImagePlus className="h-4 w-4" />
                    <span>رفع صورة من الجهاز</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setPhotoError('');
                      if (file.size > 8 * 1024 * 1024) { setPhotoError('حجم الصورة يتجاوز 8 ميغابايت. اختر صورة أصغر.'); event.currentTarget.value = ''; return; }
                      const image = new Image();
                      const reader = new FileReader();
                      reader.onload = () => {
                        image.onload = () => {
                          const scale = Math.min(1, 900 / Math.max(image.width, image.height));
                          const canvas = document.createElement('canvas');
                          canvas.width = Math.max(1, Math.round(image.width * scale));
                          canvas.height = Math.max(1, Math.round(image.height * scale));
                          const context = canvas.getContext('2d');
                          if (!context) { setPhotoError('تعذر معالجة الصورة. حاول بصيغة أخرى.'); return; }
                          context.drawImage(image, 0, 0, canvas.width, canvas.height);
                          handleFieldChange('avatarUrl', canvas.toDataURL('image/jpeg', 0.82));
                        };
                        image.onerror = () => setPhotoError('تعذر قراءة الصورة. جرّب ملف PNG أو JPG أو WebP.');
                        image.src = String(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {photoError && <p role="alert" className="text-[11px] text-rose-600">{photoError}</p>}
                  <p className="text-[11px] text-slate-600">
                    تُضغط الصورة محلياً قبل حفظها لتقليل حجمها. يمكنك أيضاً لصق رابط صورة عام أعلاه.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: BIO & STATEMENT */}
            {activeTab === 'bio' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="builder-doctor-bio" className="block text-xs font-semibold text-slate-700">
                    النبذة والسيرة الذاتية السريرية *
                  </label>
                  <textarea
                    id="builder-doctor-bio"
                    rows={6}
                    value={doctor.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    placeholder="اكتب نبذة شاملة عن مسيرة الطبيب ومجالات تخصصه وأسلوب رعايته للمرضى..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label htmlFor="builder-doctor-statement" className="block text-xs font-semibold text-slate-700">
                    رسالة الطبيب أو شعاره للمرضى (Quote / Mission Statement)
                  </label>
                  <textarea
                    id="builder-doctor-statement"
                    rows={3}
                    value={doctor.statement}
                    onChange={(e) => handleFieldChange('statement', e.target.value)}
                    placeholder="مثال: رسالتنا تتجاوز مداواة الأعراض؛ هدفنا تمكين كل مريض من استعادة نشاطه وصحته بأمان..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB 3: QUALIFICATIONS & EXPERIENCE */}
            {activeTab === 'credentials' && (
              <div className="space-y-6">
                {/* Qualifications List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">المؤهلات والشهادات الأكاديمية</h3>
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="px-2.5 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة شهادة</span>
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
                            placeholder="الدرجة العلمية (مثال: البورد السعودي)"
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            value={q.year}
                            onChange={(e) => handleUpdateQualification(idx, 'year', e.target.value)}
                            placeholder="السنة"
                            className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg font-mono text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQualification(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.institution}
                          onChange={(e) => handleUpdateQualification(idx, 'institution', e.target.value)}
                          placeholder="الجامعة أو الهيئة المانحة (مثال: جامعة الملك سعود)"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">المناصب والمستشفيات السابقة</h3>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-2.5 py-1 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
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
                            placeholder="المسمى الإكلينيكي"
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                          <input
                            type="text"
                            value={exp.period}
                            onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                            placeholder="الفترة (مثال: 2018 - الآن)"
                            className="w-28 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg font-mono text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={exp.hospital}
                          onChange={(e) => handleUpdateExperience(idx, 'hospital', e.target.value)}
                          placeholder="المستشفى أو المركز الطبي"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-teal-800 font-medium"
                        />
                        <textarea
                          rows={2}
                          value={exp.description || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                          placeholder="وصف مختصر للمهام والإنجازات..."
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600"
                        ></textarea>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: CLINIC & SCHEDULING */}
            {activeTab === 'clinic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="builder-clinic-name" className="block text-xs font-semibold text-slate-700">
                      اسم العيادة أو المركز الطبي *
                    </label>
                    <input
                      id="builder-clinic-name"
                      type="text"
                      value={doctor.clinic.name}
                      onChange={(e) => handleClinicChange('name', e.target.value)}
                      placeholder="مركز المنصوري لجراحة القلب"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-clinic-city" className="block text-xs font-semibold text-slate-700">
                      المدينة *
                    </label>
                    <input
                      id="builder-clinic-city"
                      type="text"
                      value={doctor.clinic.city}
                      onChange={(e) => handleClinicChange('city', e.target.value)}
                      placeholder="الرياض / جدة / الخبر"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="builder-clinic-address" className="block text-xs font-semibold text-slate-700">
                    العنوان التفصيلي
                  </label>
                  <input
                    id="builder-clinic-address"
                    type="text"
                    value={doctor.clinic.address}
                    onChange={(e) => handleClinicChange('address', e.target.value)}
                    placeholder="طريق الملك فهد، حي الملقا، برج النخبة الطبي"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="builder-clinic-phone" className="block text-xs font-semibold text-slate-700">
                      هاتف العيادة *
                    </label>
                    <input
                      id="builder-clinic-phone"
                      type="tel"
                      value={doctor.clinic.phone}
                      onChange={(e) => handleClinicChange('phone', e.target.value)}
                      placeholder="+966 11 482 9900"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none font-mono dir-ltr text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-clinic-whatsapp" className="block text-xs font-semibold text-slate-700">
                      واتساب الحجوزات *
                    </label>
                    <input
                      id="builder-clinic-whatsapp"
                      type="tel"
                      value={doctor.clinic.whatsapp}
                      onChange={(e) => handleClinicChange('whatsapp', e.target.value)}
                      placeholder="+966501123456"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none font-mono dir-ltr text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="builder-clinic-emergency" className="block text-xs font-semibold text-slate-700">
                      هاتف الطوارئ (اختياري)
                    </label>
                    <input
                      id="builder-clinic-emergency"
                      type="tel"
                      value={doctor.clinic.emergencyPhone || ''}
                      onChange={(e) => handleClinicChange('emergencyPhone', e.target.value)}
                      placeholder="+966 50 112 3456"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none font-mono dir-ltr text-right text-rose-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="builder-clinic-maps" className="block text-xs font-semibold text-slate-700">
                    رابط خرائط جوجل (Google Maps URL)
                  </label>
                  <input
                    id="builder-clinic-maps"
                    type="url"
                    value={doctor.clinic.googleMapsUrl || ''}
                    onChange={(e) => handleClinicChange('googleMapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none dir-ltr text-left font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: SERVICES */}
            {activeTab === 'services' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">قائمة الخدمات والفحوصات الطبية</h3>
                    <p className="text-[11px] text-slate-500">أضف الإجراءات مع مدتها والأسعار وتغطية التأمين.</p>
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
                          placeholder="اسم الخدمة الطبية"
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
                        placeholder="وصف تفصيلي للإجراء والفوائد السريرية..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600"
                      ></textarea>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-500">السعر (ر.س)</label>
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
                            مشمول بالتأمين
                          </label>
                        </div>
                      </div>
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
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="builder-seo-title" className="block text-xs font-semibold text-slate-700">
                    عنوان الصفحة لمحركات البحث (Meta Title)
                  </label>
                  <input
                    id="builder-seo-title"
                    type="text"
                    value={doctor.seo?.metaTitle || ''}
                    onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
                    placeholder="د. سارة المنصوري | استشارية جراحة القلب بالرياض"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="builder-seo-desc" className="block text-xs font-semibold text-slate-700">
                    وصف الصفحة في جوجل والمشاركات (Meta Description)
                  </label>
                  <textarea
                    id="builder-seo-desc"
                    rows={3}
                    value={doctor.seo?.metaDescription || ''}
                    onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                    placeholder="الموقع الرسمي لحجز المواعيد والاستشارات الطبية مع الاستشاري..."
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  ></textarea>
                </div>

                {/* Social media links */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">روابط منصات التواصل الرسمية</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label htmlFor="builder-social-x" className="block text-[11px] text-slate-500">حساب منصة X (تويتر)</label>
                      <input
                        id="builder-social-x"
                        type="url"
                        value={doctor.socialLinks?.twitter || ''}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dir-ltr text-left font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="builder-social-linkedin" className="block text-[11px] text-slate-500">لينكد إن (LinkedIn)</label>
                      <input
                        id="builder-social-linkedin"
                        type="url"
                        value={doctor.socialLinks?.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dir-ltr text-left font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="builder-social-instagram" className="block text-[11px] text-slate-500">إنستغرام (Instagram)</label>
                      <input
                        id="builder-social-instagram"
                        type="url"
                        value={doctor.socialLinks?.instagram || ''}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dir-ltr text-left font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: SECTIONS CONFIG */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">التحكم في ظهور أقسام الموقع العام</h3>
                  <p className="text-[11px] text-slate-500">يمكنك إخفاء أو إظهار أي قسم في موقع الطبيب بحرية تامة.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    { key: 'hero', label: 'قسم الواجهة الترحيبية (Hero & CTA)' },
                    { key: 'about', label: 'نبذة الطبيب والرسالة السريرية (About)' },
                    { key: 'qualifications', label: 'المؤهلات والزمالات الأكاديمية (Qualifications)' },
                    { key: 'experience', label: 'المسيرة والمناصب الطبية (Experience)' },
                    { key: 'services', label: 'الخدمات والإجراءات الطبية (Services)' },
                    { key: 'clinic', label: 'موقع العيادة وجدول المواعيد (Clinic & Schedule)' },
                    { key: 'articles', label: 'مقالات التثقيف الصحي (Articles)' },
                    { key: 'faqs', label: 'الأسئلة الشائعة (FAQs)' },
                    { key: 'testimonials', label: 'تقييمات وتجارب المرضى (Testimonials)' },
                    { key: 'contact', label: 'شريط التواصل ومعلومات الترخيص (Contact)' }
                  ].map(({ key, label }) => {
                    const isVisible = doctor.sectionsConfig?.[key as keyof DoctorProfile['sectionsConfig']] !== false;
                    return (
                      <div key={key} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{label}</span>
                        <button
                          type="button"
                          onClick={() => handleSectionToggle(key as keyof DoctorProfile['sectionsConfig'])}
                          className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                            isVisible ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isVisible ? 'ظاهر' : 'مخفي'}
                        </button>
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
                />
              </div>

            </div>

          </div>
        )}

      {showFirebaseSettings && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="firebase-settings-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFirebaseSettings(false); }}>
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-l from-teal-50 to-white px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-lg shadow-teal-900/15"><Cloud className="h-5 w-5" /></span>
                <div><h3 id="firebase-settings-title" className="font-bold text-slate-900">إعدادات Firebase والمنصة</h3><p className="mt-0.5 text-xs text-slate-500">حالة الربط ومفاتيح إعداد المشروع</p></div>
              </div>
              <button type="button" onClick={() => setShowFirebaseSettings(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="إغلاق"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 p-6">
              <div className={`flex items-center justify-between rounded-2xl border p-4 ${isFirebaseReady ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <div><p className="text-sm font-bold text-slate-900">{isFirebaseReady ? 'Firebase مهيأ في هذا الإصدار' : 'Firebase غير مهيأ'}</p><p className="mt-1 text-xs text-slate-600">{isFirebaseReady ? `المشروع: ${firebaseConfig.projectId}` : 'أضف بيانات مشروعك في متغيرات البيئة ثم أعد البناء.'}</p></div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${isFirebaseReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{isFirebaseReady ? 'متصل' : 'يحتاج إعداداً'}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">إعدادات البيئة المطلوبة</p>
                <div className="grid gap-2 sm:grid-cols-2">{[
                  ['VITE_FIREBASE_API_KEY', firebaseConfig.apiKey],
                  ['VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
                  ['VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
                  ['VITE_FIREBASE_APP_ID', firebaseConfig.appId],
                  ['VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
                  ['VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
                  ['VITE_FIREBASE_FIRESTORE_DATABASE_ID', firebaseConfig.firestoreDatabaseId]
                ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><p className="text-[10px] font-bold text-slate-500">{label}</p><p className="mt-1 truncate font-mono text-[11px] text-slate-800" title={value}>{value ? 'مضبوط في إعدادات البناء' : 'غير مضبوط'}</p></div>)}</div>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs font-bold">طريقة الربط</p>
                <p className="mt-1 text-xs leading-6 text-slate-300">أدخل القيم في ملف <code className="rounded bg-white/10 px-1.5 py-0.5 text-teal-200">.env</code> أو إعدادات أسرار النشر باسماء المتغيرات أعلاه، ثم أعد بناء التطبيق. لا تضع مفاتيح حساب الخدمة أو مفاتيح Admin هنا؛ مفاتيح Firebase للعميل ليست بديلاً عن قواعد Firestore الآمنة.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

    </div>
  );
};
