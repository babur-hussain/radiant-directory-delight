import { supabase } from '@/integrations/supabase/client';

// Create the monthly subscription package
export const createMonthlyPackage = async () => {
  try {
    const monthlyPackage = {
      id: 'business-monthly-package',
      title: 'Businesses Monthly Package',
      price: 1119, // This is the monthly price
      monthly_price: 1119,
      short_description: 'Monthly subscription for businesses',
      full_description: 'Get access to all business features with a monthly subscription. Perfect for businesses that prefer monthly billing.',
      features: JSON.stringify([
        'Business Profile Listing',
        'Contact Information Display',
        'Basic Analytics Dashboard',
        'Email Support',
        'Social Media Integration',
        'Monthly Billing',
        'Easy Cancellation',
        'Access to Platform'
      ]),
      popular: false,
      setup_fee: 120,
      duration_months: 12,
      type: 'Business',
      payment_type: 'recurring',
      billing_cycle: 'monthly',
      advance_payment_months: 0,
      dashboard_sections: ['analytics', 'profile', 'contacts'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if package already exists
    const { data: existingPackage } = await supabase
      .from('subscription_packages')
      .select('id')
      .eq('id', monthlyPackage.id)
      .single();

    if (existingPackage) {
      // Update existing package
      const { data, error } = await supabase
        .from('subscription_packages')
        .update(monthlyPackage)
        .eq('id', monthlyPackage.id)
        .select();

      if (error) {
        console.error('Error updating monthly package:', error);
        return { success: false, error };
      }

      console.log('✅ Monthly package updated successfully:', data);
      return { success: true, data };
    } else {
      // Create new package
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert(monthlyPackage)
        .select();

      if (error) {
        console.error('Error creating monthly package:', error);
        return { success: false, error };
      }

      console.log('✅ Monthly package created successfully:', data);
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error in createMonthlyPackage:', error);
    return { success: false, error };
  }
};

// Function to get the monthly package
export const getMonthlyPackage = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', 'business-monthly-package')
      .single();

    if (error) {
      console.error('Error getting monthly package:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMonthlyPackage:', error);
    return null;
  }
};
