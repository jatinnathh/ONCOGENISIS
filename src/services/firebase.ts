// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwrXBhg4nmIAn2PeGUrGDH_RSH9J5cwzA",
  authDomain: "ongogenisis.firebaseapp.com",
  projectId: "ongogenisis",
  storageBucket: "ongogenisis.firebasestorage.app",
  messagingSenderId: "1007813284947",
  appId: "1:1007813284947:web:aaea0963a762bfd50062a6",
  measurementId: "G-Q837DMV2SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

