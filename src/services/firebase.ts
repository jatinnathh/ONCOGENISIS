// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwrXBhg4nmIAn2PeGUrGDH_RSH9J5cwzA",
  authDomain: "ongogenisis.firebaseapp.com",
  projectId: "ongogenisis",
  storageBucket: "ongogenisis.firebasestorage.app",
  messagingSenderId: "1007813284947",
  appId: "1:1007813284947:web:aaea0963a762bfd50062a6",
  measurementId: "G-Q837DMV2SK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// // Initialize core Firebase services
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// Initialize Analytics only if supported (TypeScript-safe)
// let analytics: Analytics | null = null;
// isSupported().then((supported) => {
//   if (supported) {
//     analytics = getAnalytics(app);
//   }
// });

// export { app, analytics };
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
