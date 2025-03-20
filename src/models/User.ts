
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
  employeeCode?: string | null; // Added employee code field
  subscription?: string | null;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPackage?: string;
  // New field for custom dashboard sections
  customDashboardSections?: string[];
  
  // New fields for influencer and business profiles
  // Shared fields
  phone?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  verified?: boolean;
  city?: string;
  country?: string;
  
  // Influencer specific fields
  niche?: string;
  followersCount?: string;
  bio?: string;
  
  // Business specific fields
  businessName?: string;
  ownerName?: string;
  businessCategory?: string;
  website?: string;
  address?: {
    street?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  gstNumber?: string;
}

// Create a schema using the mongoose mock
const UserSchema = {
  uid: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  email: { type: String, default: null },
  role: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  photoURL: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  employeeCode: { type: String, default: null }, // Added employee code field
  subscription: { type: String, default: null },
  subscriptionId: { type: String, default: null },
  subscriptionStatus: { type: String, default: null },
  subscriptionPackage: { type: String, default: null },
  customDashboardSections: [{ type: String }],
  
  // Shared fields
  phone: { type: String, default: null },
  instagramHandle: { type: String, default: null },
  facebookHandle: { type: String, default: null },
  verified: { type: Boolean, default: false },
  city: { type: String, default: null },
  country: { type: String, default: null },
  
  // Influencer specific fields
  niche: { type: String, default: null },
  followersCount: { type: String, default: null },
  bio: { type: String, default: null },
  
  // Business specific fields
  businessName: { type: String, default: null },
  ownerName: { type: String, default: null },
  businessCategory: { type: String, default: null },
  website: { type: String, default: null },
  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    zipCode: { type: String, default: null }
  },
  gstNumber: { type: String, default: null }
};

// Add methods for mock implementation
UserSchema.index = function(field: any) {
  // This is a mock implementation that does nothing
  return;
};

UserSchema.virtual = function(name: string) {
  return {
    get: function() {
      return null;
    }
  };
};

UserSchema.methods = {
  isUserAdmin: function(): boolean {
    return false;
  }
};

// Create indexes for frequently queried fields
UserSchema.index({ uid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ employeeCode: 1 }); // Add index for employee code

// Virtual for compatibility with Firestore IDs
UserSchema.virtual('id').get(function() {
  return this.uid;
});

export const User = mongoose.model('User', UserSchema);
