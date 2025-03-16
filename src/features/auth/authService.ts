
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
import { User } from "../../models/User";

// Helper function to save user to MongoDB
const saveUserToMongoDB = async (
  userId: string, 
  email: string | null, 
  name: string | null, 
  role: UserRole = "User", 
  photoURL: string | null = null, 
  isAdmin: boolean = false
) => {
  try {
    console.log(`Saving user to MongoDB: ${userId}, ${email}, ${role}`);
    
    // Ensure name is a string - Fix TypeScript never type error
    let displayName: string;
    if (name === null) {
      displayName = email?.split('@')[0] || 'User';
    } else if (typeof name === 'string') {
      displayName = name;
    } else if (typeof name === 'boolean') {
      displayName = 'User';
    } else if (name) {
      // Only call toString if name exists and is not null
      try {
        displayName = String(name);
      } catch {
        displayName = 'User';
      }
    } else {
      displayName = 'User';
    }
    
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
    
    // Check if user already exists
    const existingUser = await User.findOne({ uid: userId });
    
    if (existingUser) {
      // Update existing user
      await User.findOneAndUpdate(
        { uid: userId },
        {
          email: email,
          name: displayName,
          role: role,
          photoURL: photoURL,
          isAdmin: adminStatus,
          lastLogin: new Date()
        }
      );
    } else {
      // Create new user
      await User.create({
        uid: userId,
        email: email,
        name: displayName,
        role: role,
        photoURL: photoURL,
        isAdmin: adminStatus,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    }
    
    console.log(`User successfully saved to MongoDB: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error saving user to MongoDB:", error);
    return false;
  }
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update the user's last login in MongoDB
  try {
    const existingUser = await User.findOne({ uid: userCredential.user.uid });
    
    if (existingUser) {
      // Update last login if document exists
      await User.findOneAndUpdate(
        { uid: userCredential.user.uid },
        { lastLogin: new Date() }
      );
      console.log("Updated user last login in MongoDB:", userCredential.user.uid);
    } else {
      // Create the user document if it doesn't exist
      await saveUserToMongoDB(
        userCredential.user.uid,
        userCredential.user.email,
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        'User',
        userCredential.user.photoURL,
        false
      );
    }
  } catch (error) {
    console.error("Error updating user in MongoDB during login:", error);
  }
  
  return userCredential;
};

export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  
  // Save or update the Google user in MongoDB
  try {
    const existingUser = await User.findOne({ uid: userCredential.user.uid });
    
    if (existingUser) {
      // Update last login if document exists
      await User.findOneAndUpdate(
        { uid: userCredential.user.uid },
        {
          lastLogin: new Date(),
          photoURL: userCredential.user.photoURL // Update photo URL which might have changed
        }
      );
      console.log("Updated Google user in MongoDB:", userCredential.user.uid);
    } else {
      // Create new user document for Google sign-in
      await saveUserToMongoDB(
        userCredential.user.uid,
        userCredential.user.email,
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        'User',
        userCredential.user.photoURL,
        false
      );
    }
  } catch (error) {
    console.error("Error updating user in MongoDB during Google login:", error);
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
    
    // Store user data in MongoDB
    try {
      await saveUserToMongoDB(
        firebaseUser.uid,
        firebaseUser.email,
        name || firebaseUser.email?.split('@')[0] || 'User',
        role,
        null,
        false
      );
      console.log(`User ${firebaseUser.uid} added to MongoDB during signup`);
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
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
export { saveUserToMongoDB };
