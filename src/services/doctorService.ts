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
 * Loads custom doctors stored in browser localStorage safely.
 */
function getLocalCustomDoctors(): DoctorProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DOCTORS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves custom doctors to browser localStorage safely.
 */
function setLocalCustomDoctors(doctors: DoctorProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_DOCTORS, JSON.stringify(doctors));
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

  // Try Firestore only if ready
  if (db && isFirebaseReady) {
    try {
      const doctorsRef = collection(db, COLLECTION_NAME);
      let q;

      if (isAdmin) {
        q = query(doctorsRef);
      } else {
        q = query(doctorsRef, where('status', '==', 'published'));
      }

      // Add a 2s timeout race to guarantee fast boot
      const fetchPromise = getDocs(q);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 2000)
      );

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
      const cloudDoctors: DoctorProfile[] = [];

      snapshot.forEach((docSnap) => {
        cloudDoctors.push(docSnap.data() as DoctorProfile);
      });

      if (cloudDoctors.length > 0) {
        return {
          doctors: cloudDoctors,
          source: 'cloud',
          liveSynced: true
        };
      }
    } catch {
      // Fallback seamlessly to local and demo data
    }
  }

  // Fallback: Merge Demo + Local Custom
  let merged = [...DEMO_DOCTORS];
  
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
 * Fetches a single doctor by URL slug.
 * Gated: Public visitors CANNOT view if status !== 'published'.
 */
export async function getDoctorBySlug(slug: string, isAdmin: boolean = false): Promise<DoctorProfile | null> {
  if (!slug) return null;

  // 1. Try fetching from Firestore if ready
  if (db && isFirebaseReady) {
    try {
      const doctorsRef = collection(db, COLLECTION_NAME);
      const q = query(doctorsRef, where('slug', '==', slug));
      
      const fetchPromise = getDocs(q);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 2000)
      );

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);

      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as DoctorProfile;
        if (docData.status === 'published' || isAdmin) {
          return docData;
        }
        return null;
      }
    } catch {
      // Fallback to cache and demo
    }
  }

  // 2. Check local modifications
  const localList = getLocalCustomDoctors();
  const localMatch = localList.find(d => d.slug === slug);
  if (localMatch) {
    if (localMatch.status === 'published' || isAdmin) {
      return localMatch;
    }
    return null;
  }

  // 3. Check demo doctors
  const demoMatch = DEMO_DOCTORS.find(d => d.slug === slug);
  if (demoMatch) {
    if (demoMatch.status === 'published' || isAdmin) {
      return demoMatch;
    }
    return null;
  }

  return null;
}

/**
 * Saves or updates a doctor profile in Firestore and local cache.
 */
export async function saveDoctorProfile(profile: DoctorProfile): Promise<{ success: boolean; cloudSaved: boolean }> {
  const updatedProfile: DoctorProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    isDemo: false
  };

  let cloudSaved = false;

  // Save to Firestore if available
  if (db && isFirebaseReady) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedProfile.id);
      await setDoc(docRef, updatedProfile);
      cloudSaved = true;
    } catch (error) {
      console.warn('Firestore cloud save failed or offline. Saved locally:', error);
    }
  }

  // Always update local cache
  const localList = getLocalCustomDoctors();
  const index = localList.findIndex(d => d.id === updatedProfile.id);
  if (index >= 0) {
    localList[index] = updatedProfile;
  } else {
    localList.unshift(updatedProfile);
  }
  setLocalCustomDoctors(localList);

  return { success: true, cloudSaved };
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
