import type { FieldDef, Section, SectionStyle, SectionType, SiteSettings, SiteTheme } from './types';
import { uid } from './utils';

/* ---------- fonts ---------- */
export const FONTS: { family: string; label: string; weights: string }[] = [
  { family: 'Alexandria', label: 'Alexandria — عصري هندسي', weights: '300;400;500;600;700;800' },
  { family: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic — نظيف ومقروء', weights: '300;400;500;600;700' },
  { family: 'Cairo', label: 'Cairo — كلاسيكي واضح', weights: '400;500;600;700;800' },
  { family: 'Tajawal', label: 'Tajawal — خفيف وودود', weights: '400;500;700;800' },
  { family: 'Readex Pro', label: 'Readex Pro — حديث ومرن', weights: '300;400;500;600;700' },
  { family: 'Noto Kufi Arabic', label: 'Noto Kufi — كوفي رسمي', weights: '400;500;600;700;800' },
  { family: 'El Messiri', label: 'El Messiri — فخم وأنيق', weights: '400;500;600;700' },
  { family: 'Almarai', label: 'Almarai — بسيط وقوي', weights: '300;400;700;800' },
  { family: 'Changa', label: 'Changa — جريء', weights: '400;500;600;700;800' },
  { family: 'Lalezar', label: 'Lalezar — عناوين ضخمة', weights: '400' },
];
export function fontsHref(theme: SiteTheme) {
  const fams = Array.from(new Set([theme.fontDisplay, theme.fontBody]));
  const q = fams.map(f => {
    const w = FONTS.find(x => x.family === f)?.weights || '400;600;700';
    return `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@${w}`;
  }).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/* ---------- defaults ---------- */
export const defaultTheme = (): SiteTheme => ({
  primary: '#0F7B6C', primaryDark: '#0A5A4F', accent: '#E8A33D', ink: '#0E2B2A', muted: '#5E7472',
  paper: '#FBFAF7', card: '#FFFFFF', night: '#06201E',
  fontDisplay: 'Alexandria', fontBody: 'IBM Plex Sans Arabic', radius: 22, hlStyle: 'gradient', baseSize: 16,
  pageBgMode: 'solid', pageBg: '#FBFAF7', pageBg2: '#EAF6F3', pageBgImage: '',
});
export const defaultSettings = (): SiteSettings => ({
  whatsapp: '', phone: '', floatingWhatsapp: true, mobileBar: true,
  mobileBarSecondaryLabel: 'الاتجاهات', mobileBarSecondaryHref: '#location',
  demoRibbon: false, demoRibbonText: 'نموذج مبدئي غير منشور — تصميم MedFrame Studio',
  lang: 'ar', metaTitle: '', metaDescription: '', noindex: false,
});
export const baseStyle = (o: Partial<SectionStyle> = {}): SectionStyle => ({
  bgMode: 'default', bgColor: '#FFFFFF', bgColor2: '#EAF6F3', bgAngle: 160, bgOpacity: 100,
  bgImage: '', bgOverlay: 45, bgFixed: false, tone: 'auto',
  titleScale: 1, textScale: 1, pad: 'l', width: 'normal', align: 'start',
  decor: 'none', anim: 'fade-up', stagger: true, speed: 'normal', tilt: false, float: true,
  bg3d: 'none', bg3dOpacity: 60, radius: 'theme', hideMobile: false, hideDesktop: false,
  ...o,
});

/* ---------- reusable field groups ---------- */
const kicker: FieldDef = { key: 'kicker', label: 'عنوان صغير فوق العنوان', type: 'text' };
const title: FieldDef = { key: 'title', label: 'العنوان', type: 'textarea', rows: 2, help: 'حط كلمة بين *نجمتين* عشان تتلوّن، وEnter لسطر جديد.' };
const lead: FieldDef = { key: 'lead', label: 'وصف قصير', type: 'textarea', rows: 3 };
const target = (key: string, label = 'الزرار بيودي على'): FieldDef => ({ key, label, type: 'text', help: 'wa:رسالة = واتساب برسالة جاهزة · tel = اتصال · #booking = قسم في الصفحة · أو لينك كامل' });
const columns: FieldDef = { key: 'columns', label: 'عدد الأعمدة', type: 'select', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] };
const iconItem = (extra: FieldDef[] = []): FieldDef[] => [
  { key: 'icon', label: 'الأيقونة', type: 'icon' },
  { key: 'title', label: 'العنوان', type: 'text' },
  { key: 'text', label: 'الوصف', type: 'textarea', rows: 2 },
  ...extra,
];
const shapeOpts = [{ value: 'arch', label: 'قوس' }, { value: 'rounded', label: 'مستطيل ناعم' }, { value: 'circle', label: 'دايرة' }, { value: 'blob', label: 'شكل حر' }];

export interface SectionDef {
  type: SectionType;
  label: string;
  hint: string;
  anchor: string;
  inNav: boolean;
  fields: FieldDef[];
  content: () => Record<string, any>;
  style: () => SectionStyle;
}

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  header: {
    type: 'header', label: 'الهيدر والقايمة', hint: 'اللوجو والروابط وزرار الحجز', anchor: 'top', inNav: false,
    fields: [
      { key: 'brand', label: 'اسم المكان', type: 'text' },
      { key: 'tagline', label: 'سطر تحت الاسم', type: 'text' },
      { key: 'logo', label: 'صورة اللوجو (اختياري)', type: 'image', help: 'لو مفيش لوجو، هيظهر رمز بلون الهوية.' },
      { key: 'markIcon', label: 'رمز اللوجو البديل', type: 'icon' },
      { key: 'showNav', label: 'إظهار روابط الأقسام', type: 'toggle' },
      { key: 'ctaLabel', label: 'نص زرار الهيدر', type: 'text' },
      target('ctaTarget'),
    ],
    content: () => ({ brand: 'اسم المركز', tagline: 'رعاية طبية متكاملة', logo: '', markIcon: 'stethoscope', showNav: true, ctaLabel: 'احجز دلوقتي', ctaTarget: '#booking' }),
    style: () => baseStyle({ pad: 'none', anim: 'none' }),
  },
  hero: {
    type: 'hero', label: 'الواجهة الرئيسية', hint: 'أول حاجة الزائر بيشوفها', anchor: 'home', inNav: false,
    fields: [
      { key: 'badge', label: 'الشارة الصغيرة', type: 'text' },
      { key: 'badgeHours', label: 'ساعات العمل للشارة (مثال 11-23)', type: 'text', help: 'لو كتبتها، الشارة هتقول «مفتوح دلوقتي» أو «مقفول» حسب الوقت.' },
      { key: 'badgeOpen', label: 'نص «مفتوح»', type: 'text' },
      { key: 'badgeClosed', label: 'نص «مقفول»', type: 'text' },
      title, lead,
      { key: 'btn1Label', label: 'الزرار الأساسي', type: 'text' }, target('btn1Target'), { key: 'btn1Icon', label: 'أيقونة الزرار الأساسي', type: 'icon' },
      { key: 'btn2Label', label: 'الزرار التاني', type: 'text' }, target('btn2Target', 'الزرار التاني بيودي على'), { key: 'btn2Icon', label: 'أيقونة الزرار التاني', type: 'icon' },
      { key: 'stats', label: 'أرقام سريعة', type: 'list', itemLabel: 'رقم', titleKey: 'value', fields: [{ key: 'value', label: 'الرقم', type: 'text' }, { key: 'label', label: 'الوصف', type: 'text' }], newItem: () => ({ value: '+10', label: 'وصف' }) },
      { key: 'visual', label: 'الجزء البصري', type: 'select', options: [{ value: 'art', label: 'كارت فني باسم المكان' }, { value: 'image', label: 'صورة' }, { value: '3d', label: 'مجسم 3D متحرك' }, { value: 'none', label: 'بدون (نص بس)' }] },
      { key: 'visualSide', label: 'مكان الجزء البصري', type: 'select', options: [{ value: 'end', label: 'الشمال' }, { value: 'start', label: 'اليمين' }] },
      { key: 'artWord', label: 'الكلمة الكبيرة في الكارت', type: 'text' },
      { key: 'artSub', label: 'سطر تحت الكلمة', type: 'text' },
      { key: 'image', label: 'صورة الواجهة', type: 'image' },
      { key: 'imageShape', label: 'شكل الصورة', type: 'select', options: shapeOpts },
      { key: 'threeKind', label: 'نوع المجسم 3D', type: 'select', options: [{ value: 'cells', label: 'نقطة دم وخلايا (معامل)' }, { value: 'dna', label: 'شريط DNA' }, { value: 'orbs', label: 'كرات زجاجية' }, { value: 'particles', label: 'سحابة نقاط' }] },
      { key: 'chips', label: 'كروت عائمة على الصورة', type: 'list', itemLabel: 'كارت', titleKey: 'title', fields: iconItem(), newItem: () => ({ icon: 'check', title: 'عنوان', text: 'وصف قصير' }) },
      { key: 'quick', label: 'شريط معلومات تحت الواجهة', type: 'list', itemLabel: 'معلومة', titleKey: 'title', fields: iconItem(), newItem: () => ({ icon: 'clock', title: 'معلومة', text: 'تفاصيل' }) },
      { key: 'quickCta', label: 'زرار شريط المعلومات', type: 'text' },
    ],
    content: () => ({
      badge: 'افتتاح جديد', badgeHours: '', badgeOpen: 'مفتوح دلوقتي', badgeClosed: 'مقفول دلوقتي',
      title: 'رعاية طبية متكاملة\nقريبة منك.. *في مكان واحد*', lead: 'كشف ومتابعة وتحاليل تحت سقف واحد. احجز ميعادك في دقيقة على واتساب.',
      btn1Label: 'احجز ميعادك', btn1Target: '#booking', btn1Icon: 'calendar', btn2Label: 'اتجاهات المكان', btn2Target: '#location', btn2Icon: 'pin',
      stats: [{ value: '+6', label: 'تخصصات طبية' }, { value: 'معمل', label: 'تحاليل في نفس المكان' }],
      visual: 'art', visualSide: 'end', artWord: 'الاسم', artSub: 'Medical Center', image: '', imageShape: 'arch', threeKind: 'dna',
      chips: [{ icon: 'clock', title: 'مواعيد مرنة', text: 'صباحي ومسائي' }, { icon: 'check', title: 'تم تأكيد حجزك', text: 'الأربعاء — 7:30 مساءً' }],
      quick: [], quickCta: 'احجز دلوقتي',
    }),
    style: () => baseStyle({ bgMode: 'gradient', bgColor: '#06201E', bgColor2: '#0A3330', bgAngle: 180, decor: 'glow', pad: 'l' }),
  },
  marquee: {
    type: 'marquee', label: 'شريط متحرك', hint: 'كلمات بتعدّي قدام العين', anchor: 'strip', inNav: false,
    fields: [
      { key: 'items', label: 'الكلمات (كل سطر كلمة)', type: 'lines' },
      { key: 'variant', label: 'الشكل', type: 'select', options: [{ value: 'big', label: 'كلام كبير' }, { value: 'pills', label: 'كبسولات' }] },
      { key: 'speed', label: 'السرعة (ثواني للفة)', type: 'number', min: 8, max: 90, step: 2 },
    ],
    content: () => ({ items: ['الباطنة', 'الأطفال', 'النساء والتوليد', 'الأسنان', 'الجلدية', 'العظام'], variant: 'big', speed: 30 }),
    style: () => baseStyle({ pad: 's', bgMode: 'solid', bgColor: '#FFFFFF', anim: 'none' }),
  },
  cards: {
    type: 'cards', label: 'كروت (تخصصات / خدمات)', hint: 'تخصصات، خدمات، مميزات', anchor: 'services', inNav: true,
    fields: [
      kicker, title, lead,
      { key: 'variant', label: 'شكل الكروت', type: 'select', options: [{ value: 'card', label: 'كروت بأيقونات' }, { value: 'numbered', label: 'كروت مرقّمة' }, { value: 'minimal', label: 'بسيط بدون إطار' }] },
      columns,
      { key: 'solidIcons', label: 'أيقونات ملوّنة بالكامل', type: 'toggle' },
      { key: 'showNumbers', label: 'إظهار أرقام صغيرة', type: 'toggle' },
      { key: 'items', label: 'الكروت', type: 'list', itemLabel: 'كارت', titleKey: 'title', fields: iconItem([{ key: 'tag', label: 'شارة صغيرة (اختياري)', type: 'text' }, { key: 'image', label: 'صورة (اختياري)', type: 'image' }]), newItem: () => ({ icon: 'stethoscope', title: 'تخصص جديد', text: 'وصف قصير للخدمة.', tag: '', image: '' }) },
    ],
    content: () => ({
      kicker: 'التخصصات', title: 'كل اللي عيلتك محتاجاه\nفي مكان واحد', lead: 'عيادات تخصصية بمواعيد واضحة وحجز مسبق.', variant: 'card', columns: '3', solidIcons: false, showNumbers: true,
      items: [
        { icon: 'stethoscope', title: 'الباطنة', text: 'تشخيص ومتابعة الضغط والسكر والجهاز الهضمي.', tag: '', image: '' },
        { icon: 'baby', title: 'الأطفال', text: 'متابعة النمو والتطعيمات وكشف حديثي الولادة.', tag: '', image: '' },
        { icon: 'heart', title: 'النساء والتوليد', text: 'متابعة الحمل والسونار وصحة المرأة.', tag: '', image: '' },
      ],
    }),
    style: () => baseStyle({ tilt: true }),
  },
  highlight: {
    type: 'highlight', label: 'شريط مميز (بلوك غامق)', hint: 'خدمة مهمة زي المعمل', anchor: 'highlight', inNav: true,
    fields: [
      kicker, title, { key: 'text', label: 'النص', type: 'textarea', rows: 3 },
      { key: 'btnLabel', label: 'نص الزرار', type: 'text' }, target('btnTarget'),
      { key: 'list', label: 'نقاط (كل سطر نقطة)', type: 'lines' },
      { key: 'listIcon', label: 'أيقونة النقاط', type: 'icon' },
      { key: 'image', label: 'صورة بدل النقاط (اختياري)', type: 'image' },
      { key: 'variant', label: 'الشكل', type: 'select', options: [{ value: 'dark', label: 'بلوك غامق مضيء' }, { value: 'flat', label: 'بدون بلوك' }] },
    ],
    content: () => ({ kicker: 'معمل التحاليل', title: 'تحاليلك مع كشفك..\nمن غير لف', text: 'نتايج دقيقة، واستلام النتيجة على واتساب، وسحب العينة من البيت.', btnLabel: 'اطلب تحليل', btnTarget: 'wa:عايز أطلب تحليل', list: ['صورة دم كاملة', 'سكر وتراكمي', 'وظائف كبد وكلى', 'غدة درقية', 'دهون وكوليسترول', 'باقات فحص شامل'], listIcon: 'flask', image: '', variant: 'dark' }),
    style: () => baseStyle({ pad: 'm' }),
  },
  textImage: {
    type: 'textImage', label: 'نص + صورة', hint: 'عن المكان / عن الدكتور', anchor: 'about', inNav: true,
    fields: [
      kicker, title, { key: 'text', label: 'النص', type: 'textarea', rows: 5 },
      { key: 'checks', label: 'نقاط بعلامة صح (كل سطر نقطة)', type: 'lines' },
      { key: 'image', label: 'الصورة', type: 'image' },
      { key: 'imageShape', label: 'شكل الصورة', type: 'select', options: shapeOpts },
      { key: 'imageSide', label: 'مكان الصورة', type: 'select', options: [{ value: 'end', label: 'الشمال' }, { value: 'start', label: 'اليمين' }] },
      { key: 'btnLabel', label: 'نص الزرار (اختياري)', type: 'text' }, target('btnTarget'),
    ],
    content: () => ({ kicker: 'عن المركز', title: 'رعاية *حقيقية*\nمش مجرد كشف', text: 'اكتب هنا نبذة عن المكان أو الدكتور: الخبرة، الفكرة، وإزاي بتهتموا بالمريض.', checks: ['أطباء متخصصين', 'أجهزة حديثة', 'متابعة بعد الكشف'], image: '', imageShape: 'rounded', imageSide: 'end', btnLabel: '', btnTarget: '#booking' }),
    style: () => baseStyle(),
  },
  stats: {
    type: 'stats', label: 'أرقام وإنجازات', hint: 'أرقام بتعدّ لوحدها', anchor: 'numbers', inNav: false,
    fields: [kicker, title, lead, columns, { key: 'items', label: 'الأرقام', type: 'list', itemLabel: 'رقم', titleKey: 'value', fields: [{ key: 'value', label: 'الرقم (مثال +15 أو 98%)', type: 'text' }, { key: 'label', label: 'الوصف', type: 'text' }], newItem: () => ({ value: '+100', label: 'وصف' }) }],
    content: () => ({ kicker: '', title: '', lead: '', columns: '4', items: [{ value: '+15', label: 'سنة خبرة' }, { value: '+6', label: 'تخصصات' }, { value: '12', label: 'ساعة يوميًا' }, { value: '24/7', label: 'حجز على واتساب' }] }),
    style: () => baseStyle({ pad: 'm' }),
  },
  steps: {
    type: 'steps', label: 'خطوات', hint: 'إزاي تحجز / إزاي بنشتغل', anchor: 'how', inNav: false,
    fields: [kicker, title, lead, columns, { key: 'line', label: 'خط بين الخطوات', type: 'toggle' }, { key: 'items', label: 'الخطوات', type: 'list', itemLabel: 'خطوة', titleKey: 'title', fields: iconItem(), newItem: () => ({ icon: 'check', title: 'خطوة', text: 'وصف' }) }],
    content: () => ({ kicker: 'إزاي تحجز', title: 'تجربة أبسط من أول رسالة', lead: '', columns: '4', line: true, items: [{ icon: 'chat', title: 'ابعتلنا', text: 'على واتساب أو من الفورم.' }, { icon: 'calendarClock', title: 'نأكد الميعاد', text: 'ونقولك أي تحضير مطلوب.' }, { icon: 'stethoscope', title: 'الكشف', text: 'في ميعادك من غير انتظار.' }, { icon: 'file', title: 'المتابعة', text: 'نتابع معاك على واتساب.' }] }),
    style: () => baseStyle(),
  },
  team: {
    type: 'team', label: 'الأطباء / الفريق', hint: 'صور وأسماء وتخصصات', anchor: 'doctors', inNav: true,
    fields: [kicker, title, lead, columns, { key: 'items', label: 'الأطباء', type: 'list', itemLabel: 'دكتور', titleKey: 'name', fields: [{ key: 'photo', label: 'الصورة', type: 'image' }, { key: 'name', label: 'الاسم', type: 'text' }, { key: 'role', label: 'التخصص', type: 'text' }, { key: 'text', label: 'نبذة / مواعيد', type: 'textarea', rows: 2 }], newItem: () => ({ photo: '', name: 'د. الاسم', role: 'التخصص', text: '' }) }],
    content: () => ({ kicker: 'الأطباء', title: 'فريق بتثق فيه', lead: '', columns: '4', items: [{ photo: '', name: 'د. اسم الطبيب', role: 'الباطنة', text: 'السبت والثلاثاء' }, { photo: '', name: 'د. اسم الطبيبة', role: 'النساء والتوليد', text: 'الأحد والأربعاء' }, { photo: '', name: 'د. اسم الطبيب', role: 'الأطفال', text: 'يوميًا ما عدا الجمعة' }, { photo: '', name: 'د. اسم الطبيب', role: 'العظام', text: 'الاثنين والخميس' }] }),
    style: () => baseStyle({ tilt: true }),
  },
  tests: {
    type: 'tests', label: 'دليل التحاليل (بحث)', hint: 'بحث وتصنيف وتحضير كل تحليل', anchor: 'tests', inNav: true,
    fields: [
      kicker, title, lead,
      { key: 'categories', label: 'التصنيفات (كل سطر تصنيف)', type: 'lines' },
      { key: 'searchPlaceholder', label: 'نص خانة البحث', type: 'text' },
      { key: 'items', label: 'التحاليل', type: 'list', itemLabel: 'تحليل', titleKey: 'name', fields: [{ key: 'name', label: 'الاسم', type: 'text' }, { key: 'en', label: 'الاسم الإنجليزي', type: 'text' }, { key: 'category', label: 'التصنيف (لازم يطابق سطر من التصنيفات)', type: 'text' }, { key: 'fasting', label: 'محتاج صيام', type: 'toggle' }, { key: 'prep', label: 'التحضير', type: 'text' }, { key: 'note', label: 'ملاحظة', type: 'text' }], newItem: () => ({ name: 'تحليل جديد', en: '', category: 'دم', fasting: false, prep: 'لا يحتاج صيام', note: '' }) },
      { key: 'emptyText', label: 'رسالة لو التحليل مش موجود', type: 'text' },
      { key: 'askLabel', label: 'زرار السؤال على واتساب', type: 'text' },
    ],
    content: () => ({
      kicker: 'دليل التحاليل', title: 'محتاج تصوم ولا لأ؟', lead: 'ابحث عن التحليل واعرف تحضيره قبل ما تيجي. لو دكتورك قالك تعليمات مختلفة، امشي على كلامه.',
      categories: ['دم', 'هرمونات', 'بول وبراز'], searchPlaceholder: 'ابحث: سكر، كبد، CBC…',
      items: [
        { name: 'صورة دم كاملة', en: 'CBC', category: 'دم', fasting: false, prep: 'لا يحتاج صيام', note: 'ممكن في أي وقت' },
        { name: 'سكر صائم', en: 'FBS', category: 'دم', fasting: true, prep: 'صيام 8 إلى 12 ساعة', note: 'المية مسموحة' },
        { name: 'سكر تراكمي', en: 'HbA1c', category: 'دم', fasting: false, prep: 'لا يحتاج صيام', note: 'بيقيس متوسط آخر 3 شهور' },
        { name: 'دهون الدم', en: 'Lipid Profile', category: 'دم', fasting: true, prep: 'صيام 9 إلى 12 ساعة', note: 'بلاش أكل دسم الليلة اللي قبلها' },
        { name: 'الغدة الدرقية', en: 'TSH / FT4', category: 'هرمونات', fasting: false, prep: 'لا يحتاج صيام', note: 'يفضل الصبح قبل دوا الغدة' },
        { name: 'تحليل بول كامل', en: 'Urine Analysis', category: 'بول وبراز', fasting: false, prep: 'أول عينة الصبح أفضل', note: 'من منتصف التبول' },
      ],
      emptyText: 'التحليل ده مش في القايمة، بس غالبًا بنعمله. ابعتلنا اسمه ونقولك تحضيره.', askLabel: 'اسأل على الواتساب',
    }),
    style: () => baseStyle({ anim: 'fade-up', stagger: false }),
  },
  packages: {
    type: 'packages', label: 'باقات / أسعار', hint: 'باقات فحص أو كشف', anchor: 'packages', inNav: true,
    fields: [kicker, title, lead, columns, { key: 'items', label: 'الباقات', type: 'list', itemLabel: 'باقة', titleKey: 'name', fields: [{ key: 'icon', label: 'الأيقونة', type: 'icon' }, { key: 'name', label: 'اسم الباقة', type: 'text' }, { key: 'items', label: 'المحتوى (كل سطر بند)', type: 'lines' }, { key: 'price', label: 'السعر (اختياري)', type: 'text' }, { key: 'priceNote', label: 'جنب السعر', type: 'text' }, { key: 'note', label: 'ملاحظة (مثل الصيام)', type: 'text' }, { key: 'featured', label: 'مميزة', type: 'toggle' }, { key: 'flag', label: 'شارة المميزة', type: 'text' }, { key: 'btnLabel', label: 'نص الزرار', type: 'text' }], newItem: () => ({ icon: 'heart', name: 'باقة جديدة', items: ['بند'], price: '', priceNote: 'جنيه', note: '', featured: false, flag: 'الأكثر طلبًا', btnLabel: 'اسأل عن السعر' }) }],
    content: () => ({
      kicker: 'باقات الفحص', title: 'باقات جاهزة بدل ما تختار تحليل تحليل', lead: 'ابعتلنا اسم الباقة على الواتساب ونقولك سعرها وتحضيرها.', columns: '3',
      items: [
        { icon: 'activity', name: 'باقة السكر', items: ['سكر صائم وفاطر', 'سكر تراكمي HbA1c', 'وظائف كلى'], price: '', priceNote: 'جنيه', note: 'محتاجة صيام 9 إلى 12 ساعة', featured: false, flag: '', btnLabel: 'اسأل عن السعر' },
        { icon: 'heart', name: 'باقة الاطمئنان الشاملة', items: ['صورة دم كاملة CBC', 'وظائف كبد وكلى', 'دهون وسكر', 'غدة درقية TSH', 'فيتامين د'], price: '', priceNote: 'جنيه', note: 'محتاجة صيام 9 إلى 12 ساعة', featured: true, flag: 'الأشمل للفحص الدوري', btnLabel: 'اسأل عن السعر' },
        { icon: 'baby', name: 'باقة متابعة الحمل', items: ['صورة دم كاملة', 'فصيلة الدم', 'سكر صائم', 'تحليل بول'], price: '', priceNote: 'جنيه', note: '', featured: false, flag: '', btnLabel: 'اسأل عن السعر' },
      ],
    }),
    style: () => baseStyle({ tilt: true, decor: 'dots' }),
  },
  gallery: {
    type: 'gallery', label: 'معرض صور', hint: 'صور المكان والأجهزة', anchor: 'gallery', inNav: false,
    fields: [kicker, title, lead, columns,
      { key: 'ratio', label: 'نسبة الصور', type: 'select', options: [{ value: '4/3', label: 'عرضي 4:3' }, { value: '16/9', label: 'سينمائي 16:9' }, { value: '1/1', label: 'مربع' }, { value: '3/4', label: 'طولي 3:4' }] },
      { key: 'masonry', label: 'ترتيب متداخل', type: 'toggle' },
      { key: 'items', label: 'الصور', type: 'list', itemLabel: 'صورة', titleKey: 'caption', fields: [{ key: 'image', label: 'الصورة', type: 'image' }, { key: 'caption', label: 'تعليق', type: 'text' }], newItem: () => ({ image: '', caption: '' }) }],
    content: () => ({ kicker: 'من جوه المكان', title: 'شوف المكان قبل ما تيجي', lead: '', columns: '3', ratio: '4/3', masonry: false, items: [{ image: '', caption: 'الاستقبال' }, { image: '', caption: 'غرفة الكشف' }, { image: '', caption: 'المعمل' }] }),
    style: () => baseStyle(),
  },
  cta: {
    type: 'cta', label: 'دعوة لإجراء', hint: 'بلوك لافت بزرار', anchor: 'join', inNav: false,
    fields: [kicker, title, { key: 'text', label: 'النص', type: 'textarea', rows: 3 }, { key: 'btnLabel', label: 'الزرار', type: 'text' }, target('btnTarget'), { key: 'btn2Label', label: 'زرار تاني (اختياري)', type: 'text' }, target('btn2Target', 'الزرار التاني بيودي على'), { key: 'variant', label: 'الشكل', type: 'select', options: [{ value: 'solid', label: 'بلوك ملوّن' }, { value: 'outline', label: 'إطار منقّط' }] }],
    content: () => ({ kicker: 'للأطباء', title: 'عندك عيادة؟ انضم لفريقنا', text: 'عيادات مجهزة، وسكرتارية وحجز أونلاين، وحضور رقمي للدكتور جوه موقع المركز.', btnLabel: 'قدّم دلوقتي', btnTarget: 'wa:عايز أنضم لفريق الأطباء', btn2Label: '', btn2Target: '', variant: 'solid' }),
    style: () => baseStyle({ pad: 'm' }),
  },
  booking: {
    type: 'booking', label: 'فورم الحجز (واتساب)', hint: 'الحجز بيتبعت رسالة واتساب جاهزة', anchor: 'booking', inNav: true,
    fields: [
      kicker, title, lead,
      { key: 'steps', label: 'خطوات جنب الفورم', type: 'list', itemLabel: 'خطوة', titleKey: 'title', fields: iconItem(), newItem: () => ({ icon: 'check', title: 'خطوة', text: 'وصف' }) },
      { key: 'formTitle', label: 'عنوان الفورم', type: 'text' },
      { key: 'intro', label: 'أول سطر في رسالة الواتساب', type: 'text' },
      { key: 'modeToggle', label: 'اختيار (مثلاً منزلي / في المكان)', type: 'toggle' },
      { key: 'modeA', label: 'الاختيار الأول', type: 'text' }, { key: 'modeB', label: 'الاختيار التاني', type: 'text' },
      { key: 'areaField', label: 'خانة المنطقة (تظهر مع الاختيار الأول)', type: 'toggle' },
      { key: 'selectLabel', label: 'عنوان القايمة المنسدلة', type: 'text' },
      { key: 'selectOptions', label: 'اختيارات القايمة (كل سطر اختيار)', type: 'lines' },
      { key: 'notesLabel', label: 'خانة ملاحظات (سيبها فاضية لو مش عايزها)', type: 'text' },
      { key: 'timeOptions', label: 'المواعيد المتاحة (كل سطر ميعاد)', type: 'lines' },
      { key: 'submitLabel', label: 'زرار الإرسال', type: 'text' },
    ],
    content: () => ({
      kicker: 'الحجز', title: 'احجز ميعادك في دقيقة', lead: 'املا البيانات وهتتفتح محادثة واتساب والرسالة جاهزة. مفيش حاجة بتتبعت غير لما تدوس إرسال بنفسك.',
      steps: [{ icon: 'chat', title: 'املا البيانات', text: 'الاسم والتخصص والميعاد.' }, { icon: 'calendarClock', title: 'نأكد الميعاد', text: 'برسالة على واتساب.' }, { icon: 'stethoscope', title: 'تشرّف في ميعادك', text: 'من غير انتظار.' }],
      formTitle: 'احجز ميعادك', intro: 'السلام عليكم، عايز أحجز.', modeToggle: false, modeA: 'زيارة منزلية', modeB: 'هاجي المكان', areaField: false,
      selectLabel: 'التخصص', selectOptions: ['الباطنة', 'الأطفال', 'النساء والتوليد'], notesLabel: '', timeOptions: ['الصبح', 'بعد الضهر', 'بالليل'], submitLabel: 'أكّد الحجز على واتساب',
    }),
    style: () => baseStyle({ stagger: false }),
  },
  location: {
    type: 'location', label: 'العنوان والخريطة', hint: 'العنوان والمواعيد والتليفون', anchor: 'location', inNav: true,
    fields: [kicker, title, { key: 'address', label: 'العنوان', type: 'textarea', rows: 2 }, { key: 'addressNote', label: 'علامة مميزة / كود', type: 'text' }, { key: 'hours', label: 'المواعيد', type: 'text' }, { key: 'showPhone', label: 'إظهار رقم التليفون', type: 'toggle' }, { key: 'mapQuery', label: 'البحث في الخريطة (عنوان أو إحداثيات)', type: 'text' }, { key: 'mapLink', label: 'لينك جوجل ماب (اختياري)', type: 'url' }, { key: 'embed', label: 'عرض خريطة جوجل حقيقية', type: 'toggle', help: 'لو مقفولة، هيظهر رسم خريطة بسيط مع زرار يفتح جوجل ماب.' }],
    content: () => ({ kicker: 'زورنا', title: 'العنوان والمواعيد', address: 'اكتب العنوان بالتفصيل', addressNote: '', hours: 'السبت — الخميس', showPhone: true, mapQuery: '', mapLink: '', embed: true }),
    style: () => baseStyle(),
  },
  faq: {
    type: 'faq', label: 'أسئلة متكررة', hint: 'أسئلة وإجابات', anchor: 'faq', inNav: false,
    fields: [kicker, title, lead, { key: 'layout', label: 'الترتيب', type: 'select', options: [{ value: 'side', label: 'العنوان جنب الأسئلة' }, { value: 'stacked', label: 'العنوان فوق الأسئلة' }] }, { key: 'items', label: 'الأسئلة', type: 'list', itemLabel: 'سؤال', titleKey: 'q', fields: [{ key: 'q', label: 'السؤال', type: 'text' }, { key: 'a', label: 'الإجابة', type: 'textarea', rows: 3 }], newItem: () => ({ q: 'سؤال جديد؟', a: 'الإجابة.' }) }],
    content: () => ({ kicker: 'أسئلة بتتكرر', title: 'قبل ما تيجي', lead: '', layout: 'side', items: [{ q: 'إزاي أحجز؟', a: 'من الفورم في الصفحة أو برسالة واتساب مباشرة، وهيتأكد ميعادك برسالة.' }, { q: 'فيه حجز لنفس اليوم؟', a: 'حسب المتاح، ابعتلنا وهنقولك أقرب ميعاد.' }] }),
    style: () => baseStyle({ stagger: false }),
  },
  footer: {
    type: 'footer', label: 'الفوتر', hint: 'آخر الصفحة', anchor: 'footer', inNav: false,
    fields: [{ key: 'brand', label: 'الاسم', type: 'text' }, { key: 'text', label: 'سطر (عنوان أو وصف)', type: 'text' }, { key: 'showLinks', label: 'إظهار روابط الأقسام', type: 'toggle' }, { key: 'copyright', label: 'حقوق النشر', type: 'text' }, { key: 'credit', label: 'سطر التصميم', type: 'text' }],
    content: () => ({ brand: 'اسم المركز', text: '', showLinks: true, copyright: '© 2026 اسم المركز', credit: 'تصميم وتطوير MedFrame Studio' }),
    style: () => baseStyle({ pad: 'm', bgMode: 'solid', bgColor: '#06201E', anim: 'none' }),
  },
};

export const SECTION_ORDER: SectionType[] = ['header', 'hero', 'marquee', 'cards', 'highlight', 'textImage', 'stats', 'steps', 'team', 'tests', 'packages', 'gallery', 'cta', 'booking', 'location', 'faq', 'footer'];

export function makeSection(type: SectionType, content: Record<string, any> = {}, style: Partial<SectionStyle> = {}, extra: Partial<Section> = {}): Section {
  const d = SECTION_DEFS[type];
  return {
    id: uid('sec'), type, anchor: d.anchor, label: d.label, visible: true, inNav: d.inNav,
    content: { ...d.content(), ...content },
    style: { ...d.style(), ...style },
    ...extra,
  };
}

/** Fill any keys added in later versions so older saved sites keep working. */
export function normalizeSection(s: Section): Section {
  const d = SECTION_DEFS[s.type];
  if (!d) return s;
  return { ...s, content: { ...d.content(), ...s.content }, style: { ...d.style(), ...s.style } };
}
