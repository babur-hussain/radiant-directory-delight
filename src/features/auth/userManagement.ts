import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User | null> => {
  try {
    // Convert user data to Supabase format
    const supabaseData = {
      name: userData.name,
      full_name: userData.fullName,
      phone: userData.phone,
      instagram_handle: userData.instagramHandle,
      facebook_handle: userData.facebookHandle,
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
      photo_url: userData.photoURL,
      updated_at: new Date().toISOString(),
    };
    
    // Remove undefined values
    Object.keys(supabaseData).forEach(key => {
      if (supabaseData[key] === undefined) {
        delete supabaseData[key];
      }
    });
    
    // Update the user in Supabase
    const { data, error } = await supabase
      .from('users')
      .update(supabaseData)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    // Map back to our User type
    return {
      uid: data.id,
      id: data.id, // Ensure id is set to match uid
      email: data.email,
      displayName: data.name,
      name: data.name,
      role: data.role as UserRole,
      isAdmin: data.is_admin,
      photoURL: data.photo_url,
      createdAt: data.created_at,
      lastLogin: data.last_login,
      employeeCode: data.employee_code,
      phone: data.phone,
      instagramHandle: data.instagram_handle,
      facebookHandle: data.facebook_handle,
      verified: data.verified,
      city: data.city,
      country: data.country,
      fullName: data.full_name,
      niche: data.niche,
      followersCount: data.followers_count,
      bio: data.bio,
      businessName: data.business_name,
      ownerName: data.owner_name,
      businessCategory: data.business_category,
      website: data.website,
      gstNumber: data.gst_number,
      // Subscription details
      subscription: data.subscription,
      subscriptionId: data.subscription_id,
      subscriptionStatus: data.subscription_status,
      subscriptionPackage: data.subscription_package,
      customDashboardSections: data.custom_dashboard_sections,
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

export const updateUserRole = async (uid: string, role: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role, is_admin: role.toLowerCase() === 'admin' })
      .eq('id', uid)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }
    
    return {
      uid: data.id,
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
    console.error('Error in updateUserRole:', error);
    return null;
  }
};

export const updateUserPermission = async (uid: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', uid);
    
    if (error) {
      console.error('Error updating user permission:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserPermission:', error);
    return false;
  }
};

export const createUser = async (userData: Partial<User>): Promise<User | null> => {
  try {
    const now = new Date().toISOString();
    
    // Prepare user data for Supabase
    const supabaseData = {
      id: userData.uid, // Use uid as id
      email: userData.email,
      name: userData.name || userData.displayName,
      role: userData.role || 'User',
      is_admin: userData.isAdmin || false,
      photo_url: userData.photoURL,
      employee_code: userData.employeeCode,
      phone: userData.phone,
      instagram_handle: userData.instagramHandle,
      facebook_handle: userData.facebookHandle,
      verified: userData.verified || false,
      city: userData.city,
      country: userData.country,
      full_name: userData.fullName,
      niche: userData.niche,
      followers_count: userData.followersCount,
      bio: userData.bio,
      business_name: userData.businessName,
      owner_name: userData.ownerName,
      business_category: userData.businessCategory,
      website: userData.website,
      gst_number: userData.gstNumber,
      created_at: now,
      last_login: now,
    };
    
    // Insert the user into Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(supabaseData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    // Map back to our User type
    return {
      uid: data.id,
      id: data.id, // Ensure id is set to match uid
      email: data.email,
      displayName: data.name,
      name: data.name,
      role: data.role as UserRole,
      isAdmin: data.is_admin,
      photoURL: data.photo_url,
      createdAt: data.created_at,
      lastLogin: data.last_login,
      employeeCode: data.employee_code,
      phone: data.phone,
      instagramHandle: data.instagram_handle,
      facebookHandle: data.facebook_handle,
      verified: data.verified,
      city: data.city,
      country: data.country,
      fullName: data.full_name,
      niche: data.niche,
      followersCount: data.followers_count,
      bio: data.bio,
      businessName: data.business_name,
      ownerName: data.owner_name,
      businessCategory: data.business_category,
      website: data.website,
      gstNumber: data.gst_number,
      // Subscription details
      subscription: data.subscription,
      subscriptionId: data.subscription_id,
      subscriptionStatus: data.subscription_status,
      subscriptionPackage: data.subscription_package,
      customDashboardSections: data.custom_dashboard_sections,
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    return null;
  }
};

export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
    
    return {
      uid: data.id,
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
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    return data.map(user => ({
      uid: user.id,
      email: user.email || '',
      displayName: user.name || '',
      name: user.name || '',
      role: transformRole(user.role),
      isAdmin: user.is_admin || false,
      photoURL: user.photo_url || null,
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
      lastLogin: user.last_login ? new Date(user.last_login).toISOString() : new Date().toISOString(),
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
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const transformRole = (role: string | null): UserRole => {
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
};

export const createTestUser = async (userData: TestUserData): Promise<User | null> => {
  try {
    // Generate a random user ID
    const uid = nanoid();
    
    // Insert new user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_admin: userData.isAdmin,
        employee_code: userData.employeeCode || `EMP${Math.floor(10000 + Math.random() * 90000)}`,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test user:', error);
      return null;
    }
    
    return {
      uid: data.id,
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
    console.error('Error in createTestUser:', error);
    return null;
  }
};

export const generateTestUsers = async (count = 1): Promise<User[]> => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `test-user-${i}@example.com`,
      name: `Test User ${i}`,
      role: 'User',
      isAdmin: false,
      employeeCode: `EMP${Math.floor(10000 + Math.random() * 90000)}`
    });
    
    if (user) users.push(user);
  }
  
  return users;
};

export const generateAdminUser = async (): Promise<User | null> => {
  return createTestUser({
    email: `admin-${Date.now()}@example.com`,
    name: 'Test Admin',
    role: 'Admin',
    isAdmin: true,
    employeeCode: `EMP${Math.floor(10000 + Math.random() * 90000)}`
  });
};

export const generateAllTypesOfUsers = async (): Promise<User[]> => {
  const users: User[] = [];
  
  const userTypes = [
    { email: `admin-${Date.now()}@example.com`, name: 'Test Admin', role: 'Admin', isAdmin: true },
    { email: `business-${Date.now()}@example.com`, name: 'Test Business', role: 'Business', isAdmin: false },
    { email: `influencer-${Date.now()}@example.com`, name: 'Test Influencer', role: 'Influencer', isAdmin: false }
  ];
  
  for (const userData of userTypes) {
    const user = await createTestUser(userData);
    if (user) users.push(user);
  }
  
  return users;
};

export const formatUser = (user: User): string => {
  return `${user.name} (${user.email}) - ${user.role}`;
};

export const getLocalUsers = async (): Promise<User[]> => {
  // Get users from Supabase
  return getAllUsers();
};

export const AUTH_MODULE_VERSION = '1.0.2';
