import type { Site } from '../types';
import type { TemplateDef } from '../templates';
import { defaultSettings, defaultTheme, makeSection } from '../schema';
import { uid } from '../utils';

/* ------------------------------------------------------------------
   I Clinic — demo concept for «عيادات آى كلينيك التخصصية» (Haram / Mariouteya, Giza).
   Built only from public info on the clinic's Facebook page. Marked as an unpublished
   demonstration (ribbon + noindex) until the clinic approves it.
   Still to confirm with the client: WhatsApp number, specialties, doctors, hours, photos,
   and whether the home-care service is real.
   ------------------------------------------------------------------ */

const BRAND = 'عيادات I Clinic';
const WA = '201130625714';
const ADDRESS = '1 أبراج طيبة (اللبيني) — خلف فندق السياج، المريويطية، الهرم، الجيزة';
const NIGHT = '#1E0825';

function iclinic(): Site {
  const now = new Date().toISOString();
  return {
    id: uid('site'),
    name: 'I Clinic — نموذج مبدئي',
    slug: 'iclinic-demo',
    kind: 'polyclinic',
    theme: {
      ...defaultTheme(),
      primary: '#7A2275', primaryDark: '#521451', accent: '#F2B705',
      ink: '#2A1230', muted: '#6E5A72', paper: '#FCFAFD', card: '#FFFFFF', night: NIGHT,
      pageBg: '#FCFAFD', pageBg2: '#F5EAF5', hlStyle: 'gradient',
    },
    settings: {
      ...defaultSettings(),
      whatsapp: WA, phone: '011 30625714',
      demoRibbon: true, demoRibbonText: 'نموذج مبدئي غير منشور — تصميم MedFrame Studio لعيادات I Clinic',
      noindex: true,
      metaTitle: `${BRAND} التخصصية — الهرم، المريويطية`,
      metaDescription: 'أرقى مجمع للعيادات الطبية في الهرم في جميع التخصصات، بنخبة من الأطباء والاستشاريين وأحدث الأجهزة. احجز ميعادك على واتساب.',
    },
    sections: [
      makeSection('header', { brand: BRAND, tagline: 'مجمع عيادات تخصصية', markIcon: 'stethoscope', ctaLabel: 'احجز كشف', ctaTarget: '#booking' }),
      makeSection('hero', {
        badge: 'الهرم · المريويطية',
        title: 'عيادات في كل التخصصات..\n*تحت سقف واحد*',
        lead: 'أرقى مجمع للعيادات الطبية في الهرم، بنخبة من الأطباء والاستشاريين وأحدث الأجهزة. احجز ميعادك على واتساب في دقيقة.',
        btn1Label: 'احجز ميعادك', btn1Target: '#booking', btn1Icon: 'calendar',
        btn2Label: 'اتجاهات المكان', btn2Target: '#location', btn2Icon: 'pin',
        artWord: 'I Clinic', artSub: 'Specialized Clinics',
        stats: [{ value: 'كل التخصصات', label: 'في مجمع واحد' }, { value: 'استشاريين', label: 'نخبة من الأطباء' }, { value: 'واتساب', label: 'حجز ورد سريع' }],
        chips: [{ icon: 'check', title: 'حجز مسبق', text: 'ميعادك باسمك' }, { icon: 'activity', title: 'أحدث الأجهزة', text: 'رسم قلب وغيره' }],
        quick: [
          { icon: 'pin', title: 'العنوان', text: '1 أبراج طيبة — خلف فندق السياج، المريويطية' },
          // LRM marks keep the digits in order inside the RTL layout
          { icon: 'phone', title: '‎011 30625714‎', text: 'رقم الحجز والاستفسارات' },
          { icon: 'chat', title: 'واتساب', text: 'اسأل عن أي تخصص قبل ما تيجي' },
        ],
        quickCta: 'احجز دلوقتي',
      }, { bgMode: 'gradient', bgColor: NIGHT, bgColor2: '#3A0F42', decor: 'glow' }),
      makeSection('marquee', { items: ['جميع التخصصات', 'نخبة من الاستشاريين', 'أحدث الأجهزة الطبية', 'رسم القلب', 'خدمة منزلية', 'حجز على واتساب', 'الهرم — المريويطية'] }, { pad: 's' }, { label: 'شريط الخدمات' }),
      makeSection('cards', {
        kicker: 'خدماتنا', title: 'مجمع واحد.. وكل اللي\nمحتاجه *قريب منك*', lead: 'اسأل عن أي تخصص على واتساب وهنقولك الدكتور المتاح وأقرب ميعاد.', columns: '4', solidIcons: true, showNumbers: false,
        items: [
          { icon: 'stethoscope', title: 'كشف في كل التخصصات', text: 'عيادات متنوعة في مكان واحد بدل ما تلف بين أكتر من مكان.' },
          { icon: 'badge', title: 'نخبة من الاستشاريين', text: 'أطباء واستشاريين على مستوى عالي بيهتموا بتفاصيل حالتك.' },
          { icon: 'activity', title: 'أحدث الأجهزة', text: 'أجهزة حديثة زي رسم القلب، عشان التشخيص يبقى أدق وأسرع.' },
          { icon: 'home', title: 'رعاية لحد البيت', text: 'ليه تنزل المستشفى لو الرعاية ممكن توصلك؟ اسأل على الخدمة المنزلية.' },
        ],
      }, { tilt: true }, { anchor: 'services', label: 'الخدمات' }),
      makeSection('cards', {
        kicker: 'ليه I Clinic', title: 'تجربة أبسط من أول رسالة', variant: 'numbered', columns: '4', showNumbers: false,
        items: [
          { icon: 'calendar', title: 'حجز مسبق', text: 'ميعادك محجوز باسمك، فمتستناش كتير.' },
          { icon: 'chat', title: 'متابعة على واتساب', text: 'تأكيد الميعاد والاستفسارات على موبايلك.' },
          { icon: 'building', title: 'كل التخصصات في مكان', text: 'مجمع واحد يغنيك عن التنقل بين العيادات.' },
          { icon: 'pin', title: 'في قلب المريوطية', text: 'سهل الوصول، وفي نفس المنطقة المعروفة بالهرم.' },
        ],
      }, {}, { anchor: 'why', label: 'ليه إحنا' }),
      makeSection('booking', {
        kicker: 'الحجز', title: 'احجز ميعادك في دقيقة',
        formTitle: 'احجز ميعادك', intro: `السلام عليكم، عايز أحجز في ${BRAND}.`,
        selectLabel: '', selectOptions: [], notesLabel: 'التخصص المطلوب أو سبب الزيارة',
        timeOptions: ['الصبح', 'بعد الضهر', 'بالليل'], submitLabel: 'أكّد الحجز على واتساب',
      }),
      makeSection('location', {
        kicker: 'زورنا', title: 'العنوان والتواصل', address: ADDRESS, addressNote: 'قريب من فندق السياج',
        hours: 'تواصل معنا لتأكيد مواعيد كل عيادة', showPhone: true, mapQuery: 'أبراج طيبة المريويطية الهرم الجيزة', embed: false,
      }),
      makeSection('faq', {
        layout: 'stacked', title: 'قبل ما تيجي',
        items: [
          { q: 'إزاي أحجز؟', a: 'من الفورم في الصفحة أو برسالة واتساب مباشرة، وهيتأكد ميعادك برسالة.' },
          { q: 'فين مكان العيادات؟', a: `${ADDRESS}.` },
          { q: 'ينفع أسأل عن تخصص أو دكتور معين قبل ما أجي؟', a: 'أكيد، ابعتلنا على واتساب التخصص اللي محتاجه وهنقولك المتاح وأقرب ميعاد.' },
        ],
      }, { align: 'center' }),
      makeSection('footer', { brand: BRAND, text: 'مجمع عيادات تخصصية — الهرم، الجيزة · iclinicegypt@gmail.com', copyright: `© 2026 ${BRAND}` }, { bgColor: NIGHT }),
    ],
    createdAt: now, updatedAt: now,
  };
}

export const iclinicTemplate: TemplateDef = {
  id: 'iclinic',
  kind: 'polyclinic',
  name: 'I Clinic (نموذج مبدئي)',
  description: 'عيادات آى كلينيك — الهرم، المريويطية: بنفسجي وذهبي، حجز واتساب، شريط نموذج مبدئي',
  swatch: ['#1E0825', '#7A2275', '#F2B705'],
  build: () => iclinic(),
};
