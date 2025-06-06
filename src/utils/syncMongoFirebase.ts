
// This file provides compatibility stubs for the MongoDB-Firebase sync operations
// These are no longer used as we've moved to Supabase

/**
 * Simulates syncing packages between MongoDB and Firebase
 * Now returns a mock response since we're using Supabase
 */
export const fullSyncPackages = async () => {
  console.log('Firebase sync operations are deprecated - using Supabase now');
  
  // Return a mock success response
  return {
    success: true,
    mongoToFirebase: 0,
    firebaseToMongo: 0,
    message: 'Firebase operations are deprecated. Using Supabase exclusively now.'
  };
};
