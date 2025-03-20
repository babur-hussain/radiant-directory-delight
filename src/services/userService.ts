
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, UserSubscription, isUserSubscription } from '@/types/auth';

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
    customDashboardSections: userData.custom_dashboard_sections
  })) as User[];
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error(`Error fetching user by ID ${userId}:`, error);
    throw error;
  }
  
  return data ? {
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
    customDashboardSections: data.custom_dashboard_sections
  } as User : null;
};

// Update user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  // Convert user data to snake_case format
  const formattedData: any = {
    name: userData.name || userData.displayName,
    email: userData.email,
    photo_url: userData.photoURL,
    role: userData.role,
    is_admin: userData.isAdmin,
    employee_code: userData.employeeCode,
    phone: userData.phone,
    instagram_handle: userData.instagramHandle,
    facebook_handle: userData.facebookHandle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    niche: userData.niche,
    followers_count: userData.followersCount,
    bio: userData.bio,
    business_name: userData.businessName,
    owner_name: userData.ownerName,
    business_category: userData.businessCategory,
    website: userData.website,
    gst_number: userData.gstNumber,
    subscription_id: userData.subscriptionId,
    subscription_status: userData.subscriptionStatus,
    subscription_package: userData.subscriptionPackage,
    custom_dashboard_sections: userData.customDashboardSections,
    updated_at: new Date().toISOString()
  };
  
  // Handle subscription object if it exists
  if (userData.subscription) {
    if (isUserSubscription(userData.subscription)) {
      // Convert object to string for storage
      formattedData.subscription = JSON.stringify(userData.subscription);
    } else {
      formattedData.subscription = userData.subscription;
    }
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(formattedData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
  
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
    customDashboardSections: data.custom_dashboard_sections
  } as User;
};
