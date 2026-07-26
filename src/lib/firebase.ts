import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId,
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { firebaseConfig };

export const SHOP_DOC_REF = doc(db, "shop_data", "main_config");
export const HERO_DOC_REF = doc(db, "shop_data", "hero_config");
export const CONFIG_DOC_REF = doc(db, "shop_data", "configurator_config");
export const CATEGORY_DOC_REF = doc(db, "shop_data", "category_config");
export const PRODUCT_DOC_REF = doc(db, "shop_data", "product_config");
export const BLOG_DOC_REF = doc(db, "shop_data", "blog_config");
export const REVIEW_DOC_REF = doc(db, "shop_data", "review_config");
export const LOGO_DOC_REF = doc(db, "shop_data", "logo_config");
