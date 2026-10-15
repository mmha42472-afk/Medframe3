import React, { useState } from 'react';
import { 
  Github, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  FolderCheck, 
  Workflow, 
  Zap,
  BookOpen
} from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'docs' | 'actions'>('docs');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = window.location.hostname;
  const isCurrentlyOnGitHub = currentHost.endsWith('github.io');

  const copyBranchSteps = () => {
    const text = `خطوات النشر على GitHub Pages بدون شاشة بيضاء:
1. اذهب لمستودعك على GitHub: Settings > Pages
2. تحت قسم "Build and deployment":
   - اختر Source: "Deploy from a branch"
   - Branch: اختر "main" (أو master)
   - المجلد Folder: اختر "/docs" (مهم جداً: لا تختر / root!)
3. اضغط زر Save
4. انتظر دقيقة واحدة وسيفتح موقعك مباشرة بدون شاشة بيضاء!`;
    navigator.clipboard.writeText(text).then(() => {
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
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">حل الشاشة البيضاء ودليل النشر على GitHub Pages</h3>
              <p className="text-xs text-teal-200">
                الإجابة الحاسمة: هل تختار Root أم Docs؟ وكيف يعمل الموقع بنسبة 100%
              </p>
            </div>
          </div>

          {/* Quick Verdict Banner */}
          <div className="mt-3 p-3 bg-teal-500/20 border border-teal-500/40 rounded-xl flex items-center gap-2.5 text-xs text-teal-100 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
            <span>
              الإجابة: اختر دائماً مجلد <strong className="text-white underline">/docs</strong> وليس / root لتجنب الشاشة البيضاء فوراً!
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-right">
          
          {/* Why the white screen happens */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>لماذا تظهر "شاشة بيضاء" عند اختيار / (root)؟</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              مجلد الجذر <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">/ (root)</code> يحتوي على الكود المصدري الخام بصيغة TypeScript (<code className="font-mono">.tsx</code>) والتي لا يفهمها المتصفح بدون بناء (Vite Build).
              بينما قمنا بتهيئة مشروعك ليقوم بحفظ النسخة المترجمة الجاهزة تلقائياً داخل مجلد <code className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded font-mono text-[11px]">/docs</code>!
            </p>
          </div>

          {/* Tabs: Method 1 vs Method 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setSelectedMethod('docs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethod === 'docs' 
                    ? 'bg-teal-800 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FolderCheck className="w-4 h-4" />
                <span>الطريقة 1: النشر عبر مجلد /docs (موصى بها وسريعة)</span>
              </button>

              <button
                onClick={() => setSelectedMethod('actions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethod === 'actions' 
                    ? 'bg-teal-800 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Workflow className="w-4 h-4" />
                <span>الطريقة 2: عبر GitHub Actions</span>
              </button>
            </div>

            {selectedMethod === 'docs' ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs">1</span>
                  <span>خطوات تفعيل /docs في ثوانٍ:</span>
                </h4>
                
                <ol className="space-y-2.5 pr-2 list-decimal list-inside text-slate-700 leading-relaxed">
                  <li>افتح مستودعك على موقع GitHub.</li>
                  <li>انقر على تبويب <strong>Settings</strong> أعلى المستودع.</li>
                  <li>من القائمة الجانبية اليسرى، انقر على <strong>Pages</strong>.</li>
                  <li>تحت عنوان <strong>Build and deployment</strong>:
                    <div className="mt-2 mr-4 p-3 bg-white rounded-xl border border-slate-300 font-mono text-[11px] space-y-1">
                      <p>• Source: <span className="text-teal-700 font-bold">Deploy from a branch</span></p>
                      <p>• Branch: <span className="text-teal-700 font-bold">main</span> (أو master)</p>
                      <p>• Folder: <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">/docs</span> (اختر docs وليس root!)</p>
                    </div>
                  </li>
                  <li>اضغط زر <strong>Save</strong> الأزرق.</li>
                  <li>خلال 30 إلى 60 ثانية، سيظهر لك رابط موقعك الرسمي وسيعمل فوراً بأعلى سرعة!</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs">2</span>
                  <span>طريقة GitHub Actions التلقائية:</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  لقد أعددنا لك بالفعل ملف الأتمتة <code className="bg-white border px-1.5 py-0.5 rounded font-mono text-[11px]">.github/workflows/deploy.yml</code> داخل المشروع:
                </p>
                <ol className="space-y-2 pr-2 list-decimal list-inside text-slate-700">
                  <li>في إعدادات المستودع <strong>Settings &gt; Pages</strong>.</li>
                  <li>في قائمة <strong>Source</strong>، اختر خيار: <strong>GitHub Actions</strong>.</li>
                  <li>سيقوم GitHub ببناء التطبيق تلقائياً مع كل Push ونشره بنجاح.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Current Diagnostic Status */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h5 className="font-bold text-slate-800">بيانات بيئة التشغيل الحالية:</h5>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600">
              <div>النطاق: <span className="text-slate-900 font-bold">{currentHost}</span></div>
              <div>GitHub Pages: <span className={isCurrentlyOnGitHub ? 'text-emerald-700 font-bold' : 'text-slate-700'}>{isCurrentlyOnGitHub ? 'نعم (مكتشف)' : 'معاينة محلية / Cloud Run'}</span></div>
              <div>المسار الأساسي: <span className="text-slate-900 font-bold">./ (نسبي 100%)</span></div>
              <div>توجيه SPA 404: <span className="text-emerald-700 font-bold">مفعل (public/404.html)</span></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={copyBranchSteps}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'تم نسخ الخطوات!' : 'نسخ التعليمات'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            فهمت ذلك، إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
