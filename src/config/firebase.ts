
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqX6BZYpwqf0iLeCRNmjB2NP_MEr4kDWw",
  authDomain: "grow-bharat-vyapaar.firebaseapp.com",
  projectId: "grow-bharat-vyapaar",
  storageBucket: "grow-bharat-vyapaar.appspot.com",
  messagingSenderId: "146018750556",
  appId: "1:146018750556:web:2dc9996b45599e64ced699",
  measurementId: "G-0QDRL2SSJ1"
};

// Initialize Firebase services with safe fallbacks
let app, auth, db, storage, googleProvider;
let analytics = {
  logEvent: (...args) => {
    console.log("Analytics event (stub):", args);
    return Promise.resolve();
  }
};

// Suppress the specific error about emitWarning
window.console.warn = function(...args) {
  if (args[0] && typeof args[0] === 'string' && 
     (args[0].includes('emitWarning') || 
      args[0].includes('enableMultiTabIndexedDbPersistence'))) {
    return; // Skip these warnings
  }
  // @ts-ignore
  return originalWarn.apply(this, args);
};

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create empty objects as fallbacks
  app = {};
  auth = {};
  db = {};
  storage = {};
  googleProvider = {};
}

export { auth, db, googleProvider, analytics, storage, app };
