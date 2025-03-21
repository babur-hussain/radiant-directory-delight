import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, isDefaultAdminEmail } from '@/types/auth';
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
    const isAdmin = isDefaultAdminEmail(email);
    const finalRole = isAdmin ? 'Admin' : role;
    
    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: finalRole,
          is_admin: isAdmin,
          ...additionalData
        }
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
    if (isAdmin || process.env.NODE_ENV === 'development') {
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
      isAdmin: isAdmin,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Include additional data
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
    console.log("Attempting login for:", email);
    
    // Check if user is already logged in
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user?.email?.toLowerCase() === email.toLowerCase()) {
      console.log("User is already logged in with this email, fetching profile");
      // User is already logged in with this email, just fetch the profile
      const userData = await fetchUserByUid(sessionData.session.user.id);
      
      if (userData) {
        // Special case for default admin email
        const isAdmin = isDefaultAdminEmail(email);
        if (isAdmin) {
          userData.isAdmin = true;
          userData.role = 'Admin';
        }
        
        // Update last login timestamp
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);
        } catch (updateError) {
          console.warn("Failed to update last login time:", updateError);
        }
        
        return userData;
      }
    }
    
    // Otherwise proceed with normal login
    const isAdmin = isDefaultAdminEmail(email);
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Email not confirmed') && isAdmin) {
        // Special handling for default admin - try to auto-confirm
        console.log("Email not confirmed for admin account");
        toast({
          title: "Admin login",
          description: "Attempting special login for admin account",
        });
        
        // You can add special handling here if needed
        // For now, we'll just show a clearer error
        throw new Error("Admin account needs email confirmation. Please check your inbox or Supabase dashboard.");
      }
      console.error("Login error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from login");
    }

    console.log("Auth login successful, fetching user profile");
    // Fetch user profile data
    let userData = await fetchUserByUid(data.user.id);
    
    // Handle case where user exists in auth but not in public.users table
    if (!userData) {
      console.log("User auth exists but no profile found, creating default profile");
      
      // Create a basic profile in the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name || '',
          role: isAdmin ? 'Admin' : (data.user.user_metadata.role || 'User'),
          is_admin: isAdmin,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
        
      if (insertError) {
        console.error("Error creating user profile:", insertError);
      }
      
      // Default user data
      userData = {
        uid: data.user.id,
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata.name || '',
        name: data.user.user_metadata.name || '',
        role: isAdmin ? 'Admin' : (data.user.user_metadata.role as UserRole) || 'User',
        isAdmin: isAdmin || (data.user.user_metadata.is_admin === true),
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
    if (isAdmin && !userData.isAdmin) {
      console.log("Assigning admin privileges to default admin account");
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

    console.log("Login successful, returning user data:", userData);
    return userData;
  } catch (error) {
    console.error("Error in loginWithEmail:", error);
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
    console.log("Getting current user");
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Get user error:", error);
      throw error;
    }
    
    if (!data.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("Authenticated user found:", data.user.id, "email:", data.user.email);
    
    // Fetch user profile data
    let userData = await fetchUserByUid(data.user.id);
    
    if (!userData) {
      console.log("User auth exists but no profile found in database");
      
      // Try to create a profile in the database
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          role: isDefaultAdminEmail(data.user.email || '') ? 'Admin' : (data.user.user_metadata?.role || 'User'),
          is_admin: isDefaultAdminEmail(data.user.email || '') || (data.user.user_metadata?.is_admin === true),
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
        
      if (insertError) {
        console.error("Error creating user profile:", insertError);
      } else {
        console.log("Created new user profile in database");
        // Try to fetch the newly created profile
        userData = await fetchUserByUid(data.user.id);
      }
      
      // If we still don't have a profile, create a basic user object
      if (!userData) {
        // Create a basic user object if profile not found
        const basicUserData: User = {
          uid: data.user.id,
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.name || '',
          name: data.user.user_metadata?.name || '',
          role: isDefaultAdminEmail(data.user.email || '') ? 'Admin' : (data.user.user_metadata?.role as UserRole) || 'User',
          isAdmin: isDefaultAdminEmail(data.user.email || '') || (data.user.user_metadata?.is_admin === true),
          photoURL: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        console.log("Created basic user profile:", basicUserData.email, "role:", basicUserData.role);
        return basicUserData;
      }
    }
    
    // Special case for default admin
    if (isDefaultAdminEmail(data.user.email || '') && userData) {
      userData.isAdmin = true;
      userData.role = 'Admin';
      console.log("Assigned admin privileges to user");
    }
    
    console.log("Returning user data from profile:", userData.email, "role:", userData.role);
    return userData;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};
