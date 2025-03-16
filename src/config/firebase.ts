
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

let app;
let auth;
let db;
let storage;
let googleProvider;
let analytics = {
  logEvent: (...args) => {
    console.log("Analytics event (stub):", args);
    return Promise.resolve();
  }
};

try {
  // Initialize Firebase
  console.log("Initializing Firebase...");
  app = initializeApp(firebaseConfig);
  
  // Initialize services
  try { auth = getAuth(app); console.log("Firebase Auth initialized"); } 
  catch (error) { console.error("Failed to initialize Firebase Auth:", error); auth = {}; }
  
  try { db = getFirestore(app); console.log("Firestore initialized"); } 
  catch (error) { console.error("Failed to initialize Firestore:", error); db = {}; }
  
  try { storage = getStorage(app); console.log("Firebase Storage initialized"); } 
  catch (error) { console.error("Failed to initialize Firebase Storage:", error); storage = {}; }
  
  try {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.log("Google Auth Provider initialized");
  } catch (error) {
    console.error("Failed to initialize Google Auth Provider:", error);
    googleProvider = {};
  }
  
  // Suppress the warning that causes the emitWarning error
  // This is a workaround for the "emitWarning is not a function" error
  if (window && window.console) {
    const originalWarn = window.console.warn;
    window.console.warn = (...args) => {
      // Skip warnings about emitWarning
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('emitWarning') || 
           args[0].includes('enableMultiTabIndexedDbPersistence'))) {
        return;
      }
      originalWarn.apply(window.console, args);
    };
  }
  
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  app = {};
  auth = {};
  db = {};
  storage = {};
  googleProvider = {};
}

export { auth, db, googleProvider, analytics, storage, app };
