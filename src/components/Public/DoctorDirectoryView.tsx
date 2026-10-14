import React, { useState } from 'react';
import { DoctorProfile } from '../../types/doctor';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowLeft, 
  ShieldCheck, 
  Stethoscope, 
  Award,
  Calendar
} from 'lucide-react';

interface DoctorDirectoryViewProps {
  doctors: DoctorProfile[];
  onSelectDoctor: (slug: string) => void;
  onOpenNewDoctor?: () => void;
  isAdmin: boolean;
}

export const DoctorDirectoryView: React.FC<DoctorDirectoryViewProps> = ({
  doctors,
  onSelectDoctor,
  onOpenNewDoctor,
  isAdmin
}) => {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Only show published doctors in public directory unless admin
  const availableDoctors = isAdmin ? doctors : doctors.filter(d => d.status === 'published');

  const specialties = Array.from(new Set(availableDoctors.map(d => d.specialty).filter(Boolean)));

  const filtered = availableDoctors.filter(d => {
    const matchQuery = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.clinic.city.toLowerCase().includes(search.toLowerCase());
    
    const matchSpec = selectedSpecialty === 'all' || d.specialty === selectedSpecialty;

    return matchQuery && matchSpec;
  });

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Directory Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>شبكة النخبة الطبية المعتمدة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          دليل الأطباء والمواقع الطبية المتخصصة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          تصفح المواقع الشخصية الرسمية لكبار الاستشاريين والأطباء، وتعرف على تخصصاتهم ومواعيد عياداتهم واحجز استشارتك مباشرة.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="ابحث بالاسم، التخصص، أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {specialties.length > 0 && (
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full sm:w-auto py-2 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none text-slate-700 shrink-0"
          >
            <option value="all">جميع التخصصات الطبية</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        )}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.map((doctor) => (
          <div 
            key={doctor.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <DoctorAvatar
                  name={doctor.name}
                  avatarUrl={doctor.avatarUrl}
                  themeColor={doctor.themeColor}
                  size="lg"
                  className="rounded-2xl"
                />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-900 transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-teal-800 font-semibold mt-0.5">
                    {doctor.specialty}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {doctor.title}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {doctor.bio}
              </p>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.clinic.name} · {doctor.clinic.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums">{doctor.rating.toFixed(1)}</span>
                    <span className="text-slate-600 font-normal">({doctor.reviewCount})</span>
                  </span>
                  <span>خبرة {doctor.experienceYears} عاماً</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-mono">/doctor/{doctor.slug}</span>
              <button
                onClick={() => onSelectDoctor(doctor.slug)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 group-hover:bg-teal-800"
              >
                <span>زيارة الموقع</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
