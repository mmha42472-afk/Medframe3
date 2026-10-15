export type ThemeColor = 'teal' | 'navy' | 'emerald' | 'rose' | 'plum' | 'amethyst' | 'obsidian' | 'bronze';
export type DoctorStatus = 'draft' | 'published' | 'archived';
export type SectionBgStyle = 'default' | 'white' | 'subtle' | 'tinted' | 'dark' | 'glass';

export interface MedicalQualification {
  id: string;
  degree: string;
  degreeEn?: string;
  institution: string;
  institutionEn?: string;
  year: string;
  isFellowship?: boolean;
}

export interface CareerMilestone {
  id: string;
  role: string;
  roleEn?: string;
  hospital: string;
  hospitalEn?: string;
  period: string;
  periodEn?: string;
  description?: string;
  descriptionEn?: string;
}

export interface MedicalService {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price?: number;
  durationMinutes?: number;
  insuranceAccepted?: boolean;
  category?: string;
  categoryEn?: string;
  iconName?: string;
}

export interface MedicalArticle {
  id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  readTimeMinutes: number;
  publishedDate: string;
  category: string;
  categoryEn?: string;
}

export interface PatientFAQ {
  id: string;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
}

export interface PatientTestimonial {
  id: string;
  patientName: string;
  patientNameEn?: string;
  rating: number; // 1 to 5
  comment: string;
  commentEn?: string;
  date: string;
  treatmentType?: string;
  treatmentTypeEn?: string;
  verified?: boolean;
  isApproved?: boolean;
}

export interface ClinicDetails {
  name: string;
  nameEn?: string;
  city: string;
  cityEn?: string;
  address: string;
  addressEn?: string;
  phone: string;
  emergencyPhone?: string;
  whatsapp: string;
  bookingUrl?: string;
  googleMapsUrl?: string;
  workingHours: {
    days: string;
    daysEn?: string;
    hours: string;
    hoursEn?: string;
  }[];
}

export interface DoctorSocialLinks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  website?: string;
  tiktok?: string;
}

export interface DoctorSEO {
  metaTitle: string;
  metaTitleEn?: string;
  metaDescription: string;
  metaDescriptionEn?: string;
  keywords: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  icon?: string;
  tag?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  type: 'cards' | 'text' | 'features' | 'logos' | 'timeline' | 'video';
  bgStyle: SectionBgStyle;
  content?: string;
  contentEn?: string;
  videoUrl?: string;
  items: CustomSectionItem[];
  isVisible: boolean;
  order: number;
}

export interface SectionsVisibility {
  hero: boolean;
  about: boolean;
  qualifications: boolean;
  experience: boolean;
  services: boolean;
  clinic: boolean;
  articles: boolean;
  faqs: boolean;
  testimonials: boolean;
  contact: boolean;
  customSections?: boolean;
}

export interface SectionStyleConfig {
  heroBg?: SectionBgStyle;
  aboutBg?: SectionBgStyle;
  servicesBg?: SectionBgStyle;
  qualificationsBg?: SectionBgStyle;
  clinicBg?: SectionBgStyle;
  articlesBg?: SectionBgStyle;
  faqsBg?: SectionBgStyle;
  testimonialsBg?: SectionBgStyle;
  customHexPrimary?: string;
  customHexSecondary?: string;
  borderRadius?: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
}

export interface DoctorProfile {
  id: string;
  slug: string;
  name: string; // Arabic name
  nameEn?: string; // English name
  title: string;
  titleEn?: string;
  specialty: string;
  specialtyEn?: string;
  subspecialties: string[];
  subspecialtiesEn?: string[];
  licenseNumber: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  bioEn?: string;
  statement: string;
  statementEn?: string;
  themeColor: ThemeColor;
  customStyles?: SectionStyleConfig;
  status: DoctorStatus;
  qualifications: MedicalQualification[];
  experience: CareerMilestone[];
  clinic: ClinicDetails;
  services: MedicalService[];
  articles: MedicalArticle[];
  faqs: PatientFAQ[];
  testimonials: PatientTestimonial[];
  customSections?: CustomSection[];
  socialLinks: DoctorSocialLinks;
  seo: DoctorSEO;
  sectionsConfig: SectionsVisibility;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ConsultationBooking {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: 'clinic' | 'virtual';
  serviceName?: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  isDemo?: boolean;
}
