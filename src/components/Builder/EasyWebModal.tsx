import React, { useState } from 'react';
import { DoctorProfile, ThemeColor } from '../../types/doctor';
import { THEME_PALETTES } from '../../utils/theme';
import { AVAILABLE_HERO_ICONS } from '../Common/MedicalHeroIcon';
import { 
  Sparkles, 
  X, 
  Check, 
  Stethoscope, 
  Building, 
  Phone, 
  Calendar, 
  DollarSign, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface EasyWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (doctor: DoctorProfile, openDirectlyInBuilder?: boolean) => void;
  existingDoctor?: DoctorProfile | null;
}

interface SpecialtyTemplate {
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  heroIcon: string;
  badgeText: string;
  badgeTextEn: string;
  subspecialties: string[];
  subspecialtiesEn: string[];
  bioSnippet: string;
  bioSnippetEn: string;
  qualifications: { degree: string; institution: string; year: number }[];
  services: { name: string; price: number; duration: number }[];
  faqs: { q: string; a: string }[];
}

const PRESET_SPECIALTIES: Record<string, SpecialtyTemplate> = {
  cardiology: {
    name: 'أمراض وجراحة القلب والأوعية الدموية',
    nameEn: 'Cardiology & Vascular Medicine',
    title: 'استشاري أمراض وقسطرة القلب والأوعية الدموية',
    titleEn: 'Consultant Interventional Cardiologist',
    heroIcon: 'heart',
    badgeText: 'استشاري معتمد لدى الجمعية الطبية',
    badgeTextEn: 'Certified Cardiology Consultant',
    subspecialties: ['قسطرة القلب التداخلية', 'تصوير صدى القلب ثلاثي الأبعاد', 'علاج قصور القلب واضطراب النبض', 'فحص الجهد وضغط الدم'],
    subspecialtiesEn: ['Interventional Catheterization', 'Echocardiography 3D', 'Heart Failure Management', 'Stress ECG & Hypertension'],
    bioSnippet: 'استشاري متخصص في تشخيص وعلاج أمراض الشرايين التاجية، تركيب الدعامات الذكية، وفحوصات القلب المتقدمة بأحدث التقنيات الطبية.',
    bioSnippetEn: 'Senior consultant specializing in coronary artery diagnostics, coronary stenting, and advanced cardiac imaging with international certifications.',
    qualifications: [
      { degree: 'دكتوراه أمراض القلب والأوعية الدموية', institution: 'كلية الطب - جامعة القاهرة', year: 2012 },
      { degree: 'زمالة الكلية الملكية للأطباء (MRCP)', institution: 'لندن - المملكة المتحدة', year: 2016 },
      { degree: 'عضوية الجمعية الأوروبية لأمراض القلب (ESC)', institution: 'الأكاديمية الأوروبية', year: 2019 }
    ],
    services: [
      { name: 'فحص القلب الشامل وتخطيط الجهد (ECG)', price: 500, duration: 30 },
      { name: 'إيكو القلب التلفزيوني الملون (Echocardiogram)', price: 850, duration: 40 },
      { name: 'تركيب ومتابعة جهاز هولتر ضغط ونبض (Holter 48h)', price: 1100, duration: 25 },
      { name: 'استشارة فحص ما بعد القسطرة والدعامات', price: 650, duration: 30 }
    ],
    faqs: [
      { q: 'متى يجب عليّ إجراء فحص إيكو للقلب؟', a: 'يُنصح به عند الشعور بضيق في التنفس مع المجهود، ألم الصدر، تسارع النبض غير المبرر، أو كفحص وقائي لمرضى السكري والضغط.' },
      { q: 'هل يتطلب فحص الجهد تحضيرات خاصة؟', a: 'يُفضل ارتداء ملابس رياضية مريحة والامتناع عن تناول وجبات ثقيلة أو مشروبات كافيين قبل الفحص بساعتين.' }
    ]
  },
  dentistry: {
    name: 'طب وجراحة وتجميل الأسنان',
    nameEn: 'Dentistry & Oral Surgery',
    title: 'استشاري زراعة وتجميل الأسنان وهوليوود سمايل',
    titleEn: 'Consultant Implantologist & Cosmetic Dentist',
    heroIcon: 'smile',
    badgeText: 'أخصائي زراعة وتجميل معتمد',
    badgeTextEn: 'Certified Implantology Specialist',
    subspecialties: ['زراعة الأسنان الفورية بدون جراحة', 'عدسات الأسنان الفينير واللومينير', 'علاج وتجميل اللثة بالليزر', 'علاج العصب والجذور الميكروسكوبي'],
    subspecialtiesEn: ['Immediate Dental Implants', 'Porcelain Veneers & Lumineers', 'Laser Periodontal Care', 'Microscopic Endodontics'],
    bioSnippet: 'خبرة متقدمة في تصميم الابتسامة الرقمية (Digital Smile Design)، زراعة الأسنان الألمانية والسويسرية، وعلاجات الأسنان الخالية من الألم.',
    bioSnippetEn: 'Advanced experience in Digital Smile Design, Swiss & German dental implants, and completely pain-free microscopic restorative dentistry.',
    qualifications: [
      { degree: 'ماجستير جراحة وزراعة الأسنان', institution: 'جامعة عين شمس', year: 2014 },
      { degree: 'دبلوم تجميل وتصميم الابتسامة بالليزر', institution: 'الأكاديمية الأمريكية لتجميل الأسنان (AACD)', year: 2018 },
      { degree: 'الزمالة الدولية لزراعة الأسنان (ICOI)', institution: 'الولايات المتحدة الأمريكية', year: 2021 }
    ],
    services: [
      { name: 'كشف وتشخيص بالمسح الرقمي ثلاثي الأبعاد', price: 350, duration: 20 },
      { name: 'تنظيف وتلميع الأسنان وإزالة الجير بالموجات', price: 600, duration: 30 },
      { name: 'تبييض الأسنان بالليزر وجلسة فلورايد', price: 1800, duration: 45 },
      { name: 'زراعة الأسنان الفورية مع تاج زيركون ألماني', price: 6500, duration: 60 }
    ],
    faqs: [
      { q: 'هل عملية زراعة الأسنان مؤلمة؟', a: 'تتم الزراعة تحت التخدير الموضعي المتطور وبدون أي ألم، وتستغرق الغرسة الواحدة أقل من 15 دقيقة فقط.' },
      { q: 'كم تدوم عدسات الأسنان (الفينير)؟', a: 'مع العناية المنزلية المنتظمة والمتابعة الدورية، تدوم عدسات الفينير عالية الجودة من 10 إلى 15 عاماً دون تغير في اللون.' }
    ]
  },
  ophthalmology: {
    name: 'طب وجراحة العيون والليزر',
    nameEn: 'Ophthalmology & Lasik Surgery',
    title: 'استشاري طب وجراحة العيون وتصحيح الإبصار بالليزر',
    titleEn: 'Consultant Ophthalmologist & Refractive Surgeon',
    heroIcon: 'eye',
    badgeText: 'جراح عيون معتمد واستشاري ليزك',
    badgeTextEn: 'Certified Refractive Eye Surgeon',
    subspecialties: ['تصحيح الإبصار بالفيمتو ليزك والفيمتو سمايل', 'جراحة المياه البيضاء بالموجات فوق الصوتية', 'علاج القرنية المخروطية وتثبيتها', 'علاج اعتلال الشبكية السكري بالليزر'],
    subspecialtiesEn: ['Femto-LASIK & Femto-SMILE', 'Cataract Phacoemulsification', 'Keratoconus Cross-Linking', 'Diabetic Retinopathy Management'],
    bioSnippet: 'استشاري رائد في تقنيات الفيمتو ليزك والمياه البيضاء، مع إجراء أكثر من 5000 عملية ناجحة لتصحيح عيوب الإبصار.',
    bioSnippetEn: 'Leading eye surgeon specializing in Femto-LASIK, laser refractive correction, and micro-incision cataract surgery with over 5,000 successful procedures.',
    qualifications: [
      { degree: 'دكتوراه طب وجراحة العيون', institution: 'كلية الطب - جامعة الإسكندرية', year: 2013 },
      { degree: 'زمالة كلية الجراحين الملكية للعيون (FRCS)', institution: 'غلاسكو - المملكة المتحدة', year: 2017 },
      { degree: 'عضوية الجمعية الدولية لجراحي تصحيح الإبصار (ISRS)', institution: 'الولايات المتحدة الأمريكية', year: 2020 }
    ],
    services: [
      { name: 'كشف وفحص قاع العين وضغط العين الرقمي', price: 450, duration: 25 },
      { name: 'فحص خريطة القرنية وتصوير مقطعي (Pentacam)', price: 700, duration: 20 },
      { name: 'عملية تصحيح الإبصار بالفيمتو ليزك (للعينين)', price: 8500, duration: 30 },
      { name: 'جلسة ليزر لعلاج الشبكية أو مسح العدسة', price: 1500, duration: 20 }
    ],
    faqs: [
      { q: 'ما هو السن المناسب لإجراء الفيمتو ليزك؟', a: 'يُفضل أن يكون عمر المريض 18 عاماً فأكثر مع ثبات في مقاس النظر لمدة 6 أشهر على الأقل.' },
      { q: 'متى يمكنني العودة للعمل بعد الليزك؟', a: 'يستطيع معظم المرضى استئناف الأنشطة اليومية الخفيفة والعمل المكتبي في اليوم التالي مباشرة.' }
    ]
  },
  orthopedics: {
    name: 'جراحة العظام والمفاصل والعمود الفقري',
    nameEn: 'Orthopedics & Spine Surgery',
    title: 'استشاري جراحة العظام ومناظير المفاصل والإصابات الرياضية',
    titleEn: 'Consultant Orthopedic & Arthroscopic Surgeon',
    heroIcon: 'bone',
    badgeText: 'استشاري مناظير ومفاصل معتمد',
    badgeTextEn: 'Certified Orthopedic Specialist',
    subspecialties: ['مناظير الركبة والكتف وإعادة بناء الرباط الصليبي', 'استبدال مفاصل الركبة والحوض بمفاصل صناعية متطورة', 'علاج الانزلاق الغضروفي وآلام العمود الفقري', 'حقن البلازما الغنية بالصفائح (PRP) والجيل للمفاصل'],
    subspecialtiesEn: ['Knee & Shoulder Arthroscopy / ACL', 'Total Knee & Hip Replacement', 'Spine Disc Care & Pain Management', 'Regenerative Joint Injections & PRP'],
    bioSnippet: 'استشاري متخصص في علاج خشونة المفاصل وإصابات الملاعب، وتقديم أحدث بروتوكولات العلاج التحفظي والجراحي الدقيق.',
    bioSnippetEn: 'Specialist in joint degeneration, sports trauma rehabilitation, and minimally invasive joint replacement surgeries.',
    qualifications: [
      { degree: 'دكتوراه جراحة العظام والمفاصل', institution: 'كلية الطب - جامعة المنصورة', year: 2011 },
      { degree: 'زمالة الجمعية الأوروبية لجراحة الركبة والمناظير (ESSKA)', institution: 'أوروبا', year: 2015 },
      { degree: 'عضوية الأكاديمية الأمريكية لجراحي العظام (AAOS)', institution: 'الولايات المتحدة', year: 2019 }
    ],
    services: [
      { name: 'كشف عظام وفحص حركي شامل للمفاصل', price: 450, duration: 25 },
      { name: 'حقن المفاصل بالبلازما الغنية بالصفائح (PRP)', price: 1200, duration: 30 },
      { name: 'حقن حمض الهيالورونيك (الزيت) للركبة', price: 1600, duration: 20 },
      { name: 'برنامج تأهيلي مخصص لما بعد جراحات المفاصل', price: 800, duration: 40 }
    ],
    faqs: [
      { q: 'ما هي مؤشرات حقن البلازما لمفصل الركبة؟', a: 'تُفيد حقن البلازما في حالات خشونة المفاصل من الدرجة الخفيفة والمتوسطة، والتهابات الأوتار وإصابات الغضاريف، وتساعد على تقليل الألم وتجديد الأنسجة.' },
      { q: 'متى يتطلب الانزلاق الغضروفي تدخلاً جراحياً؟', a: 'في حالات ضعف عضلات القدم أو فقدان التحكم، أو عند استمرار الألم الشديد رغم العلاج الدوائي والطبيعي لمدة تتجاوز 6 أسابيع.' }
    ]
  },
  pediatrics: {
    name: 'طب الأطفال وحديثي الولادة',
    nameEn: 'Pediatrics & Neonatology',
    title: 'استشاري طب الأطفال وحديثي الولادة ورعاية النمو',
    titleEn: 'Consultant Pediatrician & Neonatologist',
    heroIcon: 'baby',
    badgeText: 'استشاري طب أطفال ونمو معتمد',
    badgeTextEn: 'Certified Pediatric Specialist',
    subspecialties: ['فحص نمو وتطور الرضع وحديثي الولادة', 'حساسية الصدر والجهاز التنفسي عند الأطفال', 'التطعيمات الدورية والإضافية المعتمدة', 'علاج سوء التغذية وضعف الشهية ومشاكل الهضم'],
    subspecialtiesEn: ['Neonatal Growth & Development', 'Pediatric Asthma & Allergies', 'Routine & Optional Immunizations', 'Childhood Nutrition & Digestive Health'],
    bioSnippet: 'رعاية صحية حنونة ومتكاملة لأطفالكم منذ لحظة الولادة وحتى سن المراهقة، مع متابعة دقيقة لمؤشرات النمو والذكاء والمناعة.',
    bioSnippetEn: 'Compassionate, evidence-based pediatric healthcare from newborn stages through adolescence, prioritizing natural growth and preventive care.',
    qualifications: [
      { degree: 'دكتوراه طب الأطفال وحديثي الولادة', institution: 'كلية الطب - جامعة الأزهر', year: 2015 },
      { degree: 'عضوية الكلية الملكية لطب الأطفال (MRCPCH)', institution: 'المملكة المتحدة', year: 2018 },
      { degree: 'دبلوم التغذية العلاجية للأطفال', institution: 'الجمعية الأوروبية للتغذية (ESPEN)', year: 2021 }
    ],
    services: [
      { name: 'كشف أطفال وفحص سريري شامل للنمو والوزن', price: 400, duration: 25 },
      { name: 'جلسة قياس المؤشرات الحيوية وفحص الحساسية', price: 550, duration: 30 },
      { name: 'إعطاء التطعيمات المعتمدة مع دفتر متابعة رسمي', price: 450, duration: 20 },
      { name: 'استشارة تغذية ومشاكل نمو الرضع والأطفال', price: 500, duration: 30 }
    ],
    faqs: [
      { q: 'كم مرة يجب أن يفحص الطفل حديث الولادة في عامه الأول؟', a: 'يُنصح بزيارة الطبيب شهرياً خلال الستة أشهر الأولى، ثم كل شهرين حتى إتمام العام الأول لمتابعة الوزن والتطور الحركي والتطعيمات.' },
      { q: 'كيف أتعامل مع ارتفاع درجة حرارة طفلي المفاجئ؟', a: 'استخدم كمادات ماء فاتر وخافض حرارة مناسب لوزنه (باراسيتامول)، وقومي بزيارة العيادة فوراً إذا استمرت الحرارة لأكثر من 24 ساعة.' }
    ]
  },
  internalMedicine: {
    name: 'الباطنية العامة والجهاز الهضمي والسكر',
    nameEn: 'Internal Medicine & Gastroenterology',
    title: 'استشاري الأمراض الباطنية والجهاز الهضمي والسكر والضغط',
    titleEn: 'Consultant Internist & Gastroenterologist',
    heroIcon: 'stethoscope',
    badgeText: 'استشاري أمراض باطنية معتمد',
    badgeTextEn: 'Board Certified Internist',
    subspecialties: ['تنظيم السكر ومتابعة القدم السكري وضغط الدم', 'مناظير المعدة والقولون وتشخيص جرثومة المعدة', 'علاج القولون العصبي وارتجاع المريء وتقرحات الجهاز الهضمي', 'أمراض الكبد الدهني واضطرابات الغدد والدهون'],
    subspecialtiesEn: ['Diabetes & Hypertension Control', 'Endoscopy & H. Pylori Diagnostics', 'IBS & GERD Management', 'Fatty Liver & Metabolic Disorders'],
    bioSnippet: 'تشخيص دقيق وعلاج متكامل لمختلف الأمراض المزمنة، واضطرابات الجهاز الهضمي، مع التركيز على خطط التغذية والعلاج الوقائي.',
    bioSnippetEn: 'Holistic clinical care for chronic adult conditions, metabolic health, gastrointestinal health, and evidence-based preventive screenings.',
    qualifications: [
      { degree: 'دكتوراه الأمراض الباطنية العامة', institution: 'كلية الطب - جامعة عين شمس', year: 2012 },
      { degree: 'زمالة أمراض الجهاز الهضمي والمناظير', institution: 'المجلس العربي للاختصاصات الصحية', year: 2016 },
      { degree: 'دبلوم علاج السكري والغدد الصماء', institution: 'جامعة نيوكاسل - بريطانيا', year: 2019 }
    ],
    services: [
      { name: 'كشف باطنية شامل وفحص أعضاء البطن', price: 450, duration: 30 },
      { name: 'فحص وتشخيص جرثومة المعدة عبر النفخ (Breath Test)', price: 650, duration: 20 },
      { name: 'متابعة السكري والضغط وضبط جرعات الإنسولين', price: 400, duration: 25 },
      { name: 'سونار البطن والحوض وفحص الكبد والكلى', price: 750, duration: 30 }
    ],
    faqs: [
      { q: 'ما هي أعراض الإصابة بجرثومة المعدة (حلزونية)؟', a: 'حموضة وحرقة مستمرة في المعدة، انتفاخ، غثيان بعد الأكل، والشعور بالشبع المبكر، ويتم تأكيدها بفحص التنفس الدقيق.' },
      { q: 'ما هو المعدل المستهدف للتراكمي (HbA1c) لمريض السكري؟', a: 'الهدف لمعظم المرضى البالغين هو أقل من 7%، ويتم تخصيص الرقم وفق عمر وحالة كل مريض.' }
    ]
  }
};

export const EasyWebModal: React.FC<EasyWebModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  existingDoctor
}) => {
  if (!isOpen) return null;

  // Form State
  const [selectedSpecialtyKey, setSelectedSpecialtyKey] = useState<string>('cardiology');
  const [doctorName, setDoctorName] = useState<string>(existingDoctor?.name || 'د. خالد عبد العزيز');
  const [doctorNameEn, setDoctorNameEn] = useState<string>(existingDoctor?.nameEn || 'Dr. Khaled Abdelaziz');
  const [clinicName, setClinicName] = useState<string>(existingDoctor?.clinic?.name || 'عيادات النخبة التخصصية');
  const [clinicCity, setClinicCity] = useState<string>(existingDoctor?.clinic?.city || 'القاهرة');
  const [phone, setPhone] = useState<string>(existingDoctor?.clinic?.phone || '+201012345678');
  const [whatsapp, setWhatsapp] = useState<string>(existingDoctor?.clinic?.whatsapp || '+201012345678');
  const [consultationPrice, setConsultationPrice] = useState<number>(500);
  const [experienceYears, setExperienceYears] = useState<number>(15);
  const [themeColor, setThemeColor] = useState<ThemeColor>(existingDoctor?.themeColor || 'teal');
  const [schedulePattern, setSchedulePattern] = useState<'standard' | 'evening' | 'split' | 'allday'>('standard');
  const [extraHighlights, setExtraHighlights] = useState<string>('دكتوراه واستشاري - عضو الجمعيات الدولية - أحدث أجهزة الفحص والتشخيص');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTemplate = PRESET_SPECIALTIES[selectedSpecialtyKey] || PRESET_SPECIALTIES.cardiology;

  const handleQuickSpecialtySelect = (key: string) => {
    setSelectedSpecialtyKey(key);
    const tmpl = PRESET_SPECIALTIES[key];
    if (tmpl) {
      if (tmpl.services[0]?.price) {
        setConsultationPrice(tmpl.services[0].price);
      }
    }
  };

  const handleGenerateClick = (openInBuilder: boolean = false) => {
    setIsGenerating(true);

    setTimeout(() => {
      // 1. Build Working Hours
      let workingHours = [
        { days: 'السبت - الأربعاء', daysEn: 'Sat - Wed', hours: '9:00 ص - 9:00 م', hoursEn: '9:00 AM - 9:00 PM' },
        { days: 'الخميس', daysEn: 'Thursday', hours: '9:00 ص - 3:00 م', hoursEn: '9:00 AM - 3:00 PM' },
        { days: 'الجمعة', daysEn: 'Friday', hours: 'مغلق (طوارئ فقط)', hoursEn: 'Closed (Emergency Only)' }
      ];

      if (schedulePattern === 'evening') {
        workingHours = [
          { days: 'السبت - الخميس', daysEn: 'Sat - Thu', hours: '4:00 م - 10:00 م', hoursEn: '4:00 PM - 10:00 PM' },
          { days: 'الجمعة', daysEn: 'Friday', hours: 'مغلق', hoursEn: 'Closed' }
        ];
      } else if (schedulePattern === 'split') {
        workingHours = [
          { days: 'الفترة الصباحية (السبت - الخميس)', daysEn: 'Morning Shift (Sat - Thu)', hours: '9:00 ص - 1:00 م', hoursEn: '9:00 AM - 1:00 PM' },
          { days: 'الفترة المسائية (السبت - الخميس)', daysEn: 'Evening Shift (Sat - Thu)', hours: '5:00 م - 9:30 م', hoursEn: '5:00 PM - 9:30 PM' },
          { days: 'الجمعة', daysEn: 'Friday', hours: 'عطلة أسبوعية', hoursEn: 'Weekend Off' }
        ];
      } else if (schedulePattern === 'allday') {
        workingHours = [
          { days: 'طوال أيام الأسبوع (يومياً)', daysEn: 'Everyday (7 Days a Week)', hours: '10:00 ص - 10:00 م', hoursEn: '10:00 AM - 10:00 PM' }
        ];
      }

      // 2. Build Services with prices in EGP
      const services = selectedTemplate.services.map((svc, i) => ({
        id: `svc-${Date.now()}-${i}`,
        name: svc.name,
        nameEn: svc.name,
        description: `خدمة وإجراء تخصصي دقيق يُقدم بأعلى معايير الجودة والتعقيم لضمان أفضل النتائج للمريض.`,
        descriptionEn: `State-of-the-art procedure delivered under strict clinical standards.`,
        price: i === 0 ? consultationPrice : svc.price,
        currency: 'جنيه',
        durationMinutes: svc.duration,
        insuranceAccepted: true,
        category: selectedTemplate.name
      }));

      // 3. Build Qualifications
      const qualifications = selectedTemplate.qualifications.map((q, i) => ({
        id: `qual-${Date.now()}-${i}`,
        degree: q.degree,
        institution: q.institution,
        year: String(q.year)
      }));

      // 4. Build Career Milestones
      const experience = [
        {
          id: `exp-${Date.now()}-1`,
          role: selectedTemplate.title,
          roleEn: selectedTemplate.titleEn,
          hospital: clinicName,
          hospitalEn: clinicName,
          period: '2018 - حتى الآن',
          periodEn: '2018 - Present',
          description: `الإشراف على العيادات التخصصية وتقديم الرعاية الطبية وفق البروتوكولات المعتمدة عالمياً.`
        },
        {
          id: `exp-${Date.now()}-2`,
          role: 'طبيب استشاري زائر ورئيس وحدة الفحوصات',
          roleEn: 'Visiting Consultant & Unit Head',
          hospital: 'مستشفيات كبرى ومراكز تخصصية',
          hospitalEn: 'Specialized Medical Centers',
          period: '2014 - 2018',
          periodEn: '2014 - 2018',
          description: 'إجراء الفحوصات التخصصية المتقدمة وتدريب الكوادر الطبية.'
        }
      ];

      // 5. Build FAQs
      const faqs = selectedTemplate.faqs.map((f, i) => ({
        id: `faq-${Date.now()}-${i}`,
        question: f.q,
        answer: f.a
      }));

      // 6. Build Curated Photos
      const photos = [
        {
          id: `photo-${Date.now()}-1`,
          url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
          title: 'غرفة الكشف والاستشارة الطبية',
          titleEn: 'Consultation & Clinic Room',
          caption: 'بيئة طبية مهيأة بأعلى معايير الخصوصية والراحة لمرضانا الكرام',
          category: 'clinic' as const
        },
        {
          id: `photo-${Date.now()}-2`,
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
          title: 'أجهزة الفحص التخصصي المعتمدة',
          titleEn: 'Advanced Diagnostic Tools',
          caption: 'أحدث التجهيزات والتقنيات الطبية لضمان دقة وسرعة التشخيص',
          category: 'equipment' as const
        },
        {
          id: `photo-${Date.now()}-3`,
          url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
          title: 'الشهادات والاعتمادات الدولية',
          titleEn: 'Medical Accreditations',
          caption: 'بورد وزمالات معتمدة تعكس الالتزام بأعلى معايير الكفاءة السريرية',
          category: 'certificates' as const
        },
        {
          id: `photo-${Date.now()}-4`,
          url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
          title: 'ردهة الانتظار والاستقبال المريح',
          titleEn: 'Reception & Patient Lounge',
          caption: 'تنظيم مواعيد دقيق لمنع الانتظار وراحة المرضى والمرافقين',
          category: 'clinic' as const
        }
      ];

      // 7. Build Testimonials
      const testimonials = [
        {
          id: `rev-${Date.now()}-1`,
          patientName: 'أحمد محمود',
          patientNameEn: 'Ahmed Mahmoud',
          rating: 5,
          comment: 'تجربة ممتازة جداً مع الطبيب، شرح وافي وتشخيص دقيق بدون مبالغة في الفحوصات. العيادة قمة في النظافة والالتزام بالمواعيد.',
          commentEn: 'Outstanding medical care, very thorough explanation and completely accurate diagnosis. Highly recommended.',
          date: new Date().toISOString().slice(0, 10),
          treatmentType: 'كشف واستشارة طبية',
          verified: true
        },
        {
          id: `rev-${Date.now()}-2`,
          patientName: 'سارة إبراهيم',
          patientNameEn: 'Sara Ibrahim',
          rating: 5,
          comment: 'طبيب متميز ومحترف لأقصى درجة، طاقم التمريض ودود جداً، والأهم أن الخطة العلاجية كانت واضحة ونتائجها سريعة بفضل الله.',
          commentEn: 'Very professional doctor and friendly clinic staff. The treatment plan was effective and very clear.',
          date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
          treatmentType: 'متابعة وإجراء علاجي',
          verified: true
        }
      ];

      // 8. Generate Clean Unique Slug
      const cleanSlugBase = doctorNameEn
        ? doctorNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : `dr-${Date.now().toString().slice(-6)}`;
      const slug = cleanSlugBase || `dr-${Date.now().toString().slice(-6)}`;

      // 9. Full Assembled Profile
      const generatedProfile: DoctorProfile = {
        id: existingDoctor?.id || `doc-${Date.now()}`,
        slug: existingDoctor?.slug || slug,
        name: doctorName.trim(),
        nameEn: doctorNameEn.trim() || undefined,
        title: selectedTemplate.title,
        titleEn: selectedTemplate.titleEn,
        specialty: selectedTemplate.name,
        specialtyEn: selectedTemplate.nameEn,
        subspecialties: selectedTemplate.subspecialties,
        subspecialtiesEn: selectedTemplate.subspecialtiesEn,
        licenseNumber: existingDoctor?.licenseNumber || 'MED-REG-2026',
        experienceYears: Number(experienceYears) || 12,
        rating: 4.95,
        reviewCount: 38,
        avatarUrl: existingDoctor?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
        avatarSize: '2xl',
        coverUrl: '',
        bio: `${selectedTemplate.bioSnippet}\n\n${extraHighlights ? `أبرز المحطات: ${extraHighlights}` : ''}`,
        bioEn: selectedTemplate.bioSnippetEn,
        statement: `رعاية صحية متكاملة تضع صحة وراحة المريض في المقام الأول، مع الالتزام بأحدث الأدلة العلمية والتقنيات الطبية.`,
        statementEn: `Dedicated to delivering compassionate, evidence-based care tailored to each patient's individual health needs.`,
        themeColor: themeColor,
        heroIcon: selectedTemplate.heroIcon,
        heroBadgeText: selectedTemplate.badgeText,
        heroBadgeTextEn: selectedTemplate.badgeTextEn,
        status: 'published',
        qualifications,
        experience,
        clinic: {
          name: clinicName.trim(),
          nameEn: clinicName.trim(),
          city: clinicCity.trim(),
          cityEn: clinicCity.trim(),
          address: `${clinicCity} - شارع المستشفى الرئيسي - برج العيادات التخصصية`,
          phone: phone.trim(),
          emergencyPhone: phone.trim(),
          whatsapp: whatsapp.trim(),
          workingHours
        },
        services,
        photos,
        articles: [
          {
            id: `art-${Date.now()}-1`,
            title: `دليلك الشامل للحفاظ على صحتك والوقاية من المشاكل الشائعة في ${selectedTemplate.name}`,
            excerpt: `نصائح طبية وإرشادات سريرية موثقة يقدمها الطبيب للمرضى وأسرهم للوقاية والكشف المبكر.`,
            content: `تعتبر الوقاية دائماً خير وسيلة للحفاظ على جودة الحياة. في هذا المقال نناقش أهم العلامات التي لا يجب إهمالها، والخطوات اليومية البسيطة التي تقيك من المضاعفات وتضمن لك ولأسرتك حياة صحية مديدة بإذن الله.`,
            readTimeMinutes: 4,
            publishedDate: new Date().toISOString().slice(0, 10),
            category: 'تثقيف صحي'
          }
        ],
        faqs,
        testimonials,
        socialLinks: existingDoctor?.socialLinks || {},
        seo: {
          metaTitle: `${doctorName} | ${selectedTemplate.title} - ${clinicCity}`,
          metaDescription: `الموقع الرسمي لـ ${doctorName}، ${selectedTemplate.title} في ${clinicCity}. استشارات، حجز مواعيد، والخدمات الطبية.`,
          keywords: [doctorName, selectedTemplate.name, clinicCity, 'حجز موعد', 'عيادة']
        },
        sectionsConfig: {
          hero: true,
          about: true,
          qualifications: true,
          experience: true,
          services: true,
          clinic: true,
          gallery: true,
          articles: true,
          faqs: true,
          testimonials: true,
          contact: true
        },
        customStyles: {
          pageBgTheme: 'default',
          pageBgPattern: 'clean'
        },
        createdAt: existingDoctor?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setIsGenerating(false);
      onGenerate(generatedProfile, openInBuilder);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">إيزي ويب (EasyWeb)</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  ⚡ بناء فوري في دقيقة
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                اكتب معلوماتك الأساسية وسيقوم «إيزي ويب» بتجهيز وكتابة موقعك الطبي بالكامل تلقائياً!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Step 1: Pick Specialty */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-800" />
                <span>1. اختر التخصص الطبي (يقوم بإعداد الخدمات والشهادات فوراً):</span>
              </label>
              <span className="text-[10px] text-teal-800 font-semibold">
                {selectedTemplate.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PRESET_SPECIALTIES).map(([key, item]) => {
                const isSel = selectedSpecialtyKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickSpecialtySelect(key)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSel 
                        ? 'border-teal-700 bg-teal-50/70 text-teal-950 ring-2 ring-teal-700 shadow-xs font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs leading-snug">{item.name.split('و')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{item.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Doctor & Clinic Basic Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-teal-800" />
              <span>2. البيانات الشخصية وبيانات العيادة:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">اسم الطبيب بالعربية *</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="مثال: د. أحمد خالد"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">الاسم بالإنجليزية (English)</label>
                <input
                  type="text"
                  value={doctorNameEn}
                  onChange={(e) => setDoctorNameEn(e.target.value)}
                  placeholder="Dr. Ahmed Khaled"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-left font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">اسم العيادة أو المركز الطبي *</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="مركز النخبة الطبي"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">المدينة أو الحي *</label>
                <input
                  type="text"
                  value={clinicCity}
                  onChange={(e) => setClinicCity(e.target.value)}
                  placeholder="القاهرة / الرياض"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">رقم الهاتف للاتصال</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+201012345678"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-left font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">رقم واتساب للحجز والاستفسار</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+201012345678"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-left font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Price & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/60 space-y-1">
              <label className="block text-[11px] font-bold text-teal-950 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-800" />
                <span>سعر الكشف (بالجنيه):</span>
              </label>
              <input
                type="number"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-lg font-bold text-teal-900 tabular-nums"
              />
              <span className="text-[10px] text-teal-700">يُعرض في الموقع كـ (جنيه مصري)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <label className="block text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-600" />
                <span>سنوات الخبرة السريرية:</span>
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold tabular-nums"
              />
              <span className="text-[10px] text-slate-500">تظهر في بطاقات إحصائيات الطبيب</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <label className="block text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>جدول مواعيد العيادة:</span>
              </label>
              <select
                value={schedulePattern}
                onChange={(e) => setSchedulePattern(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-xs cursor-pointer"
              >
                <option value="standard">أسبوعي قياسي (9ص - 9م)</option>
                <option value="evening">مسائي فقط (4م - 10م)</option>
                <option value="split">فترتين (صباحي + مسائي)</option>
                <option value="allday">طوال الأسبوع (10ص - 10م)</option>
              </select>
              <span className="text-[10px] text-slate-500">يمكنك تعديل أي تفاصيل لاحقاً</span>
            </div>
          </div>

          {/* Step 4: Theme Color Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              3. اختر هوية ولون الموقع المفضل:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(THEME_PALETTES) as ThemeColor[]).map((thm) => {
                const pal = THEME_PALETTES[thm];
                const isSel = themeColor === thm;
                return (
                  <button
                    key={thm}
                    type="button"
                    onClick={() => setThemeColor(thm)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      isSel ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ background: pal.primary }} />
                    <span className="font-bold text-[11px] text-slate-800 truncate">{pal.nameAr.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">
              كلمات مفتاحية أو اعتمادات إضافية (اختياري):
            </label>
            <input
              type="text"
              value={extraHighlights}
              onChange={(e) => setExtraHighlights(e.target.value)}
              placeholder="مثال: زميل الجمعية الملكية - جراحة مناظير - خبرة بالمستشفيات الجامعية"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>سيتم إنشاء صفحات كاملة: النبذة، الخدمات، المواعيد، المعرض، الأسئلة والتقييمات.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={() => handleGenerateClick(true)}
              disabled={isGenerating || !doctorName.trim()}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>إنشاء وفتح في المحرر</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerateClick(false)}
              disabled={isGenerating || !doctorName.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-900 hover:to-teal-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ التوليد...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>توليد الموقع ونشره فوراً 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
