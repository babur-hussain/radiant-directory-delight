/**
 * This is a utility file to help identify and remove Firebase-related code
 * that is no longer needed after migrating to MongoDB.
 * 
 * Functions in this file don't actually do anything - they just serve as documentation
 * for what Firebase related code has been replaced with MongoDB alternatives.
 */

// The following Firebase functions have been replaced by MongoDB equivalents:
// 
// 1. Firebase Firestore operations:
//    - collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, where, query
//    - These have been replaced with Mongoose model operations
//
// 2. Firebase Authentication:
//    - Auth still used for user authentication
//    - But user data is stored in MongoDB
//
// 3. Firebase Storage:
//    - Still used for file storage

/**
 * Used for development guidance only - this helps identify which Firebase
 * imports are still needed vs which ones can be removed
 */
export const stillNeedFirebase = {
  auth: true,        // Still needed for authentication
  storage: true,     // Still needed for file storage
  firestore: false,  // Replaced by MongoDB
  database: false,   // Replaced by MongoDB
  functions: false,  // Replaced by MongoDB/backend functions
};

/**
 * Files that have been fully migrated to MongoDB
 */
export const fullyMigratedFiles = [
  "src/hooks/useSubscriptionPackages.ts",
  "src/components/subscription/RazorpayPayment.tsx",
  "src/components/GetListedForm.tsx",
  "src/lib/mongodb-utils.ts",
  "src/utils/setupMongoDB.ts",
  "src/hooks/useBusinessListings.ts",
  "src/pages/AdminDashboardPage.tsx",
  "src/components/subscription/SubscriptionPackages.tsx"
];

/**
 * Files that still need to be migrated from Firebase to MongoDB
 */
export const filesToMigrate = [
  // Authentication related files - will keep Firebase auth but store user data in MongoDB
  "src/hooks/useAuth.tsx",
  
  // Any other files still using Firebase Firestore directly
];
