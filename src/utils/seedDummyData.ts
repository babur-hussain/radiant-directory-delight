
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '@/models/Business';
import { PaymentType } from '@/models/Subscription';

export const seedDummyUsers = async (count = 10) => {
  try {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const role = i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Influencer' : 'User';
      const isAdmin = i === 0;
      
      users.push({
        id: nanoid(),
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        role: role,
        is_admin: isAdmin,
        photo_url: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i % 70}.jpg`,
        created_at: new Date().toISOString(),
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][i % 5],
        verified: i % 3 === 0,
        followers_count: role === 'Influencer' ? Math.floor(Math.random() * 100000).toString() : null,
        business_name: role === 'Business' ? `Business ${i}` : null,
      });
    }
    
    const { data, error } = await supabase
      .from('users')
      .upsert(users)
      .select();
      
    if (error) throw error;
    
    return { 
      success: true, 
      count: data.length,
      message: `Created ${data.length} dummy users`
    };
  } catch (error) {
    console.error("Error seeding dummy users:", error);
    return { 
      success: false, 
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const seedDummyBusinesses = async (count = 10) => {
  try {
    const businesses = [];
    const categories = ['Restaurant', 'Retail', 'Service', 'Technology', 'Healthcare', 'Education', 'Entertainment'];
    
    for (let i = 0; i < count; i++) {
      const businessHours = {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: i % 2 === 0 ? '10:00 AM - 4:00 PM' : 'Closed',
        sunday: 'Closed'
      };
      
      businesses.push({
        name: `Business ${i}`, 
        description: `Description for Business ${i}. This is a sample business.`,
        category: categories[i % categories.length],
        address: `${i + 100} Sample Street, Test City`,
        phone: `+91-${9000000000 + i}`,
        email: `business${i}@example.com`,
        website: `https://business${i}.example.com`,
        rating: Math.floor(Math.random() * 5 * 10) / 10,
        reviews: Math.floor(Math.random() * 100),
        latitude: 18.52 + (Math.random() * 0.1),
        longitude: 73.85 + (Math.random() * 0.1),
        hours: JSON.stringify(businessHours),
        tags: [`tag${i}`, `sample`, categories[i % categories.length].toLowerCase()],
        featured: i < 3,
        image: `https://picsum.photos/seed/business${i}/500/300`
      });
    }
    
    // Insert the businesses one by one because the types don't align perfectly
    let insertedCount = 0;
    for (const business of businesses) {
      const { error } = await supabase
        .from('businesses')
        .insert(business);
        
      if (!error) {
        insertedCount++;
      } else {
        console.error("Error inserting business:", error);
      }
    }
    
    return { 
      success: true, 
      count: insertedCount,
      message: `Created ${insertedCount} dummy businesses`
    };
  } catch (error) {
    console.error("Error seeding dummy businesses:", error);
    return { 
      success: false, 
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const seedDummySubscriptionPackages = async () => {
  try {
    const businessPackages = [
      {
        id: nanoid(),
        title: 'Business Starter',
        price: 1999,
        monthly_price: 199,
        setup_fee: 0,
        duration_months: 12,
        short_description: 'Essential tools for small businesses',
        full_description: 'Get your business online with our starter package. Includes business listing, basic analytics, and customer management.',
        features: ['Business listing', 'Basic analytics', 'Customer management', 'Email support'],
        popular: false,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly',
        type: 'Business',
        dashboard_sections: ['basic_profile', 'ratings_reviews', 'customer_leads']
      },
      {
        id: nanoid(),
        title: 'Business Pro',
        price: 4999,
        monthly_price: 499,
        setup_fee: 0,
        duration_months: 12,
        short_description: 'Advanced tools for growing businesses',
        full_description: 'Take your business to the next level with enhanced visibility and marketing tools.',
        features: ['Everything in Starter', 'Featured listing placement', 'Analytics dashboard', 'Marketing tools', 'Priority support'],
        popular: true,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly',
        type: 'Business',
        dashboard_sections: ['basic_profile', 'ratings_reviews', 'customer_leads', 'marketing_campaigns', 'analytics_dashboard']
      }
    ];
    
    const influencerPackages = [
      {
        id: nanoid(),
        title: 'Influencer Basic',
        price: 999,
        monthly_price: 99,
        setup_fee: 0,
        duration_months: 12,
        short_description: 'Essential tools for new influencers',
        full_description: 'Start your influencer journey with the tools you need to grow your audience.',
        features: ['Influencer profile', 'Basic analytics', 'Collaboration tools', 'Email support'],
        popular: false,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly',
        type: 'Influencer',
        dashboard_sections: ['influencer_profile', 'basic_analytics', 'collaboration_tools']
      },
      {
        id: nanoid(),
        title: 'Influencer Pro',
        price: 2999,
        monthly_price: 299,
        setup_fee: 0,
        duration_months: 12,
        short_description: 'Advanced tools for established influencers',
        full_description: 'Take your influence to the next level with enhanced analytics and collaboration opportunities.',
        features: ['Everything in Basic', 'Advanced analytics', 'Featured profile placement', 'Priority collaborations', 'Priority support'],
        popular: true,
        payment_type: 'recurring' as PaymentType,
        billing_cycle: 'yearly',
        type: 'Influencer',
        dashboard_sections: ['influencer_profile', 'advanced_analytics', 'collaboration_tools', 'campaign_management', 'monetization_tools']
      }
    ];
    
    const packages = [...businessPackages, ...influencerPackages];
    
    // Insert each package one by one
    let insertedCount = 0;
    for (const pkg of packages) {
      const { error } = await supabase
        .from('subscription_packages')
        .upsert(pkg);
        
      if (!error) {
        insertedCount++;
      } else {
        console.error("Error inserting package:", error);
      }
    }
    
    return { 
      success: true, 
      count: insertedCount,
      message: `Created ${insertedCount} subscription packages`
    };
  } catch (error) {
    console.error("Error seeding subscription packages:", error);
    return { 
      success: false, 
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const seedDummySubscriptions = async (count = 10) => {
  try {
    // First, get users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .limit(count);
      
    if (userError) throw userError;
    if (!users || users.length === 0) {
      throw new Error("No users found to assign subscriptions");
    }
    
    // Get packages
    const { data: packages, error: pkgError } = await supabase
      .from('subscription_packages')
      .select('id, title, price, type');
      
    if (pkgError) throw pkgError;
    if (!packages || packages.length === 0) {
      throw new Error("No subscription packages found");
    }
    
    // Create subscriptions
    const subscriptions = [];
    
    for (let i = 0; i < Math.min(count, users.length); i++) {
      const user = users[i];
      let matchingPackages = packages.filter(pkg => pkg.type === user.role);
      
      // If no matching packages, use any package
      if (matchingPackages.length === 0) {
        matchingPackages = packages;
      }
      
      const pkg = matchingPackages[Math.floor(Math.random() * matchingPackages.length)];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Random start in the past 60 days
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
      
      subscriptions.push({
        id: nanoid(),
        user_id: user.id,
        package_id: pkg.id,
        package_name: pkg.title,
        amount: pkg.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: i % 5 === 0 ? 'cancelled' : 'active', // Some cancelled subscriptions
        payment_type: 'recurring' as PaymentType,
        assigned_at: startDate.toISOString(),
        assigned_by: 'admin'
      });
    }
    
    // Insert the subscriptions one by one to handle type issues
    let insertedCount = 0;
    for (const subscription of subscriptions) {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(subscription);
        
      if (!error) {
        insertedCount++;
      } else {
        console.error("Error inserting subscription:", error);
      }
    }
    
    return { 
      success: true, 
      count: insertedCount,
      message: `Created ${insertedCount} dummy subscriptions`
    };
  } catch (error) {
    console.error("Error seeding dummy subscriptions:", error);
    return { 
      success: false, 
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const seedAllDummyData = async () => {
  try {
    const userResult = await seedDummyUsers(20);
    const businessResult = await seedDummyBusinesses(15);
    const packageResult = await seedDummySubscriptionPackages();
    const subscriptionResult = await seedDummySubscriptions(15);
    
    return {
      success: userResult.success && businessResult.success && packageResult.success && subscriptionResult.success,
      users: userResult.count,
      businesses: businessResult.count,
      packages: packageResult.count,
      subscriptions: subscriptionResult.count,
      message: "Seed data operation completed"
    };
  } catch (error) {
    console.error("Error in seedAllDummyData:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
