
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, UserRole, SubscriptionStatus } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const formatUserData = async (session: Session | null): Promise<User | null> => {
    if (!session?.user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      // Create a properly structured address object
      const address = {
        street: null,  // These fields won't come directly from profile
        city: profile?.city || null,
        state: null,
        country: profile?.country || null,
        zipCode: null
      };

      // Check if addresses table has data for this user
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!addressError && addressData) {
        // Update with data from addresses table if available
        address.street = addressData.street;
        address.state = addressData.state;
        address.city = addressData.city || profile?.city;
        address.country = addressData.country || profile?.country;
        address.zipCode = addressData.zip_code;
      }

      // Use optional chaining and type assertions to safely access these properties
      // TypeScript will no longer complain about these properties not existing
      const profileData = profile || {};
      
      // Access possibly undefined properties safely
      const engagementRate = profileData.engagement_rate as string | null || null;
      const preferredLanguage = profileData.preferred_language as string | null || null;
      const interests = profileData.interests as string | null || null;
      const location = profileData.location as string | null || null;
      const assignedBusinessId = profileData.assigned_business_id as string | null || null;
      const staffRole = profileData.staff_role as string | null || null;

      return {
        uid: session.user.id,
        id: session.user.id,
        email: session.user.email || '',
        displayName: profile?.name || session.user.user_metadata?.name || null,
        name: profile?.name || session.user.user_metadata?.name || null,
        photoURL: profile?.photo_url || session.user.user_metadata?.avatar_url || null,
        role: (profile?.role as UserRole) || 'User',
        isAdmin: profile?.is_admin || false,
        employeeCode: profile?.employee_code || null,
        createdAt: profile?.created_at || new Date().toISOString(),
        lastLogin: profile?.last_login || new Date().toISOString(),
        phone: profile?.phone || null,
        instagramHandle: profile?.instagram_handle || null,
        facebookHandle: profile?.facebook_handle || null,
        verified: profile?.verified || false,
        city: profile?.city || null,
        country: profile?.country || null,
        niche: profile?.niche || null,
        followersCount: profile?.followers_count || null,
        bio: profile?.bio || null,
        businessName: profile?.business_name || null,
        ownerName: profile?.owner_name || null,
        businessCategory: profile?.business_category || null,
        website: profile?.website || null,
        address: address,
        gstNumber: profile?.gst_number || null,
        subscription: profile?.subscription || null,
        subscriptionId: profile?.subscription_id || null,
        subscriptionStatus: profile?.subscription_status || null,
        subscriptionPackage: profile?.subscription_package || null,
        customDashboardSections: profile?.custom_dashboard_sections || [],
        engagementRate: engagementRate,
        preferredLanguage: preferredLanguage,
        interests: interests,
        location: location,
        assignedBusinessId: assignedBusinessId,
        staffRole: staffRole
      };
    } catch (error) {
      console.error('Error formatting user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const userData = await formatUserData(session);
              setUser(userData);
              setSession(session);
              
              if (userData) {
                await supabase
                  .from('users')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', userData.uid);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
            }
          }
        );

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          const userData = await formatUserData(currentSession);
          setUser(userData);
          setSession(currentSession);
        }

        setLoading(false);
        setInitialized(true);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, employeeCode?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (employeeCode && data.user) {
        await supabase
          .from('users')
          .update({ employee_code: employeeCode })
          .eq('id', data.user.id);
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            ...additionalData
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create the user profile record
        const profileData: any = {
          id: data.user.id,
          name,
          role,
          email: email,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };
        
        // Copy fields from additionalData to the profile data
        // Remove address and flatten it separately
        const addressData = additionalData.address ? { 
          ...additionalData.address,
          user_id: data.user.id, 
          created_at: new Date().toISOString()
        } : null;
        
        // Copy the rest of the fields directly to the profile
        for (const key in additionalData) {
          if (key !== 'address') {
            // Convert camelCase to snake_case for database compatibility
            const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            profileData[snakeCaseKey] = additionalData[key];
          }
        }
        
        // Make sure all new fields are properly added
        if (additionalData.engagementRate) profileData.engagement_rate = additionalData.engagementRate;
        if (additionalData.preferredLanguage) profileData.preferred_language = additionalData.preferredLanguage;
        if (additionalData.interests) profileData.interests = additionalData.interests;
        if (additionalData.location) profileData.location = additionalData.location;
        if (additionalData.assignedBusinessId) profileData.assigned_business_id = additionalData.assignedBusinessId;
        if (additionalData.staffRole) profileData.staff_role = additionalData.staffRole;
        
        // Insert the profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert(profileData);
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
        
        // Insert address data if it exists
        if (addressData) {
          const { error: addressError } = await supabase
            .from('addresses')
            .upsert(addressData);
            
          if (addressError) {
            console.error('Error creating user address:', addressError);
          }
        }
      }

      toast({
        title: "Signup successful",
        description: "Your account has been created. Please check your email for verification.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/');
      
      toast({
        title: "Logout successful",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      // Create a new object with only the fields that are valid for the Supabase users table
      const supabaseData: any = {
        ...data,
        // Don't include updated_at here, we'll add it separately
      };
      
      // Execute the update with updated_at as a separate field since it's not in the User type
      const { error } = await supabase
        .from('users')
        .update({
          ...supabaseData,
          updated_at: new Date().toISOString() // Add this separately from the User data
        })
        .eq('id', user.uid);
      
      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating user data:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserRole = async (user: User, role: UserRole) => {
    try {
      if (!user.uid) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role,
          is_admin: role === 'Admin' ? true : user.isAdmin
        })
        .eq('id', user.uid);
      
      if (error) throw error;

      const updatedUser = {
        ...user,
        role,
        isAdmin: role === 'Admin' || user.isAdmin
      };
      
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserPermission = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      
      if (error) throw error;

      if (user && user.uid === userId) {
        setUser({
          ...user,
          isAdmin
        });
      }
      
      return { userId, isAdmin };
    } catch (error) {
      console.error('Error updating user permission:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        initialized,
        userRole: user?.role || null,
        isAdmin: user?.isAdmin || false,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        signup,
        updateUserData,
        updateUserRole,
        updateUserPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
