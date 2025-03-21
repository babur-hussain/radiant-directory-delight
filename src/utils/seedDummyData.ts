
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { PaymentType, BillingCycle } from '@/models/Subscription';

export const seedDummyUsers = async () => {
  try {
    // Check if users already exist
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('id')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    // Skip if users already exist
    if (existingUsers && existingUsers.length > 0) {
      console.log("Users already exist. Skipping seed.");
      return { success: true, count: existingUsers.length };
    }
    
    // Dummy user data
    const users = [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'Admin' as UserRole,
        is_admin: true,
        created_at: new Date().toISOString(),
        phone: '+91 9876543210',
        city: 'Delhi',
        country: 'India',
        verified: true
      },
      {
        id: '2',
        email: 'business@example.com',
        name: 'Business User',
        role: 'Business' as UserRole,
        is_admin: false,
        created_at: new Date().toISOString(),
        phone: '+91 8765432109',
        city: 'Mumbai',
        country: 'India',
        business_name: 'Sample Business',
        owner_name: 'Business Owner',
        business_category: 'Restaurant',
        verified: true
      },
      {
        id: '3',
        email: 'influencer@example.com',
        name: 'Influencer User',
        role: 'Influencer' as UserRole,
        is_admin: false,
        created_at: new Date().toISOString(),
        phone: '+91 7654321098',
        city: 'Bangalore',
        country: 'India',
        instagram_handle: '@sampleinfluencer',
        followers_count: 15000,
        verified: true
      }
    ];
    
    // Insert users
    const { data, error: insertError } = await supabase
      .from('users')
      .upsert(users)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error seeding dummy users:", error);
    return { success: false, error };
  }
};

export const seedDummyBusinesses = async () => {
  try {
    // Check if businesses already exist
    const { data: existingBusinesses, error } = await supabase
      .from('businesses')
      .select('id')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    // Skip if businesses already exist
    if (existingBusinesses && existingBusinesses.length > 0) {
      console.log("Businesses already exist. Skipping seed.");
      return { success: true, count: existingBusinesses.length };
    }
    
    // Dummy business data
    const businesses = [
      {
        name: 'Organic Foods Market',
        description: 'Fresh and organic groceries',
        category: 'Grocery',
        address: '123 Main St, Mumbai',
        phone: '+91 9876543210',
        email: 'info@organicfoods.com',
        website: 'organicfoods.com',
        image: 'https://picsum.photos/200/300',
        hours: JSON.stringify({
          "monday": "9:00 AM - 9:00 PM",
          "tuesday": "9:00 AM - 9:00 PM",
          "wednesday": "9:00 AM - 9:00 PM",
          "thursday": "9:00 AM - 9:00 PM",
          "friday": "9:00 AM - 10:00 PM",
          "saturday": "10:00 AM - 10:00 PM",
          "sunday": "10:00 AM - 8:00 PM"
        }),
        rating: 4.5,
        reviews: 128,
        latitude: 19.0760,
        longitude: 72.8777,
        tags: ['organic', 'groceries', 'healthy'],
        featured: true
      },
      {
        name: 'Tech Solutions Hub',
        description: 'IT services and consulting',
        category: 'Technology',
        address: '456 Tech Park, Bangalore',
        phone: '+91 8765432109',
        email: 'contact@techsolutions.com',
        website: 'techsolutions.com',
        image: 'https://picsum.photos/200/300',
        hours: JSON.stringify({
          "monday": "9:00 AM - 6:00 PM",
          "tuesday": "9:00 AM - 6:00 PM",
          "wednesday": "9:00 AM - 6:00 PM",
          "thursday": "9:00 AM - 6:00 PM",
          "friday": "9:00 AM - 6:00 PM",
          "saturday": "10:00 AM - 2:00 PM",
          "sunday": "Closed"
        }),
        rating: 4.2,
        reviews: 75,
        latitude: 12.9716,
        longitude: 77.5946,
        tags: ['technology', 'consulting', 'it services'],
        featured: false
      }
    ];
    
    // Insert businesses
    const { data, error: insertError } = await supabase
      .from('businesses')
      .upsert(businesses)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error seeding dummy businesses:", error);
    return { success: false, error };
  }
};

export const seedDummySubscriptionPackages = async () => {
  try {
    // Check if packages already exist
    const { data: existingPackages, error } = await supabase
      .from('subscription_packages')
      .select('id')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    // Skip if packages already exist
    if (existingPackages && existingPackages.length > 0) {
      console.log("Subscription packages already exist. Skipping seed.");
      return { success: true, count: existingPackages.length };
    }
    
    // Dummy package data
    const packages = [
      {
        id: 'business-basic',
        title: 'Business Basic',
        price: 5999,
        monthly_price: 599,
        setup_fee: 999,
        duration_months: 12,
        short_description: 'Essential digital presence for small businesses',
        full_description: 'Get your business online with our essential digital package. Includes website, GMB listing, and basic SEO.',
        features: ['Google My Business Listing', 'Basic Website', 'Social Media Setup', 'Basic SEO', 'Email Support'],
        popular: false,
        type: 'Business' as 'Business' | 'Influencer',
        is_active: true,
        advance_payment_months: 0,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly' as BillingCycle,
        dashboard_sections: ['google_listing', 'ratings', 'seo']
      },
      {
        id: 'business-pro',
        title: 'Business Pro',
        price: 9999,
        monthly_price: 999,
        setup_fee: 1999,
        duration_months: 12,
        short_description: 'Complete digital marketing solution for growing businesses',
        full_description: 'Comprehensive digital marketing solution to grow your business online. Includes premium website, SEO, social media management and more.',
        features: ['Premium Website', 'Google My Business Management', 'Social Media Management', 'Advanced SEO', 'Content Creation', 'Performance Reports', 'Priority Support'],
        popular: true,
        type: 'Business' as 'Business' | 'Influencer',
        is_active: true,
        advance_payment_months: 1,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly' as BillingCycle,
        dashboard_sections: ['google_listing', 'ratings', 'seo', 'leads', 'performance']
      },
      {
        id: 'influencer-basic',
        title: 'Influencer Basic',
        price: 4999,
        monthly_price: 499,
        setup_fee: 999,
        duration_months: 12,
        short_description: 'Start your influencer journey',
        full_description: 'Perfect for new influencers looking to build their brand. Get access to campaigns, analytics and basic brand connections.',
        features: ['Campaign Access', 'Basic Analytics', 'Profile Optimization', 'Email Support'],
        popular: false,
        type: 'Influencer' as 'Business' | 'Influencer',
        is_active: true,
        advance_payment_months: 0,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly' as BillingCycle,
        dashboard_sections: ['reels', 'ratings', 'rank']
      },
      {
        id: 'influencer-pro',
        title: 'Influencer Pro',
        price: 7999,
        monthly_price: 799,
        setup_fee: 1499,
        duration_months: 12,
        short_description: 'Advanced tools for professional influencers',
        full_description: 'Take your influence to the next level with premium tools, analytics, brand partnerships and dedicated support.',
        features: ['Premium Campaign Priority', 'Advanced Analytics', 'Brand Partnership', 'Content Strategy', 'Performance Reports', 'Priority Support'],
        popular: true,
        type: 'Influencer' as 'Business' | 'Influencer',
        is_active: true,
        advance_payment_months: 1,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly' as BillingCycle,
        dashboard_sections: ['reels', 'ratings', 'rank', 'creatives', 'performance', 'leads']
      }
    ];
    
    // Insert packages
    const { data, error: insertError } = await supabase
      .from('subscription_packages')
      .upsert(packages)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error seeding dummy subscription packages:", error);
    return { success: false, error };
  }
};

export const seedDummySubscriptions = async () => {
  try {
    // Check if subscriptions already exist
    const { data: existingSubscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    // Skip if subscriptions already exist
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log("Subscriptions already exist. Skipping seed.");
      return { success: true, count: existingSubscriptions.length };
    }
    
    // Get users
    const { data: users } = await supabase
      .from('users')
      .select('id, role')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!users || users.length === 0) {
      console.log("No users found. Please seed users first.");
      return { success: false, error: "No users found" };
    }
    
    // Get packages
    const { data: packages } = await supabase
      .from('subscription_packages')
      .select('id, title, price, type')
      .order('created_at', { ascending: false });
    
    if (!packages || packages.length === 0) {
      console.log("No packages found. Please seed packages first.");
      return { success: false, error: "No packages found" };
    }
    
    // Create some dummy subscriptions
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(now.getFullYear() + 1);
    
    const subscriptions = users.map(user => {
      // Find a matching package type for this user
      const matchingPackages = packages.filter(p => {
        if (user.role === 'Business' && p.type === 'Business') return true;
        if (user.role === 'Influencer' && p.type === 'Influencer') return true;
        return false;
      });
      
      const randomPackage = matchingPackages.length > 0 
        ? matchingPackages[Math.floor(Math.random() * matchingPackages.length)]
        : packages[0];
      
      return {
        id: `sub-${user.id}`,
        user_id: user.id,
        package_id: randomPackage.id,
        package_name: randomPackage.title,
        status: Math.random() > 0.2 ? 'active' : 'pending',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        amount: randomPackage.price,
        payment_type: 'recurring' as PaymentType,
        payment_method: 'razorpay',
        transaction_id: `tx-${Math.floor(Math.random() * 1000000)}`,
        billing_cycle: 'yearly' as BillingCycle,
        recurring_amount: randomPackage.price,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };
    });
    
    // Insert subscriptions
    const { data, error: insertError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptions)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error seeding dummy subscriptions:", error);
    return { success: false, error };
  }
};

export const seedAllDummyData = async () => {
  const results = {
    users: await seedDummyUsers(),
    businesses: await seedDummyBusinesses(),
    packages: await seedDummySubscriptionPackages(),
    subscriptions: await seedDummySubscriptions()
  };
  
  return {
    success: 
      results.users.success && 
      results.businesses.success && 
      results.packages.success && 
      results.subscriptions.success,
    results
  };
};

// Export an alias for backward compatibility
export const seedDummyData = seedAllDummyData;
