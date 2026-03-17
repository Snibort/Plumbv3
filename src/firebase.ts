import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// 1. Create a new mixing bowl for our final recipe
const finalConfig = {
  // 2. Dump in all the safe, public ingredients from the JSON recipe book
  ...firebaseConfig, 
  // 3. Add the secret ingredient (the API key) directly from our locked safe (.env)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY 
};

// 4. Put the finished mix into the oven (start Firebase!)
const app = initializeApp(finalConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
