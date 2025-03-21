import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

// Map from Supabase user to our User model
export const mapUserFromSupabase = (user: any): User => {
  return {
    uid: user.id,
    email: user.email || '',
    displayName: user.name || '',
    name: user.name || '',
    role: user.role || 'user',
    isAdmin: user.is_admin || false,
    photoURL: user.photo_url || null,
    createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
    lastLogin: user.last_login ? new Date(user.last_login).toISOString() : new Date().toISOString(),
    // Add all other required properties from the User type
    employeeCode: user.employee_code || null,
    phone: user.phone || null,
    instagramHandle: user.instagram_handle || null,
    facebookHandle: user.facebook_handle || null,
    verified: user.verified || false,
    city: user.city || null,
    country: user.country || null,
    niche: user.niche || null,
    followersCount: user.followers_count || null,
    bio: user.bio || null,
    businessName: user.business_name || null,
    ownerName: user.owner_name || null,
    businessCategory: user.business_category || null,
    website: user.website || null,
    gstNumber: user.gst_number || null
  };
};

// Function to sign up a new user
export const signUp = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error signing up:', error);
      return null;
    }

    // Map the Supabase user data to our User model
    return mapUserFromSupabase(data.user);
  } catch (error) {
    console.error('Error in signUp:', error);
    return null;
  }
};

// Function to sign in an existing user
export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error signing in:', error);
      return null;
    }

    // Map the Supabase user data to our User model
    return mapUserFromSupabase(data.user);
  } catch (error) {
    console.error('Error in signIn:', error);
    return null;
  }
};

// Function to sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
    }
  } catch (error) {
    console.error('Error in signOut:', error);
  }
};

// Function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Map the Supabase user data to our User model
    return mapUserFromSupabase(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const mapUserData = (userData: any): User => {
  return {
    uid: userData.uid || userData.id,
    id: userData.uid || userData.id, // Ensure id is set to match uid
    email: userData.email,
    displayName: userData.displayName,
    name: userData.name,
    role: userData.role,
    isAdmin: userData.isAdmin,
    photoURL: userData.photoURL,
    createdAt: userData.createdAt || new Date().toISOString(),
    lastLogin: userData.lastLogin || new Date().toISOString(),
    employeeCode: userData.employeeCode,
    phone: userData.phone,
    instagramHandle: userData.instagramHandle,
    facebookHandle: userData.facebookHandle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    fullName: userData.fullName,
    niche: userData.niche,
    followersCount: userData.followersCount,
    bio: userData.bio,
    businessName: userData.businessName,
    ownerName: userData.ownerName,
    businessCategory: userData.businessCategory,
    website: userData.website,
    address: userData.address,
    gstNumber: userData.gstNumber,
    subscription: userData.subscription,
    subscriptionId: userData.subscriptionId,
    subscriptionStatus: userData.subscriptionStatus,
    subscriptionPackage: userData.subscriptionPackage,
    customDashboardSections: userData.customDashboardSections,
  };
};
