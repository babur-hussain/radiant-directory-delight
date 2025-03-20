
/**
 * Main MongoDB configuration module
 * Provides real or mock mongoose based on environment
 */

import * as mongooseModule from 'mongoose';
import SchemaClass from './schema-mock';
import { createMockModel } from './mock-model';
import { QueryResult, extractQueryResults } from './query-result';

// Re-export the query helpers
export { QueryResult, extractQueryResults };

// Re-export connection management functions
export { connectToMongoDB, isMongoDB_Connected, isMongoDBConnected } from './connection';

const MOCK_DB_NAME = 'growbharatdb';
let mockConnection = false;

// MongoDB mock implementation
const mongooseMock = {
  Schema: SchemaClass,
  model: (name: string, schema: any) => createMockModel(name, schema),
  // Mock mongoose.connect
  connect: (uri: string, options?: any) => {
    console.log('MongoDB Mock: Connecting to', MOCK_DB_NAME);
    mockConnection = true;
    return Promise.resolve({ connection: { db: { databaseName: MOCK_DB_NAME } } });
  },
  // Mock connection property
  connection: {
    readyState: 1, // Connected
    host: 'localhost',
    name: MOCK_DB_NAME,
    db: { databaseName: MOCK_DB_NAME }
  }
};

// Use the real mongoose in production, mock in development/test
const isProduction = false; // Always use mock for now

// Export the mongoose instance (real or mock)
export const mongoose = isProduction ? mongooseModule : mongooseMock;

// Export the mongoose instance for use elsewhere
export default mongoose;
