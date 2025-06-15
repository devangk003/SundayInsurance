import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔐 Firebase config - DO NOT expose real values in public repos
const firebaseConfig = {
  apiKey: "AIzaSyA5y_O0oYOmo20yLRKI3g0jO9OciXojwC4",
  authDomain: "sundayinsurance-71274.firebaseapp.com",
  projectId: "sundayinsurance-71274",
  storageBucket: "sundayinsurance-71274.firebasestorage.app",
  messagingSenderId: "949975870982",
  appId: "1:949975870982:web:34e676fc47c3276a5fdd87",
  measurementId: "G-DSPSZRCE6J"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
