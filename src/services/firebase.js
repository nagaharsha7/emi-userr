import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMr82hCAUT4lW1ZXCt_9Dl1kwoBBUTDXA",
  authDomain: "emiii-a9b91.firebaseapp.com",
  databaseURL: "https://emiii-a9b91-default-rtdb.firebaseio.com",
  projectId: "emiii-a9b91",
  storageBucket: "emiii-a9b91.firebasestorage.app",
  messagingSenderId: "870006262655",
  appId: "1:870006262655:web:bb145140ca6401e3f6684a"
};


const FORCE_MOCK_MODE = false; // Set to true to bypass Firebase entirely and run in Mock Mode

let app = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

const hasConfig = !FORCE_MOCK_MODE && !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock mode:", error);
    isFirebaseConfigured = false;
  }
} else {
  console.warn("Firebase running in LOCAL STORAGE MOCK MODE (Firebase bypassed).");
}

const setFirebaseConfigured = (val) => {
  isFirebaseConfigured = val;
};

export { auth, db, isFirebaseConfigured, setFirebaseConfigured };
export default app;
