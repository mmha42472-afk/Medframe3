import type { Site, SiteKind } from './types';
import { defaultSettings, defaultTheme, makeSection } from './schema';
import { slugify, uid } from './utils';

export interface TemplateDef { id: string; kind: SiteKind; name: string; description: string; swatch: [string, string, string]; build: (name?: string) => Site }

const now = () => new Date().toISOString();
/** The distinctive word of a name: «مركز الأمل الطبي» → «الأمل» */
const keyword = (name: string, fallback: string) => {
  const generic = /^(عيادات|عيادة|مركز|مجمع|معمل|مستشفى|الطبي|الطبية|التخصصي|التخصصية|للتحاليل|التحاليل|الطبيه|د\.?|دكتور)$/;
  return name.split(/\s+/).find(w => w && !generic.test(w)) || fallback;
};
const site = (kind: SiteKind, name: string, partial: Partial<Site>): Site => ({
  id: uid('site'), name, slug: slugify(name), kind,
  theme: defaultTheme(), settings: defaultSettings(), sections: [],
  createdAt: now(), updatedAt: now(), ...partial,
});

/* ---------- 1. Polyclinic — deep teal night hero, art card, gold accent ---------- */
function polyclinic(name = 'عيادات سَنا التخصصية'): Site {
  const brand = name;
  return site('polyclinic', name, {
    theme: { ...defaultTheme(), primary: '#0F7B6C', primaryDark: '#0A5A4F', accent: '#E8A33D', ink: '#0E2B2A', muted: '#5E7472', paper: '#FBFAF7', night: '#06201E', pageBg: '#FBFAF7', hlStyle: 'gradient' },
    settings: { ...defaultSettings(), whatsapp: '', phone: '01X XXXX XXXX', metaTitle: `${brand} — رعاية طبية متكاملة`, metaDescription: 'عيادات تخصصية ومعمل تحاليل في مكان واحد. احجز ميعادك على واتساب.' },
    sections: [
      makeSection('header', { brand, tagline: 'مجمع عيادات تخصصية', markIcon: 'stethoscope', ctaLabel: 'احجز كشف', ctaTarget: '#booking' }),
      makeSection('hero', {
        badge: 'افتتاح جديد', title: 'رعاية طبية متكاملة\nقريبة منك.. *في مكان واحد*',
        lead: 'كشف، متابعة، وتحاليل تحت سقف واحد. احجز ميعادك في دقيقة على واتساب، ووفّر على نفسك المشوار والانتظار.',
        artWord: keyword(name, 'سَنا'), artSub: 'Polyclinic & Lab',
        stats: [{ value: '+6', label: 'تخصصات طبية' }, { value: 'معمل', label: 'تحاليل تابع للمركز' }, { value: 'واتساب', label: 'حجز ورد سريع' }],
        quick: [{ icon: 'pin', title: 'العنوان', text: 'اكتب عنوان المركز' }, { icon: 'clock', title: 'السبت — الخميس', text: 'صباحي ومسائي' }, { icon: 'phone', title: '01X XXXX XXXX', text: 'رقم الحجز والاستفسارات' }],
      }, { decor: 'glow', bg3d: 'none' }),
      makeSection('marquee', { items: ['الباطنة', 'الأطفال', 'النساء والتوليد', 'الأسنان', 'الجلدية', 'العظام', 'معمل التحاليل', 'سحب منزلي'] }, { pad: 's' }, { label: 'شريط التخصصات' }),
      makeSection('cards', {
        kicker: 'التخصصات', title: 'كل اللي عيلتك محتاجاه\nفي مكان واحد', columns: '3',
        items: [
          { icon: 'stethoscope', title: 'الباطنة', text: 'تشخيص ومتابعة الضغط والسكر وأمراض الجهاز الهضمي.' },
          { icon: 'baby', title: 'الأطفال', text: 'متابعة النمو والتطعيمات وكشف الأطفال وحديثي الولادة.' },
          { icon: 'heart', title: 'النساء والتوليد', text: 'متابعة الحمل والسونار وصحة المرأة.' },
          { icon: 'smile', title: 'الأسنان', text: 'حشو وعلاج عصب وتنظيف وتجميل الأسنان.' },
          { icon: 'sun', title: 'الجلدية', text: 'علاج الأمراض الجلدية ومشاكل البشرة والشعر.' },
          { icon: 'bone', title: 'العظام', text: 'آلام المفاصل والظهر والإصابات والكسور.' },
        ],
      }, { tilt: true }, { anchor: 'specialties', label: 'التخصصات' }),
      makeSection('highlight', {}, { pad: 's' }, { anchor: 'lab', label: 'التحاليل' }),
      makeSection('cards', {
        kicker: 'ليه إحنا', title: 'تجربة أبسط من أول رسالة', lead: '', variant: 'numbered', columns: '4', showNumbers: false,
        items: [
          { icon: 'calendar', title: 'حجز مسبق', text: 'ميعادك محجوز باسمك، فمتستناش كتير.' },
          { icon: 'flask', title: 'كشف وتحليل في مكان واحد', text: 'الدكتور يطلب التحليل وتعمله في نفس الزيارة.' },
          { icon: 'chat', title: 'متابعة على واتساب', text: 'تأكيد الميعاد والتذكير والنتايج على موبايلك.' },
          { icon: 'pin', title: 'قريب منك', text: 'في قلب منطقتك، وسهل الوصول.' },
        ],
      }, {}, { anchor: 'why', label: 'ليه إحنا' }),
      makeSection('team', {}, { tilt: true, bgMode: 'solid', bgColor: '#EEF6F4' }, { inNav: false }),
      makeSection('cta', {}, { pad: 's' }),
      makeSection('booking', { selectOptions: ['الباطنة', 'الأطفال', 'النساء والتوليد', 'الأسنان', 'الجلدية', 'العظام', 'معمل التحاليل'] }),
      makeSection('location', { address: 'اكتب العنوان بالتفصيل', hours: 'السبت — الخميس · صباحي ومسائي', mapQuery: '' }),
      makeSection('faq', {
        layout: 'stacked', items: [
          { q: 'إزاي أحجز؟', a: 'من الفورم في الصفحة أو برسالة واتساب مباشرة، وهيتأكد ميعادك برسالة.' },
          { q: 'ينفع أعمل التحاليل في نفس يوم الكشف؟', a: 'أيوه، معمل التحاليل تابع للمركز، فتقدر تعمل التحليل في نفس الزيارة.' },
          { q: 'فيه سحب عينات من البيت؟', a: 'أيوه، ابعت على واتساب العنوان والتحليل المطلوب وهيتحددلك ميعاد.' },
        ],
      }, { align: 'center' }),
      makeSection('footer', { brand, text: 'مجمع عيادات تخصصية ومعمل تحاليل', copyright: `© 2026 ${brand}` }, { bgColor: '#06201E' }),
    ],
  });
}

/* ---------- 2. Lab — clinical white, navy + blood-drop red, 3D cells ---------- */
function lab(name = 'معمل نَقاء للتحاليل'): Site {
  const brand = name;
  return site('lab', name, {
    theme: { ...defaultTheme(), primary: '#1F2A7A', primaryDark: '#141C57', accent: '#D7263D', ink: '#141B3D', muted: '#55607A', paper: '#FFFFFF', card: '#FFFFFF', night: '#141C57', pageBg: '#FFFFFF', hlStyle: 'color', radius: 18 },
    settings: { ...defaultSettings(), phone: '01X XXXX XXXX', mobileBarSecondaryLabel: 'الاتجاهات', metaTitle: `${brand} — نتيجة دقيقة تطمّنك`, metaDescription: 'معمل تحاليل طبية: سحب منزلي، نتيجة على واتساب، ودليل تحضير التحاليل.' },
    sections: [
      makeSection('header', { brand, tagline: 'MEDICAL LAB', markIcon: 'drop', ctaLabel: 'احجز على الواتساب', ctaTarget: 'wa:مساء الخير، عايز أحجز تحليل' }),
      makeSection('hero', {
        badge: 'من 11 الصبح لـ 11 بالليل', badgeHours: '11-23', badgeOpen: 'مفتوح دلوقتي', badgeClosed: 'مقفول دلوقتي',
        title: 'نتيجة دقيقة *تطمّنك*،\nوتوصلك لحد عندك', lead: 'اسحب العينة في المعمل أو من بيتك، والنتيجة توصلك على الواتساب.',
        btn1Label: 'اطلب سحب منزلي', btn1Target: 'wa:عايز أحجز سحب منزلي', btn1Icon: 'home', btn2Label: 'اعرف تحضير تحليلك', btn2Target: '#tests', btn2Icon: 'search',
        stats: [], visual: '3d', threeKind: 'cells',
        chips: [{ icon: 'drop', title: 'أدوات استخدام مرة واحدة', text: '' }, { icon: 'file', title: 'النتيجة PDF على الواتساب', text: '' }],
      }, { bgMode: 'solid', bgColor: '#FFFFFF', decor: 'dots' }),
      makeSection('marquee', { variant: 'pills', items: ['صورة دم كاملة CBC', 'سكر تراكمي HbA1c', 'وظائف كبد', 'وظائف كلى', 'دهون الدم', 'فيتامين د', 'الغدة الدرقية TSH', 'مخزون الحديد', 'تحليل حمل', 'تحليل بول'], speed: 40 }, { bgMode: 'solid', bgColor: '#F2F4FC' }, { label: 'شريط التحاليل' }),
      makeSection('cards', {
        kicker: 'خدماتنا', title: 'كل اللي محتاجه في زيارة واحدة', lead: '', columns: '4', solidIcons: true, showNumbers: false,
        items: [
          { icon: 'flask', title: 'تحاليل الدم الروتينية', text: 'صورة دم، سكر، وظائف كبد وكلى، دهون، وغدة درقية.' },
          { icon: 'home', title: 'سحب عينات من البيت', text: 'لكبار السن والحوامل والأطفال، في الميعاد اللي يناسبك.' },
          { icon: 'file', title: 'نتيجتك على موبايلك', text: 'بنبعتلك النتيجة على الواتساب أول ما تجهز.' },
          { icon: 'clock', title: 'مفتوح 12 ساعة', text: 'من 11 الصبح لحد 11 بالليل، فتلحق بعد شغلك.' },
        ],
      }, { tilt: true }, { label: 'الخدمات' }),
      makeSection('tests'),
      makeSection('packages', {}, { bgMode: 'solid', bgColor: '#FFFFFF', decor: 'dots' }),
      makeSection('booking', {
        kicker: 'الحجز والسحب المنزلي', title: 'من غير ما تنزل من البيت',
        steps: [{ icon: 'chat', title: 'ابعتلنا التحاليل', text: 'اكتبها أو صوّر الروشتة.' }, { icon: 'calendarClock', title: 'نأكد الميعاد', text: 'ونقولك تعليمات الصيام لو محتاج.' }, { icon: 'shield', title: 'نسحب العينة', text: 'بأدوات معقمة واستخدام مرة واحدة.' }, { icon: 'file', title: 'النتيجة توصلك', text: 'على الواتساب، وورقي لو حبيت.' }],
        intro: `السلام عليكم، عايز أحجز في ${brand}.`, modeToggle: true, modeA: 'سحب منزلي', modeB: 'هاجي المعمل', areaField: true,
        selectLabel: '', selectOptions: [], notesLabel: 'التحاليل المطلوبة', timeOptions: ['الصبح', 'بعد الضهر', 'بالليل'], submitLabel: 'كمّل الحجز على الواتساب',
      }),
      makeSection('faq', {
        kicker: 'أسئلة بتتكرر', title: 'قبل ما تيجي', items: [
          { q: 'أقدر أشرب مية وأنا صايم للتحليل؟', a: 'أيوه، المية العادية مسموحة. الممنوع الأكل والعصير والشاي والقهوة لحد ما تسحب العينة.' },
          { q: 'آخد أدويتي قبل التحليل؟', a: 'أغلب الأدوية عادي، بس بعض التحاليل زي الغدة الدرقية بيفضل تسحب قبل الدوا. قول للفني على أدويتك.' },
          { q: 'محتاج روشتة عشان أعمل تحليل؟', a: 'ابعتلنا على الواتساب التحاليل اللي عايزها، ولو معاك روشتة ابعت صورتها.' },
          { q: 'بتسحبوا من الأطفال؟', a: 'أيوه. ولو الطفل صغير، السحب المنزلي بيكون أريح ليه.' },
        ],
      }, { bgMode: 'solid', bgColor: '#F2F4FC' }),
      makeSection('location', { kicker: 'زورنا', title: 'عنوان المعمل', address: 'اكتب عنوان المعمل بالتفصيل', addressNote: 'علامة مميزة جنب المعمل', hours: 'من 11 صباحًا إلى 11 مساءً', embed: false }),
      makeSection('footer', { brand, text: 'للتحاليل الطبية', copyright: `© 2026 ${brand}` }, { bgColor: '#141C57' }),
    ],
  });
}

/* ---------- 3. Doctor — warm editorial, photo arch ---------- */
function doctor(name = 'د. اسم الطبيب'): Site {
  return site('doctor', name, {
    theme: { ...defaultTheme(), primary: '#1E4E79', primaryDark: '#143657', accent: '#C9A227', ink: '#14202E', muted: '#5A6573', paper: '#F7F5F0', night: '#0E1626', pageBg: '#F7F5F0', fontDisplay: 'El Messiri', hlStyle: 'marker' },
    settings: { ...defaultSettings(), phone: '01X XXXX XXXX', metaTitle: `${name} — استشاري`, metaDescription: 'احجز كشفك مع الدكتور على واتساب.' },
    sections: [
      makeSection('header', { brand: name, tagline: 'استشاري التخصص', markIcon: 'user', ctaLabel: 'احجز كشف', ctaTarget: '#booking' }),
      makeSection('hero', {
        badge: 'استشاري · خبرة +15 سنة', title: 'خبرتك تستحق دكتور\n*بيسمعك* للآخر', lead: 'اكتب هنا جملة عن الدكتور وتخصصه وإزاي بيتعامل مع المريض.',
        btn1Label: 'احجز كشف', btn1Target: '#booking', btn2Label: 'عن الدكتور', btn2Target: '#about', btn2Icon: 'user',
        stats: [{ value: '+15', label: 'سنة خبرة' }, { value: '+20K', label: 'مريض' }], visual: 'image', imageShape: 'arch',
        chips: [{ icon: 'badge', title: 'زمالة', text: 'اكتب الشهادة' }],
      }, { bgMode: 'default', decor: 'grain' }),
      makeSection('textImage', { kicker: 'عن الدكتور', title: 'رحلة *طويلة*\nفي خدمة المرضى', imageShape: 'rounded', imageSide: 'start' }),
      makeSection('stats', {}, { bgMode: 'solid', bgColor: '#0E1626' }),
      makeSection('cards', { kicker: 'الخدمات', title: 'إيه اللي بنقدمه', columns: '3', items: [{ icon: 'stethoscope', title: 'كشف واستشارة', text: 'تشخيص دقيق وخطة علاج واضحة.' }, { icon: 'scan', title: 'متابعة دورية', text: 'متابعة الحالة وتعديل العلاج.' }, { icon: 'chat', title: 'استشارة أونلاين', text: 'متابعة سريعة على واتساب.' }] }, { tilt: true }),
      makeSection('steps', { columns: '3', items: [{ icon: 'chat', title: 'احجز', text: 'من الفورم أو واتساب.' }, { icon: 'stethoscope', title: 'الكشف', text: 'في ميعادك.' }, { icon: 'file', title: 'المتابعة', text: 'خطة واضحة ومتابعة.' }] }),
      makeSection('gallery', { title: 'العيادة', kicker: 'من جوه العيادة' }),
      makeSection('booking', { selectLabel: 'نوع الزيارة', selectOptions: ['كشف جديد', 'إعادة', 'استشارة'] }),
      makeSection('location', {}),
      makeSection('faq', {}),
      makeSection('footer', { brand: name, text: 'استشاري التخصص', copyright: `© 2026 ${name}` }, { bgColor: '#0E1626' }),
    ],
  });
}

function blank(name = 'موقع جديد'): Site {
  return site('blank', name, {
    sections: [
      makeSection('header', { brand: name }),
      makeSection('hero', { title: 'عنوان *كبير* يشد العين', visual: 'none', stats: [], chips: [] }, { align: 'center' }),
      makeSection('footer', { brand: name, copyright: `© 2026 ${name}` }),
    ],
  });
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'polyclinic', kind: 'polyclinic', name: 'مجمع عيادات', description: 'واجهة تركواز غامقة، تخصصات، معمل، أطباء، حجز وخريطة', swatch: ['#06201E', '#0F7B6C', '#E8A33D'], build: polyclinic },
  { id: 'lab', kind: 'lab', name: 'معمل تحاليل', description: 'أبيض نظيف، مجسم خلايا 3D، دليل تحاليل بالبحث، باقات وسحب منزلي', swatch: ['#FFFFFF', '#1F2A7A', '#D7263D'], build: lab },
  { id: 'doctor', kind: 'doctor', name: 'عيادة دكتور', description: 'شخصي وفخم: صورة الدكتور، نبذة، أرقام، خدمات وحجز', swatch: ['#F7F5F0', '#1E4E79', '#C9A227'], build: doctor },
  { id: 'blank', kind: 'blank', name: 'صفحة فاضية', description: 'ابدأ من الصفر وضيف الأقسام اللي عايزها', swatch: ['#FBFAF7', '#0F7B6C', '#E8A33D'], build: blank },
];
