import React, { 
  createContext, 
  useEffect, 
  useState 
} from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  getUserByUid, 
  createUserIfNotExists, 
  updateUserLoginTimestamp 
} from '../features/auth/authService';
import { User, UserRole } from '../types/auth';
import { User as UserModel } from '../models/User';

export type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  userRole: null,
  isAdmin: false,
  logout: () => Promise.resolve(),
  login: () => Promise.resolve(),
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          
          // Set user role
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

  const value = {
    currentUser,
    loading,
    userRole,
    isAdmin,
    logout,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
