
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string;
  uid: string | null;
  id: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState & {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<any>;
}>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  role: 'user',
  uid: null,
  id: null,
  isAdmin: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Fetch user data to get role
            const { data: userData } = await supabase
              .from('users')
              .select('role, is_admin')
              .eq('id', session.user.id)
              .single();
            
            if (userData) {
              setUserRole(userData.role || 'user');
              setIsAdmin(userData.is_admin || false);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        } else {
          setUserRole('user');
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          // Fetch user data to get role
          const { data: userData } = await supabase
            .from('users')
            .select('role, is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUserRole(userData.role || 'user');
            setIsAdmin(userData.is_admin || false);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData
      }
    });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      role: userRole,
      uid: user?.id || null,
      id: user?.id || null,
      isAdmin,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
