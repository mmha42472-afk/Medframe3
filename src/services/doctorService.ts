import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseReady, handleFirestoreError, OperationType } from '../firebase/config';
import { DoctorProfile, DoctorStatus } from '../types/doctor';
import { DEMO_DOCTORS } from '../data/demoDoctors';

const COLLECTION_NAME = 'doctors';
const STORAGE_KEY_CUSTOM_DOCTORS = 'medframe_local_doctors_cache_v1';

export interface LoadResult {
  doctors: DoctorProfile[];
  source: 'cloud' | 'local' | 'demo';
  liveSynced: boolean;
}

/**
 * Normalizes any doctor record (from Firestore, localStorage, or JSON)
 * ensuring all required objects, clinic details, and arrays are guaranteed to exist.
 */
export function normalizeDoctorProfile(raw: any): DoctorProfile {
  if (!raw) {
    raw = {};
  }
  return {
    id: raw.id || `doc-${Date.now()}`,
    slug: raw.slug || `dr-${Date.now().toString().slice(-6)}`,
    name: raw.name || 'طبيب استشاري',
    nameEn: raw.nameEn || '',
    title: raw.title || 'طبيب استشاري',
    specialty: raw.specialty || 'طب عام',
    subspecialties: Array.isArray(raw.subspecialties) ? raw.subspecialties : [],
    licenseNumber: raw.licenseNumber || 'SCHS-REG',
    experienceYears: Number(raw.experienceYears) || 5,
    rating: Number(raw.rating) || 5.0,
    reviewCount: Number(raw.reviewCount) || 1,
    avatarUrl: raw.avatarUrl || '',
    coverUrl: raw.coverUrl || '',
    bio: raw.bio || '',
    statement: raw.statement || '',
    themeColor: raw.themeColor || 'teal',
    status: raw.status === 'draft' ? 'draft' : 'published',
    qualifications: Array.isArray(raw.qualifications) ? raw.qualifications : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    clinic: {
      name: raw.clinic?.name || 'العيادة الطبية',
      city: raw.clinic?.city || 'الرياض',
      address: raw.clinic?.address || '',
      phone: raw.clinic?.phone || '',
      whatsapp: raw.clinic?.whatsapp || '',
      workingHours: Array.isArray(raw.clinic?.workingHours) ? raw.clinic.workingHours : []
    },
    services: Array.isArray(raw.services) ? raw.services : [],
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    articles: Array.isArray(raw.articles) ? raw.articles : [],
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    testimonials: Array.isArray(raw.testimonials) ? raw.testimonials : [],
    customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
    socialLinks: raw.socialLinks || {},
    seo: raw.seo || { metaTitle: raw.name || '', metaDescription: '', keywords: [] },
    sectionsConfig: {
      hero: raw.sectionsConfig?.hero ?? true,
      about: raw.sectionsConfig?.about ?? true,
      qualifications: raw.sectionsConfig?.qualifications ?? true,
      experience: raw.sectionsConfig?.experience ?? true,
      services: raw.sectionsConfig?.services ?? true,
      clinic: raw.sectionsConfig?.clinic ?? true,
      gallery: raw.sectionsConfig?.gallery ?? (Array.isArray(raw.photos) && raw.photos.length > 0),
      articles: raw.sectionsConfig?.articles ?? true,
      faqs: raw.sectionsConfig?.faqs ?? true,
      testimonials: raw.sectionsConfig?.testimonials ?? true,
      contact: raw.sectionsConfig?.contact ?? true,
    },
    customStyles: raw.customStyles || {},
    avatarSize: raw.avatarSize || 'xl',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    isDemo: Boolean(raw.isDemo)
  };
}

/**
 * Loads custom doctors stored in browser localStorage safely.
 */
function getLocalCustomDoctors(): DoctorProfile[] {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DOCTORS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeDoctorProfile);
      }
      return [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves custom doctors to browser localStorage safely.
 */
function setLocalCustomDoctors(doctors: DoctorProfile[]): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DOCTORS, JSON.stringify(doctors));
    }
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

/**
 * Fetches all doctors according to authorization level.
 * Public users ONLY receive 'published' profiles.
 * Admins receive all (published, draft, archived).
 * Implements a 2s timeout race so dormant or slow connections fall back instantly to demo data.
 */
export async function getDoctorsList(isAdmin: boolean = false): Promise<LoadResult> {
  const localItems = getLocalCustomDoctors();

  // Try Firestore if ready
  if (isFirebaseReady) {
    try {
      const doctorsRef = collection(db, COLLECTION_NAME);
      const q = isAdmin 
        ? query(doctorsRef) 
        : query(doctorsRef, where('status', '==', 'published'));

      const fetchPromise = getDocs(q);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
      const cloudDoctors: DoctorProfile[] = [];

      snapshot.forEach((docSnap) => {
        cloudDoctors.push(normalizeDoctorProfile(docSnap.data()));
      });

      if (cloudDoctors.length > 0) {
        // Merge any local items that might not have synced yet
        const merged = [...cloudDoctors];
        localItems.forEach(localItem => {
          const idx = merged.findIndex(d => d.id === localItem.id);
          if (idx >= 0) {
            // Keep the one with newer updatedAt
            const localTime = new Date(localItem.updatedAt || 0).getTime();
            const cloudTime = new Date(merged[idx].updatedAt || 0).getTime();
            if (localTime > cloudTime) {
              merged[idx] = localItem;
            }
          } else {
            merged.unshift(localItem);
          }
        });

        const finalDoctors = isAdmin 
          ? merged 
          : merged.filter(d => d.status === 'published');

        return {
          doctors: finalDoctors,
          source: 'cloud',
          liveSynced: true
        };
      }
    } catch (e) {
      console.warn('Firestore load notice (falling back to local/demo):', e);
    }
  }

  // Fallback: Merge Demo + Local Custom
  let merged = DEMO_DOCTORS.map(normalizeDoctorProfile);
  
  // Overwrite or append local items
  localItems.forEach(localItem => {
    const index = merged.findIndex(d => d.id === localItem.id);
    if (index >= 0) {
      merged[index] = localItem;
    } else {
      merged.unshift(localItem);
    }
  });

  // Filter drafts for non-admin
  if (!isAdmin) {
    merged = merged.filter(d => d.status === 'published');
  }

  return {
    doctors: merged,
    source: localItems.length > 0 ? 'local' : 'demo',
    liveSynced: false
  };
}

/**
 * Normalizes slug candidates for resilient matching
 */
function getSlugVariants(slug: string): string[] {
  const set = new Set<string>();
  const trimmed = slug.trim().toLowerCase();
  set.add(trimmed);
  if (trimmed.startsWith('dr-dr-')) {
    set.add(trimmed.replace(/^dr-dr-/, 'dr-'));
  } else if (trimmed.startsWith('dr-')) {
    set.add(trimmed.replace(/^dr-/, 'dr-dr-'));
  }
  return Array.from(set);
}

/**
 * Fetches a single doctor by URL slug or ID.
 * Gated: Public visitors receive full profile or draft preview banner.
 * Local-First for 0ms instant loading, with reliable Firestore cloud fallback.
 */
export async function getDoctorBySlug(slug: string, isAdmin: boolean = false): Promise<DoctorProfile | null> {
  if (!slug) return null;
  const variants = getSlugVariants(slug);
  const cleanTarget = slug.trim().toLowerCase();

  // 1. Instant check: local custom modifications (0ms, offline-first)
  const localList = getLocalCustomDoctors();
  const localMatch = localList.find(d => 
    variants.includes(d.slug.toLowerCase()) || 
    d.id.toLowerCase() === cleanTarget ||
    d.slug.toLowerCase() === cleanTarget
  );
  if (localMatch) {
    if (localMatch.status === 'published' || isAdmin) {
      return localMatch;
    }
  }

  // 2. Instant check: demo doctors
  const demoMatch = DEMO_DOCTORS.find(d => 
    variants.includes(d.slug.toLowerCase()) || 
    d.id.toLowerCase() === cleanTarget ||
    d.slug.toLowerCase() === cleanTarget
  );
  if (demoMatch) {
    if (demoMatch.status === 'published' || isAdmin) {
      return demoMatch;
    }
  }

  // 3. Cloud Firestore query (vital for public visitors and new devices)
  if (isFirebaseReady) {
    try {
      const doctorsRef = collection(db, COLLECTION_NAME);
      const q = query(doctorsRef, where('slug', 'in', variants.slice(0, 10)));
      
      const fetchPromise = getDocs(q);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 4000)
      );

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
      if (!snapshot.empty) {
        const docData = normalizeDoctorProfile(snapshot.docs[0].data());
        if (docData.status === 'published' || isAdmin) {
          return docData;
        }
      }

      // Check by direct doc ID if target starts with doc-
      if (cleanTarget.startsWith('doc-')) {
        const docSnap = await getDoc(doc(db, COLLECTION_NAME, cleanTarget));
        if (docSnap.exists()) {
          const docData = normalizeDoctorProfile(docSnap.data());
          if (docData.status === 'published' || isAdmin) {
            return docData;
          }
        }
      }
    } catch (e) {
      console.warn('Firestore fetch slug query error:', e);
    }
  }

  // 4. Return local or demo match if found (even if draft, to allow draft preview banner)
  if (localMatch) return localMatch;
  if (demoMatch) return demoMatch;

  return null;
}

/**
 * Finds doctor by slug or ID regardless of draft or published status (used for helpful resolution in 404 / draft views)
 */
export async function findDoctorAnyStatus(slug: string): Promise<DoctorProfile | null> {
  if (!slug) return null;
  const variants = getSlugVariants(slug);
  const cleanTarget = slug.trim().toLowerCase();

  // 1. Check local modifications first
  const localList = getLocalCustomDoctors();
  const localMatch = localList.find(d => 
    variants.includes(d.slug.toLowerCase()) || 
    d.id.toLowerCase() === cleanTarget ||
    d.slug.toLowerCase() === cleanTarget
  );
  if (localMatch) return localMatch;

  // 2. Check demo doctors
  const demoMatch = DEMO_DOCTORS.find(d => 
    variants.includes(d.slug.toLowerCase()) || 
    d.id.toLowerCase() === cleanTarget ||
    d.slug.toLowerCase() === cleanTarget
  );
  if (demoMatch) return demoMatch;

  // 3. Check Firestore
  if (isFirebaseReady) {
    try {
      const doctorsRef = collection(db, COLLECTION_NAME);
      const q = query(doctorsRef, where('slug', 'in', variants.slice(0, 10)));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return normalizeDoctorProfile(snapshot.docs[0].data());
      }
      if (cleanTarget.startsWith('doc-')) {
        const snap = await getDoc(doc(db, COLLECTION_NAME, cleanTarget));
        if (snap.exists()) return normalizeDoctorProfile(snap.data());
      }
    } catch (e) {
      console.warn('Firestore findDoctorAnyStatus error:', e);
    }
  }

  return null;
}

/**
 * Formats firestore errors into clear actionable Arabic messages
 */
export function formatFirestoreErrorMessage(error: unknown): string {
  if (!error) return 'خطأ غير معروف في الاتصال بفايربيس';
  const str = String(error);
  if (str.includes('permission-denied') || str.includes('insufficient permissions')) {
    return 'قواعد أمان فايربيس تتطلب تسجيل الدخول كمسؤول أولاً. (يجب تفعيل Email/Password في Firebase Console وتسجيل الدخول كمسؤول).';
  }
  if (str.includes('not-found') || str.includes('NOT_FOUND')) {
    return 'قاعدة بيانات Firestore المحددة غير موجودة في هذا المشروع أو تم تغيير معرف قاعدة البيانات.';
  }
  if (str.includes('unavailable') || str.includes('client is offline')) {
    return 'خوادم فايربيس غير متاحة حالياً أو الجهاز غير متصل بالإنترنت.';
  }
  return str;
}

/**
 * Saves or updates a doctor profile in Firestore and local cache.
 */
export async function saveDoctorProfile(profile: DoctorProfile): Promise<{ success: boolean; cloudSaved: boolean; cloudError?: string }> {
  const updatedProfile: DoctorProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    isDemo: false
  };

  let cloudSaved = false;
  let cloudError: string | undefined = undefined;

  // 1. Always update local cache FIRST for instant UI reactivity
  const localList = getLocalCustomDoctors();
  const index = localList.findIndex(d => d.id === updatedProfile.id);
  if (index >= 0) {
    localList[index] = updatedProfile;
  } else {
    localList.unshift(updatedProfile);
  }
  setLocalCustomDoctors(localList);

  // 2. Save to Firestore cloud database
  if (isFirebaseReady) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedProfile.id);
      await setDoc(docRef, updatedProfile);
      cloudSaved = true;
    } catch (error) {
      console.warn('Firestore cloud save failed. Saved locally:', error);
      cloudError = formatFirestoreErrorMessage(error);
    }
  } else {
    cloudError = 'خدمة فايربيس غير متصلة بعد.';
  }

  return { success: true, cloudSaved, cloudError };
}

/**
 * Deletes a doctor profile.
 */
export async function deleteDoctorProfile(id: string): Promise<boolean> {
  // Delete from Firestore if available
  if (db && isFirebaseReady) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firestore deletion notice:', error);
    }
  }

  // Delete from local cache
  const localList = getLocalCustomDoctors().filter(d => d.id !== id);
  setLocalCustomDoctors(localList);

  return true;
}

/**
 * Duplicates a doctor profile.
 */
export async function duplicateDoctorProfile(source: DoctorProfile): Promise<DoctorProfile> {
  const timestamp = Date.now().toString().slice(-4);
  const newSlug = `${source.slug}-copy-${timestamp}`;
  const newId = `doc-${Date.now()}`;

  const duplicated: DoctorProfile = {
    ...source,
    id: newId,
    slug: newSlug,
    name: `${source.name} (نسخة مسودة)`,
    nameEn: source.nameEn ? `${source.nameEn} (Copy)` : undefined,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false
  };

  await saveDoctorProfile(duplicated);
  return duplicated;
}

/**
 * Toggles publication status of a doctor.
 */
export async function toggleDoctorStatus(
  doctor: DoctorProfile, 
  newStatus: DoctorStatus
): Promise<DoctorProfile> {
  const updated: DoctorProfile = {
    ...doctor,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  await saveDoctorProfile(updated);
  return updated;
}

/**
 * Syncs demo doctors into live Firestore collection.
 */
export async function syncDemoDataToFirestore(): Promise<{ count: number; error?: string }> {
  if (!db || !isFirebaseReady) {
    return { count: 0, error: 'قاعدة بيانات فايربيس غير متصلة حالياً. يرجى التحقق من إعدادات المفاتيح.' };
  }

  let count = 0;
  try {
    for (const demoDoc of DEMO_DOCTORS) {
      const docRef = doc(db, COLLECTION_NAME, demoDoc.id);
      await setDoc(docRef, {
        ...demoDoc,
        updatedAt: new Date().toISOString()
      });
      count++;
    }
    return { count };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    } catch (e) {
      return { count, error: e instanceof Error ? e.message : String(e) };
    }
    return { count };
  }
}

/**
 * Transfers and syncs all current doctor profiles (demo + custom edits) into live Firestore.
 */
export async function syncAllDoctorsToFirestore(doctorsList: DoctorProfile[]): Promise<{ 
  success: boolean; 
  count: number; 
  total: number;
  error?: string 
}> {
  if (!db || !isFirebaseReady) {
    return { 
      success: false, 
      count: 0, 
      total: doctorsList.length, 
      error: 'خدمة فايربيس غير متصلة بعد. يرجى إدخال مفاتيح فايربيس أو التأكد من التهيئة.' 
    };
  }

  let count = 0;
  let firstError: string | undefined = undefined;

  for (const doctor of doctorsList) {
    try {
      const docRef = doc(db, COLLECTION_NAME, doctor.id);
      await setDoc(docRef, {
        ...doctor,
        updatedAt: new Date().toISOString()
      });
      count++;
    } catch (error) {
      if (!firstError) {
        firstError = formatFirestoreErrorMessage(error);
      }
    }
  }

  if (count > 0 && !firstError) {
    return { success: true, count, total: doctorsList.length };
  }

  if (count > 0 && firstError) {
    return { 
      success: true, 
      count, 
      total: doctorsList.length, 
      error: `تم نقل ${count} ملفات بنجاح إلى فايربيس. ملاحظة: ${firstError}` 
    };
  }

  return { 
    success: false, 
    count: 0, 
    total: doctorsList.length, 
    error: firstError || 'فشل نقل البيانات إلى فايربيس.' 
  };
}

/**
 * Exports doctors array to a downloadable JSON file.
 */
export function exportDoctorsJSON(doctors: DoctorProfile[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doctors, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `medframe_doctors_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Parses and validates an uploaded JSON file into doctor profiles.
 */
export function importDoctorsJSON(jsonString: string): DoctorProfile[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('ملف JSON غير صالح أو به خطأ في الصياغة.');
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const validDoctors: DoctorProfile[] = [];

  for (const item of items) {
    if (!item.name || !item.specialty) {
      continue;
    }

    const cleanDoctor: DoctorProfile = {
      id: item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      slug: item.slug || `dr-${Date.now().toString().slice(-6)}`,
      name: item.name,
      nameEn: item.nameEn || '',
      title: item.title || 'طبيب استشاري',
      specialty: item.specialty,
      subspecialties: Array.isArray(item.subspecialties) ? item.subspecialties : [],
      licenseNumber: item.licenseNumber || 'SCHS-REG',
      experienceYears: Number(item.experienceYears) || 5,
      rating: Number(item.rating) || 5,
      reviewCount: Number(item.reviewCount) || 1,
      avatarUrl: item.avatarUrl || '',
      coverUrl: item.coverUrl || '',
      bio: item.bio || '',
      statement: item.statement || '',
      themeColor: item.themeColor || 'teal',
      status: item.status === 'published' ? 'published' : 'draft',
      qualifications: Array.isArray(item.qualifications) ? item.qualifications : [],
      experience: Array.isArray(item.experience) ? item.experience : [],
      clinic: item.clinic || {
        name: 'العيادة الطبية',
        city: 'الرياض',
        address: '',
        phone: '',
        whatsapp: '',
        workingHours: []
      },
      services: Array.isArray(item.services) ? item.services : [],
      articles: Array.isArray(item.articles) ? item.articles : [],
      faqs: Array.isArray(item.faqs) ? item.faqs : [],
      testimonials: Array.isArray(item.testimonials) ? item.testimonials : [],
      socialLinks: item.socialLinks || {},
      seo: item.seo || {
        metaTitle: item.name,
        metaDescription: '',
        keywords: []
      },
      sectionsConfig: item.sectionsConfig || {
        hero: true,
        about: true,
        qualifications: true,
        experience: true,
        services: true,
        clinic: true,
        articles: true,
        faqs: true,
        testimonials: true,
        contact: true
      },
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    validDoctors.push(cleanDoctor);
  }

  if (validDoctors.length === 0) {
    throw new Error('لم يتم العثور على أي ملفات أطباء صالحة في الملف المرفق.');
  }

  // Save to local cache
  const localList = getLocalCustomDoctors();
  validDoctors.forEach(docItem => {
    const idx = localList.findIndex(d => d.id === docItem.id);
    if (idx >= 0) {
      localList[idx] = docItem;
    } else {
      localList.unshift(docItem);
    }
  });
  setLocalCustomDoctors(localList);

  return validDoctors;
}
