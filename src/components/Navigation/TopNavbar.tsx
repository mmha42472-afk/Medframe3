import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Database, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  Stethoscope,
  Flame,
  Github
} from 'lucide-react';

interface TopNavbarProps {
  currentView: 'dashboard' | 'builder' | 'directory' | 'preview' | 'studio';
  onNavigate: (view: 'dashboard' | 'builder' | 'directory' | 'studio') => void;
  onOpenNewDoctorModal?: () => void;
  onOpenLoginModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenGitHubPagesModal: () => void;
  isCloudLive: boolean;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLoginModal,
  onOpenFirebaseModal,
  onOpenGitHubPagesModal,
  isCloudLive,
  onSyncCloud,
  isSyncing
}) => {
  const { user, isAdmin, isDemoAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-right focus:outline-none group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-900 transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  ميد فريم ستوديو
                </span>
                <span className="text-[10px] text-teal-800 font-medium tracking-wide uppercase font-mono">
                  MedFrame Studio
                </span>
              </div>
            </button>

            {/* Cloud Status Badge */}
            <div className="hidden sm:flex items-center mr-2">
              {isCloudLive ? (
                <button
                  onClick={onOpenFirebaseModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 font-medium whitespace-nowrap cursor-pointer transition-colors"
                  title="انقر لفتح إعدادات فايربيس السحابية"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>فايربيس متصل</span>
                </button>
              ) : (
                <button
                  onClick={onOpenFirebaseModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 font-medium whitespace-nowrap cursor-pointer transition-colors"
                  title="انقر لربط أو فحص مفاتيح فايربيس الخاصة بك"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>إعدادات السحابة (Firebase)</span>
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                currentView === 'dashboard' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
              }`}
            >
              لوحة التحكم
            </button>
            <button
              onClick={() => onNavigate('directory')}
              className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                currentView === 'directory' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
              }`}
            >
              دليل الأطباء
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('builder')}
                className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                  currentView === 'builder' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
                }`}
              >
                محرر المواقع
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate('studio')}
                className="whitespace-nowrap shrink-0 py-1 px-3 rounded-full bg-[#0B2D5C] text-white text-xs font-bold hover:bg-[#0d3770] transition-colors cursor-pointer"
              >
                استوديو المواقع ✦
              </button>
            )}

            {/* GitHub Pages Deploy Help */}
            <button
              onClick={onOpenGitHubPagesModal}
              className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              title="دليل حل الشاشة البيضاء والنشر على GitHub Pages"
            >
              <Github className="w-3.5 h-3.5" />
              <span>نشر GitHub Pages</span>
            </button>

            {/* Firebase API Settings */}
            <button
              onClick={onOpenFirebaseModal}
              className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              title="إعدادات مفاتيح فايربيس السحابية"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>مفاتيح Firebase</span>
            </button>
          </nav>

          {/* Zone 3: Auth control / profile */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>{user?.displayName || 'المشرف'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {isDemoAdmin ? 'مشرف تجريبي معتمد' : user?.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-900 shadow-sm transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>دخول المشرف (Admin)</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            لوحة التحكم
          </button>
          <button
            onClick={() => {
              onNavigate('directory');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            دليل الأطباء العام
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('builder');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              محرر المواقع الطبية
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('studio');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 text-sm font-bold text-[#0B2D5C] hover:bg-slate-50 rounded-lg"
            >
              استوديو المواقع (مجمعات، معامل، عيادات)
            </button>
          )}
          <button
            onClick={() => {
              onOpenFirebaseModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 rounded-lg flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>إعدادات مفاتيح فايربيس السحابية</span>
          </button>
          <button
            onClick={() => {
              onOpenGitHubPagesModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 rounded-lg flex items-center gap-2"
          >
            <Github className="w-4 h-4 text-slate-700" />
            <span>دليل النشر على GitHub Pages</span>
          </button>
        </div>
      )}
    </header>
  );
};
