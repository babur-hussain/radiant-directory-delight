
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Note: This file is now a stub as we've already completed the migration to MongoDB

/**
 * Migrates users from Firestore to MongoDB (now a no-op)
 */
export const migrateUsersFromFirestore = async (progressCallback: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  console.log('Migration already completed - using MongoDB only');
  progressCallback(100);
  
  toast({
    title: 'Information',
    description: 'The app now uses MongoDB exclusively for data storage.',
  });
  
  return { success: 0, failed: 0 };
};

/**
 * Migrates subscriptions from Firestore to MongoDB (now a no-op)
 */
export const migrateSubscriptionsFromFirestore = async (progressCallback: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  console.log('Migration already completed - using MongoDB only');
  progressCallback(100);
  
  return { success: 0, failed: 0 };
};

/**
 * Migrates businesses from Firestore to MongoDB (now a no-op)
 */
export const migrateBusinessesFromFirestore = async (progressCallback: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  console.log('Migration already completed - using MongoDB only');
  progressCallback(100);
  
  return { success: 0, failed: 0 };
};
