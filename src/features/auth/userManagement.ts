
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { nanoid } from 'nanoid';
import { getUserById, getAllUsers } from './userDataAccess';

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

// Export user role and permission functions
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

// Export user data access functions
export { getUserById, getAllUsers };

// Test user creation function to fix the error in AdminUsersPage.tsx
export interface TestUserData {
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  employeeCode?: string;
}

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

// Add these export functions to match what's imported in other files
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

// Add utility functions
export const formatUser = (user: User): string => {
  return `${user.name} (${user.email}) - ${user.role}`;
};

export const getLocalUsers = async (): Promise<User[]> => {
  // Get users from Supabase
  return getAllUsers();
};

// Add a version number for tracking changes
export const AUTH_MODULE_VERSION = '1.0.2';
