
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

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
      email: data.email || '',
      displayName: data.name || '',
      name: data.name || '',
      role: data.role || 'user',
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
