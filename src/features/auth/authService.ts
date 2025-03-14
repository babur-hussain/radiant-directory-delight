
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth, db, googleProvider } from "../../config/firebase";
import { UserRole } from "../../types/auth";
import { getRoleKey, saveUserToAllUsersList } from "./authStorage";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update the user's last login in Firestore
  try {
    const userDoc = doc(db, "users", userCredential.user.uid);
    const docSnapshot = await getDoc(userDoc);
    
    if (docSnapshot.exists()) {
      // Update last login if document exists
      await setDoc(userDoc, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } else {
      // Create the user document if it doesn't exist
      await setDoc(userDoc, {
        email: userCredential.user.email,
        name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        role: 'User',
        photoURL: userCredential.user.photoURL,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      console.log("User document created in Firestore during login:", userCredential.user.uid);
    }
  } catch (error) {
    console.error("Error updating user in Firestore during login:", error);
  }
  
  return userCredential;
};

export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  
  // Save or update the Google user in Firestore
  try {
    const userDoc = doc(db, "users", userCredential.user.uid);
    const docSnapshot = await getDoc(userDoc);
    
    if (docSnapshot.exists()) {
      // Update last login if document exists
      await setDoc(userDoc, {
        lastLogin: serverTimestamp(),
        photoURL: userCredential.user.photoURL // Update photo URL which might have changed
      }, { merge: true });
    } else {
      // Create new user document for Google sign-in
      await setDoc(userDoc, {
        email: userCredential.user.email,
        name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        role: 'User',
        photoURL: userCredential.user.photoURL,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      console.log("User document created in Firestore for Google login:", userCredential.user.uid);
    }
  } catch (error) {
    console.error("Error updating user in Firestore during Google login:", error);
  }
  
  return userCredential;
};

export const signup = async (email: string, password: string, name: string, role: UserRole) => {
  // Create the user in Firebase Authentication
  const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
  
  // Set display name
  if (firebaseUser) {
    await updateProfile(firebaseUser, {
      displayName: name
    });
    
    // Store user data in Firestore
    try {
      const userDoc = doc(db, "users", firebaseUser.uid);
      
      // Always create a new document for the user
      await setDoc(userDoc, {
        email: firebaseUser.email,
        name: name || firebaseUser.email?.split('@')[0] || 'User',
        role: role,
        photoURL: null,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      console.log("User successfully saved to Firestore:", firebaseUser.uid);
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw new Error(`Failed to save user data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Store role information in localStorage
  if (role && firebaseUser) {
    localStorage.setItem(getRoleKey(firebaseUser.uid), role as string);
  }
  
  return firebaseUser;
};

export const logoutUser = async () => {
  return await signOut(auth);
};
