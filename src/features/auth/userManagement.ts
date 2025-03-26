import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const getUsersByRole = (users: User[], role: UserRole): User[] => {
  const normalizedRole = normalizeRole(role);
  return users.filter(user => normalizeRole(user.role) === normalizedRole);
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (normalizeRole(role)) {
    case 'admin':
      return 'Admin';
    case 'business':
      return 'Business Owner';
    case 'influencer':
      return 'Influencer';
    case 'user':
      return 'User';
    case 'staff':
      return 'Staff';
    default:
      return 'User';
  }
};

export const determineUserRole = (userData: any): UserRole => {
  if (!userData) return 'user';

  if (userData.role) {
    return normalizeRole(userData.role);
  }

  if (userData.businessName || userData.business_name) {
    return 'business';
  }

  if (userData.followersCount || userData.followers_count || userData.niche) {
    return 'influencer';
  }

  return 'user';
};

const DEFAULT_PHOTO_URL = 'https://example.com/default-avatar.png';

const testUsers: TestUserData[] = [
  { email: 'admin@example.com', name: 'Admin User', role: 'admin', password: 'password123' },
  { email: 'business@example.com', name: 'Business User', role: 'business', password: 'password123' },
  { email: 'influencer@example.com', name: 'Influencer User', role: 'influencer', password: 'password123' },
  { email: 'user@example.com', name: 'Regular User', role: 'user', password: 'password123' },
];

interface TestUserData {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

export function transformRole(role: string | null): UserRole {
  if (!role) return 'user';
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'business':
      return 'business';
    case 'influencer':
      return 'influencer';
    case 'user':
      return 'user';
    case 'staff':
      return 'staff';
    default:
      return 'user';
  }
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
    
    return {
      uid: data.id,
      id: data.id,
      email: data.email || '',
      displayName: data.name || '',
      name: data.name || '',
      role: transformRole(data.role),
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
      niche: data.niche || '',
      followersCount: data.followers_count || '',
      bio: data.bio || '',
      businessName: data.business_name || '',
      ownerName: data.owner_name || '',
      businessCategory: data.business_category || '',
      website: data.website || '',
      gstNumber: data.gst_number || ''
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

export { getAllUsers } from './userDataAccess';

export const createTestUser = async (userData: {
  email: string;
  name: string;
  role?: UserRole;
  isAdmin?: boolean;
  employeeCode?: string;
}): Promise<User> => {
  try {
    const userId = uuidv4();
    
    const newUser: User = {
      uid: userId,
      id: userId,
      email: userData.email,
      displayName: userData.name,
      name: userData.name,
      role: userData.role || 'user',
      isAdmin: userData.isAdmin || false,
      photoURL: DEFAULT_PHOTO_URL,
      employeeCode: userData.employeeCode || '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      phone: '',
      instagramHandle: '',
      facebookHandle: '',
      verified: false,
      city: '',
      country: '',
      niche: '',
      followersCount: '',
      bio: '',
      businessName: '',
      ownerName: '',
      businessCategory: '',
      website: '',
      gstNumber: ''
    };
    
    console.log('Test user created:', newUser);
    
    return newUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw new Error('Failed to create test user');
  }
};

const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return 'user';
  
  const normalizedRoleString = role.toLowerCase();
  
  switch (normalizedRoleString) {
    case 'admin':
      return 'admin';
    case 'business':
      return 'business';
    case 'influencer':
      return 'influencer';
    case 'staff':
      return 'staff';
    case 'user':
    default:
      return 'user';
  }
};

export const getUserRoleColor = (role?: string): string => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case 'admin':
      return '#4f46e5';
    case 'business':
      return '#0891b2';
    case 'influencer':
      return '#db2777';
    case 'user':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};
