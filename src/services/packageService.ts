
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { PaymentType, BillingCycle } from '@/models/Subscription';
import { toast } from '@/hooks/use-toast';

// Helper function to ensure payment type is valid
const getPaymentType = (type: string | null): PaymentType => {
  return (type?.toLowerCase() === 'one-time') ? 'one-time' : 'recurring';
};

// Helper function to ensure billing cycle is valid
const getBillingCycle = (cycle: string | null): BillingCycle | undefined => {
  if (cycle?.toLowerCase() === 'monthly') return 'monthly';
  if (cycle?.toLowerCase() === 'yearly') return 'yearly';
  return undefined;
};

// Map a Supabase row to an ISubscriptionPackage object
const mapToPackage = (pkg: any): ISubscriptionPackage => {
  return {
    id: pkg.id,
    title: pkg.title || '',
    price: pkg.price || 0,
    monthlyPrice: pkg.monthly_price,
    setupFee: pkg.setup_fee || 0,
    durationMonths: pkg.duration_months || 12,
    shortDescription: pkg.short_description || '',
    fullDescription: pkg.full_description || '',
    features: Array.isArray(pkg.features) ? pkg.features : [],
    popular: pkg.popular || false,
    type: pkg.type as "Business" | "Influencer" || 'Business',
    termsAndConditions: pkg.terms_and_conditions || '',
    paymentType: getPaymentType(pkg.payment_type),
    billingCycle: getBillingCycle(pkg.billing_cycle),
    advancePaymentMonths: pkg.advance_payment_months || 0,
    dashboardSections: pkg.dashboard_sections || [],
    isActive: true
  };
};

// Map an ISubscriptionPackage to a Supabase row
const mapToSupabasePackage = (pkg: ISubscriptionPackage) => {
  // Generate an ID if one doesn't exist
  const packageId = pkg.id || `pkg_${Date.now()}`;
  
  // Process features to ensure it's always an array
  let features: string[] = [];
  if (Array.isArray(pkg.features)) {
    features = pkg.features.filter(f => f.trim().length > 0);
  } else if (typeof pkg.features === 'string') {
    // Cast features to string before using split
    features = (pkg.features as string).split('\n').filter(f => f.trim().length > 0);
  }
  
  // Handle one-time packages appropriately
  const isOneTime = pkg.paymentType === 'one-time';
  
  // Create the Supabase object with all fields properly mapped
  return {
    id: packageId,
    title: pkg.title,
    price: pkg.price,
    monthly_price: isOneTime ? null : (pkg.monthlyPrice || null),
    duration_months: pkg.durationMonths || 12,
    short_description: pkg.shortDescription || '',
    full_description: pkg.fullDescription || '',
    features: features,
    popular: pkg.popular || false,
    setup_fee: isOneTime ? 0 : (pkg.setupFee || 0),
    type: pkg.type || 'Business',
    payment_type: isOneTime ? 'one-time' : 'recurring',
    billing_cycle: isOneTime ? null : (pkg.billingCycle || 'yearly'),
    dashboard_sections: Array.isArray(pkg.dashboardSections) ? pkg.dashboardSections : [],
    terms_and_conditions: pkg.termsAndConditions || '',
    advance_payment_months: isOneTime ? 0 : (pkg.advancePaymentMonths || 0)
  };
};

// Get all subscription packages
const getAllPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching subscription packages:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No subscription packages found in database');
      return [];
    }
    
    return data.map(mapToPackage);
  } catch (error) {
    console.error('Error in getAllPackages:', error);
    throw new Error(`Failed to fetch packages: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Get packages by type
const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type)
      .order('price', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${type} packages:`, error);
      throw error;
    }
    
    return data.map(mapToPackage);
  } catch (error) {
    console.error(`Error in getPackagesByType:`, error);
    throw new Error(`Failed to fetch ${type} packages: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Get package by ID
const getPackageById = async (id: string): Promise<ISubscriptionPackage | null> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching package by ID ${id}:`, error);
      throw error;
    }
    
    if (!data) return null;
    
    return mapToPackage(data);
  } catch (error) {
    console.error(`Error in getPackageById:`, error);
    throw new Error(`Failed to fetch package ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Save package function - completely rewritten for reliability
const savePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  try {
    console.log("savePackage called with:", JSON.stringify(packageData, null, 2));
    
    // Validate required fields
    if (!packageData.title) {
      throw new Error('Package title is required');
    }
    
    if (packageData.price === undefined || packageData.price === null) {
      throw new Error('Package price is required');
    }
    
    // Ensure package has an ID
    if (!packageData.id) {
      packageData.id = `pkg_${Date.now()}`;
      console.log("Generated new ID for package:", packageData.id);
    }
    
    // Prepare data for Supabase
    const supabaseData = mapToSupabasePackage(packageData);
    console.log("Transformed data for Supabase:", JSON.stringify(supabaseData, null, 2));
    
    // Try first to check if the package already exists
    const { data: existingPackage, error: checkError } = await supabase
      .from('subscription_packages')
      .select('id')
      .eq('id', supabaseData.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking if package exists:", checkError);
      throw new Error(`Error checking if package exists: ${checkError.message}`);
    }
    
    let result;
    
    if (existingPackage) {
      // Package exists, update it
      console.log(`Package with ID ${supabaseData.id} exists, updating...`);
      
      const { data: updatedData, error: updateError } = await supabase
        .from('subscription_packages')
        .update(supabaseData)
        .eq('id', supabaseData.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error("Error updating package:", updateError);
        throw new Error(`Error updating package: ${updateError.message}`);
      }
      
      result = updatedData;
      console.log("Package updated successfully:", result);
    } else {
      // Package doesn't exist, insert it
      console.log(`Package with ID ${supabaseData.id} doesn't exist, inserting...`);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('subscription_packages')
        .insert([supabaseData]) // Make sure it's an array
        .select('*')
        .single();
      
      if (insertError) {
        console.error("Error inserting package:", insertError);
        throw new Error(`Error inserting package: ${insertError.message}`);
      }
      
      result = insertedData;
      console.log("Package inserted successfully:", result);
    }
    
    if (!result) {
      throw new Error("No data returned after saving package");
    }
    
    // Map back to our model
    const savedPackage = mapToPackage(result);
    
    return savedPackage;
  } catch (error) {
    console.error("Error in savePackage:", error);
    throw error;
  }
};

// Delete package
const deletePackage = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting package with ID ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error in deletePackage:`, error);
    throw new Error(`Failed to delete package: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export { 
  getAllPackages, 
  getPackagesByType, 
  getPackageById, 
  savePackage, 
  deletePackage 
};
