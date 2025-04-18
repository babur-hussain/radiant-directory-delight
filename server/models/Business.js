
import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  hours: { type: Object, default: {} },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for frequently queried fields
BusinessSchema.index({ category: 1 });
BusinessSchema.index({ featured: 1 });
BusinessSchema.index({ name: 1 });

export default mongoose.model('Business', BusinessSchema);
