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
    email: userData.email || "",
    displayName: userData.name,
    name: userData.name,
    photoURL: userData.photo_url,
    isAdmin: userData.is_admin || false,
    is_admin: userData.is_admin || false,
    role: userData.role as UserRole,
    employee_code: userData.employee_code,
    employeeCode: userData.employee_code,
    createdAt: userData.created_at,
    created_at: userData.created_at,
    lastLogin: userData.last_login,
    last_login: userData.last_login,
    phone: userData.phone || "",
    instagram_handle: userData.instagram_handle,
    instagramHandle: userData.instagram_handle,
    facebook_handle: userData.facebook_handle,
    facebookHandle: userData.facebook_handle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    niche: userData.niche,
    followers_count: userData.followers_count,
    followersCount: userData.followers_count,
    bio: userData.bio,
    business_name: userData.business_name,
    businessName: userData.business_name,
    owner_name: userData.owner_name,
    ownerName: userData.owner_name,
    business_category: userData.business_category,
    businessCategory: userData.business_category,
    website: userData.website,
    gst_number: userData.gst_number,
    gstNumber: userData.gst_number,
    address: userData.address,
    subscription: userData.subscription,
    subscription_id: userData.subscription_id,
    subscriptionId: userData.subscription_id,
    subscription_status: userData.subscription_status,
    subscriptionStatus: userData.subscription_status,
    subscription_package: userData.subscription_package,
    subscriptionPackage: userData.subscription_package,
    custom_dashboard_sections: userData.custom_dashboard_sections,
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
  
  const userData: any = data;

  return userData ? {
    uid: userData.id,
    id: userData.id,
    email: userData.email,
    displayName: userData.name,
    name: userData.name,
    photoURL: userData.photo_url,
    isAdmin: userData.is_admin || false,
    is_admin: userData.is_admin || false,
    role: userData.role as UserRole,
    employee_code: userData.employee_code,
    employeeCode: userData.employee_code,
    createdAt: userData.created_at,
    created_at: userData.created_at,
    lastLogin: userData.last_login,
    last_login: userData.last_login,
    phone: userData.phone,
    instagram_handle: userData.instagram_handle,
    instagramHandle: userData.instagram_handle,
    facebook_handle: userData.facebook_handle,
    facebookHandle: userData.facebook_handle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    niche: userData.niche,
    followers_count: userData.followers_count,
    followersCount: userData.followers_count,
    bio: userData.bio,
    business_name: userData.business_name,
    businessName: userData.business_name,
    owner_name: userData.owner_name,
    ownerName: userData.owner_name,
    business_category: userData.business_category,
    businessCategory: userData.business_category,
    website: userData.website,
    gst_number: userData.gst_number,
    gstNumber: userData.gst_number,
    address: userData.address,
    subscription: userData.subscription,
    subscription_id: userData.subscription_id,
    subscriptionId: userData.subscription_id,
    subscription_status: userData.subscription_status,
    subscriptionStatus: userData.subscription_status,
    subscription_package: userData.subscription_package,
    subscriptionPackage: userData.subscription_package,
    custom_dashboard_sections: userData.custom_dashboard_sections,
    customDashboardSections: userData.custom_dashboard_sections
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
    is_admin: userData.isAdmin || userData.is_admin,
    employee_code: userData.employee_code || userData.employeeCode,
    phone: userData.phone,
    instagram_handle: userData.instagram_handle || userData.instagramHandle,
    facebook_handle: userData.facebook_handle || userData.facebookHandle,
    verified: userData.verified,
    city: userData.city,
    country: userData.country,
    niche: userData.niche,
    followers_count: userData.followers_count || userData.followersCount,
    bio: userData.bio,
    business_name: userData.business_name || userData.businessName,
    owner_name: userData.owner_name || userData.ownerName,
    business_category: userData.business_category || userData.businessCategory,
    website: userData.website,
    gst_number: userData.gst_number || userData.gstNumber,
    subscription_id: userData.subscription_id || userData.subscriptionId,
    subscription_status: userData.subscription_status || userData.subscriptionStatus,
    subscription_package: userData.subscription_package || userData.subscriptionPackage,
    custom_dashboard_sections: userData.custom_dashboard_sections || userData.customDashboardSections,
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
  
  const updatedUserData: any = data;

  return {
    uid: updatedUserData.id,
    id: updatedUserData.id,
    email: updatedUserData.email,
    displayName: updatedUserData.name,
    name: updatedUserData.name,
    photoURL: updatedUserData.photo_url,
    isAdmin: updatedUserData.is_admin || false,
    is_admin: updatedUserData.is_admin || false,
    role: updatedUserData.role as UserRole,
    employee_code: updatedUserData.employee_code,
    employeeCode: updatedUserData.employee_code,
    createdAt: updatedUserData.created_at,
    created_at: updatedUserData.created_at,
    lastLogin: updatedUserData.last_login,
    last_login: updatedUserData.last_login,
    phone: updatedUserData.phone,
    instagram_handle: updatedUserData.instagram_handle,
    instagramHandle: updatedUserData.instagram_handle,
    facebook_handle: updatedUserData.facebook_handle,
    facebookHandle: updatedUserData.facebook_handle,
    verified: updatedUserData.verified,
    city: updatedUserData.city,
    country: updatedUserData.country,
    niche: updatedUserData.niche,
    followers_count: updatedUserData.followers_count,
    followersCount: updatedUserData.followers_count,
    bio: updatedUserData.bio,
    business_name: updatedUserData.business_name,
    businessName: updatedUserData.business_name,
    owner_name: updatedUserData.owner_name,
    ownerName: updatedUserData.owner_name,
    business_category: updatedUserData.business_category,
    businessCategory: updatedUserData.business_category,
    website: updatedUserData.website,
    gst_number: updatedUserData.gst_number,
    gstNumber: updatedUserData.gst_number,
    address: updatedUserData.address,
    subscription: updatedUserData.subscription,
    subscription_id: updatedUserData.subscription_id,
    subscriptionId: updatedUserData.subscription_id,
    subscription_status: updatedUserData.subscription_status,
    subscriptionStatus: updatedUserData.subscription_status,
    subscription_package: updatedUserData.subscription_package,
    subscriptionPackage: updatedUserData.subscription_package,
    custom_dashboard_sections: updatedUserData.custom_dashboard_sections,
    customDashboardSections: updatedUserData.custom_dashboard_sections
  } as User;
};
