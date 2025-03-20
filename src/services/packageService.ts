
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPackage, ISubscriptionPackage } from '@/models/SubscriptionPackage';

// Get all subscription packages
export const getAllPackages = async (): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) {
    console.error('Error fetching subscription packages:', error);
    throw error;
  }
  
  return data as ISubscriptionPackage[];
};

// Get packages by type
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('type', type)
    .order('price', { ascending: true });
  
  if (error) {
    console.error(`Error fetching ${type} packages:`, error);
    throw error;
  }
  
  return data as ISubscriptionPackage[];
};

// Get package by ID
export const getPackageById = async (id: string): Promise<ISubscriptionPackage | null> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching package by ID ${id}:`, error);
    throw error;
  }
  
  return data as ISubscriptionPackage;
};

// Create or update package
export const savePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  // Ensure package has an ID
  if (!packageData.id) {
    packageData.id = packageData.title.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Convert features to array if it's a string
  if (typeof packageData.features === 'string') {
    packageData.features = (packageData.features as unknown as string).split(',').map((f: string) => f.trim());
  } else if (!Array.isArray(packageData.features)) {
    packageData.features = [];
  }
  
  const { data, error } = await supabase
    .from('subscription_packages')
    .upsert(packageData, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving subscription package:', error);
    throw error;
  }
  
  return data?.[0] as ISubscriptionPackage;
};

// Delete package
export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscription_packages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting package with ID ${id}:`, error);
    throw error;
  }
};
