
// This file is now replaced by src/features/auth/authStorage.ts
// Re-exporting from the new location for backward compatibility
import { 
  getRoleKey, 
  getAdminKey, 
  initializeDefaultAdmin, 
  saveUserToAllUsersList, 
  ALL_USERS_KEY 
} from "../features/auth/authStorage";

export {
  getRoleKey,
  getAdminKey,
  initializeDefaultAdmin,
  saveUserToAllUsersList,
  ALL_USERS_KEY
};
