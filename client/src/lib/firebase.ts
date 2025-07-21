import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmIiBMGURfx9Q3kM5qyq-4NcBwy7NB1v4",
  authDomain: "worktrackweb.firebaseapp.com",
  projectId: "worktrackweb",
  storageBucket: "worktrackweb.firebasestorage.app",
  appId: "1:314644104043:web:a47972942406c81012822e",
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
