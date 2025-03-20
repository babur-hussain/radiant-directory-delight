
// This file is now just a re-export module for better organization

// Export user role and permission functions
export { updateUserRole, updateUserPermission } from './roleManagement';

// Export user data access functions
export { getUserById, getAllUsers } from './userDataAccess';

// Export test user creation functions
export { createTestUser, ensureTestUsers } from './testUsers';

// Export utility functions
export { formatUser, getLocalUsers } from './utils/userUtils';

// Re-export types correctly using 'export type'
export type { TestUserData } from './testUsers';
