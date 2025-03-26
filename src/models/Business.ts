
import { Database } from '@/integrations/supabase/types';

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
  created_at?: string;
  updated_at?: string;
}

// Define an adapter function to convert Supabase business data to our application model
export const fromSupabase = (data: Database['public']['Tables']['businesses']['Row']): IBusiness => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    category: data.category || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : (data.hours || {}),
    tags: data.tags || [],
    featured: data.featured || false,
    image: data.image || '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Map CSV column headers to database fields for import
// Enhanced to support more variations of column names
export const csvHeaderMapping = {
  // Name variations
  "Business Name": "name",
  "BusinessName": "name",
  "Name": "name",
  "business name": "name",
  "business_name": "name",
  "businessname": "name",
  "name": "name",
  
  // Category variations
  "Category": "category",
  "category": "category",
  "Business Category": "category",
  "BusinessCategory": "category",
  "business_category": "category",
  
  // Address variations
  "Address": "address",
  "address": "address",
  "Location": "address",
  "location": "address",
  
  // Phone variations
  "Mobile Number": "phone",
  "Phone": "phone",
  "Mobile": "phone",
  "Contact": "phone",
  "Phone Number": "phone",
  "mobile": "phone",
  "mobile number": "phone",
  "phone": "phone",
  "contact": "phone",
  
  // Rating/Review variations
  "Review": "rating",
  "Rating": "rating",
  "Stars": "rating",
  "review": "rating",
  "rating": "rating",
  
  // Reviews count variations
  "Reviews": "reviews",
  "reviews": "reviews",
  "Review Count": "reviews",
  "ReviewCount": "reviews",
  "review count": "reviews",
  
  // Other fields
  "Description": "description",
  "description": "description",
  "Email": "email",
  "email": "email",
  "Website": "website",
  "website": "website",
  "Tags": "tags",
  "tags": "tags",
  "Image": "image",
  "image": "image",
  "Featured": "featured",
  "featured": "featured"
};

// Generate inverse mapping for Supabase CSV import
export const getInverseHeaderMapping = (): Record<string, string> => {
  // Create standard mapping from DB column to CSV header
  return {
    "name": "Business Name",
    "category": "Category",
    "address": "Address",
    "phone": "Phone",
    "rating": "Rating",
    "reviews": "Reviews",
    "description": "Description",
    "email": "Email",
    "website": "Website",
    "tags": "Tags",
    "image": "Image",
    "featured": "Featured"
  };
};
