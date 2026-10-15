import React, { useState } from 'react';
import { PatientTestimonial, ThemeColor } from '../../types/doctor';
import { getTheme } from '../../utils/theme';
import { 
  Star, 
  X, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  HeartHandshake,
  ShieldCheck 
} from 'lucide-react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  themeColor: ThemeColor;
  onAddReview: (review: PatientTestimonial) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  themeColor,
  onAddReview
}) => {
  const theme = getTheme(themeColor);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !comment.trim()) return;

    const newReview: PatientTestimonial = {
      id: `rev-${Date.now()}`,
      patientName: patientName.trim(),
      rating,
      comment: comment.trim(),
      treatmentType: treatmentType.trim() || 'كشف واستشارة طبية',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      verified: true,
      isApproved: true
    };

    onAddReview(newReview);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      // Reset form
      setPatientName('');
      setTreatmentType('');
      setComment('');
      setRating(5);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${theme.heroGradient} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute left-5 top-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <HeartHandshake className="w-5 h-5 text-teal-300" />
            <h3 className="text-base font-bold">إضافة تقييم وتجربة علاجية</h3>
          </div>
          <p className="text-xs text-white/80">
            شارك رأيك وتجربتك مع {doctorName} لمساعدة المرضى الآخرين
          </p>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">شكراً لك على تقييمك!</h4>
            <p className="text-xs text-slate-500">
              تم تسجيل تقييمك وإضافته بنجاح إلى سجل تجارب المرضى في موقع الطبيب.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
            
            {/* Interactive Stars */}
            <div className="space-y-1.5 text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">تقييمك العام للخدمة والرعاية:</label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-bold text-teal-800">
                {rating === 5 ? 'ممتاز جداً (5/5)' : rating === 4 ? 'جيد جداً (4/5)' : rating === 3 ? 'متوسط (3/5)' : 'يحتاج تحسين'}
              </span>
            </div>

            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>اسم المريض / المراجع</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="مثال: عبدالمحسن الشمري"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
            </div>

            {/* Treatment Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>نوع العلاج أو الاستشارة</span>
              </label>
              <input
                type="text"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                placeholder="مثال: فحص دوري شامل، متابعة ضغط، عملية جراحية"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>تفاصيل التجربة ورأيك في الرعاية</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب عن دقة التشخيص، تعامل الطبيب والطاقم الطبي، النتيجة العلاجية..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${theme.buttonClass}`}
              >
                إرسال التقييم
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
