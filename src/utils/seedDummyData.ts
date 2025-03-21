
import { createTestUser, generateAllTypesOfUsers } from '@/features/auth/userManagement';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

// Generate random dummy users
export const seedDummyUsers = async (count = 10) => {
  try {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const role = i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Influencer' : 'User';
      const isAdmin = i === 0; // Make first user admin
      
      const user = await createTestUser({
        email: `test${role.toLowerCase()}${i}@example.com`,
        name: `Test ${role} ${i}`,
        role: role,
        isAdmin: isAdmin
      });
      
      if (user) users.push(user);
    }
    
    return {
      success: true,
      count: users.length,
      users
    };
  } catch (error) {
    console.error('Error creating dummy users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Generate random dummy businesses
export const seedDummyBusinesses = async (count = 20) => {
  try {
    const businesses = [];
    const categories = ['Restaurant', 'Retail', 'Tech', 'Healthcare', 'Entertainment'];
    
    for (let i = 0; i < count; i++) {
      const business = {
        name: `Dummy Business ${i}`,
        description: `This is a dummy business number ${i}`,
        category: categories[i % categories.length],
        address: `${100 + i} Main Street, Test City`,
        phone: `555-${1000 + i}`,
        email: `business${i}@example.com`,
        website: `https://dummybusiness${i}.com`,
        rating: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 100),
        featured: i % 5 === 0,
        tags: ['dummy', `tag${i}`, 'test'],
        hours: JSON.stringify({
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM'
        })
      };
      
      const { data, error } = await supabase.from('businesses').insert(business).select();
      
      if (error) throw error;
      if (data && data.length > 0) businesses.push(data[0]);
    }
    
    return {
      success: true,
      count: businesses.length,
      businesses
    };
  } catch (error) {
    console.error('Error creating dummy businesses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Generate subscription packages
export const seedDummySubscriptionPackages = async () => {
  try {
    const packageTemplates: ISubscriptionPackage[] = [
      {
        id: `business-basic-${nanoid(6)}`,
        title: 'Business Basic',
        price: 999,
        monthlyPrice: 99,
        durationMonths: 12,
        shortDescription: 'Essential tools for small businesses',
        fullDescription: 'Get started with the essential tools needed to grow your small business.',
        features: ['Business profile', 'Basic analytics', 'Up to 5 product listings'],
        popular: false,
        type: 'Business',
        paymentType: 'recurring',
        billingCycle: 'monthly',
        setupFee: 499
      },
      {
        id: `business-pro-${nanoid(6)}`,
        title: 'Business Pro',
        price: 2499,
        monthlyPrice: 249,
        durationMonths: 12,
        shortDescription: 'Complete solution for growing businesses',
        fullDescription: 'All the tools you need to take your business to the next level.',
        features: ['Business profile', 'Advanced analytics', 'Unlimited product listings', 'Priority support', 'Marketing tools'],
        popular: true,
        type: 'Business',
        paymentType: 'recurring',
        billingCycle: 'yearly'
      },
      {
        id: `influencer-starter-${nanoid(6)}`,
        title: 'Influencer Starter',
        price: 799,
        monthlyPrice: 79,
        durationMonths: 12,
        shortDescription: 'Perfect for new influencers',
        fullDescription: 'Start your influencer journey with all the tools you need.',
        features: ['Influencer profile', 'Basic analytics', 'Up to 3 brand connections'],
        popular: false,
        type: 'Influencer',
        paymentType: 'recurring',
        billingCycle: 'monthly'
      },
      {
        id: `influencer-elite-${nanoid(6)}`,
        title: 'Influencer Elite',
        price: 1999,
        monthlyPrice: 199,
        durationMonths: 12,
        shortDescription: 'For professional influencers',
        fullDescription: 'Take your influencer career to new heights with premium tools and connections.',
        features: ['Verified profile', 'Advanced analytics', 'Unlimited brand connections', 'Content planning tools', 'Engagement tracking'],
        popular: true,
        type: 'Influencer',
        paymentType: 'recurring',
        billingCycle: 'yearly'
      },
      {
        id: `one-time-special-${nanoid(6)}`,
        title: 'One-time Special',
        price: 4999,
        durationMonths: 12,
        shortDescription: 'One-time payment, full year access',
        fullDescription: 'Get all premium features with a single payment for a full year.',
        features: ['All Business Pro features', 'One-time payment', 'Full year access', 'No recurring charges'],
        popular: false,
        type: 'Business',
        paymentType: 'one-time'
      }
    ];
    
    const createdPackages = [];
    
    for (const pkg of packageTemplates) {
      // Convert to Supabase format
      const packageData = {
        id: pkg.id,
        title: pkg.title,
        price: pkg.price,
        monthly_price: pkg.monthlyPrice,
        setup_fee: pkg.setupFee || 0,
        duration_months: pkg.durationMonths,
        short_description: pkg.shortDescription,
        full_description: pkg.fullDescription,
        features: pkg.features,
        popular: pkg.popular,
        type: pkg.type,
        payment_type: pkg.paymentType,
        billing_cycle: pkg.billingCycle,
        dashboard_sections: []
      };
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .upsert(packageData)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) createdPackages.push(data[0]);
    }
    
    return {
      success: true,
      count: createdPackages.length,
      packages: createdPackages
    };
  } catch (error) {
    console.error('Error creating dummy subscription packages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Generate dummy subscriptions
export const seedDummySubscriptions = async (count = 10) => {
  try {
    // Get users and packages to assign
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role')
      .limit(count);
    
    if (usersError) throw usersError;
    if (!users || users.length === 0) throw new Error('No users found to assign subscriptions to');
    
    const { data: packages, error: packagesError } = await supabase
      .from('subscription_packages')
      .select('id, title, price, type, payment_type');
    
    if (packagesError) throw packagesError;
    if (!packages || packages.length === 0) throw new Error('No subscription packages found');
    
    const subscriptions = [];
    
    for (let i = 0; i < Math.min(count, users.length); i++) {
      const user = users[i];
      // Find appropriate package for user role
      const userRole = user.role || 'User';
      const matchingPackages = packages.filter(pkg => pkg.type === userRole || pkg.type === 'Business');
      
      if (matchingPackages.length === 0) continue;
      
      // Select random package
      const selectedPackage = matchingPackages[Math.floor(Math.random() * matchingPackages.length)];
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 12); // 12 months subscription
      
      const subscription = {
        id: nanoid(),
        user_id: user.id,
        package_id: selectedPackage.id,
        package_name: selectedPackage.title,
        amount: selectedPackage.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: Math.random() > 0.8 ? 'cancelled' : 'active', // 20% chance of being cancelled
        payment_type: selectedPackage.payment_type || 'recurring',
        assigned_at: startDate.toISOString(),
        assigned_by: 'system'
      };
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscription)
        .select();
      
      if (error) throw error;
      if (data && data.length > 0) subscriptions.push(data[0]);
    }
    
    return {
      success: true,
      count: subscriptions.length,
      subscriptions
    };
  } catch (error) {
    console.error('Error creating dummy subscriptions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Seed all data at once
export const seedAllDummyData = async () => {
  try {
    const userResult = await seedDummyUsers(15);
    const businessResult = await seedDummyBusinesses(20);
    const packageResult = await seedDummySubscriptionPackages();
    const subscriptionResult = await seedDummySubscriptions(25);
    
    return {
      success: true,
      users: userResult.success ? userResult.count : 0,
      businesses: businessResult.success ? businessResult.count : 0,
      packages: packageResult.success ? packageResult.count : 0,
      subscriptions: subscriptionResult.success ? subscriptionResult.count : 0
    };
  } catch (error) {
    console.error('Error seeding all data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
