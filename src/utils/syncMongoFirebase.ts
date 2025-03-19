
import axios from 'axios';
import { SubscriptionPackage, ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from '@/hooks/use-toast';

/**
 * Note: This file has been updated to only work with MongoDB.
 * Firebase operations are now no-ops. The file is kept for backward compatibility.
 */

/**
 * Synchronization is no longer needed as we only use MongoDB
 */
export const syncPackageToFirebase = async (packageData: ISubscriptionPackage): Promise<boolean> => {
  console.log('Firebase sync skipped - using MongoDB only');
  toast({
    title: 'Information',
    description: 'The app now uses MongoDB exclusively for data storage.',
  });
  return true;
};

/**
 * Synchronizes all subscription packages from MongoDB to Firebase (no-op)
 */
export const syncAllPackagesToFirebase = async (): Promise<{success: boolean, count: number}> => {
  console.log('Firebase sync skipped - using MongoDB only');
  toast({
    title: 'Information',
    description: 'The app now uses MongoDB exclusively for data storage.',
  });
  return { success: true, count: 0 };
};

/**
 * Firebase packages to MongoDB sync (no-op)
 */
export const syncFirebasePackagesToMongo = async (): Promise<{success: boolean, count: number}> => {
  console.log('Firebase sync skipped - using MongoDB only');
  toast({
    title: 'Information',
    description: 'The app now uses MongoDB exclusively for data storage.',
  });
  return { success: true, count: 0 };
};

/**
 * Full two-way synchronization (no-op)
 */
export const fullSyncPackages = async (): Promise<{success: boolean, mongoToFirebase: number, firebaseToMongo: number}> => {
  console.log('Firebase sync skipped - using MongoDB only');
  toast({
    title: 'Information',
    description: 'The app now uses MongoDB exclusively for data storage.',
  });
  return { success: true, mongoToFirebase: 0, firebaseToMongo: 0 };
};
