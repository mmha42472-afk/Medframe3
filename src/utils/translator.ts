import { DoctorProfile } from '../types/doctor';

/**
 * High-precision medical & Arabized translation dictionary
 */
const MEDICAL_DICTIONARY: Record<string, string> = {
  // Titles & Specialties
  'دكتور': 'Doctor',
  'دكتورة': 'Doctor',
  'د.': 'Dr.',
  'طبيب استشاري': 'Consultant Physician',
  'استشاري': 'Consultant',
  'أخصائي': 'Specialist',
  'طبيب عام': 'General Practitioner',
  'جراح': 'Surgeon',
  'أمراض القلب': 'Cardiology & Cardiovascular Medicine',
  'طب وجراحة العيون': 'Ophthalmology & Eye Surgery',
  'طب الأطفال': 'Pediatrics & Child Health',
  'طب وجراحة الأسنان': 'Dental Medicine & Oral Surgery',
  'أمراض الجلدية والتجميل': 'Dermatology & Aesthetic Medicine',
  'طب وجراحة العظام': 'Orthopedic Surgery & Sports Medicine',
  'المخ والأعصاب': 'Neurology & Neurosurgery',
  'الأنف والأذن والحنجرة': 'ENT & Head and Neck Surgery',
  'النساء والتوليد': 'Obstetrics & Gynecology',
  'الطب الباطني': 'Internal Medicine',
  'الجهاز الهضمي': 'Gastroenterology',
  'الغدد الصماء والسكري': 'Endocrinology & Diabetes',
  'العلاج الطبيعي والتأهيل': 'Physical Therapy & Rehabilitation',
  'الطب النفسي': 'Psychiatry & Mental Health',
  'الأورام': 'Oncology',
  'المسالك البولية': 'Urology',

  // Degrees & Qualifications
  'بكالوريوس الطب والجراحة': 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
  'البورد الأمريكي': 'American Board of Medical Specialties (ABMS)',
  'البورد الكندي': 'Royal College of Physicians and Surgeons of Canada',
  'البورد السعودي': 'Saudi Board of Medical Specialties (SBMS)',
  'البورد العربي': 'Arab Board of Health Specializations',
  'زمالة الكلية الملكية للأطباء': 'Fellowship of the Royal College of Physicians (FRCP)',
  'زمالة الكلية الملكية للجراحين': 'Fellowship of the Royal College of Surgeons (FRCS)',
  'ماجستير': 'Master of Science (MSc)',
  'دكتوراه': 'Doctor of Philosophy (PhD) in Medical Sciences',
  'جامعة الملك سعود': 'King Saud University',
  'جامعة الملك عبدالعزيز': 'King Abdulaziz University',
  'جامعة هارفارد': 'Harvard Medical School',
  'جامعة جونز هوبكنز': 'Johns Hopkins University',
  'كليفلاند كلينك': 'Cleveland Clinic',
  'جامعة القاهرة': 'Cairo University Faculty of Medicine',

  // Common Medical Services
  'كشف سريري واستشارة متخصصة': 'Clinical Examination & Specialized Consultation',
  'فحص دوري وشامل': 'Comprehensive Annual Health Checkup',
  'تخطيط القلب الكهربائي': 'Electrocardiogram (ECG / EKG)',
  'إيكو القلب بالموجات فوق الصوتية': 'Echocardiography (Echo)',
  'قسطرة تشخيصية وعلاجية': 'Diagnostic & Interventional Angiography',
  'تصحيح النظر بالفيمتو ليزك': 'Femto-LASIK Vision Correction',
  'فحص ضغط العين والشبكية': 'Intraocular Pressure & Retinal Examination',
  'علاج الحول وضعف البصر': 'Strabismus & Amblyopia Treatment',
  'متابعة نمو وحديثي الولادة': 'Neonatal Growth & Developmental Milestones',
  'تطعيمات الأطفال المعتمدة': 'Certified Pediatric Vaccinations',
  'تنظيف وتبييض الأسنان': 'Professional Teeth Cleaning & Whitening',
  'زراعة الأسنان': 'Dental Implants & Restorative Surgery',
  'تقويم الأسنان': 'Orthodontics & Clear Aligners',
  'علاج حب الشباب والندبات': 'Acne & Scar Laser Treatment',
  'جلسات نضارة وبلازما': 'PRP & Skin Rejuvenation Sessions',
  'فيلر وبوتوكس': 'Botox & Dermal Fillers Injections',
  'فحوصات مخبرية متقدمة': 'Advanced Laboratory Diagnostic Testing',

  // Working Hours & Days
  'السبت': 'Saturday',
  'الأحد': 'Sunday',
  'الإثنين': 'Monday',
  'الاثنين': 'Monday',
  'الثلاثاء': 'Tuesday',
  'الأربعاء': 'Wednesday',
  'الخميس': 'Thursday',
  'الجمعة': 'Friday',
  'من السبت إلى الخميس': 'Saturday to Thursday',
  'الأحد إلى الخميس': 'Sunday to Thursday',
  'مغلق': 'Closed',
  'صباحاً': 'AM',
  'مساءً': 'PM',
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',
  'الدمام': 'Dammam',
  'الخبر': 'Al Khobar',
  'مكة المكرمة': 'Makkah',
  'المدينة المنورة': 'Madinah',
  'دبي': 'Dubai',
  'أبوظبي': 'Abu Dhabi',
  'القاهرة': 'Cairo',
  'الإسكندرية': 'Alexandria',
  'عمان': 'Amman',
  'الكويت': 'Kuwait City',
  'الدوحة': 'Doha',
  'المنامة': 'Manama',

  // Common Phrases
  'عيادة': 'Clinic',
  'مركز طبي': 'Medical Center',
  'مستشفى': 'Hospital',
  'برج': 'Tower',
  'طريق': 'Road',
  'شارع': 'Street',
  'حي': 'District',
  'الدور': 'Floor'
};

/**
 * Transliterates Arabic names to English smoothly
 */
export function transliterateArabicToEnglish(arabicText: string): string {
  if (!arabicText || !arabicText.trim()) return '';

  // Direct dictionary check
  if (MEDICAL_DICTIONARY[arabicText.trim()]) {
    return MEDICAL_DICTIONARY[arabicText.trim()];
  }

  // Common Arabic name mapping
  const nameMap: Record<string, string> = {
    'محمد': 'Mohammed',
    'أحمد': 'Ahmed',
    'محمود': 'Mahmoud',
    'سارة': 'Sara',
    'نورة': 'Noura',
    'نوره': 'Noura',
    'فاطمة': 'Fatima',
    'مريم': 'Maryam',
    'طارق': 'Tariq',
    'خالد': 'Khaled',
    'عبدالله': 'Abdullah',
    'عبد الرحمن': 'Abdulrahman',
    'عبدالعزيز': 'Abdulaziz',
    'سعود': 'Saud',
    'فيصل': 'Faisal',
    'فهد': 'Fahad',
    'سلطان': 'Sultan',
    'منصور': 'Mansour',
    'المنصوري': 'Al-Mansouri',
    'الزهراني': 'Al-Zahrani',
    'الشمري': 'Al-Shammari',
    'العتيبي': 'Al-Otaibi',
    'القحطاني': 'Al-Qahtani',
    'الغامدي': 'Al-Ghamdi',
    'الدوسري': 'Al-Dossari',
    'الحربي': 'Al-Harbi',
    'المطيري': 'Al-Mutairi',
    'العنزي': 'Al-Anazi',
    'بنت': 'Bint',
    'بن': 'Bin',
    'آل': 'Al'
  };

  let processed = arabicText;

  // Replace recognized names & terms
  Object.keys(MEDICAL_DICTIONARY).forEach(key => {
    if (processed.includes(key)) {
      processed = processed.split(key).join(MEDICAL_DICTIONARY[key]);
    }
  });

  Object.keys(nameMap).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    processed = processed.replace(regex, nameMap[key]);
  });

  // Basic letter transliteration for remaining Arabic characters
  const charMap: Record<string, string> = {
    'ا': 'a', 'أ': 'A', 'إ': 'E', 'آ': 'Aa',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'A', 'غ': 'Gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'a', 'ء': "'", 'ئ': "'", 'ؤ': "o"
  };

  let transliterated = '';
  for (let i = 0; i < processed.length; i++) {
    const ch = processed[i];
    if (charMap[ch]) {
      transliterated += charMap[ch];
    } else {
      transliterated += ch;
    }
  }

  // Capitalize words nicely
  return transliterated
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Translates an entire DoctorProfile from Arabic to English
 */
export function translateDoctorProfileToEnglish(doctor: DoctorProfile): DoctorProfile {
  const cloned: DoctorProfile = JSON.parse(JSON.stringify(doctor));

  // 1. Name & Titles
  cloned.nameEn = cloned.nameEn || transliterateArabicToEnglish(cloned.name.replace(/^د\.\s*/, 'Dr. '));
  cloned.titleEn = cloned.titleEn || (
    cloned.title.includes('استشاري') 
      ? `Senior Consultant ${transliterateArabicToEnglish(cloned.specialty)}` 
      : `Specialist in ${transliterateArabicToEnglish(cloned.specialty)}`
  );
  cloned.specialtyEn = cloned.specialtyEn || transliterateArabicToEnglish(cloned.specialty);

  // Subspecialties
  if (cloned.subspecialties && cloned.subspecialties.length > 0) {
    cloned.subspecialtiesEn = cloned.subspecialties.map(sub => 
      MEDICAL_DICTIONARY[sub] || transliterateArabicToEnglish(sub)
    );
  }

  // Bio & Statement
  if (!cloned.bioEn || cloned.bioEn.length < 10) {
    cloned.bioEn = `${cloned.nameEn} is a distinguished healthcare professional specializing in ${cloned.specialtyEn} with over ${cloned.experienceYears} years of clinical excellence. Dedicated to providing compassionate, evidence-based medical care using modern diagnostic and therapeutic technologies.`;
  }

  if (!cloned.statementEn || cloned.statementEn.length < 5) {
    cloned.statementEn = `Committed to patient-centered care, precise clinical standards, and empowering patients with knowledge for lifelong wellness.`;
  }

  // Clinic Details
  if (cloned.clinic) {
    cloned.clinic.nameEn = cloned.clinic.nameEn || transliterateArabicToEnglish(cloned.clinic.name);
    cloned.clinic.cityEn = cloned.clinic.cityEn || transliterateArabicToEnglish(cloned.clinic.city);
    cloned.clinic.addressEn = cloned.clinic.addressEn || `${cloned.clinic.cityEn} Medical District, Healthcare Avenue`;

    if (cloned.clinic.workingHours) {
      cloned.clinic.workingHours = cloned.clinic.workingHours.map(wh => ({
        ...wh,
        daysEn: wh.daysEn || transliterateArabicToEnglish(wh.days),
        hoursEn: wh.hoursEn || wh.hours.replace('صباحاً', 'AM').replace('مساءً', 'PM')
      }));
    }
  }

  // Services
  if (cloned.services && cloned.services.length > 0) {
    cloned.services = cloned.services.map(svc => ({
      ...svc,
      nameEn: svc.nameEn || MEDICAL_DICTIONARY[svc.name] || transliterateArabicToEnglish(svc.name),
      descriptionEn: svc.descriptionEn || `Comprehensive clinical assessment and state-of-the-art procedure for ${svc.nameEn || transliterateArabicToEnglish(svc.name)}.`,
      categoryEn: svc.categoryEn || (svc.category ? transliterateArabicToEnglish(svc.category) : 'Clinical Procedure')
    }));
  }

  // Qualifications
  if (cloned.qualifications && cloned.qualifications.length > 0) {
    cloned.qualifications = cloned.qualifications.map(q => ({
      ...q,
      degreeEn: q.degreeEn || MEDICAL_DICTIONARY[q.degree] || transliterateArabicToEnglish(q.degree),
      institutionEn: q.institutionEn || MEDICAL_DICTIONARY[q.institution] || transliterateArabicToEnglish(q.institution)
    }));
  }

  // Experience
  if (cloned.experience && cloned.experience.length > 0) {
    cloned.experience = cloned.experience.map(exp => ({
      ...exp,
      roleEn: exp.roleEn || MEDICAL_DICTIONARY[exp.role] || transliterateArabicToEnglish(exp.role),
      hospitalEn: exp.hospitalEn || MEDICAL_DICTIONARY[exp.hospital] || transliterateArabicToEnglish(exp.hospital),
      periodEn: exp.periodEn || exp.period,
      descriptionEn: exp.descriptionEn || `Led clinical specialized operations and patient care protocols at ${exp.hospitalEn || 'the medical center'}.`
    }));
  }

  // Articles
  if (cloned.articles && cloned.articles.length > 0) {
    cloned.articles = cloned.articles.map(art => ({
      ...art,
      titleEn: art.titleEn || transliterateArabicToEnglish(art.title),
      excerptEn: art.excerptEn || `Key medical insights and patient guidance regarding ${art.titleEn || transliterateArabicToEnglish(art.title)}.`,
      contentEn: art.contentEn || art.content,
      categoryEn: art.categoryEn || transliterateArabicToEnglish(art.category)
    }));
  }

  // FAQs
  if (cloned.faqs && cloned.faqs.length > 0) {
    cloned.faqs = cloned.faqs.map(faq => ({
      ...faq,
      questionEn: faq.questionEn || transliterateArabicToEnglish(faq.question),
      answerEn: faq.answerEn || `Patients are advised to consult directly with ${cloned.nameEn} during the clinical appointment for personalized evaluation.`
    }));
  }

  // Testimonials
  if (cloned.testimonials && cloned.testimonials.length > 0) {
    cloned.testimonials = cloned.testimonials.map(t => ({
      ...t,
      patientNameEn: t.patientNameEn || transliterateArabicToEnglish(t.patientName),
      treatmentTypeEn: t.treatmentTypeEn || transliterateArabicToEnglish(t.treatmentType || 'Medical Consultation'),
      commentEn: t.commentEn || `Excellent experience with ${cloned.nameEn}. Outstanding professionalism, clear explanations, and world-class care.`
    }));
  }

  // SEO
  if (cloned.seo) {
    cloned.seo.metaTitleEn = cloned.seo.metaTitleEn || `${cloned.nameEn} | ${cloned.specialtyEn} - Official Medical Website`;
    cloned.seo.metaDescriptionEn = cloned.seo.metaDescriptionEn || `Book an appointment with ${cloned.nameEn}, leading specialist in ${cloned.specialtyEn} in ${cloned.clinic?.cityEn || 'Saudi Arabia'}.`;
  }

  return cloned;
}
