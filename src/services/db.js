import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, enableIndexedDbPersistence } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Enable offline persistence so queued writes aren't lost on refresh if offline
enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Firebase persistence error:", err.code);
});

// ═══════════════════════════════════════════════════════════════
// Request deduplication cache — prevents duplicate in-flight requests
// ═══════════════════════════════════════════════════════════════
const inflightRequests = new Map();

const deduplicatedFetch = async (key, fetchFn) => {
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }
  const promise = fetchFn().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
};

// ═══════════════════════════════════════════════════════════════
// Storage Upload — with file validation
// ═══════════════════════════════════════════════════════════════
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadFile = async (file, path) => {
  if (!file) return null;

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Supported: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, OGG.`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`);
  }

  // Sanitize filename — remove path traversal characters
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `${path}/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ═══════════════════════════════════════════════════════════════
// Hero Section
// ═══════════════════════════════════════════════════════════════
export const getHeroData = () =>
  deduplicatedFetch('hero', async () => {
    try {
      const docSnap = await getDoc(doc(db, 'siteData', 'hero'));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
      console.warn('getHeroData failed:', err.message);
      return null;
    }
  });

export const updateHeroData = async (data) => {
  await setDoc(doc(db, 'siteData', 'hero'), data, { merge: true });
};

// ═══════════════════════════════════════════════════════════════
// About Section
// ═══════════════════════════════════════════════════════════════
export const getAboutData = () =>
  deduplicatedFetch('about', async () => {
    try {
      const docSnap = await getDoc(doc(db, 'siteData', 'about'));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
      console.warn('getAboutData failed:', err.message);
      return null;
    }
  });

export const updateAboutData = async (data) => {
  await setDoc(doc(db, 'siteData', 'about'), data, { merge: true });
};

// ═══════════════════════════════════════════════════════════════
// Achievements
// ═══════════════════════════════════════════════════════════════
export const getAchievements = () =>
  deduplicatedFetch('achievements', async () => {
    try {
      const q = query(collection(db, 'achievements'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      // Fallback without ordering if index not created
      try {
        const snapshot = await getDocs(collection(db, 'achievements'));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (fallbackErr) {
        console.warn('getAchievements failed:', fallbackErr.message);
        return [];
      }
    }
  });

export const addAchievement = async (data) => {
  return addDoc(collection(db, 'achievements'), data);
};

export const updateAchievement = async (id, data) => {
  return updateDoc(doc(db, 'achievements', id), data);
};

export const deleteAchievement = async (id) => {
  return deleteDoc(doc(db, 'achievements', id));
};

// ═══════════════════════════════════════════════════════════════
// Blogs
// ═══════════════════════════════════════════════════════════════
export const getBlogs = () =>
  deduplicatedFetch('blogs', async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      // Fallback without ordering if index not created
      try {
        const snapshot = await getDocs(collection(db, 'blogs'));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (fallbackErr) {
        console.warn('getBlogs failed:', fallbackErr.message);
        return [];
      }
    }
  });

export const addBlog = async (data) => {
  return addDoc(collection(db, 'blogs'), data);
};

export const updateBlog = async (id, data) => {
  return updateDoc(doc(db, 'blogs', id), data);
};

export const deleteBlog = async (id) => {
  return deleteDoc(doc(db, 'blogs', id));
};
