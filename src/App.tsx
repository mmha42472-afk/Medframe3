/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DoctorProfile, DoctorStatus } from './types/doctor';
import { 
  getDoctorsList, 
  getDoctorBySlug, 
  saveDoctorProfile, 
  deleteDoctorProfile, 
  duplicateDoctorProfile, 
  toggleDoctorStatus, 
  syncDemoDataToFirestore,
  syncAllDoctorsToFirestore,
  findDoctorAnyStatus,
  exportDoctorsJSON,
  importDoctorsJSON
} from './services/doctorService';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { DoctorBuilder } from './components/Builder/DoctorBuilder';
import { DoctorWebsiteView } from './components/Preview/DoctorWebsiteView';
import { DoctorDirectoryView } from './components/Public/DoctorDirectoryView';
import { NotFoundView } from './components/Public/NotFoundView';
const StudioApp = lazy(() => import('./studio/editor/StudioApp'));
import { AdminLoginModal } from './components/Auth/AdminLoginModal';
import { NewDoctorModal } from './components/Builder/NewDoctorModal';
import { FirebaseConfigModal } from './components/Common/FirebaseConfigModal';
import { GitHubPagesModal } from './components/Common/GitHubPagesModal';
import { EasyWebModal } from './components/Builder/EasyWebModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  X,
  Stethoscope,
  Lock
} from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

function MainApp() {
  const { isAdmin } = useAuth();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<{
    page: 'dashboard' | 'builder' | 'directory' | 'doctor' | 'notfound' | 'studio';
    slug?: string;
  }>({ page: 'dashboard' });

  // Doctors collection state
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloudLive, setIsCloudLive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active doctor for builder or direct view
  const [activeDoctor, setActiveDoctor] = useState<DoctorProfile | null>(null);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewDoctorModalOpen, setIsNewDoctorModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isGitHubPagesModalOpen, setIsGitHubPagesModalOpen] = useState(false);
  const [isEasyWebModalOpen, setIsEasyWebModalOpen] = useState(false);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Parse URL hash or search params
  const parseCurrentUrl = useCallback(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Direct query param support ?doctor=dr-slug
    const queryDoctor = urlParams.get('doctor') || urlParams.get('profile');
    if (queryDoctor) {
      return { page: 'doctor' as const, slug: queryDoctor };
    }

    // 2. Hash routing: #/doctor/:slug
    if (hash.startsWith('#/doctor/')) {
      const slug = hash.replace('#/doctor/', '').split('?')[0].trim();
      return { page: 'doctor' as const, slug };
    }

    if (hash === '#/directory') {
      return { page: 'directory' as const };
    }

    if (hash === '#/builder') {
      return { page: 'builder' as const };
    }

    if (hash === '#/studio') {
      return { page: 'studio' as const };
    }

    if (hash === '#/dashboard' || hash === '#/admin' || hash === '#admin') {
      return { page: 'dashboard' as const };
    }

    // 3. In-page section anchors like #clinic-schedule, #about, #services, #clinic-gallery
    // Prevent kicking the visitor back to dashboard when clicking in-page anchor links!
    if (hash.startsWith('#') && !hash.startsWith('#/')) {
      if (activeDoctor) {
        return { page: 'doctor' as const, slug: activeDoctor.slug };
      }
    }

    // 4. Default landing: If public visitor (not admin) visits root URL, show first published doctor website!
    if (!isAdmin && doctors.length > 0) {
      const publishedDoc = doctors.find(d => d.status === 'published');
      if (publishedDoc) {
        return { page: 'doctor' as const, slug: publishedDoc.slug };
      }
    }

    return { page: 'dashboard' as const };
  }, [activeDoctor, isAdmin, doctors]);

  // Load initial doctors
  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      // In studio dashboard, load all profiles (published + drafts) so admin can manage them
      const result = await getDoctorsList(true);
      setDoctors(result.doctors);
      setIsCloudLive(result.liveSynced);
    } catch (e) {
      console.warn('Load doctors note:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Route listener
  useEffect(() => {
    const handleUrlChange = async () => {
      const route = parseCurrentUrl();
      setCurrentRoute(route);

      if (route.page === 'doctor' && route.slug) {
        const cleanSlug = route.slug.trim().toLowerCase();

        // 1. Check if activeDoctor is already this doctor
        if (activeDoctor && (
          activeDoctor.slug.toLowerCase() === cleanSlug || 
          activeDoctor.id.toLowerCase() === cleanSlug ||
          activeDoctor.slug.toLowerCase().replace(/^dr-dr-/, 'dr-') === cleanSlug.replace(/^dr-dr-/, 'dr-')
        )) {
          return;
        }

        // 2. Check in-memory doctors list
        const memMatch = doctors.find(d => {
          const dSlug = d.slug.trim().toLowerCase();
          const dId = d.id.trim().toLowerCase();
          return dSlug === cleanSlug || 
                 dId === cleanSlug || 
                 dSlug.replace(/^dr-dr-/, 'dr-') === cleanSlug.replace(/^dr-dr-/, 'dr-');
        });

        if (memMatch) {
          setActiveDoctor(memMatch);
          return;
        }

        // 3. Fallback to doctorService (local storage first, then Firestore)
        let found = await getDoctorBySlug(route.slug, true);
        if (!found) {
          found = await findDoctorAnyStatus(route.slug);
        }
        if (found) {
          setActiveDoctor(found);
        } else {
          setActiveDoctor(null);
          setCurrentRoute({ page: 'notfound', slug: route.slug });
        }
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [parseCurrentUrl, doctors, activeDoctor]);

  // Navigation handlers
  const navigateTo = (page: 'dashboard' | 'builder' | 'directory' | 'studio') => {
    window.location.hash = `#/${page === 'dashboard' ? '' : page}`;
    setCurrentRoute({ page });
  };

  const openDoctorPublic = (slug: string) => {
    const cleanSlug = slug.trim().toLowerCase();
    const target = doctors.find(d => {
      const dSlug = d.slug.trim().toLowerCase();
      const dId = d.id.trim().toLowerCase();
      return dSlug === cleanSlug || 
             dId === cleanSlug || 
             dSlug.replace(/^dr-dr-/, 'dr-') === cleanSlug.replace(/^dr-dr-/, 'dr-');
    });
    if (target) {
      setActiveDoctor(target);
    }
    setCurrentRoute({ page: 'doctor', slug });
    window.location.hash = `#/doctor/${slug}`;
  };

  // Sync all doctor data to Firestore
  const handleSyncCloud = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncAllDoctorsToFirestore(doctors);
      if (result.error && result.count === 0) {
        showToast(`تنبيه فايربيس: ${result.error}`, 'error');
      } else if (result.error) {
        showToast(result.error, 'info');
        setIsCloudLive(true);
        await loadDoctors();
      } else {
        showToast(`تم بنجاح نقل ومزامنة ${result.count} موقع طبيب إلى قاعدة بيانات فايربيس!`, 'success');
        setIsCloudLive(true);
        await loadDoctors();
      }
    } catch (err) {
      showToast('تعذر إكمال المزامنة السحابية مع خوادم فايربيس.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save doctor
  const handleSaveDoctor = async (doctorToSave: DoctorProfile) => {
    try {
      const res = await saveDoctorProfile(doctorToSave);
      setDoctors(prev => {
        const idx = prev.findIndex(d => d.id === doctorToSave.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = doctorToSave;
          return updated;
        }
        return [doctorToSave, ...prev];
      });
      setActiveDoctor(doctorToSave);

      if (res.cloudSaved) {
        showToast('تم حفظ التعديلات في سحابة فايربيس وقاعدة البيانات بنجاح!', 'success');
      } else if (res.cloudError) {
        showToast(`تم الحفظ محلياً. تنبيه السحابة: ${res.cloudError}`, 'info');
      } else {
        showToast('تم حفظ التعديلات محلياً بنجاح.', 'success');
      }
    } catch {
      showToast('حدث خطأ أثناء الحفظ.', 'error');
    }
  };

  // EasyWeb generator handler
  const handleEasyWebGenerate = async (generatedDoc: DoctorProfile, openInBuilder?: boolean) => {
    try {
      await saveDoctorProfile(generatedDoc);
      setDoctors(prev => {
        const filtered = prev.filter(d => d.id !== generatedDoc.id);
        return [generatedDoc, ...filtered];
      });
      showToast(`تم إنشاء وتجهيز موقع ${generatedDoc.name} بنجاح عبر إيزي ويب!`, 'success');

      if (openInBuilder) {
        setActiveDoctor(generatedDoc);
        navigateTo('builder');
      } else {
        openDoctorPublic(generatedDoc.slug);
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ موقع الطبيب المنشأ.', 'error');
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (id: string) => {
    try {
      await deleteDoctorProfile(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
      showToast('تم حذف موقع الطبيب بنجاح.', 'success');
    } catch {
      showToast('تعذر حذف الملف.', 'error');
    }
  };

  // Duplicate doctor
  const handleDuplicateDoctor = async (doctorToClone: DoctorProfile) => {
    try {
      const cloned = await duplicateDoctorProfile(doctorToClone);
      setDoctors(prev => [cloned, ...prev]);
      showToast(`تم تكرار الملف باسم: ${cloned.name}`, 'success');
    } catch {
      showToast('تعذر تكرار الملف.', 'error');
    }
  };

  // Toggle doctor publish status
  const handleToggleStatus = async (doctorToToggle: DoctorProfile, newStatus: DoctorStatus) => {
    try {
      const updated = await toggleDoctorStatus(doctorToToggle, newStatus);
      setDoctors(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast(
        newStatus === 'published' 
          ? `تم نشر موقع ${updated.name} للعامة أونلاين!` 
          : `تم تحويل ${updated.name} إلى مسودة خاصة.`,
        'success'
      );
    } catch {
      showToast('تعذر تغيير حالة النشر.', 'error');
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    exportDoctorsJSON(doctors);
    showToast('تم تحميل ملف النسخة الاحتياطية (JSON) بنجاح.', 'success');
  };

  // Import JSON
  const handleImportJSON = (jsonString: string) => {
    try {
      const imported = importDoctorsJSON(jsonString);
      setDoctors(prev => {
        const merged = [...prev];
        imported.forEach(item => {
          const idx = merged.findIndex(d => d.id === item.id);
          if (idx >= 0) merged[idx] = item;
          else merged.unshift(item);
        });
        return merged;
      });
      showToast(`تم استيراد ${imported.length} ملفات أطباء بنجاح!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل استيراد الملف.', 'error');
    }
  };

  // Open builder for specific doctor
  const handleEditDoctorInBuilder = (doc: DoctorProfile) => {
    setActiveDoctor(doc);
    navigateTo('builder');
  };

  // Publish doctor directly and open their website
  const handlePublishDoctorDirectly = async (doctorToPublish: DoctorProfile) => {
    const updated: DoctorProfile = {
      ...doctorToPublish,
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    await handleSaveDoctor(updated);
    setDoctors(prev => {
      const idx = prev.findIndex(d => d.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    setActiveDoctor(updated);
    setCurrentRoute({ page: 'doctor', slug: updated.slug });
    window.location.hash = `#/doctor/${updated.slug}`;
    showToast(`تم بنجاح نشر موقع ${updated.name} للعامة أونلاين!`, 'success');
  };

  const handlePreviewDraftDirectly = (doctorToPreview: DoctorProfile) => {
    setActiveDoctor(doctorToPreview);
    setCurrentRoute({ page: 'doctor', slug: doctorToPreview.slug });
  };

  // ==========================================
  // RENDER ROUTED VIEWS
  // ==========================================

  // 1. Direct Public Doctor Website
  if (currentRoute.page === 'doctor') {
    if (!activeDoctor) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4 max-w-sm w-full animate-in fade-in duration-200">
            <div className="w-10 h-10 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">جارٍ تحميل موقع الطبيب...</h3>
              <p className="text-xs text-slate-500 mt-1">يتم جلب البيانات وتجهيز الصفحة</p>
            </div>
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold underline cursor-pointer"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <DoctorWebsiteView
          doctor={activeDoctor}
          isPreviewMode={false}
          onBackToDashboard={() => navigateTo('dashboard')}
          onEditDoctor={() => handleEditDoctorInBuilder(activeDoctor)}
          onUpdateDoctor={(updated) => handleSaveDoctor(updated)}
          onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        />
        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onCloseToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />
      </>
    );
  }

  // 1b. Site Studio (full-screen editor for polyclinic / lab / doctor sites)
  if (currentRoute.page === 'studio') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-sm w-full">
            <h3 className="font-bold text-slate-900">استوديو المواقع للمشرف فقط</h3>
            <p className="text-xs text-slate-500">سجّل دخول المشرف عشان تفتح الاستوديو.</p>
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-2.5 bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer">تسجيل الدخول</button>
            <button onClick={() => navigateTo('dashboard')} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">رجوع</button>
          </div>
          <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      );
    }
    return (
      <Suspense fallback={<div className="grid h-screen place-items-center bg-slate-950 text-sm text-slate-400">جاري فتح الاستوديو…</div>}>
        <StudioApp onExit={() => navigateTo('dashboard')} doctors={doctors} />
      </Suspense>
    );
  }

  // 2. 404 / Private Draft View
  if (currentRoute.page === 'notfound') {
    return (
      <NotFoundView
        slug={currentRoute.slug}
        publishedDoctors={doctors.filter(d => d.status === 'published')}
        allDoctors={doctors}
        onSelectDoctor={openDoctorPublic}
        onGoHome={() => navigateTo('dashboard')}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onPublishDoctor={handlePublishDoctorDirectly}
        onPreviewDraft={handlePreviewDraftDirectly}
        onEditInBuilder={handleEditDoctorInBuilder}
      />
    );
  }

  // 3. Full App Shell (Navbar + Content)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" dir="rtl">
      
      <div>
        {/* Universal Top Bar */}
        <TopNavbar
          currentView={currentRoute.page as any}
          onNavigate={navigateTo}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onOpenGitHubPagesModal={() => setIsGitHubPagesModalOpen(true)}
          isCloudLive={isCloudLive}
          onSyncCloud={handleSyncCloud}
          isSyncing={isSyncing}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Dashboard View - Secured so only admin can view it */}
          {currentRoute.page === 'dashboard' && (
            isAdmin ? (
              <AdminDashboard
                doctors={doctors}
                loading={loading}
                isCloudLive={isCloudLive}
                onAddNewDoctor={() => {
                  if (!isAdmin) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setIsNewDoctorModalOpen(true);
                }}
                onEditDoctor={handleEditDoctorInBuilder}
                onPreviewDoctor={(doc) => openDoctorPublic(doc.slug)}
                onDuplicateDoctor={handleDuplicateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
                onToggleStatus={handleToggleStatus}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
                onSyncCloud={handleSyncCloud}
                isSyncing={isSyncing}
                onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
                onOpenGitHubPagesModal={() => setIsGitHubPagesModalOpen(true)}
                onOpenStudio={() => navigateTo('studio')}
                onOpenEasyWeb={() => {
                  if (!isAdmin) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setIsEasyWebModalOpen(true);
                }}
              />
            ) : (
              <div className="max-w-md mx-auto py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-5">
                <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">لوحة التحكم مقيدة للمشرف فقط</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    لوحة التحكم والإدارة الطبية وقاعدة البيانات متاحة حصرياً للطبيب المسؤول. يرجى تسجيل الدخول للوصول إلى أدوات الإدارة.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    تسجيل دخول المشرف (Admin Login)
                  </button>
                  {doctors.some(d => d.status === 'published') && (
                    <button
                      onClick={() => {
                        const pub = doctors.find(d => d.status === 'published');
                        if (pub) openDoctorPublic(pub.slug);
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      تصفح موقع الطبيب المنشور كزائر
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {/* Builder View */}
          {currentRoute.page === 'builder' && (
            activeDoctor ? (
              <DoctorBuilder
                initialDoctor={activeDoctor}
                onSave={handleSaveDoctor}
                onBackToDashboard={() => navigateTo('dashboard')}
                onOpenPublicSite={openDoctorPublic}
              />
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
                <Stethoscope className="w-12 h-12 text-teal-800 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">اختر طبيباً لتعديل موقعه بالمحرر</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  يرجى تحديد طبيب من قائمة لوحة التحكم أو إنشاء موقع جديد للبدء في التعديل المباشر.
                </p>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            )
          )}

          {/* Public Directory View */}
          {currentRoute.page === 'directory' && (
            <DoctorDirectoryView
              doctors={doctors}
              onSelectDoctor={openDoctorPublic}
              isAdmin={isAdmin}
            />
          )}

        </main>
      </div>

      {/* Universal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MedFrame Studio · ميد فريم</span>
            <span>-</span>
            <span>منصة بناء وإدارة مواقع الأطباء</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <button 
              onClick={() => setIsGitHubPagesModalOpen(true)}
              className="hover:text-teal-800 transition-colors underline cursor-pointer"
            >
              جاهز للنشر على GitHub Pages (دليل الشاشة البيضاء)
            </button>
            <span>·</span>
            <button 
              onClick={() => setIsFirebaseModalOpen(true)}
              className="hover:text-teal-800 transition-colors underline cursor-pointer"
            >
              إعدادات فايربيس السحابية
            </button>
            <span>·</span>
            <span>دعم ثنائي للغة العربية والإنجليزية</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      <NewDoctorModal
        isOpen={isNewDoctorModalOpen}
        onClose={() => setIsNewDoctorModalOpen(false)}
        onCreate={(newDoc) => {
          handleSaveDoctor(newDoc);
          setActiveDoctor(newDoc);
          navigateTo('builder');
        }}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigSaved={() => loadDoctors()}
      />

      <GitHubPagesModal
        isOpen={isGitHubPagesModalOpen}
        onClose={() => setIsGitHubPagesModalOpen(false)}
      />

      <EasyWebModal
        isOpen={isEasyWebModalOpen}
        onClose={() => setIsEasyWebModalOpen(false)}
        onGenerate={handleEasyWebGenerate}
      />

      {/* Floating Toast Container */}
      <ToastContainer toasts={toasts} onCloseToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />

    </div>
  );
}

function ToastContainer({ toasts, onCloseToast }: { toasts: ToastMessage[]; onCloseToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 space-y-2 max-w-sm w-full pointer-events-none" dir="rtl">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200 ${
            toast.type === 'error' 
              ? 'bg-rose-900 text-white border-rose-800' 
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button 
            onClick={() => onCloseToast(toast.id)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
