
import { supabase } from '@/integrations/supabase/client';
import { PaymentType, BillingCycle, SubscriptionStatus } from '@/models/Subscription';
import { UserRole } from '@/types/auth';

// Enhanced seed data function with subscription-based packages and table creation
export const seedDatabase = async (): Promise<boolean> => {
  try {
    console.log("Setting up comprehensive database with subscription-based packages...");
    
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
    
    // Note: The subscriptions table should be created via Supabase dashboard
    // or through a migration script. For now, we'll handle the 404 error gracefully
    console.log("Note: Ensure 'subscriptions' table exists in Supabase with proper schema");
    
    // Business Packages - Subscription-based
    const businessPackages = [
      {
        id: crypto.randomUUID(),
        title: "Business Starter",
        price: 999,
        monthlyPrice: 99,
        short_description: "Perfect for small businesses getting started",
        full_description: "Essential features for small businesses to establish their online presence and connect with local customers.",
        features: JSON.stringify([
          "Business Profile Listing",
          "Contact Information Display",
          "Basic Analytics Dashboard",
          "Email Support",
          "Social Media Integration"
        ]),
        popular: false,
        setup_fee: 0,
        duration_months: 12,
        type: "Business" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "monthly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "contacts"]
      },
      {
        id: crypto.randomUUID(),
        title: "Business Growth",
        price: 4999,
        monthlyPrice: 499,
        short_description: "Advanced features for growing businesses",
        full_description: "Comprehensive package for businesses looking to expand their reach and increase customer engagement.",
        features: JSON.stringify([
          "Premium Business Listing",
          "Priority Search Results",
          "Advanced Analytics Dashboard",
          "Customer Review Management",
          "Social Media Integration",
          "Email Marketing Tools",
          "Phone Support",
          "Custom Branding"
        ]),
        popular: true,
        setup_fee: 500,
        duration_months: 12,
        type: "Business" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "yearly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "contacts", "reviews", "marketing"]
      },
      {
        id: crypto.randomUUID(),
        title: "Business Enterprise",
        price: 9999,
        monthlyPrice: 999,
        short_description: "Complete solution for large businesses",
        full_description: "Enterprise-grade features for large businesses requiring maximum visibility and advanced tools.",
        features: JSON.stringify([
          "Featured Business Listing",
          "Top Search Results",
          "Advanced Analytics & Reports",
          "Dedicated Account Manager",
          "Priority Support (24/7)",
          "Custom Integration APIs",
          "Multi-location Management",
          "Advanced Marketing Tools",
          "White-label Solutions"
        ]),
        popular: false,
        setup_fee: 1000,
        duration_months: 12,
        type: "Business" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "yearly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "contacts", "reviews", "marketing", "enterprise"]
      },
      {
        id: crypto.randomUUID(),
        title: "Business One-Time",
        price: 1999,
        short_description: "Lifetime access for one-time payment",
        full_description: "Pay once and get lifetime access to essential business features.",
        features: JSON.stringify([
          "Lifetime Business Listing",
          "Basic Analytics",
          "Contact Management",
          "Email Support",
          "No Recurring Fees"
        ]),
        popular: false,
        setup_fee: 0,
        duration_months: 0, // Lifetime
        type: "Business" as const,
        payment_type: "one-time" as PaymentType,
        billing_cycle: null,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "contacts"]
      }
    ];

    // Influencer Packages - Subscription-based
    const influencerPackages = [
      {
        id: crypto.randomUUID(),
        title: "Influencer Starter",
        price: 499,
        monthlyPrice: 49,
        short_description: "Begin your influencer journey",
        full_description: "Essential tools for new influencers to start building their brand and connecting with businesses.",
        features: JSON.stringify([
          "Influencer Profile Creation",
          "Basic Analytics Dashboard",
          "Brand Collaboration Requests",
          "Content Management Tools",
          "Email Support",
          "Social Media Integration"
        ]),
        popular: false,
        setup_fee: 0,
        duration_months: 12,
        type: "Influencer" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "monthly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "collaborations"]
      },
      {
        id: crypto.randomUUID(),
        title: "Influencer Pro",
        price: 1999,
        monthlyPrice: 199,
        short_description: "Advanced tools for growing influencers",
        full_description: "Comprehensive package for established influencers looking to expand their reach and increase earnings.",
        features: JSON.stringify([
          "Premium Influencer Profile",
          "Advanced Analytics & Insights",
          "Priority Brand Matching",
          "Content Creation Tools",
          "Revenue Tracking",
          "Direct Brand Communication",
          "Phone Support",
          "Custom Branding",
          "Performance Reports"
        ]),
        popular: true,
        setup_fee: 200,
        duration_months: 12,
        type: "Influencer" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "yearly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "collaborations", "earnings", "content"]
      },
      {
        id: crypto.randomUUID(),
        title: "Influencer Elite",
        price: 3999,
        monthlyPrice: 399,
        short_description: "Elite features for top influencers",
        full_description: "Premium package for high-performing influencers requiring maximum visibility and advanced collaboration tools.",
        features: JSON.stringify([
          "Featured Influencer Profile",
          "Top Search Results",
          "Advanced Analytics & AI Insights",
          "Dedicated Success Manager",
          "Priority Support (24/7)",
          "Exclusive Brand Partnerships",
          "Advanced Content Tools",
          "Revenue Optimization",
          "White-label Solutions",
          "Custom Integration APIs"
        ]),
        popular: false,
        setup_fee: 500,
        duration_months: 12,
        type: "Influencer" as const,
        payment_type: "recurring" as PaymentType,
        billing_cycle: "yearly" as BillingCycle,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "collaborations", "earnings", "content", "elite"]
      },
      {
        id: crypto.randomUUID(),
        title: "Influencer Lifetime",
        price: 2999,
        short_description: "Lifetime access for influencers",
        full_description: "Pay once and get lifetime access to all influencer features with no recurring fees.",
        features: JSON.stringify([
          "Lifetime Influencer Profile",
          "All Basic & Pro Features",
          "Lifetime Analytics Access",
          "Brand Collaboration Tools",
          "Content Management",
          "Email Support",
          "No Recurring Fees"
        ]),
        popular: false,
        setup_fee: 0,
        duration_months: 0, // Lifetime
        type: "Influencer" as const,
        payment_type: "one-time" as PaymentType,
        billing_cycle: null,
        advance_payment_months: 0,
        dashboard_sections: ["analytics", "profile", "collaborations", "earnings", "content"]
      }
    ];

    // Insert all packages
    const allPackages = [...businessPackages, ...influencerPackages];
    
    for (const pkg of allPackages) {
      const { error: packageError } = await supabase
        .from('subscription_packages')
        .upsert(pkg);
        
      if (packageError) {
        console.error("Error creating package:", pkg.title, packageError);
        return false;
      }
    }
    
    console.log(`✅ Successfully created ${allPackages.length} subscription packages`);
    console.log(`📊 Business packages: ${businessPackages.length}`);
    console.log(`📊 Influencer packages: ${influencerPackages.length}`);
    
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
};

export default seedDatabase;
