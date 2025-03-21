
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

// Helper function to convert role string to UserRole type
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
    console.error('Error in fetchUserByUid:', error);
    return null;
  }
};
