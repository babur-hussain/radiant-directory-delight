
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Fetch user by UID
export const fetchUserByUid = async (uid: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) {
      console.error('Error fetching user by UID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchUserByUid:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

// Clear local user cache (exported for components that need it)
export const clearUserCache = () => {
  localStorage.removeItem('all_users_data');
  console.log('User cache cleared');
};

// Update user role (exported for auth service)
export const updateUserRole = async (uid: string, role: UserRole) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', uid)
      .select();
    
    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    throw error;
  }
};

// Create or update user
export const createOrUpdateUser = async (userData: Partial<User> & { uid: string }) => {
  try {
    // Convert user data to the format expected by Supabase
    const supabaseData: any = {
      id: userData.uid,
      email: userData.email,
      name: userData.name || userData.displayName,
      role: userData.role,
      is_admin: userData.isAdmin,
      photo_url: userData.photoURL,
      employee_code: userData.employee_code,
      phone: userData.phone,
      instagram_handle: userData.instagram_handle,
      facebook_handle: userData.facebook_handle,
      verified: userData.verified,
      city: userData.city,
      country: userData.country,
      niche: userData.niche,
      followers_count: userData.followers_count,
      bio: userData.bio,
      business_name: userData.business_name,
      owner_name: userData.owner_name,
      business_category: userData.business_category,
      website: userData.website,
      gst_number: userData.gst_number,
    };
    
    // Handle subscription data - ensure it's a string for Supabase
    if (userData.subscription) {
      if (typeof userData.subscription === 'object') {
        supabaseData.subscription = JSON.stringify(userData.subscription);
      } else {
        supabaseData.subscription = userData.subscription;
      }
    }
    
    // Add other subscription-related fields
    supabaseData.subscription_id = userData.subscription_id;
    supabaseData.subscription_status = userData.subscription_status;
    supabaseData.subscription_package = userData.subscription_package;
    supabaseData.custom_dashboard_sections = userData.custom_dashboard_sections;
    
    // Add timestamp
    supabaseData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .upsert(supabaseData)
      .select();
    
    if (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (uid: string) => {
  try {
    // Note: This only deletes the user from our public.users table
    // To fully delete a user, you would need admin privileges to delete from auth.users
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', uid);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

// Add address to user
export const addUserAddress = async (userId: string, addressData: any) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        ...addressData
      })
      .select();
    
    if (error) {
      console.error('Error adding user address:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in addUserAddress:', error);
    throw error;
  }
};

// Get user addresses
export const getUserAddresses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserAddresses:', error);
    throw error;
  }
};
