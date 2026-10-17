import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Heart,
  Award,
  Sparkles,
  Activity,
  Syringe,
  Eye,
  Smile,
  Brain,
  Baby,
  Bone,
  Pill,
  Building,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  BadgeCheck,
  UserCheck
} from 'lucide-react';

export interface MedicalIconOption {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
}

export const AVAILABLE_HERO_ICONS: MedicalIconOption[] = [
  { id: 'shield', nameAr: 'درع الترخيص والتوثيق', nameEn: 'Certified Shield', category: 'اعتماد' },
  { id: 'stethoscope', nameAr: 'سماعة الطبيب', nameEn: 'Stethoscope', category: 'عام' },
  { id: 'heart', nameAr: 'نبض وصحة القلب', nameEn: 'Cardio Pulse', category: 'باطنية وقلب' },
  { id: 'award', nameAr: 'وسام التميز والخبرة', nameEn: 'Excellence Award', category: 'شهادات' },
  { id: 'badge', nameAr: 'شارة التوثيق الرسمي', nameEn: 'Official Badge', category: 'اعتماد' },
  { id: 'sparkles', nameAr: 'جودة ورعاية فائقة', nameEn: 'Premium Quality', category: 'تجميل وتميز' },
  { id: 'activity', nameAr: 'مخطط النشاط والفحوصات', nameEn: 'Vital Activity', category: 'تشخيص' },
  { id: 'eye', nameAr: 'طب وجراحة العيون', nameEn: 'Ophthalmology', category: 'عيون' },
  { id: 'smile', nameAr: 'طب وتجميل الأسنان', nameEn: 'Dental & Smile', category: 'أسنان' },
  { id: 'brain', nameAr: 'مخ وأعصاب ونفسية', nameEn: 'Neurology', category: 'أعصاب' },
  { id: 'baby', nameAr: 'طب الأطفال وحديثي الولادة', nameEn: 'Pediatrics', category: 'أطفال' },
  { id: 'bone', nameAr: 'جراحة العظام والمفاصل', nameEn: 'Orthopedics', category: 'عظام' },
  { id: 'syringe', nameAr: 'حقن وعلاجات تخصصية', nameEn: 'Clinical Procedures', category: 'إجراءات' },
  { id: 'pill', nameAr: 'علاج دوائي وصيدلة', nameEn: 'Pharmacology', category: 'علاج' },
  { id: 'building', nameAr: 'مستشفى ومركز طبي', nameEn: 'Medical Center', category: 'مراكز' },
  { id: 'clock', nameAr: 'مواعيد واستشارات دقيقة', nameEn: 'Appointments & Care', category: 'مواعيد' },
  { id: 'star', nameAr: 'تقييم ونجم الجودة', nameEn: 'Top Rated', category: 'تقييم' }
];

interface MedicalHeroIconProps {
  iconId?: string;
  className?: string;
}

export const MedicalHeroIcon: React.FC<MedicalHeroIconProps> = ({ iconId = 'shield', className = 'w-4 h-4' }) => {
  switch (iconId) {
    case 'stethoscope':
      return <Stethoscope className={className} />;
    case 'heart':
      return <HeartPulse className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'badge':
      return <BadgeCheck className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'eye':
      return <Eye className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'baby':
      return <Baby className={className} />;
    case 'bone':
      return <Bone className={className} />;
    case 'syringe':
      return <Syringe className={className} />;
    case 'pill':
      return <Pill className={className} />;
    case 'building':
      return <Building className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'usercheck':
      return <UserCheck className={className} />;
    case 'check':
      return <CheckCircle2 className={className} />;
    case 'shield':
    default:
      return <ShieldCheck className={className} />;
  }
};
