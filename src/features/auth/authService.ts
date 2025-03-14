
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

// Helper function to save user to Firestore
const saveUserToFirestore = async (
  userId: string, 
  email: string | null, 
  name: string | null, 
  role: UserRole = "User", 
  photoURL: string | null = null, 
  isAdmin: boolean = false
) => {
  try {
    console.log(`Saving user to Firestore: ${userId}, ${email}, ${role}`);
    const userDoc = doc(db, "users", userId);
    
    // Ensure name is a string
    const displayName = name === null ? (email?.split('@')[0] || 'User') :
                         typeof name === 'string' ? name : 
                         typeof name === 'boolean' ? 'User' : 
                         name?.toString() || 'User';
    
    // Ensure isAdmin is a boolean
    let adminStatus = false;
    if (typeof isAdmin === 'boolean') {
      adminStatus = isAdmin;
    } else if (typeof isAdmin === 'string') {
      // Safely convert string to boolean without using toLowerCase
      adminStatus = isAdmin === 'true' || isAdmin === 'TRUE';
    } else {
      // For any other type, use Boolean conversion
      adminStatus = Boolean(isAdmin);
    }
    
    await setDoc(userDoc, {
      email: email,
      name: displayName,
      role: role,
      photoURL: photoURL,
      isAdmin: adminStatus,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    console.log(`User successfully saved to Firestore: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    return false;
  }
};

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
      console.log("Updated user last login in Firestore:", userCredential.user.uid);
    } else {
      // Create the user document if it doesn't exist
      await saveUserToFirestore(
        userCredential.user.uid,
        userCredential.user.email,
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        'User',
        userCredential.user.photoURL,
        false
      );
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
      console.log("Updated Google user in Firestore:", userCredential.user.uid);
    } else {
      // Create new user document for Google sign-in
      await saveUserToFirestore(
        userCredential.user.uid,
        userCredential.user.email,
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        'User',
        userCredential.user.photoURL,
        false
      );
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
      await saveUserToFirestore(
        firebaseUser.uid,
        firebaseUser.email,
        name || firebaseUser.email?.split('@')[0] || 'User',
        role,
        null,
        false
      );
      console.log(`User ${firebaseUser.uid} added to Firestore during signup`);
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

// Export the helper function for use in other components
export { saveUserToFirestore };
