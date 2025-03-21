
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

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
      role: data.role || 'user',
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
      role: user.role || 'user',
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
