
import { mongoose } from '../config/mongodb';

export interface IUser {
  uid: string;
  name: string | null;
  email: string | null;
  role: string | null;
  isAdmin: boolean;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
  subscription?: string | null;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPackage?: string;
  // New field for custom dashboard sections
  customDashboardSections?: string[];
}

// Create a schema using the mongoose mock
const UserSchema = mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  email: { type: String, default: null },
  role: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  photoURL: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  subscription: { type: String, default: null },
  subscriptionId: { type: String, default: null },
  subscriptionStatus: { type: String, default: null },
  subscriptionPackage: { type: String, default: null },
  // Add customDashboardSections field to schema
  customDashboardSections: [{ type: String }]
});

// Create indexes for frequently queried fields
UserSchema.index({ uid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isAdmin: 1 });

// Virtual for compatibility with Firestore IDs
UserSchema.virtual('id').get(function() {
  return this.uid;
});

// Add method to check if a user is admin for easier access
UserSchema.methods.isUserAdmin = function(): boolean {
  return this.isAdmin === true || this.role === 'Admin' || this.role === 'admin';
};

export const User = mongoose.model('User', UserSchema);
