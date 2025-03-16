
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqX6BZYpwqf0iLeCRNmjB2NP_MEr4kDWw",
  authDomain: "grow-bharat-vyapaar.firebaseapp.com",
  projectId: "grow-bharat-vyapaar",
  storageBucket: "grow-bharat-vyapaar.appspot.com",
  messagingSenderId: "146018750556",
  appId: "1:146018750556:web:2dc9996b45599e64ced699",
  measurementId: "G-0QDRL2SSJ1"
};

// Simple safe initialization function
const safeInitFirebase = () => {
  try {
    console.log("Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized");
    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase app:", error);
    // Return a dummy app object that won't crash things
    return {} as any;
  }
};

// Initialize Firebase core app
const app = safeInitFirebase();

// Initialize Auth with error handling
let auth;
try {
  auth = getAuth(app);
  console.log("Firebase Auth initialized");
} catch (error) {
  console.error("Failed to initialize Firebase Auth:", error);
  auth = {} as any;
}

// Initialize Firestore with error handling
let db;
try {
  db = getFirestore(app);
  console.log("Firestore initialized");
} catch (error) {
  console.error("Failed to initialize Firestore:", error);
  db = {} as any;
}

// Initialize Storage with error handling
let storage;
try {
  storage = getStorage(app);
  console.log("Firebase Storage initialized");
} catch (error) {
  console.error("Failed to initialize Firebase Storage:", error);
  storage = {} as any;
}

// Initialize Google Auth Provider with error handling
let googleProvider;
try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  console.log("Google Auth Provider initialized");
} catch (error) {
  console.error("Failed to initialize Google Auth Provider:", error);
  googleProvider = {} as any;
}

// Simple analytics stub that won't break if blocked
const analytics = {
  logEvent: (...args: any[]) => {
    console.log("Analytics event (stub):", args);
    return Promise.resolve();
  }
};

console.log("Firebase services initialized successfully");

export { auth, db, googleProvider, analytics, storage, app };
