import { supabase } from '@/integrations/supabase/client';
import { Business } from '@/lib/csv-utils';

// Sample business data for initialization
const sampleBusinesses: Partial<Business>[] = [
  {
    name: "The Coffee House",
    category: "Coffee Shop",
    description: "A cozy coffee shop with a variety of brews and pastries.",
    address: "123 Main St, Anytown, CA",
    phone: "555-123-4567",
    website: "https://example.com/coffeehouse",
    rating: 4.5,
    reviews: 127,
    featured: true,
    tags: ["coffee", "pastries", "breakfast"],
    latitude: 37.7749,
    longitude: -122.4194,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  // ... other sample businesses
];

/**
 * Initialize businesses in the database
 * @returns {Promise<boolean>} - Success status
 */
export const initializeBusinesses = async (): Promise<boolean> => {
  try {
    // Check if businesses already exist
    const { data: existingBusinesses, error: checkError, count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    if (checkError) {
      console.error("Error checking for existing businesses:", checkError);
      return false;
    }
    
    // If there are already businesses, we don't need to initialize
    if (count && count > 0) {
      console.log(`Found ${count} existing businesses, skipping initialization.`);
      return true;
    }
    
    console.log("No businesses found, initializing with sample data...");
    
    // Format businesses for Supabase
    const formattedBusinesses = sampleBusinesses.map(business => ({
      name: business.name || '',
      category: business.category || '',
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      website: business.website || '',
      rating: business.rating || 0,
      reviews: business.reviews || 0,
      featured: business.featured || false,
      tags: business.tags || [],
      latitude: business.latitude || 0,
      longitude: business.longitude || 0,
      image: business.image || '',
      hours: JSON.stringify({
        "Monday": "8:00 AM - 5:00 PM",
        "Tuesday": "8:00 AM - 5:00 PM",
        "Wednesday": "8:00 AM - 5:00 PM",
        "Thursday": "8:00 AM - 5:00 PM",
        "Friday": "8:00 AM - 5:00 PM",
        "Saturday": "9:00 AM - 3:00 PM",
        "Sunday": "Closed"
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert businesses one by one to avoid type issues
    for (const business of formattedBusinesses) {
      const { error } = await supabase
        .from('businesses')
        .insert([business]);
      
      if (error) {
        console.error(`Error inserting business "${business.name}":`, error);
      }
    }
    
    console.log(`Successfully initialized ${formattedBusinesses.length} businesses.`);
    return true;
  } catch (error) {
    console.error("Error initializing businesses:", error);
    return false;
  }
};
