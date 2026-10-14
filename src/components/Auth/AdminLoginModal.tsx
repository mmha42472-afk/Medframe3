import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  KeyRound
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { sendEmailLink, loginWithGoogle, loginAsDemoAdmin, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSentSuccess, setLinkSentSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLocalError('يرجى إدخال عنوان بريد إلكتروني صالح.');
      return;
    }

    setSendingLink(true);
    setLocalError(null);
    clearError();

    try {
      await sendEmailLink(email.trim());
      setLinkSentSuccess(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'تعذر إرسال الرابط.');
    } finally {
      setSendingLink(false);
    }
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'فشل تسجيل الدخول بحساب Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">دخول المسؤول (Admin Access)</h3>
              <p className="text-xs text-slate-500">نظام المصادقة المشفر والتحقق من الصلاحيات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {(localError || error) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {linkSentSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">تم إرسال الرابط الآمن بنجاح!</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                أرسلنا رابط تسجيل الدخول بدون كلمة مرور إلى <strong className="text-slate-900">{email}</strong>. انقر على الرابط الموجود في رسالتك لإكمال الدخول.
              </p>
              <button
                onClick={() => setLinkSentSuccess(false)}
                className="text-xs font-semibold text-teal-800 hover:text-teal-900 underline mt-2"
              >
                إرسال إلى بريد آخر
              </button>
            </div>
          ) : (
            <>
              {/* Option 1: Passwordless Email Link */}
              <form onSubmit={handleSendLink} className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="admin-email" className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>رابط الدخول بدون كلمة مرور (Email Link)</span>
                  </label>
                  <span className="text-[11px] text-slate-600">موثق في فايربيس</span>
                </div>

                <div className="relative">
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mmha42472@gmail.com أو بريدك المسجل"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingLink}
                  className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingLink ? 'جارٍ إرسال الرابط...' : 'إرسال رابط الدخول المشفر'}</span>
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">أو عبر خيارات الدخول السريع</span>
              </div>

              {/* Option 2: Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>تسجيل الدخول باستخدام Google</span>
              </button>

              {/* Option 3: Instant Sandbox Demo Admin Mode */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>صلاحية فورية للمعاينة (Sandbox Admin)</span>
                  </div>
                  <span className="text-[10px] bg-teal-100/80 text-teal-800 px-1.5 py-0.5 rounded font-mono">
                    admin: true
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  يتيح لك تفقد لوحة التحكم والمحرر وإدارة الأطباء دون الحاجة لتأكيد البريد الخارجي داخل نافذة المعاينة.
                </p>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="w-full py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>تفعيل الدخول كمسؤول معتمد</span>
                </button>
              </div>
            </>
          )}

          {/* Security claim assurance */}
          <div className="pt-2 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>يتم التحقق من دعوى المسؤولية (custom claim: admin) وقواعد Firestore المشددة.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
