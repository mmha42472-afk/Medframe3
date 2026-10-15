import React, { useState, useRef } from 'react';
import { ThemeColor } from '../../types/doctor';
import { getTheme } from '../../utils/theme';
import { DoctorAvatar } from '../Common/DoctorAvatar';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Sparkles, 
  Link, 
  RefreshCw,
  Camera
} from 'lucide-react';

interface DoctorPhotoUploaderProps {
  currentAvatarUrl: string;
  doctorName: string;
  themeColor: ThemeColor;
  onChangeAvatar: (newUrl: string) => void;
}

// Curated high-resolution medical avatars presets
const CURATED_AVATARS = [
  {
    id: 'f-cardio',
    name: 'طبيبة قلب استشارية',
    url: 'https://images.unsplash.com/photo-1594824813576-953e5b3c3b0d?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    id: 'm-surgeon',
    name: 'جراح استشاري',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  },
  {
    id: 'f-pediatric',
    name: 'أخصائية أطفال',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    id: 'm-ophthalmology',
    name: 'طبيب عيون معتمد',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  },
  {
    id: 'f-dermatology',
    name: 'استشارية جلدية وتجميل',
    url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    id: 'm-general',
    name: 'طبيب أسنان وأورام',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  }
];

export const DoctorPhotoUploader: React.FC<DoctorPhotoUploaderProps> = ({
  currentAvatarUrl,
  doctorName,
  themeColor,
  onChangeAvatar
}) => {
  const theme = getTheme(themeColor);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeMode, setActiveMode] = useState<'upload' | 'preset' | 'url'>('upload');

  // Compress & convert file to clean base64 data URL
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 10MB input
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميغابايت.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to scale down to 500x500 for crisp, lightweight storage
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed WebP or JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChangeAvatar(dataUrl);
        }
        setIsProcessing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      onChangeAvatar(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-5" dir="rtl">
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-700" />
            <span>صورة الطبيب الشخصية (Doctor Profile Picture)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            ارفع صورتك من جهازك، أو اختر صورة طبية جاهزة، أو استخدم رابطاً خارجياً
          </p>
        </div>

        {currentAvatarUrl && (
          <button
            type="button"
            onClick={() => onChangeAvatar('')}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الصورة والرجوع للمونوغرام"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>إزالة الصورة</span>
          </button>
        )}
      </div>

      {/* Main Avatar Preview + Selector Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/60">
        
        {/* Live Preview Avatar */}
        <div className="relative group shrink-0">
          <DoctorAvatar
            name={doctorName || 'دكتور'}
            avatarUrl={currentAvatarUrl}
            themeColor={themeColor}
            size="2xl"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-opacity backdrop-blur-xs"
          >
            <Upload className="w-5 h-5 mb-1 text-teal-300" />
            <span>تغيير الصورة</span>
          </div>
        </div>

        {/* Upload Mode Selector */}
        <div className="flex-1 w-full space-y-3">
          
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'upload' ? 'bg-teal-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع من الجهاز</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('preset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'preset' ? 'bg-teal-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>معرض النماذج الطبية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'url' ? 'bg-teal-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>رابط صورة URL</span>
            </button>
          </div>

          {/* Mode 1: Local Device Upload */}
          {activeMode === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-3 px-4 border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/40 hover:bg-teal-50 rounded-xl text-xs font-bold text-teal-900 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
                    <span>جاري معالجة الصورة وتحسينها...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-teal-700" />
                    <span>انقر هنا لاختيار صورة من حاسوبك أو هاتفك</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400">يدعم PNG, JPG, WebP. يتم ضغط الصورة تلقائياً لحفظها محلياً وسحابياً بدون بطء.</p>
            </div>
          )}

          {/* Mode 2: Presets Gallery */}
          {activeMode === 'preset' && (
            <div className="space-y-2">
              <span className="text-[11px] text-slate-500 font-medium">اختر صورة متناسقة مع تخصصك:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CURATED_AVATARS.map((preset) => {
                  const isSelected = currentAvatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChangeAvatar(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                        isSelected ? 'border-teal-700 ring-2 ring-teal-500/30' : 'border-slate-200 hover:border-slate-400'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 3: Direct URL */}
          {activeMode === 'url' && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/doctor-photo.jpg"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-left dir-ltr focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                تطبيق الرابط
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
