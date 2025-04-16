
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

// Helper function to convert role string to UserRole type
function transformRole(role: string | null): UserRole {
  if (!role) return 'User';
  
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
      return 'Staff';
    default:
      return 'User'; // Default to User if unknown
  }
}

// Transform Supabase user object to our User type
export function transformUserFromSupabase(data: any): User {
  return {
    uid: data.id,
    id: data.id, // Ensure id is set to match uid
    email: data.email || '',
    displayName: data.name || '',
    name: data.name || '',
    role: transformRole(data.role),
    isAdmin: data.is_admin || false,
    photoURL: data.photo_url || null,
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
    lastLogin: data.last_login ? new Date(data.last_login).toISOString() : new Date().toISOString(),
    employeeCode: data.employee_code || null,
    phone: data.phone || null,
    
    // Additional fields for different user types
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
    gstNumber: data.gst_number || null,
    
    subscription: data.subscription || null,
    subscriptionId: data.subscription_id || null,
    subscriptionStatus: data.subscription_status || null,
    subscriptionPackage: data.subscription_package || null,
    customDashboardSections: data.custom_dashboard_sections || null,
    
    // Referral fields - now included in the database
    referralId: data.referral_id || null,
    referredBy: data.referred_by || null,
    referralEarnings: data.referral_earnings || 0,
    referralCount: data.referral_count || 0,
    
    // Influencer flag - now included in the database
    isInfluencer: data.is_influencer || false
  };
}

export const fetchUserByUid = async (uid: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user by UID:', error);
      return null;
    }
    
    if (!data) return null;
    
    return transformUserFromSupabase(data);
  } catch (error) {
    console.error('Error in fetchUserByUid:', error);
    return null;
  }
};

export const getAllUsers = async (page = 1, limit = 10, searchTerm?: string): Promise<{users: User[], count: number}> => {
  try {
    let query = supabase.from("users").select("*", { count: "exact" });

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`
      );
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching users:", error);
      return { users: [], count: 0 };
    }

    const users: User[] = data.map(userData => transformUserFromSupabase(userData));

    return { users, count: count || 0 };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return { users: [], count: 0 };
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return transformUserFromSupabase(data);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};
