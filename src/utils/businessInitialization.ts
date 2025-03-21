
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '../models/Business';

// Create a sample business if none exist
export const createSampleBusinessIfNoneExist = async (): Promise<boolean> => {
  try {
    // Check if businesses exist
    const { count, error: countError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking business count:', countError);
      return false;
    }
    
    // If there are already businesses, we don't need to create samples
    if (count && count > 0) {
      return true;
    }
    
    // Create sample businesses
    const sampleBusinesses: Partial<IBusiness>[] = [
      {
        name: 'Sample Restaurant',
        description: 'A delicious sample restaurant to showcase the platform.',
        category: 'Restaurant',
        address: '123 Sample Street, Sampleville',
        phone: '555-123-4567',
        email: 'info@samplerestaurant.com',
        website: 'https://samplerestaurant.com',
        rating: 4.5,
        reviews: 42,
        featured: true,
        tags: ['sample', 'restaurant', 'food'],
        hours: {
          monday: '9:00 AM - 10:00 PM',
          tuesday: '9:00 AM - 10:00 PM',
          wednesday: '9:00 AM - 10:00 PM',
          thursday: '9:00 AM - 10:00 PM',
          friday: '9:00 AM - 11:00 PM',
          saturday: '10:00 AM - 11:00 PM',
          sunday: '10:00 AM - 9:00 PM'
        },
        latitude: 40.7128,
        longitude: -74.0060,
        image: 'https://placehold.co/600x400/png?text=Sample+Restaurant'
      },
      {
        name: 'Sample Retail Store',
        description: 'A fantastic sample retail store with amazing products.',
        category: 'Retail',
        address: '456 Example Avenue, Exampletown',
        phone: '555-987-6543',
        email: 'sales@sampleretail.com',
        website: 'https://sampleretail.com',
        rating: 4.2,
        reviews: 36,
        featured: false,
        tags: ['sample', 'retail', 'shopping'],
        hours: {
          monday: '10:00 AM - 9:00 PM',
          tuesday: '10:00 AM - 9:00 PM',
          wednesday: '10:00 AM - 9:00 PM',
          thursday: '10:00 AM - 9:00 PM',
          friday: '10:00 AM - 9:00 PM',
          saturday: '9:00 AM - 9:00 PM',
          sunday: '11:00 AM - 7:00 PM'
        },
        latitude: 34.0522,
        longitude: -118.2437,
        image: 'https://placehold.co/600x400/png?text=Sample+Retail'
      }
    ];
    
    // Format hours as JSON strings
    const formattedBusinesses = sampleBusinesses.map(business => ({
      ...business,
      hours: JSON.stringify(business.hours)
    }));
    
    // Insert sample businesses
    const { error: insertError } = await supabase
      .from('businesses')
      .insert(formattedBusinesses);
    
    if (insertError) {
      console.error('Error creating sample businesses:', insertError);
      return false;
    }
    
    console.log('Sample businesses created successfully');
    return true;
  } catch (error) {
    console.error('Error in createSampleBusinessIfNoneExist:', error);
    return false;
  }
};

export default createSampleBusinessIfNoneExist;
