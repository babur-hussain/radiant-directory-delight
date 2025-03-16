
import React, { 
  createContext, 
  useEffect, 
  useState 
} from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  getUserByUid, 
  createUserIfNotExists, 
  updateUserLoginTimestamp,
  updateUserRole as updateUserRoleService
} from '../features/auth/authService';
import { User, UserRole, AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  userRole: null,
  isAdmin: false,
  isAuthenticated: false,
  initialized: false,
  user: null,
  logout: () => Promise.resolve(),
  login: () => Promise.resolve(),
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Check if user exists in MongoDB
          let user = await getUserByUid(firebaseUser.uid);
          
          // If not, create the user in MongoDB
          if (!user) {
            user = await createUserIfNotExists(firebaseUser);
          } else {
            // Update last login time
            await updateUserLoginTimestamp(firebaseUser.uid);
          }

          // Set user state
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: user?.role as UserRole || null,
            isAdmin: user?.isAdmin || false
          };
          
          setCurrentUser(userData);
          setUserRole(user?.role as UserRole || null);
          setIsAdmin(user?.isAdmin || false);
        } catch (error) {
          console.error("Error processing user authentication:", error);
          setCurrentUser(null);
          setUserRole(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error with Google login:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      // Create user in MongoDB with role
      const user = await createUserIfNotExists({
        ...firebaseUser,
        displayName: name,
      });
      
      // Update user role
      if (user) {
        await updateUserRoleService(firebaseUser.uid, role, role === "Admin");
      }
      
      return user;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!currentUser) return;
    
    try {
      const isUserAdmin = role === "Admin";
      await updateUserRoleService(currentUser.uid, role, isUserAdmin);
      
      setUserRole(role);
      setIsAdmin(isUserAdmin);
      
      // Update the current user object
      setCurrentUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          role,
          isAdmin: isUserAdmin
        };
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const updateUserPermission = async (userId: string, isUserAdmin: boolean) => {
    try {
      // Get current role
      const user = await getUserByUid(userId);
      if (!user) throw new Error("User not found");
      
      // Update role with admin status
      await updateUserRoleService(userId, user.role as UserRole, isUserAdmin);
      
      // If updating current user, also update state
      if (currentUser && currentUser.uid === userId) {
        setIsAdmin(isUserAdmin);
        setCurrentUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            isAdmin: isUserAdmin
          };
        });
      }
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    userRole,
    isAdmin,
    logout,
    login,
    loginWithGoogle,
    signup,
    updateUserRole,
    updateUserPermission,
    isAuthenticated: !!currentUser,
    initialized,
    user: currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
