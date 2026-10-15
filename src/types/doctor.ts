export type ThemeColor = 'teal' | 'navy' | 'emerald' | 'rose' | 'plum';
export type DoctorStatus = 'draft' | 'published' | 'archived';

export interface MedicalQualification {
  id: string;
  degree: string; // e.g. بكالوريوس الطب والجراحة
  institution: string; // e.g. جامعة الملك سعود
  year: string; // e.g. 2012
  isFellowship?: boolean;
}

export interface CareerMilestone {
  id: string;
  role: string; // e.g. رئيس قسم القسطرة التداخلية
  hospital: string; // e.g. مستشفى الملك فيصل التخصصي
  period: string; // e.g. 2018 - الآن
  description?: string;
}

export interface MedicalService {
  id: string;
  name: string;
  description: string;
  price?: number;
  durationMinutes?: number;
  insuranceAccepted?: boolean;
  category?: string;
}

export interface MedicalArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  readTimeMinutes: number;
  publishedDate: string;
  category: string;
}

export interface PatientFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PatientTestimonial {
  id: string;
  patientName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  treatmentType?: string;
}

export interface ClinicDetails {
  name: string;
  city: string;
  address: string;
  phone: string;
  emergencyPhone?: string;
  whatsapp: string;
  bookingUrl?: string;
  googleMapsUrl?: string;
  workingHours: {
    days: string;
    hours: string;
  }[];
}

export interface DoctorSocialLinks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  website?: string;
}

export interface DoctorSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface CustomDoctorSection {
  id: string;
  title: string;
  body: string;
  backgroundColor: string;
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
}

export interface DoctorProfile {
  id: string;
  slug: string;
  name: string; // Arabic name
  nameEn?: string; // English name
  title: string; // e.g. استشارية جراحة القلب والقسطرة
  specialty: string;
  subspecialties: string[];
  licenseNumber: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  statement: string; // Personal statement / motto
  themeColor: ThemeColor;
  status: DoctorStatus;
  qualifications: MedicalQualification[];
  experience: CareerMilestone[];
  clinic: ClinicDetails;
  services: MedicalService[];
  articles: MedicalArticle[];
  faqs: PatientFAQ[];
  testimonials: PatientTestimonial[];
  socialLinks: DoctorSocialLinks;
  seo: DoctorSEO;
  sectionsConfig: SectionsVisibility;
  sectionColors?: Record<string, string>;
  customSections?: CustomDoctorSection[];
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean; // marks if this record came from seed
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
  notes?: string;
  createdAt: string;
  status: 'pending' | 'confirmed';
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  isDemo?: boolean;
}
