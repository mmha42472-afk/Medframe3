import React, { useState } from 'react';
import { DoctorProfile } from '../../types/doctor';
import { getTheme } from '../../utils/theme';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  Video
} from 'lucide-react';

interface AppointmentModalProps {
  doctor: DoctorProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ doctor, isOpen, onClose }) => {
  const theme = getTheme(doctor.themeColor);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('مساءً (٤:٠٠ م - ٨:٠٠ م)');
  const [consultationType, setConsultationType] = useState<'clinic' | 'virtual'>('clinic');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const ref = `MED-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);
    setIsSuccess(true);
  };

  const handleWhatsAppConfirm = () => {
    const rawNumber = doctor.clinic.whatsapp.replace(/[^0-9]/g, '');
    const typeLabel = consultationType === 'clinic' ? 'كشف حضوري بالعيادة' : 'استشارة مرئية عن بعد';
    const message = `السلام عليكم ورحمة الله،\nأود تأكيد طلب حجز موعد مع ${doctor.name}\n- رقم الحجز: ${bookingRef}\n- المريض: ${patientName}\n- الجوال: ${patientPhone}\n- نوع الاستشارة: ${typeLabel}\n- التاريخ المفضل: ${preferredDate || 'أقرب موعد متاح'}\n- الفترة: ${preferredTime}\n${notes ? `- ملاحظات: ${notes}` : ''}`;
    
    const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetForm = () => {
    setIsSuccess(false);
    setPatientName('');
    setPatientPhone('');
    setPreferredDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">طلب حجز موعد كشف واستشارة</h3>
            <p className="text-xs text-slate-500">{doctor.name} · {doctor.clinic.name}</p>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">تم تسجيل طلب الموعد بنجاح!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  رقم المرجع الطبي: <span className="font-mono font-bold text-slate-800">{bookingRef}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم المريض:</span>
                  <span className="font-semibold text-slate-800">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نوع الكشف:</span>
                  <span className="font-semibold text-slate-800">
                    {consultationType === 'clinic' ? 'كشف بالعيادة' : 'استشارة مرئية عن بعد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الموعد المقترح:</span>
                  <span className="font-semibold text-slate-800">{preferredDate || 'أقرب موعد'} ({preferredTime})</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleWhatsAppConfirm}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تأكيد الموعد فوراً عبر واتساب العيادة</span>
                </button>
                <button
                  onClick={resetForm}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Consultation Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">نوع الاستشارة المطلوبة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('clinic')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      consultationType === 'clinic'
                        ? 'border-teal-700 bg-teal-50/70 text-teal-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <span>كشف حضوري بالعيادة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('virtual')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      consultationType === 'virtual'
                        ? 'border-teal-700 bg-teal-50/70 text-teal-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-teal-700" />
                    <span>استشارة مرئية (عن بُعد)</span>
                  </button>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="patient-name" className="block text-xs font-semibold text-slate-700">
                    اسم المريض الكامل *
                  </label>
                  <div className="relative">
                    <input
                      id="patient-name"
                      type="text"
                      required
                      placeholder="مثال: عبد الله السالم"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none placeholder:text-slate-600"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="patient-phone" className="block text-xs font-semibold text-slate-700">
                    رقم الجوال *
                  </label>
                  <div className="relative">
                    <input
                      id="patient-phone"
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none text-left font-mono placeholder:text-slate-600"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="preferred-date" className="block text-xs font-semibold text-slate-700">
                    التاريخ المفضل
                  </label>
                  <div className="relative">
                    <input
                      id="preferred-date"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="preferred-time" className="block text-xs font-semibold text-slate-700">
                    الفترة المفضلة
                  </label>
                  <div className="relative">
                    <select
                      id="preferred-time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none"
                    >
                      <option value="مساءً (٤:٠٠ م - ٨:٠٠ م)">الفترة المسائية (٤:٠٠ م - ٨:٠٠ م)</option>
                      <option value="صباحاً (١٠:٠٠ ص - ١:٠٠ م)">الفترة الصباحية (١٠:٠٠ ص - ١:٠٠ م)</option>
                      <option value="أقرب موعد متاح">أقرب موعد متاح في العيادة</option>
                    </select>
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="booking-notes" className="block text-xs font-semibold text-slate-700">
                  سبب الزيارة أو الأعراض (اختياري)
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  placeholder="وصف مختصر للشكوى الطبية أو السؤال للاستشاري..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none placeholder:text-slate-600"
                ></textarea>
              </div>

              {/* Clinic Confirmation Note */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                سيتواصل معك منسق المواعيد بالعيادة هاتفياً أو عبر واتساب لتأكيد الساعة الدقيقة قبل الزيارة.
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${theme.buttonClass}`}
                >
                  إرسال طلب الحجز
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
