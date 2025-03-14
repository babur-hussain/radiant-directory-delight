
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

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

// Initialize Firebase only if no apps exist
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add custom parameters for Google sign-in
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics conditionally
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (err) {
    console.error('Analytics error:', err);
    return null;
  }
};

const analyticsPromise = initializeAnalytics();

export { auth, googleProvider, analyticsPromise as analytics };
