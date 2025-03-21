
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { IBusiness } from '@/models/Business';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { ISubscription, PaymentType, BillingCycle } from '@/models/Subscription';

// Seed dummy users
export const seedDummyUsers = async (count: number = 5): Promise<User[]> => {
  const users: User[] = [];
  
  const roles = ['User', 'Business', 'Influencer', 'Admin'];
  
  for (let i = 0; i < count; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const isAdmin = role === 'Admin';
    
    const userData = {
      id: nanoid(),
      email: `test-user-${i}@example.com`,
      name: `Test User ${i}`,
      role: role,
      is_admin: isAdmin,
      employee_code: `EMP${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      
      const user: User = {
        uid: data.id,
        email: data.email,
        displayName: data.name,
        name: data.name,
        role: data.role,
        isAdmin: data.is_admin,
        photoURL: data.photo_url,
        createdAt: data.created_at,
        lastLogin: data.last_login,
        employeeCode: data.employee_code,
        phone: data.phone,
        instagramHandle: data.instagram_handle,
        facebookHandle: data.facebook_handle,
        verified: data.verified,
        city: data.city,
        country: data.country,
        niche: data.niche,
        followersCount: data.followers_count,
        bio: data.bio,
        businessName: data.business_name,
        ownerName: data.owner_name,
        businessCategory: data.business_category,
        website: data.website,
        gstNumber: data.gst_number
      };
      
      users.push(user);
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  }
  
  return users;
};

// Seed dummy businesses
export const seedDummyBusinesses = async (count: number = 5): Promise<IBusiness[]> => {
  const businesses: IBusiness[] = [];
  
  const categories = ['Restaurant', 'Retail', 'Technology', 'Healthcare', 'Education'];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const businessData = {
      name: `Test Business ${i}`,
      description: `Description for test business ${i}`,
      category: category,
      address: `123 Test St, City ${i}, Country`,
      phone: `+1234567890${i}`,
      email: `business${i}@example.com`,
      website: `https://business${i}.example.com`,
      image: '',
      hours: JSON.stringify({
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' }
      }),
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 100),
      featured: Math.random() > 0.7,
      tags: ['test', category.toLowerCase(), 'dummy'],
      latitude: Math.random() * 180 - 90,
      longitude: Math.random() * 360 - 180
    };
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();
      
      if (error) throw error;
      
      const business: IBusiness = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        image: data.image,
        hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours,
        rating: data.rating,
        reviews: data.reviews,
        featured: data.featured,
        tags: data.tags,
        latitude: data.latitude,
        longitude: data.longitude
      };
      
      businesses.push(business);
    } catch (error) {
      console.error('Error creating test business:', error);
    }
  }
  
  return businesses;
};

// Seed dummy subscription packages
export const seedDummySubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  const packages: ISubscriptionPackage[] = [];
  
  const businessPackages = [
    {
      id: nanoid(),
      title: 'Basic Business',
      price: 999,
      monthlyPrice: 999,
      setupFee: 0,
      durationMonths: 1,
      shortDescription: 'Essentials for small businesses',
      fullDescription: 'A basic package for small businesses to get started with digital marketing.',
      features: ['Basic analytics', 'Social media setup', 'Monthly report'],
      popular: false,
      type: 'Business',
      termsAndConditions: 'Standard terms apply',
      paymentType: 'recurring',
      billingCycle: 'monthly',
      advancePaymentMonths: 0,
      dashboardSections: ['analytics', 'performance']
    },
    {
      id: nanoid(),
      title: 'Pro Business',
      price: 2499,
      monthlyPrice: 2499,
      setupFee: 0,
      durationMonths: 1,
      shortDescription: 'Complete solution for growing businesses',
      fullDescription: 'A comprehensive package for businesses looking to expand their digital presence.',
      features: ['Advanced analytics', 'Social media management', 'SEO optimization', 'Weekly reports', '24/7 support'],
      popular: true,
      type: 'Business',
      termsAndConditions: 'Standard terms apply',
      paymentType: 'recurring',
      billingCycle: 'monthly',
      advancePaymentMonths: 0,
      dashboardSections: ['analytics', 'performance', 'marketing', 'customers']
    }
  ];
  
  const influencerPackages = [
    {
      id: nanoid(),
      title: 'Basic Influencer',
      price: 799,
      monthlyPrice: 799,
      setupFee: 0,
      durationMonths: 1,
      shortDescription: 'Essentials for emerging influencers',
      fullDescription: 'Start your influencer journey with essential tools and features.',
      features: ['Profile optimization', 'Basic analytics', 'Campaign access'],
      popular: false,
      type: 'Influencer',
      termsAndConditions: 'Standard terms apply',
      paymentType: 'recurring',
      billingCycle: 'monthly',
      advancePaymentMonths: 0,
      dashboardSections: ['profile', 'campaigns']
    },
    {
      id: nanoid(),
      title: 'Pro Influencer',
      price: 1999,
      monthlyPrice: 1999,
      setupFee: 0,
      durationMonths: 1,
      shortDescription: 'Complete package for professional influencers',
      fullDescription: 'Take your influence to the next level with our professional tools and features.',
      features: ['Advanced analytics', 'Priority campaign access', 'Brand collaboration tools', 'Audience insights', 'Monetization strategies'],
      popular: true,
      type: 'Influencer',
      termsAndConditions: 'Standard terms apply',
      paymentType: 'recurring',
      billingCycle: 'monthly',
      advancePaymentMonths: 0,
      dashboardSections: ['profile', 'campaigns', 'analytics', 'earnings']
    }
  ];
  
  const allPackages = [...businessPackages, ...influencerPackages];
  
  for (const pkg of allPackages) {
    try {
      const formattedPackage = {
        id: pkg.id,
        title: pkg.title,
        price: pkg.price,
        monthly_price: pkg.monthlyPrice,
        setup_fee: pkg.setupFee,
        duration_months: pkg.durationMonths,
        short_description: pkg.shortDescription,
        full_description: pkg.fullDescription,
        features: pkg.features,
        popular: pkg.popular,
        type: pkg.type,
        terms_and_conditions: pkg.termsAndConditions,
        payment_type: pkg.paymentType,
        billing_cycle: pkg.billingCycle,
        advance_payment_months: pkg.advancePaymentMonths,
        dashboard_sections: pkg.dashboardSections
      };
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert(formattedPackage)
        .select()
        .single();
      
      if (error) throw error;
      
      const savedPackage: ISubscriptionPackage = {
        id: data.id,
        title: data.title,
        price: data.price,
        monthlyPrice: data.monthly_price,
        setupFee: data.setup_fee,
        durationMonths: data.duration_months,
        shortDescription: data.short_description,
        fullDescription: data.full_description,
        features: data.features,
        popular: data.popular,
        type: data.type,
        termsAndConditions: data.terms_and_conditions,
        paymentType: data.payment_type,
        billingCycle: data.billing_cycle,
        advancePaymentMonths: data.advance_payment_months,
        dashboardSections: data.dashboard_sections
      };
      
      packages.push(savedPackage);
    } catch (error) {
      console.error('Error creating subscription package:', error);
    }
  }
  
  return packages;
};

// Seed dummy subscriptions
export const seedDummySubscriptions = async (count: number = 3): Promise<ISubscription[]> => {
  const subscriptions: ISubscription[] = [];
  
  // First, get some users and packages
  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .limit(count);
  
  const { data: packages } = await supabase
    .from('subscription_packages')
    .select('id, title, price, billing_cycle')
    .limit(count);
  
  if (!users || !packages || users.length === 0 || packages.length === 0) {
    throw new Error('No users or packages available. Please seed users and packages first.');
  }
  
  for (let i = 0; i < Math.min(count, users.length, packages.length); i++) {
    const user = users[i];
    const pkg = packages[i];
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 1);
    
    const subscriptionData = {
      id: nanoid(),
      user_id: user.id,
      package_id: pkg.id,
      package_name: pkg.title,
      amount: pkg.price,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      payment_type: 'recurring' as PaymentType,
      billing_cycle: pkg.billing_cycle || 'monthly' as BillingCycle,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();
      
      if (error) throw error;
      
      const subscription: ISubscription = {
        id: data.id,
        userId: data.user_id,
        packageId: data.package_id,
        packageName: data.package_name,
        amount: data.amount,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        paymentType: data.payment_type,
        billingCycle: data.billing_cycle,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      subscriptions.push(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  }
  
  return subscriptions;
};

// Seed all dummy data
export const seedAllDummyData = async () => {
  // Seed users first
  const users = await seedDummyUsers(5);
  
  // Seed businesses
  const businesses = await seedDummyBusinesses(3);
  
  // Seed subscription packages
  const packages = await seedDummySubscriptionPackages();
  
  // Seed subscriptions last (depends on users and packages)
  const subscriptions = await seedDummySubscriptions(3);
  
  return {
    users,
    businesses,
    packages,
    subscriptions
  };
};

// Helper function to seed a specific number of each
export const seedDummyData = async (
  userCount: number = 5,
  businessCount: number = 3,
  subscriptionCount: number = 3
) => {
  const users = await seedDummyUsers(userCount);
  const businesses = await seedDummyBusinesses(businessCount);
  const packages = await seedDummySubscriptionPackages();
  const subscriptions = await seedDummySubscriptions(subscriptionCount);
  
  return {
    users,
    businesses,
    packages,
    subscriptions
  };
};
