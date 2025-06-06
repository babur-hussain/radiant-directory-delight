
/**
 * Main MongoDB configuration module
 * Uses real mongoose for all operations - no mocks
 */

import * as mongooseModule from 'mongoose';

// Re-export connection management functions
export { connectToMongoDB, isMongoDB_Connected, isMongoDBConnected } from './connection';

// Export the real mongoose instance for all operations
export const mongoose = mongooseModule;

// Export the mongoose instance for use elsewhere
export default mongoose;
