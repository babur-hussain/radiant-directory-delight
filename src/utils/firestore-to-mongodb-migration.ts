
// This is a stub file to replace Firebase migration utilities
// It provides mock implementations for backward compatibility

type MigrationResult = {
  success: number;
  failed: number;
};

// Mock implementation for Firebase to MongoDB migration
export const migrateUsersFromFirestore = async (
  progressCallback?: (progress: number) => void
): Promise<MigrationResult> => {
  // Simulate progress for UI
  if (progressCallback) {
    for (let i = 0; i <= 100; i += 10) {
      progressCallback(i / 100);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Migration from Firebase to MongoDB is no longer supported - using Supabase now');
  return { success: 0, failed: 0 };
};

export const migrateSubscriptionsFromFirestore = async (
  progressCallback?: (progress: number) => void
): Promise<MigrationResult> => {
  // Simulate progress for UI
  if (progressCallback) {
    for (let i = 0; i <= 100; i += 10) {
      progressCallback(i / 100);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Migration from Firebase to MongoDB is no longer supported - using Supabase now');
  return { success: 0, failed: 0 };
};

export const migrateBusinessesFromFirestore = async (
  progressCallback?: (progress: number) => void
): Promise<MigrationResult> => {
  // Simulate progress for UI
  if (progressCallback) {
    for (let i = 0; i <= 100; i += 10) {
      progressCallback(i / 100);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Migration from Firebase to MongoDB is no longer supported - using Supabase now');
  return { success: 0, failed: 0 };
};
