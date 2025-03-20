
import { createOrUpdateUser } from "@/api/services/userAPI";
import { UserRole } from "@/types/auth";
import { nanoid } from 'nanoid';

// Function to create a test employee ID
export const createTestEmployeeId = () => {
  return `EMP${Math.floor(10000 + Math.random() * 90000)}`;
};

// Create a function to generate test users
export const generateTestUsers = async (count = 10, type: UserRole = 'User') => {
  console.log(`Generating ${count} test ${type} users...`);
  
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const userId = nanoid();
    const employeeCode = createTestEmployeeId();
    
    // Create a user with basic fields
    const userData = {
      uid: userId,
      email: `test${type.toLowerCase()}${i}@example.com`,
      name: `Test ${type} ${i}`,
      role: type,
      isAdmin: type === 'Admin',
      employeeCode: employeeCode,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    try {
      // Create the user in the database
      await createOrUpdateUser(userData);
      users.push(userData);
      console.log(`Created test ${type} user: ${userData.email}`);
    } catch (error) {
      console.error(`Failed to create test user ${i}:`, error);
    }
  }
  
  return users;
};

// Define TestUserData type for export
export interface TestUserData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
  employeeCode: string;
  createdAt: string;
  lastLogin: string;
}

// Create a single test user (used by other modules)
export const createTestUser = async (role: UserRole = 'User'): Promise<TestUserData | null> => {
  const users = await generateTestUsers(1, role);
  return users[0] || null;
};

// Generate a specific test admin user
export const generateAdminUser = async () => {
  const adminId = nanoid();
  const employeeCode = createTestEmployeeId();
  
  try {
    const adminData = {
      uid: adminId,
      email: `admin@example.com`,
      name: 'Admin User',
      role: 'Admin' as UserRole,
      isAdmin: true,
      employeeCode,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    await createOrUpdateUser(adminData);
    console.log(`Created admin user: ${adminData.email}`);
    return adminData;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return null;
  }
};

// Generate users of different types
export const generateAllTypesOfUsers = async (countPerType = 5) => {
  console.log('Generating test users of all types...');
  
  // Create a test admin
  const admin = await generateAdminUser();
  
  // Create users of each type
  const standardUsers = await generateTestUsers(countPerType, 'User');
  const businessUsers = await generateTestUsers(countPerType, 'Business');
  const influencerUsers = await generateTestUsers(countPerType, 'Influencer');
  
  return {
    admin,
    standardUsers,
    businessUsers,
    influencerUsers,
    allUsers: [admin, ...standardUsers, ...businessUsers, ...influencerUsers].filter(Boolean)
  };
};

// Ensure test users exist (used by admin panels)
export const ensureTestUsers = async (count = 5): Promise<TestUserData[]> => {
  console.log('Ensuring test users exist...');
  
  try {
    // Generate one of each type
    const admin = await generateAdminUser();
    const standardUsers = await generateTestUsers(count, 'User');
    const businessUsers = await generateTestUsers(count, 'Business');
    const influencerUsers = await generateTestUsers(count, 'Influencer');
    
    return [admin, ...standardUsers, ...businessUsers, ...influencerUsers].filter(Boolean) as TestUserData[];
  } catch (error) {
    console.error('Failed to ensure test users exist:', error);
    return [];
  }
};
