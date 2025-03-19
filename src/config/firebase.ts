
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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
let app, auth, storage, googleProvider;
let analytics = {
  logEvent: (...args) => {
    console.log("Analytics event (stub):", args);
    return Promise.resolve();
  }
};

// Create a stub Firestore db object for backward compatibility
const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
  }),
};

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  console.log("Firebase auth initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create empty objects as fallbacks
  app = {};
  auth = {};
  storage = {};
  googleProvider = {};
}

// Export auth for authentication, and stub db for backward compatibility
export { auth, googleProvider, analytics, storage, app, db };
