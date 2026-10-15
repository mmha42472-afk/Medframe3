import React, { useState, useEffect } from 'react';
import { 
  getActiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  resetFirebaseConfig, 
  testFirestoreConnection, 
  FirebaseConfigParams,
  STORAGE_KEY_CUSTOM_FIREBASE,
  DEFAULT_FIREBASE_CONFIG
} from '../../firebase/config';
import { 
  Database, 
  Key, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  Copy, 
  AlertCircle, 
  X, 
  ExternalLink,
  Flame,
  Info,
  Server
} from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<FirebaseConfigParams>(getActiveFirebaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCustomActive, setIsCustomActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveFirebaseConfig();
      setConfig(active);
      setTestResult(null);
      setSaveSuccess(false);
      try {
        setIsCustomActive(Boolean(localStorage.getItem(STORAGE_KEY_CUSTOM_FIREBASE)));
      } catch {
        setIsCustomActive(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testFirestoreConnection(config);
      setTestResult(res);
    } catch (e) {
      setTestResult({
        success: false,
        error: e instanceof Error ? e.message : 'فشل فحص الاتصال'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveCustomFirebaseConfig(config);
    setSaveSuccess(true);
    setIsCustomActive(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة مفاتيح فايربيس الافتراضية للتطبيق؟')) {
      resetFirebaseConfig();
      setConfig(DEFAULT_FIREBASE_CONFIG);
      setIsCustomActive(false);
      setTestResult(null);
      setSaveSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  const envSnippet = `# MedFrame Studio - Custom Firebase Credentials
VITE_FIREBASE_API_KEY="${config.apiKey}"
VITE_FIREBASE_PROJECT_ID="${config.projectId}"
VITE_FIREBASE_AUTH_DOMAIN="${config.authDomain}"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="${config.firestoreDatabaseId || '(default)'}"
VITE_FIREBASE_STORAGE_BUCKET="${config.storageBucket || ''}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${config.messagingSenderId || ''}"
VITE_FIREBASE_APP_ID="${config.appId || ''}"`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إعدادات مفاتيح فايربيس (Firebase API Settings)</h3>
              <p className="text-xs text-teal-200">
                إدارة وربط مفاتيح مشروع Firebase الخاص بك للمزامنة السحابية وقواعد البيانات
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isCustomActive 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-white/15 text-teal-100 border border-white/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCustomActive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-300'}`}></span>
              {isCustomActive ? 'مفاتيح مخصصة للمستخدم نشطة' : 'المفاتيح الافتراضية السحابية نشطة'}
            </span>
            <a 
              href="https://console.firebase.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-teal-200 hover:text-white flex items-center gap-1 underline underline-offset-4 mr-auto"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-right">
          
          {/* Verification & Auth Providers Notice */}
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>حالة تفعيل تسجيل الدخول (Sign-in Providers) وسبب خطأ auth/operation-not-allowed:</span>
              </span>
              <a
                href={`https://console.firebase.google.com/project/${config.projectId || 'gen-lang-client-0271207340'}/authentication/providers`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
              >
                <span>فتح Sign-in method للمشروع</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              إذا واجهت رسالة <b>auth/operation-not-allowed</b>، فذلك لأن فايربيس يتطلب تفعيل موفّر <b>Email/Password</b> يدوياً لمرة واحدة من صفحة 
              <b> Authentication &gt; Sign-in method</b> لمشروعك <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">{config.projectId}</code>.
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-amber-200/70 text-[11px] text-emerald-800 font-semibold">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>مفاتيح الـ SDK المهيأة في التطبيق متطابقة تماماً مع ملف <code className="font-mono text-emerald-950">firebase-applet-config.json</code>.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            
            {/* API Key */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Key className="w-3.5 h-3.5 text-teal-700" />
                <span>Firebase API Key (مفتاح الواجهة)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

            {/* Project ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Server className="w-3.5 h-3.5 text-teal-700" />
                <span>Project ID (معرف المشروع)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="my-medical-app-123"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

            {/* Auth Domain */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Auth Domain (نطاق المصادقة)</span>
              </label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="project-id.firebaseapp.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

            {/* Firestore Database ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Database className="w-3.5 h-3.5 text-teal-700" />
                <span>Firestore Database ID (معرف قاعدة البيانات)</span>
              </label>
              <input
                type="text"
                value={config.firestoreDatabaseId || '(default)'}
                onChange={(e) => setConfig({ ...config, firestoreDatabaseId: e.target.value })}
                placeholder="(default) أو اسم مخصص"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
              <p className="text-[10px] text-slate-400">اتركها (default) إذا لم تنشئ قاعدة بيانات ثانوية.</p>
            </div>

            {/* Storage Bucket */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span>Storage Bucket (مستودع التخزين)</span>
              </label>
              <input
                type="text"
                value={config.storageBucket || ''}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                placeholder="project-id.firebasestorage.app"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

            {/* Messaging Sender ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span>Messaging Sender ID</span>
              </label>
              <input
                type="text"
                value={config.messagingSenderId || ''}
                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                placeholder="1234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

            {/* App ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span>App ID (معرف التطبيق)</span>
              </label>
              <input
                type="text"
                value={config.appId || ''}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:123456789:web:abcdef"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-left dir-ltr"
              />
            </div>

          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  {testResult.success 
                    ? `الاتصال بقاعدة بيانات Firestore ناجح تماماً! زمن الاستجابة: ${testResult.latencyMs}ms` 
                    : `تعذر الاتصال: ${testResult.error}`}
                </span>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold animate-pulse">
              تم حفظ الإعدادات وتطبيقها! جاري تحديث التطبيق تلقائياً...
            </div>
          )}

          {/* Export .env snippet */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">تصدير المتغيرات لملف .env</span>
            <button
              onClick={copyEnv}
              className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ!' : 'نسخ كـ .env'}</span>
            </button>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs text-slate-600 hover:text-rose-700 font-bold transition-colors"
          >
            استعادة الافتراضي
          </button>

          <div className="flex items-center gap-2.5 mr-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'جارٍ الفحص...' : 'اختبار الاتصال'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-teal-900/20"
            >
              حفظ وتطبيق فوراً
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
