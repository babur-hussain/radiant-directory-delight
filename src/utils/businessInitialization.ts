
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '@/models/Business';

// Sample business data
const sampleBusinesses: Partial<IBusiness>[] = [
  {
    name: "Tech Solutions Inc",
    description: "Providing innovative technology solutions for businesses of all sizes",
    category: "Technology",
    address: "123 Tech Street, Silicon Valley, CA",
    phone: "+1-234-567-8901",
    email: "info@techsolutions.example",
    website: "https://techsolutions.example",
    rating: 4.8,
    reviews: 125,
    featured: true,
    tags: ["technology", "software", "consulting"],
    image: "https://source.unsplash.com/random/300x200/?tech",
    hours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" }
    },
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    name: "Gourmet Delights",
    description: "Experience the finest cuisine from around the world",
    category: "Restaurant",
    address: "456 Food Avenue, New York, NY",
    phone: "+1-345-678-9012",
    email: "hello@gourmetdelights.example",
    website: "https://gourmetdelights.example",
    rating: 4.5,
    reviews: 210,
    featured: true,
    tags: ["restaurant", "gourmet", "dining"],
    image: "https://source.unsplash.com/random/300x200/?restaurant",
    hours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "12:00", close: "21:00" }
    },
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    name: "Wellness Center",
    description: "Your one-stop destination for health and wellness services",
    category: "Healthcare",
    address: "789 Wellness Blvd, Los Angeles, CA",
    phone: "+1-456-789-0123",
    email: "care@wellnesscenter.example",
    website: "https://wellnesscenter.example",
    rating: 4.7,
    reviews: 89,
    featured: false,
    tags: ["healthcare", "wellness", "spa", "fitness"],
    image: "https://source.unsplash.com/random/300x200/?wellness",
    hours: {
      monday: { open: "08:00", close: "20:00" },
      tuesday: { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday: { open: "08:00", close: "20:00" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "10:00", close: "16:00" }
    },
    latitude: 34.0522,
    longitude: -118.2437
  }
];

// Function to initialize businesses
export const initializeBusinesses = async (): Promise<number> => {
  let count = 0;
  
  try {
    for (const business of sampleBusinesses) {
      // Format hours for Supabase storage
      const formattedBusiness = {
        ...business,
        name: business.name, // Ensure name is included
        hours: business.hours ? JSON.stringify(business.hours) : null
      };
      
      // Insert business into Supabase
      const { data, error } = await supabase
        .from('businesses')
        .upsert([formattedBusiness])
        .select();
      
      if (error) {
        console.error("Error inserting business:", error);
        continue;
      }
      
      count++;
    }
    
    return count;
  } catch (error) {
    console.error("Error initializing businesses:", error);
    return count;
  }
};

// Function to check if businesses need to be initialized
export const checkAndInitializeBusinesses = async (): Promise<{ initialized: boolean; count: number }> => {
  try {
    // Check if businesses table has data
    const { data, error, count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) throw error;
    
    if (count === 0) {
      // No businesses found, initialize
      const initializedCount = await initializeBusinesses();
      return { initialized: true, count: initializedCount };
    }
    
    return { initialized: false, count: count || 0 };
  } catch (error) {
    console.error("Error checking businesses:", error);
    return { initialized: false, count: 0 };
  }
};
