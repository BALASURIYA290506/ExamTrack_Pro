import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZO9qGsnXTZzuf_TgYvZcTGuydE7xuUSM",
  authDomain: "examtrack-pro.firebaseapp.com",
  projectId: "examtrack-pro",
  storageBucket: "examtrack-pro.firebasestorage.app",
  messagingSenderId: "409388847318",
  appId: "1:409388847318:web:3a4e990742d79f6d66b977",
  measurementId: "G-9PSD93CNQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
if (typeof window !== 'undefined') {
  // Use dynamic import so that ad blockers won't crash the module evaluation
  import("firebase/analytics").then(({ getAnalytics }) => {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Analytics blocked by adblocker");
    }
  }).catch((e) => {
    console.warn("Firebase Analytics script blocked by client.");
  });
}

const db = getFirestore(app);


export { db };
