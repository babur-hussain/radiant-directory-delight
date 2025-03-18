
import { connectToMongoDB } from '../config/mongodb';
import { User } from '../models/User';
import { Business } from '../models/Business';
import { Subscription } from '../models/Subscription';
import { SubscriptionPackage } from '../models/SubscriptionPackage';
import { createTestUser } from '../features/auth/userManagement';
import { UserRole } from '../types/auth';

// Default package templates for seeding if needed
const defaultBusinessPackages = [
  {
    id: "business-basic",
    title: "Basic Business",
    price: 9999,
    shortDescription: "Essential tools for small businesses",
    fullDescription: "Get started with the essential tools every small business needs to establish an online presence.",
    features: ["Business profile listing", "Basic analytics", "Email support"],
    popular: false,
    setupFee: 1999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring"
  },
  {
    id: "business-pro",
    title: "Business Pro",
    price: 19999,
    shortDescription: "Advanced tools for growing businesses",
    fullDescription: "Comprehensive tools and features for businesses looking to expand their reach and customer base.",
    features: ["Everything in Basic", "Priority business listing", "Advanced analytics", "Priority support", "Marketing toolkit"],
    popular: true,
    setupFee: 999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring"
  }
];

const defaultInfluencerPackages = [
  {
    id: "influencer-starter",
    title: "Influencer Starter",
    price: 4999,
    shortDescription: "Essential tools for new influencers",
    fullDescription: "Get started with the essential tools every influencer needs to connect with businesses.",
    features: ["Influencer profile listing", "Basic analytics", "Email support"],
    popular: false,
    setupFee: 999,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring"
  },
  {
    id: "influencer-pro",
    title: "Influencer Pro",
    price: 9999,
    shortDescription: "Advanced tools for serious influencers",
    fullDescription: "Comprehensive tools and features for influencers looking to monetize their audience and grow their brand.",
    features: ["Everything in Starter", "Priority profile listing", "Advanced analytics", "Priority support", "Brand partnership toolkit"],
    popular: true,
    setupFee: 499,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring"
  }
];

// Generate a random date within the last year
const getRandomDate = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const timeOffset = now.getTime() - oneYearAgo.getTime();
  return new Date(oneYearAgo.getTime() + Math.random() * timeOffset);
};

// Generate a random price between min and max
const getRandomPrice = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate random boolean with weight towards true or false
const getRandomBoolean = (trueWeight = 0.5) => {
  return Math.random() < trueWeight;
};

// Generate a random business name
const getRandomBusinessName = () => {
  const prefixes = ['Royal', 'Golden', 'Prime', 'Elite', 'Superior', 'Classic', 'Modern', 'Advanced', 'Digital'];
  const businesses = ['Solutions', 'Enterprise', 'Services', 'Associates', 'Consultants', 'Systems', 'Group', 'Industries', 'Technologies'];
  
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${businesses[Math.floor(Math.random() * businesses.length)]}`;
};

// Generate a random user name
const getRandomUserName = () => {
  const firstNames = ['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Olivia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate a random email based on name
const getRandomEmail = (name: string) => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
  const nameParts = name.toLowerCase().replace(/\s+/g, '.');
  
  return `${nameParts}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

// Seed dummy users
export const seedDummyUsers = async (count = 10): Promise<{ success: boolean; count: number }> => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    const roles: UserRole[] = ['Business', 'Influencer', 'Admin', 'staff'];
    let createdCount = 0;
    
    for (let i = 0; i < count; i++) {
      const name = getRandomUserName();
      const email = getRandomEmail(name);
      const role = roles[Math.floor(Math.random() * roles.length)];
      const isAdmin = role === 'Admin';
      
      try {
        await createTestUser({
          email,
          name,
          role,
          isAdmin
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating test user ${email}:`, error);
      }
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding dummy users:", error);
    return { success: false, count: 0 };
  }
};

// Seed dummy businesses
export const seedDummyBusinesses = async (count = 10): Promise<{ success: boolean; count: number }> => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    const categories = ['Restaurant', 'Retail', 'Technology', 'Healthcare', 'Education', 'Finance', 'Real Estate'];
    let createdCount = 0;
    
    for (let i = 0; i < count; i++) {
      const businessName = getRandomBusinessName();
      
      try {
        await Business.create({
          id: Date.now() + i,
          name: businessName,
          description: `${businessName} provides high-quality services to customers worldwide.`,
          category: categories[Math.floor(Math.random() * categories.length)],
          address: `${Math.floor(Math.random() * 999) + 1} Main St, City, State`,
          phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: getRandomEmail(businessName),
          website: `https://www.${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 100),
          latitude: (Math.random() * 180) - 90,
          longitude: (Math.random() * 360) - 180,
          hours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM'
          },
          tags: ['Professional', 'Reliable', 'Experienced'],
          featured: getRandomBoolean(0.3),
          image: ''
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating business ${businessName}:`, error);
      }
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding dummy businesses:", error);
    return { success: false, count: 0 };
  }
};

// Seed dummy subscription packages
export const seedDummySubscriptionPackages = async (): Promise<{ success: boolean; count: number }> => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Check if packages already exist
    const existingCount = await SubscriptionPackage.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing packages, skipping seed`);
      return { success: true, count: existingCount };
    }
    
    // Combine business and influencer packages
    const allPackages = [...defaultBusinessPackages, ...defaultInfluencerPackages];
    let createdCount = 0;
    
    // Add each package to MongoDB
    for (const pkg of allPackages) {
      try {
        await SubscriptionPackage.create({
          ...pkg,
          features: pkg.features || []
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating package ${pkg.title}:`, error);
      }
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding dummy subscription packages:", error);
    return { success: false, count: 0 };
  }
};

// Seed dummy subscriptions
export const seedDummySubscriptions = async (count = 10): Promise<{ success: boolean; count: number }> => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get some users and packages to associate
    const users = await User.find().lean();
    const packages = await SubscriptionPackage.find().lean();
    
    if (users.length === 0 || packages.length === 0) {
      throw new Error("Need users and packages to create subscriptions");
    }
    
    const statuses = ['active', 'trial', 'expired', 'cancelled'];
    let createdCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const userRole = randomUser.role;
        
        // Filter packages by user role
        const rolePackages = packages.filter(pkg => 
          (userRole === 'Business' && pkg.type === 'Business') || 
          (userRole === 'Influencer' && pkg.type === 'Influencer')
        );
        
        // Skip if no matching packages
        if (rolePackages.length === 0) continue;
        
        const randomPackage = rolePackages[Math.floor(Math.random() * rolePackages.length)];
        const startDate = getRandomDate();
        
        // Calculate end date based on duration
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (randomPackage.durationMonths || 12));
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        await Subscription.create({
          id: `sub_${Date.now()}_${i}`,
          userId: randomUser.uid,
          packageId: randomPackage.id,
          status,
          startDate,
          endDate,
          price: randomPackage.price,
          paymentMethod: 'credit_card',
          paymentStatus: status === 'active' ? 'paid' : 'pending',
          metadata: {
            razorpayOrderId: `order_${Date.now()}_${i}`,
            razorpayPaymentId: `pay_${Date.now()}_${i}`,
            paymentType: randomPackage.paymentType
          }
        });
        
        createdCount++;
      } catch (error) {
        console.error(`Error creating subscription:`, error);
      }
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding dummy subscriptions:", error);
    return { success: false, count: 0 };
  }
};

// Seed all data types
export const seedAllDummyData = async (): Promise<{ 
  success: boolean; 
  users: number; 
  businesses: number; 
  packages: number; 
  subscriptions: number 
}> => {
  try {
    const usersResult = await seedDummyUsers(15);
    const businessesResult = await seedDummyBusinesses(20);
    const packagesResult = await seedDummySubscriptionPackages();
    const subscriptionsResult = await seedDummySubscriptions(25);
    
    return {
      success: true,
      users: usersResult.count,
      businesses: businessesResult.count,
      packages: packagesResult.count,
      subscriptions: subscriptionsResult.count
    };
  } catch (error) {
    console.error("Error seeding all dummy data:", error);
    return {
      success: false,
      users: 0,
      businesses: 0,
      packages: 0,
      subscriptions: 0
    };
  }
};
