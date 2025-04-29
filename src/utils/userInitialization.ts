
import { User, IUser } from '../models/User';
import { loadAllUsers } from '@/features/auth/authStorage';
import { getRoleAsString } from '@/types/auth';

export const importUsersToMongoDB = async (
  progressCallback?: (progress: number) => void
): Promise<{ loaded: number; failed: number }> => {
  try {
    console.log('Starting user initialization in MongoDB');
    
    // Check if users already exist in MongoDB
    const existingCount = await User.countDocuments();
    console.log(`Found ${existingCount} existing users in MongoDB`);
    
    if (existingCount > 0) {
      console.log('Users already exist in MongoDB, skipping initialization');
      return { loaded: existingCount, failed: 0 };
    }
    
    // Get all users from Firebase/Firestore
    const users = await loadAllUsers();
    console.log(`Retrieved ${users.length} users to load into MongoDB`);
    
    if (!users || users.length === 0) {
      console.warn('No users found to load into MongoDB');
      return { loaded: 0, failed: 0 };
    }
    
    let loaded = 0;
    let failed = 0;
    
    // Import users to MongoDB
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      try {
        // Convert to MongoDB model format
        const userData: IUser = {
          uid: user.uid || user.id,
          name: user.name || user.displayName || null,
          email: user.email || null,
          role: getRoleAsString(user.role), // Convert role to string
          isAdmin: Boolean(user.isAdmin) || false,
          photoURL: user.photoURL || null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date() // Default to current date if not provided
        };
        
        // Save to MongoDB
        await User.create(userData);
        loaded++;
      } catch (error) {
        console.error(`Failed to load user "${user.email}" to MongoDB:`, error);
        failed++;
      }
      
      // Update progress
      if (progressCallback) {
        progressCallback((i + 1) / users.length);
      }
    }
    
    console.log(`Successfully loaded ${loaded} users to MongoDB, ${failed} failed`);
    return { loaded, failed };
  } catch (error) {
    console.error('Error initializing users in MongoDB:', error);
    throw error;
  }
};
