
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore
} from "firebase/firestore";
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

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  console.log("Initializing Firebase...");
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  
  // Add custom parameters for Google sign-in
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Create dummy objects to prevent app from crashing
  if (!app) app = {} as any;
  if (!auth) auth = {} as any;
  if (!db) db = {} as any;
  if (!storage) storage = {} as any;
  if (!googleProvider) googleProvider = {} as any;
}

// Simple analytics stub that won't break if blocked
const analytics = {
  logEvent: (...args: any[]) => {
    console.log("Analytics event (stub):", args);
  }
};

export { auth, db, googleProvider, analytics, storage, app };
