import React, { useState } from 'react';
import { ThemeColor } from '../../types/doctor';
import { getTheme } from '../../utils/theme';

interface DoctorAvatarProps {
  name: string;
  avatarUrl?: string;
  themeColor?: ThemeColor;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  name,
  avatarUrl,
  themeColor = 'teal',
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const theme = getTheme(themeColor);

  const getInitials = (fullName: string) => {
    const cleaned = fullName.replace(/^(د\.?|الدكتور|الدكتورة|Dr\.?)\s+/i, '').trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]} ${parts[parts.length - 1][0]}`;
    }
    return cleaned.slice(0, 2) || 'طب';
  };

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 md:w-40 md:h-40 text-2xl md:text-3xl'
  };

  const hasValidImage = Boolean(avatarUrl && avatarUrl.trim().length > 5 && !imgError);

  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden rounded-2xl shrink-0 bg-slate-100 border border-slate-200/80 shadow-sm ${sizeClasses[size]} ${className}`}>
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  // Resilient SVG clinical monogram fallback
  return (
    <div 
      className={`relative flex items-center justify-center font-bold tracking-tight rounded-2xl select-none shrink-0 shadow-sm border border-slate-200/80 text-white ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%)`
      }}
      aria-label={name}
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span>{getInitials(name)}</span>
      </div>

      {/* Subtle clinical cross icon in background */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none p-2" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
      </svg>
    </div>
  );
};
