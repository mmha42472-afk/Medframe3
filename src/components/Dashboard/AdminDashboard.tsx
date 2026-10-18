import React, { useState, useMemo } from 'react';
import { DoctorProfile, DoctorStatus } from '../../types/doctor';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Copy as DuplicateIcon, 
  Trash2, 
  Globe, 
  Lock, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Share2,
  Flame,
  Github
} from 'lucide-react';

interface AdminDashboardProps {
  doctors: DoctorProfile[];
  loading: boolean;
  isCloudLive: boolean;
  onAddNewDoctor: () => void;
  onEditDoctor: (doctor: DoctorProfile) => void;
  onPreviewDoctor: (doctor: DoctorProfile) => void;
  onDuplicateDoctor: (doctor: DoctorProfile) => void;
  onDeleteDoctor: (id: string) => void;
  onToggleStatus: (doctor: DoctorProfile, newStatus: DoctorStatus) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
  onOpenFirebaseModal?: () => void;
  onOpenGitHubPagesModal?: () => void;
  onOpenEasyWeb?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  doctors,
  loading,
  isCloudLive,
  onAddNewDoctor,
  onEditDoctor,
  onPreviewDoctor,
  onDuplicateDoctor,
  onDeleteDoctor,
  onToggleStatus,
  onExportJSON,
  onImportJSON,
  onSyncCloud,
  isSyncing,
  onOpenFirebaseModal,
  onOpenGitHubPagesModal,
  onOpenEasyWeb
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // JSON import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Delete modal state
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorProfile | null>(null);

  // Specialties list
  const specialties = useMemo(() => {
    const set = new Set<string>();
    (doctors || []).forEach(d => {
      if (d && d.specialty) set.add(d.specialty);
    });
    return Array.from(set);
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return (doctors || []).filter(doctor => {
      if (!doctor || !doctor.id) return false;

      const matchesSearch = 
        (doctor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.clinic?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.clinic?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ? true : doctor.status === statusFilter;

      const matchesSpecialty = 
        selectedSpecialty === 'all' ? true : doctor.specialty === selectedSpecialty;

      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [doctors, searchQuery, statusFilter, selectedSpecialty]);

  // Statistics
  const stats = useMemo(() => {
    const valid = (doctors || []).filter(d => Boolean(d && d.id));
    const total = valid.length;
    const published = valid.filter(d => d?.status === 'published').length;
    const drafts = valid.filter(d => d?.status === 'draft').length;
    const totalReviews = valid.reduce((acc, curr) => acc + (curr?.reviewCount || 0), 0);
    return { total, published, drafts, totalReviews };
  }, [doctors]);

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/doctor/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExecuteImport = () => {
    setImportError(null);
    try {
      if (!importJsonText.trim()) {
        setImportError('يرجى إدخال محتوى JSON.');
        return;
      }
      onImportJSON(importJsonText);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'فشل استيراد الملف.');
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Top Banner & Clinic Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              لوحة إدارة مواقع الأطباء
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              إدارة وبناء المواقع الإلكترونية والملفات الشخصية للأطباء ونشرها على نطاقات موحدة.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenFirebaseModal && (
              <button
                onClick={onOpenFirebaseModal}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                title="إعدادات مفاتيح فايربيس السحابية"
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>مفاتيح Firebase</span>
              </button>
            )}

            {onOpenGitHubPagesModal && (
              <button
                onClick={onOpenGitHubPagesModal}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                title="دليل النشر على GitHub Pages وحل الشاشة البيضاء"
              >
                <Github className="w-3.5 h-3.5 text-slate-800" />
                <span>دليل GitHub Pages</span>
              </button>
            )}

            <button
              onClick={onExportJSON}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="تصدير بيانات جميع الأطباء بصيغة JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>تصدير JSON</span>
            </button>

            <button
              onClick={() => {
                setImportError(null);
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="استيراد أطباء من ملف JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>استيراد JSON</span>
            </button>

            {onOpenEasyWeb && (
              <button
                onClick={onOpenEasyWeb}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-teal-700 hover:from-amber-600 hover:to-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02]"
                title="إنشاء موقع متكامل فوري في دقيقة واحدة"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>⚡ إيزي ويب (إنشاء موقع فوري)</span>
              </button>
            )}

            <button
              onClick={onAddNewDoctor}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موقع طبيب جديد</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">إجمالي الأطباء</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {stats.total}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-emerald-800 font-medium">مواقع منشورة أونلاين</span>
            <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
              {stats.published}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-amber-800 font-medium">مسودات خاصة</span>
            <div className="text-2xl font-bold text-amber-800 mt-1 tabular-nums">
              {stats.drafts}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">إجمالي تقييمات المرضى</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {stats.totalReviews}
            </div>
          </div>
        </div>
      </div>

      {/* Cloud vs Demo Sync Notice if not live */}
      {!isCloudLive && (
        <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <Database className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">أنت تعمل الآن على البيانات المحلية والتجريبية (Demo Mode)</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                يمكنك بنقرة واحدة مزامنة هذه الملفات وحفظها دائماً داخل قاعدة بيانات فايربيس (Firestore) المشفرة.
              </p>
            </div>
          </div>
          <button
            onClick={onSyncCloud}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جارٍ الحفظ السحابي...' : 'مزامنة السحابة الآن'}</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث بالاسم، التخصص، المدينة، أو الرابط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 focus:bg-white outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Status Filters (Interactive segmented buttons per anti-slop) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({doctors.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'published' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منشور ({doctors.filter(d => d.status === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'draft' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مسودات ({doctors.filter(d => d.status === 'draft').length})
          </button>
        </div>

        {/* Specialty Dropdown */}
        {specialties.length > 0 && (
          <div className="relative shrink-0">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="py-2 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none text-slate-700"
            >
              <option value="all">جميع التخصصات الطبية</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Doctors Grid / List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">جارٍ تحميل بيانات الأطباء من الخادم...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو تغيير محددات الحالة والتخصص.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSelectedSpecialty('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => {
            const isPublished = doctor.status === 'published';
            return (
              <div 
                key={doctor.id} 
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
              >
                
                {/* Card Header & Profile */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <DoctorAvatar
                        name={doctor.name}
                        avatarUrl={doctor.avatarUrl}
                        themeColor={doctor.themeColor}
                        size="md"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight hover:text-teal-900 cursor-pointer" onClick={() => onPreviewDoctor(doctor)}>
                          {doctor.name}
                        </h3>
                        <p className="text-[11px] text-teal-800 font-medium mt-0.5">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${
                      isPublished ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                    }`}>
                      {isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isPublished ? 'منشور أونلاين' : 'مسودة'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.bio || doctor.title}
                  </p>

                  {/* Clinic and Meta info */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>العيادة:</span>
                      <span className="font-medium text-slate-800">{doctor.clinic?.name || 'العيادة الطبية'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>المدينة:</span>
                      <span className="text-slate-800">{doctor.clinic?.city || 'الرياض'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>الخدمات / المقالات:</span>
                      <span className="font-mono text-slate-700">{doctor.services?.length || 0} خدمات · {doctor.articles?.length || 0} مقالات</span>
                    </div>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-[170px] dir-ltr text-left">
                      /doctor/{doctor.slug}
                    </span>
                    <button
                      onClick={() => handleCopyLink(doctor.slug, doctor.id)}
                      className="p-1 text-slate-500 hover:text-teal-800 rounded transition-colors"
                      title="نسخ رابط الموقع"
                    >
                      {copiedId === doctor.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Actions Bottom Strip */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => onToggleStatus(doctor, isPublished ? 'draft' : 'published')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                      isPublished 
                        ? 'text-amber-800 hover:bg-amber-100/60' 
                        : 'text-emerald-800 hover:bg-emerald-100/60'
                    }`}
                    title={isPublished ? 'تحويل إلى مسودة خاصة' : 'نشر الموقع للعامة'}
                  >
                    <span>{isPublished ? 'إلغاء النشر' : 'نشر الموقع'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Live Preview */}
                    <button
                      onClick={() => onPreviewDoctor(doctor)}
                      className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-white rounded-lg transition-colors"
                      title="معاينة الموقع كزائر"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Builder */}
                    <button
                      onClick={() => onEditDoctor(doctor)}
                      className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-white rounded-lg transition-colors"
                      title="تعديل الموقع بالمحرر"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicateDoctor(doctor)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                      title="نسخ وتكرار الموقع"
                    >
                      <DuplicateIcon className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDoctorToDelete(doctor)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* JSON Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-800" />
                <span>استيراد ملف بيانات الأطباء (JSON)</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="json-paste-input" className="block text-xs font-semibold text-slate-700">
                الصق محتوى JSON أو ارفع الملف:
              </label>
              <textarea
                id="json-paste-input"
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "name": "د. أحمد", "specialty": "جراحة عامة", ... } ]'
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-700 outline-none dir-ltr text-left"
              ></textarea>
            </div>

            {/* Quick File Select */}
            <div>
              <input
                id="json-file-input"
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImportJsonText(event.target?.result as string || '');
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-xs text-slate-500 file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                بدء الاستيراد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">حذف موقع الطبيب نهائياً؟</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من حذف موقع <strong className="text-slate-900">{doctorToDelete.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDoctorToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  onDeleteDoctor(doctorToDelete.id);
                  setDoctorToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                نعم، احذف الموقع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
