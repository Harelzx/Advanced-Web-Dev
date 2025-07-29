import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKqM0lNqBRjgNwiNKBO3tmwStl1HQO_Is",
  authDomain: "web2025-592b4.firebaseapp.com",
  databaseURL:
    "https://web2025-592b4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "web2025-592b4",
  storageBucket: "web2025-592b4.firebasestorage.app",
  messagingSenderId: "635879071437",
  appId: "1:635879071437:web:cd939e0a7198125e3fd384",
  measurementId: "G-04BZQ896E0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

export const GEMINI_API_KEY = "AIzaSyAlg1yOw7XYs7vT2UtWMWu5CvAGPjiE2V4";
export const YOUTUBE_API_KEY = "AIzaSyA1oPMrqyK8JhF09MkMGtE_0v-I-2STeDI";
