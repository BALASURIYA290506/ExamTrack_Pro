import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // Frequently blocked by adblockers like uBlock Origin or Brave Shields
  console.warn("Firebase Analytics could not be loaded. It might be blocked by an adblocker.");
}

const db = getFirestore(app);


export { db };
