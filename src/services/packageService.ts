
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { PaymentType, BillingCycle } from '@/models/Subscription';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all subscription packages
 */
const getAllPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    console.log("Fetching all packages from Supabase");
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching packages:', error);
      throw new Error(`Failed to fetch packages: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('No subscription packages found in database');
      return [];
    }
    
    const mappedPackages = data.map(mapDbRowToPackage);
    console.log(`Successfully fetched ${mappedPackages.length} packages:`, mappedPackages);
    return mappedPackages;
  } catch (error) {
    console.error('Error in getAllPackages:', error);
    throw error;
  }
};

/**
 * Get packages by type (Business or Influencer)
 */
const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    console.log(`Fetching packages of type '${type}' from Supabase`);
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type)
      .order('price', { ascending: true });
    
    if (error) {
      console.error(`Supabase error fetching ${type} packages:`, error);
      throw new Error(`Failed to fetch ${type} packages: ${error.message}`);
    }
    
    const mappedPackages = data ? data.map(mapDbRowToPackage) : [];
    console.log(`Successfully fetched ${mappedPackages.length} ${type} packages`);
    return mappedPackages;
  } catch (error) {
    console.error(`Error in getPackagesByType:`, error);
    throw error;
  }
};

/**
 * Get a single package by ID
 */
const getPackageById = async (id: string): Promise<ISubscriptionPackage | null> => {
  try {
    console.log(`Fetching package with ID '${id}' from Supabase`);
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Supabase error fetching package with ID ${id}:`, error);
      throw new Error(`Failed to fetch package: ${error.message}`);
    }
    
    if (!data) {
      console.log(`Package with ID ${id} not found`);
      return null;
    }
    
    const mappedPackage = mapDbRowToPackage(data);
    console.log(`Successfully fetched package: ${mappedPackage.title}`);
    return mappedPackage;
  } catch (error) {
    console.error(`Error in getPackageById:`, error);
    throw error;
  }
};

/**
 * Save (create or update) a package
 */
const savePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  try {
    console.log("Starting savePackage with data:", packageData);
    
    // Validate required fields
    if (!packageData.title) {
      throw new Error('Package title is required');
    }
    
    if (packageData.price === undefined || packageData.price === null) {
      throw new Error('Package price is required');
    }
    
    // Generate an ID if one doesn't exist
    const packageId = packageData.id || `pkg_${uuidv4().substring(0, 8)}`;
    console.log(`Using package ID: ${packageId}`);
    
    // Prepare the data for Supabase - handle arrays as JSON strings
    const supabaseData = {
      id: packageId,
      title: String(packageData.title || '').trim(),
      price: packageData.price,
      monthly_price: packageData.monthlyPrice || null,
      setup_fee: packageData.setupFee || 0,
      duration_months: packageData.durationMonths || 12,
      short_description: String(packageData.shortDescription || ''),
      full_description: String(packageData.fullDescription || ''),
      features: Array.isArray(packageData.features) ? JSON.stringify(packageData.features) : '[]',
      popular: packageData.popular || false,
      type: packageData.type || 'Business',
      terms_and_conditions: String(packageData.termsAndConditions || ''),
      payment_type: packageData.paymentType || 'recurring',
      billing_cycle: packageData.paymentType === 'one-time' ? null : packageData.billingCycle || 'yearly',
      advance_payment_months: packageData.advancePaymentMonths || 0,
      dashboard_sections: Array.isArray(packageData.dashboardSections) ? packageData.dashboardSections : []
    };
    
    console.log("Prepared Supabase data:", supabaseData);

    // First, check if the package exists
    const { data: existingPackage, error: checkError } = await supabase
      .from('subscription_packages')
      .select('id')
      .eq('id', packageId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking if package exists:", checkError);
    }
    
    let result;
    
    if (existingPackage) {
      // Package exists, update it
      console.log("Package exists, updating:", packageId);
      const { data, error } = await supabase
        .from('subscription_packages')
        .update(supabaseData)
        .eq('id', packageId)
        .select('*')
        .single();
        
      if (error) {
        console.error("Update error:", error);
        throw new Error(`Failed to update package: ${error.message}`);
      }
      
      result = data;
    } else {
      // Package doesn't exist, insert it
      console.log("Package doesn't exist, inserting:", packageId);
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert(supabaseData)
        .select('*')
        .single();
        
      if (error) {
        console.error("Insert error:", error);
        throw new Error(`Failed to insert package: ${error.message}`);
      }
      
      result = data;
    }
    
    if (!result) {
      throw new Error("Failed to save package: No data returned");
    }
    
    console.log("Package saved successfully:", result);
    return mapDbRowToPackage(result);
  } catch (error) {
    console.error("Error in savePackage:", error);
    throw error;
  }
};

/**
 * Delete a package by ID
 */
const deletePackage = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting package with ID: ${id}`);
    
    if (!id) {
      throw new Error('Package ID is required');
    }
    
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Supabase error deleting package with ID ${id}:`, error);
      throw new Error(`Failed to delete package: ${error.message}`);
    }
    
    console.log(`Package ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error in deletePackage:`, error);
    throw error;
  }
};

/**
 * Map a Supabase row to an ISubscriptionPackage object
 */
const mapDbRowToPackage = (dbRow: any): ISubscriptionPackage => {
  // Validate payment type
  const paymentType: PaymentType = dbRow.payment_type?.toLowerCase() === 'one-time' ? 'one-time' : 'recurring';
  
  // Validate billing cycle
  let billingCycle: BillingCycle | undefined;
  if (dbRow.billing_cycle) {
    if (dbRow.billing_cycle.toLowerCase() === 'monthly') {
      billingCycle = 'monthly';
    } else if (dbRow.billing_cycle.toLowerCase() === 'yearly') {
      billingCycle = 'yearly';
    }
  }
  
  // Parse features from JSON string or use empty array
  let features: string[] = [];
  try {
    if (typeof dbRow.features === 'string' && dbRow.features) {
      // Try to parse as JSON
      features = JSON.parse(dbRow.features);
    } else if (Array.isArray(dbRow.features)) {
      features = dbRow.features;
    } else if (typeof dbRow.features === 'string' && dbRow.features.includes('✅')) {
      // Handle non-JSON formatted features with checkmarks
      features = dbRow.features.split('\n').map((feature: string) => feature.trim());
    }
  } catch (e) {
    console.warn("Error parsing features:", e);
    // If parsing fails, try to split by newlines or commas
    if (typeof dbRow.features === 'string') {
      if (dbRow.features.includes('\n')) {
        features = dbRow.features.split('\n').map((f: string) => f.trim()).filter(Boolean);
      } else if (dbRow.features.includes(',')) {
        features = dbRow.features.split(',').map((f: string) => f.trim()).filter(Boolean);
      } else if (dbRow.features.trim()) {
        features = [dbRow.features.trim()];
      }
    }
  }
  
  // Parse dashboard_sections from JSON string or use empty array
  let dashboardSections: string[] = [];
  try {
    if (typeof dbRow.dashboard_sections === 'string' && dbRow.dashboard_sections) {
      dashboardSections = JSON.parse(dbRow.dashboard_sections);
    } else if (Array.isArray(dbRow.dashboard_sections)) {
      dashboardSections = dbRow.dashboard_sections;
    }
  } catch (e) {
    console.warn("Error parsing dashboard_sections:", e);
  }
  
  return {
    id: dbRow.id,
    title: dbRow.title || '',
    price: typeof dbRow.price === 'number' ? dbRow.price : 0,
    monthlyPrice: typeof dbRow.monthly_price === 'number' ? dbRow.monthly_price : undefined,
    setupFee: typeof dbRow.setup_fee === 'number' ? dbRow.setup_fee : 0,
    durationMonths: typeof dbRow.duration_months === 'number' ? dbRow.duration_months : 12,
    shortDescription: dbRow.short_description || '',
    fullDescription: dbRow.full_description || '',
    features: features,
    popular: !!dbRow.popular,
    type: dbRow.type === 'Influencer' ? 'Influencer' : 'Business',
    termsAndConditions: dbRow.terms_and_conditions || '',
    paymentType: paymentType,
    billingCycle: billingCycle,
    advancePaymentMonths: typeof dbRow.advance_payment_months === 'number' ? dbRow.advance_payment_months : 0,
    dashboardSections: dashboardSections,
    isActive: true
  };
};

export { 
  getAllPackages, 
  getPackagesByType, 
  getPackageById, 
  savePackage, 
  deletePackage 
};
