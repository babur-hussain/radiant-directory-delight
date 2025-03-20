
// This file is a re-export module for better organization of auth functionality

// Export user role and permission functions
export { updateUserRole, updateUserPermission } from './roleManagement';

// Export user data access functions
export { getUserById, getAllUsers } from './userDataAccess';

// Export test user creation functions
export { createTestUser, ensureTestUsers } from './testUsers';

// Export utility functions
export { formatUser, getLocalUsers } from './utils/userUtils';

// Export types properly using the 'export type' syntax
export type { TestUserData } from './testUsers';

// Add a version number for tracking changes
export const AUTH_MODULE_VERSION = '1.0.1';
