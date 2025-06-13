import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔐 Firebase config - DO NOT expose real values in public repos
const firebaseConfig = {
  apiKey: "", // 🔒 Your API Key here
  authDomain: "", // 🔒 Your Auth Domain
  projectId: "", // ✅ Safe to show (project ID only)
  storageBucket: "", // 🔒 Firebase Storage Bucket
  messagingSenderId: "", // 🔒 Messaging sender ID here
  appId: "", // 🔒 Firebase App ID here
  measurementId: "" // 🔒 Google Analytics Measurement ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
