
import { mongoose } from '../config/mongodb';

export interface IBusiness {
  id: number;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviews: number;
  latitude: number;
  longitude: number;
  hours: Record<string, any>;
  tags: string[];
  featured: boolean;
  image: string;
}

const BusinessSchema = new mongoose.Schema<IBusiness>({
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
  hours: { type: Map, of: String, default: {} },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  image: { type: String, default: '' }
});

// Create indexes for frequently queried fields
BusinessSchema.index({ category: 1 });
BusinessSchema.index({ featured: 1 });
BusinessSchema.index({ name: 1 });

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
