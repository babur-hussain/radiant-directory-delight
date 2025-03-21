import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Get user from Supabase
export const getUserFromSupabase = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      uid: data.id,
      id: data.id, // Ensure id is set to match uid
      email: data.email || '',
      displayName: data.name || '',
      name: data.name || '',
      role: data.role as UserRole || 'User',
      isAdmin: data.is_admin || false,
      photoURL: data.photo_url || '',
      employeeCode: data.employee_code || '',
      createdAt: data.created_at || new Date().toISOString(),
      lastLogin: data.last_login || new Date().toISOString(),
      phone: data.phone || '',
      instagramHandle: data.instagram_handle || '',
      facebookHandle: data.facebook_handle || '',
      verified: data.verified || false,
      city: data.city || '',
      country: data.country || '',
      fullName: data.full_name || '',
      niche: data.niche || '',
      followersCount: data.followers_count || '',
      bio: data.bio || '',
      businessName: data.business_name || '',
      ownerName: data.owner_name || '',
      businessCategory: data.business_category || '',
      website: data.website || '',
      gstNumber: data.gst_number || '',
      // Add subscription information if available
      subscription: data.subscription || null,
      subscriptionId: data.subscription_id || '',
      subscriptionStatus: data.subscription_status || '',
      subscriptionPackage: data.subscription_package || '',
      customDashboardSections: data.custom_dashboard_sections || [],
    };
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }
};

// Get all users from Supabase
export const getAllUsersFromSupabase = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    return data.map(user => ({
      uid: user.id,
      id: user.id, // Ensure id is set to match uid
      email: user.email || '',
      displayName: user.name || '',
      name: user.name || '',
      role: user.role as UserRole || 'User',
      isAdmin: user.is_admin || false,
      photoURL: user.photo_url || '',
      employeeCode: user.employee_code || '',
      createdAt: user.created_at || new Date().toISOString(),
      lastLogin: user.last_login || new Date().toISOString(),
      phone: user.phone || '',
      instagramHandle: user.instagram_handle || '',
      facebookHandle: user.facebook_handle || '',
      verified: user.verified || false,
      city: user.city || '',
      country: user.country || '',
      fullName: user.full_name || '',
      niche: user.niche || '',
      followersCount: user.followers_count || '',
      bio: user.bio || '',
      businessName: user.business_name || '',
      ownerName: user.owner_name || '',
      businessCategory: user.business_category || '',
      website: user.website || '',
      gstNumber: user.gst_number || '',
      // Add subscription information if available
      subscription: user.subscription || null,
      subscriptionId: user.subscription_id || '',
      subscriptionStatus: user.subscription_status || '',
      subscriptionPackage: user.subscription_package || '',
      customDashboardSections: user.custom_dashboard_sections || [],
    }));
  } catch (error) {
    console.error('Error getting all users from Supabase:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Map from Supabase user to our User type
    return {
      uid: data.id,
      email: data.email || '',
      displayName: data.name || '', // Add displayName property
      name: data.name || '',
      role: transformRole(data.role),
      isAdmin: data.is_admin || false,
      photoURL: data.photo_url || null,
      employeeCode: data.employee_code || null,
      createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
      lastLogin: data.last_login ? new Date(data.last_login).toISOString() : new Date().toISOString(),
      phone: data.phone || null,
      instagramHandle: data.instagram_handle || null,
      facebookHandle: data.facebook_handle || null,
      verified: data.verified || false,
      city: data.city || null,
      country: data.country || null,
      niche: data.niche || null,
      followersCount: data.followers_count || null,
      bio: data.bio || null,
      businessName: data.business_name || null,
      ownerName: data.owner_name || null,
      businessCategory: data.business_category || null,
      website: data.website || null,
      gstNumber: data.gst_number || null
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

// Helper function to ensure role is a valid UserRole
function transformRole(role: string | null): UserRole {
  if (!role) return null;
  
  // Match with expected UserRole values
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Admin';
    case 'business':
      return 'Business';
    case 'influencer':
      return 'Influencer';
    case 'user':
      return 'User';
    case 'staff':
      return 'staff';
    default:
      return 'User'; // Default to User if unknown
  }
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    // Map all users from Supabase to our User type
    return data.map(user => ({
      uid: user.id,
      email: user.email || '',
      displayName: user.name || '', // Add displayName property
      name: user.name || '',
      role: transformRole(user.role),
      isAdmin: user.is_admin || false,
      photoURL: user.photo_url || null,
      employeeCode: user.employee_code || null,
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
      lastLogin: user.last_login ? new Date(user.last_login).toISOString() : new Date().toISOString(),
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
    }));
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};
