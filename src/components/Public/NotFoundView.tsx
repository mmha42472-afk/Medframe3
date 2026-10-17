import React, { useState, useMemo } from 'react';
import { DoctorProfile } from '../../types/doctor';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { 
  Stethoscope, 
  Search, 
  Lock, 
  Home, 
  ShieldCheck, 
  ArrowLeft,
  Globe,
  Eye,
  Edit3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface NotFoundViewProps {
  slug?: string;
  publishedDoctors: DoctorProfile[];
  allDoctors?: DoctorProfile[];
  onSelectDoctor: (slug: string) => void;
  onGoHome: () => void;
  onOpenLogin: () => void;
  onPublishDoctor?: (doctor: DoctorProfile) => void;
  onPreviewDraft?: (doctor: DoctorProfile) => void;
  onEditInBuilder?: (doctor: DoctorProfile) => void;
}

function normalizeSlug(s?: string): string {
  if (!s) return '';
  return s.trim().toLowerCase().replace(/^dr-dr-/, 'dr-');
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  slug,
  publishedDoctors,
  allDoctors = [],
  onSelectDoctor,
  onGoHome,
  onOpenLogin,
  onPublishDoctor,
  onPreviewDraft,
  onEditInBuilder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Check if this slug matches a draft doctor
  const draftDoctor = useMemo(() => {
    if (!slug) return null;
    const target = normalizeSlug(slug);
    return allDoctors.find(d => {
      const dSlug = normalizeSlug(d.slug);
      return dSlug === target || d.slug.toLowerCase() === slug.toLowerCase();
    }) || null;
  }, [slug, allDoctors]);

  const filtered = publishedDoctors.filter(d => 
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.clinic?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.clinic?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePublishNow = async () => {
    if (!draftDoctor || !onPublishDoctor) return;
    setPublishing(true);
    try {
      await onPublishDoctor(draftDoctor);
    } finally {
      setPublishing(false);
    }
  };

  // IF DOCTOR EXISTS BUT IS IN DRAFT MODE
  if (draftDoctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white" dir="rtl">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-9 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Badge & Avatar */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>الموقع الطبي لا يزال في مرحلة (مسودة خاصة)</span>
            </div>

            <div className="flex justify-center pt-2">
              <DoctorAvatar
                name={draftDoctor.name}
                avatarUrl={draftDoctor.avatarUrl}
                themeColor={draftDoctor.themeColor}
                size="lg"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {draftDoctor.name}
              </h2>
              <p className="text-xs text-teal-800 font-semibold mt-1">
                {draftDoctor.title} · {draftDoctor.specialty}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 dir-ltr">
                /doctor/{draftDoctor.slug}
              </p>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-right text-xs space-y-1.5 text-amber-950">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>لماذا تظهر هذه الصفحة؟</span>
            </p>
            <p className="text-amber-900/90 leading-relaxed text-[11px]">
              موقع الطبيب تم إنشاؤه وتعديله بنجاح وهو محفوظ، ولكنه محفوظ حالياً كـ <strong className="text-amber-950 underline">مسودة خاصة (Draft)</strong> لمنع ظهور المواقع غير المكتملة للعامة.
            </p>
            <p className="text-amber-800 text-[11px]">
              يمكنك الآن بنقرة واحدة نشره ليصبح متاحاً فوراً لكافة الزوار، أو معاينته كمسودة.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handlePublishNow}
              disabled={publishing}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{publishing ? 'جارٍ نشر الموقع...' : 'نشر هذا الموقع للعامة أونلاين الآن'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {onPreviewDraft && (
                <button
                  onClick={() => onPreviewDraft(draftDoctor)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة كمسودة</span>
                </button>
              )}

              {onEditInBuilder && (
                <button
                  onClick={() => onEditInBuilder(draftDoctor)}
                  className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                  <span>تعديل بالمحرر</span>
                </button>
              )}
            </div>
          </div>

          {/* Return Home */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={onGoHome}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>العودة للوحة التحكم الرئيسية</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // STANDARD 404 (SLUG REALLY NOT FOUND)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white" dir="rtl">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 text-center space-y-6">
        
        {/* Medical Lock / 404 Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            404 · PROFILE UNAVAILABLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            الموقع الطبي غير متوفر حالياً
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {slug ? (
              <>
                الرابط <span className="font-mono font-semibold text-slate-800 dir-ltr inline-block">({slug})</span> غير موجود أو تم تغيير مساره.
              </>
            ) : (
              'الصفحة المطلوبة غير موجودة أو تم تغيير مسارها.'
            )}
          </p>
        </div>

        {/* Search published doctors */}
        <div className="pt-2 text-right space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            ابحث عن طبيب أو تخصص في دليل الأطباء المعتمدين:
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="اكتب اسم الطبيب أو التخصص (مثل: قلب، عيون، أطفال)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Quick list of available published doctors */}
          <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
            {filtered.slice(0, 3).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoctor(doc.slug)}
                className="w-full text-right p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all flex items-center justify-between text-xs group cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-teal-900">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500">{doc.specialty} · {doc.clinic?.city || 'الرياض'}</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:-translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>تسجيل دخول المشرف</span>
          </button>
        </div>

      </div>
    </div>
  );
};
