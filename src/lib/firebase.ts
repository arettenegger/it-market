import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import defaultFirebaseConfig from "../../firebase-applet-config.json";

let activeConfig = defaultFirebaseConfig;
try {
  const custom = localStorage.getItem("custom_firebase_config");
  if (custom) {
    const parsed = JSON.parse(custom);
    if (parsed && parsed.apiKey && parsed.projectId) {
      activeConfig = parsed;
    }
  }
} catch (e) {
  // fallback
}

const app = initializeApp({
  apiKey: activeConfig.apiKey,
  authDomain: activeConfig.authDomain,
  projectId: activeConfig.projectId,
  storageBucket: activeConfig.storageBucket,
  messagingSenderId: activeConfig.messagingSenderId,
  appId: activeConfig.appId,
  measurementId: activeConfig.measurementId,
});

export const db = getFirestore(app, activeConfig.firestoreDatabaseId || "(default)");
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firebaseConfig = activeConfig;

export const SHOP_DOC_REF = doc(db, "shop_data", "main_config");
export const HERO_DOC_REF = doc(db, "shop_data", "hero_config");
export const CONFIG_DOC_REF = doc(db, "shop_data", "configurator_config");
export const CATEGORY_DOC_REF = doc(db, "shop_data", "category_config");
export const PRODUCT_DOC_REF = doc(db, "shop_data", "product_config");
export const BLOG_DOC_REF = doc(db, "shop_data", "blog_config");
export const REVIEW_DOC_REF = doc(db, "shop_data", "review_config");
export const LOGO_DOC_REF = doc(db, "shop_data", "logo_config");
