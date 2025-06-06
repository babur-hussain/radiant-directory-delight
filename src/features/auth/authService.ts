import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { fetchUserByUid } from '@/lib/supabase/userUtils';
import { updateUserRole } from './roleManagement';
import { toast } from '@/hooks/use-toast';

// Signup with email and password
export const signupWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: UserRole = 'User',
  additionalData: any = {}
): Promise<User> => {
  try {
    // Check for default admin email
    const isDefaultAdmin = email.toLowerCase() === 'baburhussain660@gmail.com';
    const finalRole = isDefaultAdmin ? 'Admin' : role;
    
    // Format user metadata to ensure all fields are captured
    const userMetadata = {
      name,
      role: finalRole,
      is_admin: isDefaultAdmin,
      phone: additionalData.phone || null,
      instagram_handle: additionalData.instagramHandle || null,
      facebook_handle: additionalData.facebookHandle || null,
      business_name: additionalData.businessName || null,
      business_category: additionalData.businessCategory || null,
      website: additionalData.website || null,
      niche: additionalData.niche || null,
      followers_count: additionalData.followersCount || null,
      bio: additionalData.bio || null,
      city: additionalData.city || null,
      country: additionalData.country || null,
      owner_name: additionalData.ownerName || null,
      gst_number: additionalData.gstNumber || null,
      first_name: additionalData.firstName || additionalData.fullName?.split(' ')[0] || null,
      last_name: additionalData.lastName || 
        (additionalData.fullName?.includes(' ') ? 
          additionalData.fullName.split(' ').slice(1).join(' ') : null),
      username: additionalData.username || null,
      // Include any other fields that might be in additionalData
      ...additionalData
    };
    
    console.log("User metadata for signup:", userMetadata);
    
    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata
      }
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from signup");
    }

    // For default admin or when email confirmation is not required,
    // try to login immediately after signup
    if (isDefaultAdmin || process.env.NODE_ENV === 'development') {
      try {
        await supabase.auth.signInWithPassword({
          email,
          password
        });
      } catch (loginError) {
        console.warn("Auto login after signup failed:", loginError);
        // Continue with signup flow even if auto-login fails
      }
    }

    // Create a user object from the signup data
    const newUser: User = {
      uid: data.user.id,
      id: data.user.id,
      email: email,
      displayName: name,
      name: name,
      photoURL: null,
      role: finalRole,
      isAdmin: isDefaultAdmin,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Include formatted additional data
      phone: userMetadata.phone,
      instagramHandle: userMetadata.instagram_handle,
      facebookHandle: userMetadata.facebook_handle,
      businessName: userMetadata.business_name,
      businessCategory: userMetadata.business_category,
      website: userMetadata.website,
      niche: userMetadata.niche,
      followersCount: userMetadata.followers_count,
      bio: userMetadata.bio,
      city: userMetadata.city,
      country: userMetadata.country,
      ownerName: userMetadata.owner_name,
      gstNumber: userMetadata.gst_number,
      // Include any other additional data
      ...additionalData
    };

    // Set user role (this also updates the database)
    await updateUserRole(newUser);

    return newUser;
  } catch (error) {
    console.error("Error in signupWithEmail:", error);
    throw error;
  }
};

// Login with email and password
export const loginWithEmail = async (
  email: string,
  password: string,
  employeeCode?: string
): Promise<User> => {
  try {
    // Check for email confirmation bypass for development or default admin
    const isDefaultAdmin = email.toLowerCase() === 'baburhussain660@gmail.com';
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Email not confirmed') && isDefaultAdmin) {
        // Special handling for default admin - try to auto-confirm
        console.log("Attempting to bypass email confirmation for default admin");
        toast({
          title: "Admin login",
          description: "Attempting special login for admin account",
        });
        
        // You can add special handling here if needed
        // For now, we'll just show a clearer error
        throw new Error("Admin account needs email confirmation. Please check Supabase dashboard.");
      }
      console.error("Login error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from login");
    }

    // Fetch user profile data
    let userData = await fetchUserByUid(data.user.id);
    
    // Handle case where user exists in auth but not in public.users table
    if (!userData) {
      // Default user data
      userData = {
        uid: data.user.id,
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata.name || '',
        name: data.user.user_metadata.name || '',
        role: (data.user.user_metadata.role as UserRole) || 'User',
        isAdmin: isDefaultAdmin || (data.user.user_metadata.is_admin === true),
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
    }

    // Check for employee code if provided
    if (employeeCode && userData.employeeCode !== employeeCode) {
      // Only enforce employee code check for staff or admin roles
      if (['Staff', 'Admin'].includes(userData.role || '')) {
        throw new Error("Invalid employee code");
      }
    }

    // Special case for default admin email
    if (isDefaultAdmin && !userData.isAdmin) {
      userData.isAdmin = true;
      userData.role = 'Admin';
      
      // Update role in database
      await updateUserRole(userData);
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    return userData;
  } catch (error) {
    console.error("Error in loginWithEmail:", error);
    throw error;
  }
};

// Login with Google - Fixed for mobile
export const loginWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error("Google login error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in loginWithGoogle:", error);
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Get session error:", error);
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error("Error in getCurrentSession:", error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    console.log("Getting current user...");
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Get user error:", error);
      throw error;
    }
    
    if (!data.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Found authenticated user:", data.user.id);
    
    // Fetch user profile data
    const userData = await fetchUserByUid(data.user.id);
    
    if (!userData) {
      console.log("User exists in auth but not in profiles, creating basic profile");
      // Basic user data if no profile exists
      const basicUserData: User = {
        uid: data.user.id,
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.name || '',
        name: data.user.user_metadata?.name || '',
        role: (data.user.user_metadata?.role as UserRole) || 'User',
        isAdmin: data.user.email?.toLowerCase() === 'baburhussain660@gmail.com' || false,
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      return basicUserData;
    }
    
    // Special case for default admin
    if (data.user.email?.toLowerCase() === 'baburhussain660@gmail.com' && userData) {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }
    
    console.log("Returning user data:", userData.id, userData.role);
    return userData;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};
