import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, UserSubscription, isUserSubscription } from '@/types/auth';

// Get user by ID
export const getUserById = async (uid: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();
  
  if (error) {
    console.error('Error fetching user by ID:', error);
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  
  if (!data) return null;
  
  return {
    uid: data.id,
    id: data.id,
    email: data.email,
    displayName: data.name,
    name: data.name,
    photoURL: data.photo_url,
    isAdmin: data.is_admin || false,
    role: data.role as UserRole,
    employeeCode: data.employee_code,
    createdAt: data.created_at,
    lastLogin: data.last_login,
    phone: data.phone,
    instagramHandle: data.instagram_handle,
    facebookHandle: data.facebook_handle,
    verified: data.verified,
    city: data.city,
    country: data.country,
    niche: data.niche,
    followersCount: data.followers_count,
    bio: data.bio,
    businessName: data.business_name,
    ownerName: data.owner_name,
    businessCategory: data.business_category,
    website: data.website,
    gstNumber: data.gst_number,
    subscription: data.subscription,
    subscriptionId: data.subscription_id,
    subscriptionStatus: data.subscription_status,
    subscriptionPackage: data.subscription_package,
    customDashboardSections: data.custom_dashboard_sections,
    referralId: data.referral_id,
    referralCount: data.referral_count || 0,
    referralEarnings: data.referral_earnings || 0,
    address: data.address ? {
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      country: data.address.country,
      zipCode: data.address.zipCode
    } : null
  } as User;
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data.map((userData: any) => ({
    uid: userData.id,
    id: userData.id,
    email: userData.email,
    displayName: userData.name,
    name: userData.name,
    photoURL: userData.photo_url,
    isAdmin: userData.is_admin || false,
    role: userData.role as UserRole,
    employeeCode: userData.employee_code,
    createdAt: userData.created_at,
    lastLogin: userData.last_login,
    phone: userData.phone,
    instagramHandle: userData.instagram_handle,
    facebookHandle: userData.facebook_handle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    niche: userData.niche,
    followersCount: userData.followers_count,
    bio: userData.bio,
    businessName: userData.business_name,
    ownerName: userData.owner_name,
    businessCategory: userData.business_category,
    website: userData.website,
    gstNumber: userData.gst_number,
    subscription: userData.subscription,
    subscriptionId: userData.subscription_id,
    subscriptionStatus: userData.subscription_status,
    subscriptionPackage: userData.subscription_package,
    customDashboardSections: userData.custom_dashboard_sections,
    referralId: userData.referral_id,
    referralCount: userData.referral_count || 0,
    referralEarnings: userData.referral_earnings || 0,
    address: userData.address ? {
      street: userData.address.street,
      city: userData.address.city,
      state: userData.address.state,
      country: userData.address.country,
      zipCode: userData.address.zipCode
    } : null
  })) as User[];
};

// Update user
export const updateUser = async (uid: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      role: updates.role,
      is_admin: updates.isAdmin,
      phone: updates.phone,
      instagram_handle: updates.instagramHandle,
      facebook_handle: updates.facebookHandle,
      verified: updates.verified,
      city: updates.city,
      country: updates.country,
      niche: updates.niche,
      followers_count: updates.followersCount,
      bio: updates.bio,
      business_name: updates.businessName,
      owner_name: updates.ownerName,
      business_category: updates.businessCategory,
      website: updates.website,
      gst_number: updates.gstNumber,
      updated_at: new Date().toISOString()
    })
    .eq('id', uid)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  
  // Return the updated user with proper mapping
  return {
    uid: data.id,
    id: data.id,
    email: data.email,
    displayName: data.name,
    name: data.name,
    photoURL: data.photo_url,
    isAdmin: data.is_admin || false,
    role: data.role as UserRole,
    employeeCode: data.employee_code,
    createdAt: data.created_at,
    lastLogin: data.last_login,
    phone: data.phone,
    instagramHandle: data.instagram_handle,
    facebookHandle: data.facebook_handle,
    verified: data.verified,
    city: data.city,
    country: data.country,
    niche: data.niche,
    followersCount: data.followers_count,
    bio: data.bio,
    businessName: data.business_name,
    ownerName: data.owner_name,
    businessCategory: data.business_category,
    website: data.website,
    gstNumber: data.gst_number,
    subscription: data.subscription,
    subscriptionId: data.subscription_id,
    subscriptionStatus: data.subscription_status,
    subscriptionPackage: data.subscription_package,
    customDashboardSections: data.custom_dashboard_sections,
    referralId: data.referral_id,
    referralCount: data.referral_count || 0,
    referralEarnings: data.referral_earnings || 0,
    address: data.address ? {
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      country: data.address.country,
      zipCode: data.address.zipCode
    } : null
  } as User;
};

// Delete user
export const deleteUser = async (uid: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', uid);
  
  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
