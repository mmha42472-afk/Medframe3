import React, { useState } from 'react';
import { DoctorProfile, ThemeColor } from '../../types/doctor';
import { THEME_PALETTES } from '../../utils/theme';
import { 
  X, 
  Plus, 
  Stethoscope, 
  Building, 
  Palette, 
  Globe, 
  Lock 
} from 'lucide-react';

interface NewDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (doctor: DoctorProfile) => void;
}

export const NewDoctorModal: React.FC<NewDoctorModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [title, setTitle] = useState('طبيب استشاري');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('الرياض');
  const [phone, setPhone] = useState('+966 11 000 0000');
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialty.trim()) return;

    // Generate slug from English name or timestamp
    const baseSlug = nameEn.trim()
      ? `dr-${nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : `dr-${Date.now().toString().slice(-6)}`;

    const newDoctor: DoctorProfile = {
      id: `doc-${Date.now()}`,
      slug: baseSlug,
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      title: title.trim() || 'طبيب استشاري',
      specialty: specialty.trim(),
      subspecialties: [],
      licenseNumber: `SCHS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      experienceYears: 10,
      rating: 5.0,
      reviewCount: 1,
      avatarUrl: '',
      coverUrl: '',
      bio: `استشاري متخصص في ${specialty.trim()} مع التزام بتقديم أعلى معايير الرعاية الصحية المبنية على البراهين.`,
      statement: 'صحة المريض ورعايته بأمان هي أولويتنا السامية دائماً.',
      themeColor,
      status,
      qualifications: [
        {
          id: `q-${Date.now()}`,
          degree: 'البورد السعودي في التخصص الدقيق',
          institution: 'الهيئة السعودية للتخصصات الصحية',
          year: `${new Date().getFullYear() - 5}`,
          isFellowship: false
        }
      ],
      experience: [
        {
          id: `exp-${Date.now()}`,
          role: 'طبيب استشاري',
          hospital: clinicName.trim() || 'المستشفى التخصصي',
          period: '2020 - حتى الآن',
          description: 'رعاية المرضى والإشراف على العيادات التخصصية.'
        }
      ],
      clinic: {
        name: clinicName.trim() || 'عيادات النخبة الطبية',
        city: city.trim() || 'الرياض',
        address: 'شارع التخصصي',
        phone: phone.trim() || '+966 11 000 0000',
        whatsapp: '+966500000000',
        workingHours: [
          { days: 'الأحد - الخميس', hours: '٤:٠٠ م - ٩:٠٠ م' },
          { days: 'السبت', hours: '١٠:٠٠ ص - ٢:٠٠ م' }
        ]
      },
      services: [
        {
          id: `s-${Date.now()}`,
          name: 'فحص واستشارة طبية شاملة',
          description: 'جلسة تقييم سريري شاملة وتحديد الخطة العلاجية المناسبة.',
          price: 450,
          durationMinutes: 30,
          insuranceAccepted: true,
          category: 'استشاري'
        }
      ],
      articles: [],
      faqs: [],
      testimonials: [],
      socialLinks: {},
      seo: {
        metaTitle: `${name.trim()} | ${title.trim()} ${city.trim()}`,
        metaDescription: `الموقع الرسمي لـ ${name.trim()}، ${title.trim()} في ${city.trim()}. حجز مواعيد الكشف والاستشارات الطبية.`,
        keywords: [name.trim(), specialty.trim(), city.trim(), 'حجز موعد طبيب']
      },
      sectionsConfig: {
        hero: true,
        about: true,
        qualifications: true,
        experience: true,
        services: true,
        clinic: true,
        articles: false,
        faqs: false,
        testimonials: false,
        contact: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    onCreate(newDoctor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        dir="rtl"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">إنشاء موقع طبيب جديد</h3>
              <p className="text-xs text-slate-500">تهيئة الهوية الطبية والموقع الشخصي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="new-doc-name-ar" className="block text-xs font-semibold text-slate-700">
                اسم الطبيب (بالعربية) *
              </label>
              <input
                id="new-doc-name-ar"
                type="text"
                required
                placeholder="د. فيصل الشريف"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="new-doc-name-en" className="block text-xs font-semibold text-slate-700">
                الاسم بالإنجليزية (لتوليد الرابط)
              </label>
              <input
                id="new-doc-name-en"
                type="text"
                placeholder="Dr. Faisal Al-Sharif"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none dir-ltr text-left font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="new-doc-specialty" className="block text-xs font-semibold text-slate-700">
                التخصص الطبي *
              </label>
              <input
                id="new-doc-specialty"
                type="text"
                required
                placeholder="طب وجراحة الأنف والأذن والحنجرة"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="new-doc-title" className="block text-xs font-semibold text-slate-700">
                المسمى الوظيفي
              </label>
              <input
                id="new-doc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="new-doc-clinic-name" className="block text-xs font-semibold text-slate-700">
                اسم العيادة أو المستشفى
              </label>
              <input
                id="new-doc-clinic-name"
                type="text"
                placeholder="مجمع الشريف الطبي"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="new-doc-city" className="block text-xs font-semibold text-slate-700">
                المدينة
              </label>
              <input
                id="new-doc-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
          </div>

          {/* Theme Color Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">النمط اللوني الرئيسي للموقع</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(THEME_PALETTES) as ThemeColor[]).map((c) => {
                const pal = THEME_PALETTES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setThemeColor(c)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      themeColor === c ? 'border-teal-700 ring-2 ring-teal-700' : 'border-slate-200'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full mx-auto block shadow-xs" 
                      style={{ background: pal.primary }}
                    ></span>
                    <span className="text-[10px] text-slate-600 block mt-1">{pal.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">حالة النشر الأولية</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                  status === 'draft' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>مسودة خاصة (Draft)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                  status === 'published' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>نشر مباشر (Published)</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              إنشاء ومتابعة إلى المحرر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
