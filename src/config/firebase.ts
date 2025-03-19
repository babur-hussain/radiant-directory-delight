
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

// Export only what we need for authentication, not Firestore
export { auth, googleProvider, analytics, storage, app };
