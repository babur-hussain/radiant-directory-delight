
import { createOrUpdateUser } from "@/api/services/userAPI";
import { UserRole, normalizeRole } from "@/types/auth";
import { nanoid } from 'nanoid';

// Function to create a test employee ID
export const createTestEmployeeId = () => {
  return `EMP${Math.floor(10000 + Math.random() * 90000)}`;
};

// Create a function to generate test users
export const generateTestUsers = async (count = 10, type: string = 'user') => {
  const role = normalizeRole(type);
  console.log(`Generating ${count} test ${role} users...`);
  
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const userId = nanoid();
    const employeeCode = createTestEmployeeId();
    
    // Create a user with basic fields
    const userData = {
      uid: userId,
      email: `test${role}${i}@example.com`,
      name: `Test ${role} ${i}`,
      role: role,
      isAdmin: role === 'admin',
      employeeCode: employeeCode,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    try {
      // Create the user in the database
      await createOrUpdateUser(userData);
      users.push(userData);
      console.log(`Created test ${role} user: ${userData.email}`);
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
export const createTestUser = async (role: string = 'user'): Promise<TestUserData | null> => {
  const normalizedRole = normalizeRole(role);
  const users = await generateTestUsers(1, normalizedRole);
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
      role: 'admin' as UserRole,
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
  const standardUsers = await generateTestUsers(countPerType, 'user');
  const businessUsers = await generateTestUsers(countPerType, 'business');
  const influencerUsers = await generateTestUsers(countPerType, 'influencer');
  
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
    const standardUsers = await generateTestUsers(count, 'user');
    const businessUsers = await generateTestUsers(count, 'business');
    const influencerUsers = await generateTestUsers(count, 'influencer');
    
    return [admin, ...standardUsers, ...businessUsers, ...influencerUsers].filter(Boolean) as TestUserData[];
  } catch (error) {
    console.error('Failed to ensure test users exist:', error);
    return [];
  }
};
