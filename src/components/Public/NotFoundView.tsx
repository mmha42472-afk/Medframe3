import React, { useState } from 'react';
import { DoctorProfile } from '../../types/doctor';
import { 
  Stethoscope, 
  Search, 
  Lock, 
  Home, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

interface NotFoundViewProps {
  slug?: string;
  publishedDoctors: DoctorProfile[];
  onSelectDoctor: (slug: string) => void;
  onGoHome: () => void;
  onOpenLogin: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  slug,
  publishedDoctors,
  onSelectDoctor,
  onGoHome,
  onOpenLogin
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = publishedDoctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.clinic.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                الرابط <span className="font-mono font-semibold text-slate-800 dir-ltr inline-block">({slug})</span> غير موجود أو لا يزال في مرحلة <strong className="text-slate-900">المسودة الخاصة</strong> ويتطلب تصريح مشرف لمعاينته.
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
                className="w-full text-right p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-teal-900">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500">{doc.specialty} · {doc.clinic.city}</p>
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
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>تسجيل دخول المشرف لمعاينة المسودة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
