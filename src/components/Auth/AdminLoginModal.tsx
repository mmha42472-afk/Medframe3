import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isCustomConfigSaved } from '../../firebase/config';
import { 
  X, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  Flame,
  Settings,
  ArrowRight
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFirebaseModal?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenFirebaseModal 
}) => {
  const { 
    loginWithEmailPassword, 
    registerWithEmailPassword, 
    sendEmailLink, 
    loginWithGoogle, 
    loginAsDemoAdmin, 
    error, 
    clearError 
  } = useAuth();

  // Mode: email-password, email-link, or demo
  const [authMethod, setAuthMethod] = useState<'password' | 'link'>('password');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSentSuccess, setLinkSentSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const hasCustomFirebase = isCustomConfigSaved();

  if (!isOpen) return null;

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLocalError('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      if (isRegisterMode) {
        await registerWithEmailPassword(email.trim(), password);
      } else {
        await loginWithEmailPassword(email.trim(), password);
      }
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'فشل تسجيل الدخول.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLocalError('يرجى إدخال عنوان بريد إلكتروني صالح.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      await sendEmailLink(email.trim());
      setLinkSentSuccess(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'تعذر إرسال الرابط.');
    } finally {
      setIsSubmitting(false);
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
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">دخول المسؤول (Admin Access)</h3>
              <p className="text-xs text-slate-500">نظام تسجيل الدخول المشفر وإدارة عيادات الأطباء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* STEP 1: Add Firebase Info First Banner */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            hasCustomFirebase 
              ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  hasCustomFirebase ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">
                      {hasCustomFirebase 
                        ? 'مشروع فايربيس الخاص بك متصل ومفعّل' 
                        : 'هل تريد إدخال بيانات مشروع Firebase أولاً؟'}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      hasCustomFirebase 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {hasCustomFirebase ? 'Custom Active' : 'اختياري أو مستحسن'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {hasCustomFirebase
                      ? 'يتم استخدام مفاتيح API وقاعدة البيانات الخاصة بك في تسجيل الدخول وحفظ بيانات الأطباء.'
                      : 'يمكنك إدخال مفاتيح API الخاصة بمشروعك (API Key, Project ID) قبل الدخول لربط قاعدة بياناتك الحقيقية مباشرة.'}
                  </p>
                </div>
              </div>

              {onOpenFirebaseModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFirebaseModal();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-sm ${
                    hasCustomFirebase 
                      ? 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{hasCustomFirebase ? 'تعديل الإعدادات' : 'إدخال مفاتيح فايربيس'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Errors */}
          {(localError || error) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{localError || error}</div>
            </div>
          )}

          {/* Auth Method Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setLocalError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'password'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>البريد وكلمة المرور</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('link');
                setLocalError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'link'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>رابط سحري بدون كلمة مرور</span>
            </button>
          </div>

          {/* TAB 1: Email and Password Authentication */}
          {authMethod === 'password' && (
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {isRegisterMode ? 'إنشاء حساب مسؤول جديد' : 'تسجيل الدخول بالبريد وكلمة المرور'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setLocalError(null);
                  }}
                  className="text-teal-800 hover:text-teal-900 font-semibold underline text-[11px]"
                >
                  {isRegisterMode ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                </button>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  البريد الإلكتروني (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pr-9 pl-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition-all placeholder:text-slate-400 text-left dir-ltr"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    كلمة المرور (Password)
                  </label>
                  {!isRegisterMode && (
                    <span className="text-[11px] text-slate-500">6 خانات على الأقل</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pr-9 pl-10 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition-all placeholder:text-slate-400 text-left dir-ltr font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isRegisterMode ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting 
                    ? 'جاري التحقق والمصادقة...' 
                    : isRegisterMode 
                      ? 'إنشاء حساب المسؤول والدخول' 
                      : 'تسجيل الدخول إلى لوحة التحكم'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 2: Magic Email Link */}
          {authMethod === 'link' && (
            <div className="space-y-4">
              {linkSentSuccess ? (
                <div className="text-center py-4 space-y-3 bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">تم إرسال رابط الدخول المشفر!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    أرسلنا رابط تسجيل الدخول بدون كلمة مرور إلى <strong className="text-slate-900 dir-ltr inline-block">{email}</strong>. انقر على الرابط الموجود في صندوق الوارد لإكمال الدخول.
                  </p>
                  <button
                    onClick={() => setLinkSentSuccess(false)}
                    className="text-xs font-semibold text-teal-800 hover:text-teal-900 underline mt-2"
                  >
                    إرسال إلى بريد آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendLink} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      البريد الإلكتروني للرابط السحري
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mmha42472@gmail.com أو بريدك المسجل"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition-all placeholder:text-slate-400 text-left dir-ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جارٍ إرسال الرابط...' : 'إرسال رابط الدخول بدون كلمة مرور'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Alternative Options */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium whitespace-nowrap">
              أو عبر خيارات الدخول السريع
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>دخول بحساب Google</span>
            </button>

            {/* Sandbox Demo Admin Mode */}
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>دخول سريع للمعاينة (Sandbox)</span>
            </button>
          </div>

          {/* Security note */}
          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>تسجيل الدخول مشفر عبر بروتوكول TLS مع تطبيق قواعد Firestore الصارمة للمسؤولين.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
