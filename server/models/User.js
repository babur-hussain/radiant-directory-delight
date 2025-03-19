
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  email: { type: String, default: null },
  role: { type: String, default: 'user' },
  isAdmin: { type: Boolean, default: false },
  photoURL: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
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
});

// Create indexes for frequently queried fields
UserSchema.index({ uid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isAdmin: 1 });

// Method to check if a user is admin
UserSchema.methods.isUserAdmin = function() {
  return this.isAdmin === true || this.role === 'Admin' || this.role === 'admin';
};

export default mongoose.model('User', UserSchema);
