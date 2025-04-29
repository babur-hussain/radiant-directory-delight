import { getRoleAsString, User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { createOrUpdateUser } from '@/api/services/userAPI';

// Function to update user data with proper role handling
export function updateUserData(user: User) {
  if (!user) return null;
  
  // Convert role to string for display and storage
  const roleString = getRoleAsString(user.role);
  
  // Determine if user is admin
  const isAdmin = user.isAdmin || (user.role === 'Admin') || 
    (Array.isArray(user.role) && user.role.includes('Admin'));
  
  return {
    ...user,
    roleDisplay: roleString,
    isAdmin
  };
}

// Function to authenticate user with email and password
export async function authenticateUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError);
    }
    
    // Combine auth data with user profile data
    const user: User = {
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email || '',
      name: userData?.name || data.user.user_metadata?.name || '',
      displayName: userData?.name || data.user.user_metadata?.name || '',
      role: userData?.role || 'User',
      isAdmin: userData?.is_admin || false,
      photoURL: userData?.photo_url || data.user.user_metadata?.avatar_url || '',
      createdAt: data.user.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    return updateUserData(user);
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Function to register a new user
export async function registerUser(email: string, password: string, name: string, role: UserRole) {
  try {
    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });
    
    if (error) throw error;
    
    // Create user profile in our users table
    const newUser = {
      id: data.user?.id,
      uid: data.user?.id,
      email: email,
      name: name,
      role: role,
      isAdmin: role === 'Admin',
      createdAt: new Date().toISOString()
    };
    
    await createOrUpdateUser(newUser);
    
    return updateUserData(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Function to sign out the current user
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Function to get the current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError);
    }
    
    // Combine auth data with user profile data
    const user: User = {
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email || '',
      name: userData?.name || data.user.user_metadata?.name || '',
      displayName: userData?.name || data.user.user_metadata?.name || '',
      role: userData?.role || 'User',
      isAdmin: userData?.is_admin || false,
      photoURL: userData?.photo_url || data.user.user_metadata?.avatar_url || '',
      createdAt: data.user.created_at || new Date().toISOString(),
      lastLogin: userData?.last_login || new Date().toISOString(),
      // Add other fields from userData if they exist
      phone: userData?.phone || '',
      employeeCode: userData?.employee_code || '',
      subscription: userData?.subscription || null,
      subscriptionId: userData?.subscription_id || null,
      subscriptionStatus: userData?.subscription_status || null
    };
    
    return updateUserData(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Function to reset password
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

// Function to update user password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

// Function to authenticate with Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

// Export all functions for use in the application
export const authService = {
  authenticateUser,
  registerUser,
  signOutUser,
  getCurrentUser,
  resetPassword,
  updatePassword,
  signInWithGoogle,
  updateUserData
};

export default authService;
