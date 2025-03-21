
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from 'nanoid';

// Constants for default user data
const DEFAULT_PHOTO_URL = 'https://example.com/default-avatar.png';

// Test user data
const testUsers: TestUserData[] = [
  { email: 'admin@example.com', name: 'Admin User', role: 'Admin', password: 'password123' },
  { email: 'business@example.com', name: 'Business User', role: 'Business', password: 'password123' },
  { email: 'influencer@example.com', name: 'Influencer User', role: 'Influencer', password: 'password123' },
  { email: 'user@example.com', name: 'Regular User', role: 'User', password: 'password123' },
];

// Fix TestUserData interface
interface TestUserData {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

// Helper function to convert role string to UserRole type
export function transformRole(role: string | null): UserRole {
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
      return 'Staff';
    default:
      return 'User'; // Default to User if unknown
  }
}

// Get user by ID
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
      id: data.id, // Add id property
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

// Export the getAllUsers function from userDataAccess
export { getAllUsers } from './userDataAccess';

// Create a test user for development environments
export const createTestUser = async (userData: {
  email: string;
  name: string;
  role?: UserRole;
  isAdmin?: boolean;
  employeeCode?: string;
}): Promise<User> => {
  try {
    // Generate a unique ID using nanoid
    const userId = nanoid();
    
    // Create user data object with defaults
    const newUser: User = {
      uid: userId,
      id: userId,
      email: userData.email,
      displayName: userData.name,
      name: userData.name,
      role: userData.role || 'User',
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
    
    // For a real application, you would store this user in a database
    console.log('Test user created:', newUser);
    
    return newUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw new Error('Failed to create test user');
  }
};
