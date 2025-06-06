
import { supabase } from '@/integrations/supabase/client';
import { PaymentType, BillingCycle, SubscriptionStatus } from '@/models/Subscription';
import { UserRole } from '@/types/auth';

// Seedatabase function that initializes minimal required data
export const seedDatabase = async (): Promise<boolean> => {
  try {
    console.log("Setting up minimal required database tables and data...");
    
    // Create minimal user
    const adminUser = {
      id: crypto.randomUUID(),
      email: "admin@example.com",
      name: "Admin User",
      role: "Admin" as UserRole,
      is_admin: true,
      created_at: new Date().toISOString(),
      phone: null,
      city: null,
      country: null,
      verified: true
    };
    
    const { error: userError } = await supabase
      .from('users')
      .upsert(adminUser);
      
    if (userError) {
      console.error("Error creating admin user:", userError);
      return false;
    }
    
    // Setup minimal subscription package
    const features = ["Premium Business Listing", "Priority Support", "5 Location Listings", "Featured in Search Results"];
    const dashboardSections = ["analytics", "content", "reports"];
    
    const basicPackage = {
      id: crypto.randomUUID(),
      title: "Basic Package",
      price: 999,
      short_description: "Essential features for businesses",
      full_description: "This package includes all essential features needed to get started.",
      features: JSON.stringify(features),
      popular: true,
      setup_fee: 0,
      duration_months: 12,
      type: "Business" as const,
      payment_type: "recurring" as PaymentType,
      billing_cycle: "yearly" as BillingCycle,
      dashboard_sections: dashboardSections
    };
    
    const { error: packageError } = await supabase
      .from('subscription_packages')
      .upsert(basicPackage);
      
    if (packageError) {
      console.error("Error creating subscription package:", packageError);
      return false;
    }
    
    console.log("Database initialized with minimal required data");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

export default seedDatabase;
