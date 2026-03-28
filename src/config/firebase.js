import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAiyyny7GXQLGvUCmsh1cl82LQMY4LJ4Os",
  authDomain: "robiul-alam-dipu.firebaseapp.com",
  projectId: "robiul-alam-dipu",
  storageBucket: "robiul-alam-dipu.firebasestorage.app",
  messagingSenderId: "496571071111",
  appId: "1:496571071111:web:5c9b2a5d7e7da3bd469622",
  measurementId: "G-JLQGF08MYR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
