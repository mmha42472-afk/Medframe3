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
  Stethoscope
} from 'lucide-react';

interface TopNavbarProps {
  currentView: 'dashboard' | 'builder' | 'directory' | 'preview';
  onNavigate: (view: 'dashboard' | 'builder' | 'directory') => void;
  onOpenNewDoctorModal?: () => void;
  onOpenLoginModal: () => void;
  isCloudLive: boolean;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLoginModal,
  isCloudLive,
  onSyncCloud,
  isSyncing
}) => {
  const { user, isAdmin, isDemoAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Wordmark (Single text element with domain medical icon) */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-right focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-900 transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  ميد فريم ستوديو
                </span>
                <span className="text-[10px] text-teal-800 font-medium tracking-wide uppercase font-mono">
                  MedFrame Studio
                </span>
              </div>
            </button>

            {/* Live Cloud vs Demo Badge */}
            <div className="hidden sm:flex items-center mr-2">
              {isCloudLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200/60 font-medium whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  سحابي مباشر (Firestore)
                </span>
              ) : (
                <button
                  onClick={onSyncCloud}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200/60 transition-colors cursor-pointer font-medium whitespace-nowrap"
                  title="انقر لمزامنة البيانات التجريبية إلى سحابة فايربيس"
                >
                  <Database className="w-3 h-3 text-amber-600" />
                  {isSyncing ? 'جارٍ المزامنة...' : 'بيانات محلية (مزامنة للسحابة)'}
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentView === 'dashboard' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
              }`}
            >
              لوحة التحكم
            </button>
            <button
              onClick={() => onNavigate('directory')}
              className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentView === 'directory' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
              }`}
            >
              دليل المواقع الطبية
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('builder')}
                className={`hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  currentView === 'builder' ? 'text-teal-900 border-teal-700 font-semibold' : 'border-transparent'
                }`}
              >
                محرر المواقع
              </button>
            )}
            <a
              href="#/doctor/dr-sara-mansouri"
              className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              target="_blank"
              rel="noreferrer"
            >
              <span>معاينة موقع حي</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action (Auth control / profile) */}
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
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-900 shadow-sm transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>دخول المشرف (Admin)</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
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
            دليل المواقع الطبية العامة
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
          <button
            onClick={() => {
              onSyncCloud();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 text-sm font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg"
          >
            مزامنة البيانات السحابية (Firestore)
          </button>
        </div>
      )}
    </header>
  );
};
