import { supabase } from '@/integrations/supabase/client';
import { PaymentType, BillingCycle, SubscriptionStatus } from '@/models/Subscription';
import { UserRole } from '@/types/auth';

const generateRandomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const seedDatabase = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const nineMonthsLater = new Date();
  nineMonthsLater.setMonth(nineMonthsLater.getMonth() + 9);

  try {
    // Clear existing data
    await supabase.from('users').delete().neq('id', 'null');
    await supabase.from('businesses').delete().neq('id', 'null');
    await supabase.from('subscription_packages').delete().neq('id', 'null');
    await supabase.from('user_subscriptions').delete().neq('id', 'null');

    console.log("✅ Existing data cleared");
  } catch (clearError) {
    console.error("❌ Error clearing existing data:", clearError);
    return false;
  }
  
  // Seed users with proper types
  const users = [
    {
      id: "user1",
      email: "admin@example.com",
      name: "Admin User",
      role: "Admin" as UserRole,
      is_admin: true,
      created_at: new Date().toISOString(),
      phone: "123-456-7890",
      city: "New York",
      country: "USA",
      verified: true
    },
    {
      id: "user2",
      email: "business@example.com",
      name: "Business User",
      role: "Business" as UserRole,
      is_admin: false,
      created_at: new Date().toISOString(),
      phone: "987-654-3210",
      city: "Los Angeles",
      country: "USA",
      verified: true,
      business_name: "Acme Corp",
      owner_name: "John Doe",
      business_category: "Technology"
    },
    {
      id: "user3",
      email: "influencer@example.com",
      name: "Influencer User",
      role: "Influencer" as UserRole,
      is_admin: false,
      created_at: new Date().toISOString(),
      phone: "555-123-4567",
      city: "Miami",
      country: "USA",
      verified: true,
      instagram_handle: "@influencer",
      followers_count: 10000
    },
    {
      id: "user4",
      email: "staff@example.com",
      name: "Staff User",
      role: "staff" as UserRole,
      is_admin: false,
      created_at: new Date().toISOString(),
      phone: "111-222-3333",
      city: "Chicago",
      country: "USA",
      verified: false,
      employee_code: "EMP123"
    }
  ];

  // Seed businesses
  const businesses = [
    {
      id: "business1",
      name: "Tech Solutions Inc.",
      owner_id: "user2",
      category: "Technology",
      created_at: new Date().toISOString(),
      city: "San Francisco",
      country: "USA"
    },
    {
      id: "business2",
      name: "Global Marketing Ltd.",
      owner_id: "user2",
      category: "Marketing",
      created_at: new Date().toISOString(),
      city: "London",
      country: "UK"
    }
  ];

  // Seed subscription packages with proper types
  const subscriptionPackages = [
    {
      id: "business-basic",
      title: "Business Basic",
      price: 999,
      short_description: "Essential tools for small businesses",
      full_description: "Our basic package includes all the essential tools...",
      features: ["Google Business Profile", "Basic SEO", "1 Creative per month"],
      popular: false,
      setup_fee: 499,
      duration_months: 12,
      type: "Business" as const,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      dashboard_sections: ["reels", "creatives", "seo"]
    },
    {
      id: "business-pro",
      title: "Business Pro",
      price: 2499,
      short_description: "Advanced tools for growing businesses",
      full_description: "Our pro package includes advanced tools...",
      features: ["Google Business Profile", "Advanced SEO", "5 Creatives per month", "Priority Support"],
      popular: true,
      setup_fee: 0,
      duration_months: 12,
      type: "Business" as const,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      dashboard_sections: ["reels", "creatives", "seo", "ads"]
    },
    {
      id: "influencer-basic",
      title: "Influencer Basic",
      price: 499,
      short_description: "Basic tools for influencers",
      full_description: "Our basic influencer package...",
      features: ["Profile Optimization", "Basic Analytics", "Content Scheduling"],
      popular: false,
      setup_fee: 0,
      duration_months: 12,
      type: "Influencer" as const,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      dashboard_sections: ["reels", "analytics"]
    },
    {
      id: "influencer-pro",
      title: "Influencer Pro",
      price: 1499,
      short_description: "Advanced tools for influencers",
      full_description: "Our pro influencer package...",
      features: ["Profile Optimization", "Advanced Analytics", "Content Scheduling", "Campaign Management"],
      popular: true,
      setup_fee: 0,
      duration_months: 12,
      type: "Influencer" as const,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      dashboard_sections: ["reels", "analytics", "campaigns"]
    }
  ];

  // Seed user subscriptions with proper types
  const userSubscriptions = [
    {
      id: "sub_1",
      user_id: "user2",
      package_id: "business-pro",
      package_name: "Business Pro",
      status: "active" as SubscriptionStatus,
      start_date: threeMonthsAgo.toISOString(),
      end_date: nineMonthsLater.toISOString(),
      amount: 2499,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      signup_fee: 0,
      created_at: threeMonthsAgo.toISOString(),
      is_pausable: true,
      is_user_cancellable: true
    },
    {
      id: "sub_2",
      user_id: "user3",
      package_id: "influencer-pro",
      package_name: "Influencer Pro",
      status: "active" as SubscriptionStatus,
      start_date: threeMonthsAgo.toISOString(),
      end_date: nineMonthsLater.toISOString(),
      amount: 1499,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      signup_fee: 0,
      created_at: threeMonthsAgo.toISOString(),
      is_pausable: true,
      is_user_cancellable: true
    }
  ];

  try {
    // Insert users one by one with proper type conversion
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_admin: user.is_admin,
          created_at: user.created_at,
          phone: user.phone,
          city: user.city,
          country: user.country,
          verified: user.verified,
          instagram_handle: user.instagram_handle || null,
          followers_count: user.followers_count ? String(user.followers_count) : null,
          business_name: user.business_name || null,
          owner_name: user.owner_name || null,
          business_category: user.business_category || null
        });
      
      if (error) {
        console.error("Error inserting user:", error);
      }
    }

    // Insert businesses
    const { error: businessError } = await supabase
      .from('businesses')
      .upsert(businesses);

    if (businessError) {
      console.error("Error inserting businesses:", businessError);
    }

    // Insert subscription packages
    const { error: packageError } = await supabase
      .from('subscription_packages')
      .upsert(subscriptionPackages);

    if (packageError) {
      console.error("Error inserting subscription packages:", packageError);
    }

    // Insert user subscriptions
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert(userSubscriptions);

    if (subscriptionError) {
      console.error("Error inserting user subscriptions:", subscriptionError);
    }

    console.log("✅ Dummy data seeded successfully");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
};
