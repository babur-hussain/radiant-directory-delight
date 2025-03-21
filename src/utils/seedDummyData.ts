import { createTestUser } from '@/features/auth/userManagement';

export const seedDummyData = async () => {
  // Seed Users
  const testUsers = [
    { email: 'test1@example.com', name: 'Test User 1', role: 'User', isAdmin: false },
    { email: 'test2@example.com', name: 'Test User 2', role: 'User', isAdmin: false },
    { email: 'admin1@example.com', name: 'Admin User 1', role: 'Admin', isAdmin: true },
  ];

  for (const user of testUsers) {
    await createTestUser(user);
  }

  // Seed Subscription Packages
  const subscriptionPackages = [
    {
      title: 'Basic Plan',
      price: 100,
      durationMonths: 12,
      shortDescription: 'Basic features',
      fullDescription: 'All basic features included',
      features: ['Feature 1', 'Feature 2'],
      type: 'Business',
      paymentType: 'recurring',
    },
    {
      title: 'Premium Plan',
      price: 200,
      durationMonths: 12,
      shortDescription: 'Premium features',
      fullDescription: 'All premium features included',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      type: 'Business',
      paymentType: 'recurring',
    },
  ];

  // Seed Subscriptions
  const subscriptions = [
    {
      userId: 'test1@example.com', // Replace with actual user ID
      packageId: 'Basic Plan', // Replace with actual package ID
      packageName: 'Basic Plan',
      amount: 100,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active',
    },
    {
      userId: 'test2@example.com', // Replace with actual user ID
      packageId: 'Premium Plan', // Replace with actual package ID
      packageName: 'Premium Plan',
      amount: 200,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active',
    },
  ];

  console.log('Dummy data seeded successfully');
};
