// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKwJeYdmymvuAqTuVTE8_Mlc0D18bDC_8",
  authDomain: "nomina-pro.firebaseapp.com",
  projectId: "nomina-pro",
  storageBucket: "nomina-pro.firebasestorage.app",
  messagingSenderId: "542069260503",
  appId: "1:542069260503:web:2044f09f09966ec1493092"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


