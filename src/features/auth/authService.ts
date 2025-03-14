
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { UserRole } from "../../types/auth";
import { getRoleKey, saveUserToAllUsersList } from "./authStorage";

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const signup = async (email: string, password: string, name: string, role: UserRole) => {
  const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
  
  // Set display name
  if (firebaseUser) {
    await updateProfile(firebaseUser, {
      displayName: name
    });
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
