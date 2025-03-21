
/**
 * Service for Razorpay API interactions
 */

import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { supabase } from '@/integrations/supabase/client';
import { RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { RazorpayOptions, SubscriptionResult } from '@/types/razorpay';

// Constants
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://kyjdfhajtdqhdoijzmgk.supabase.co";

/**
 * Create a new Razorpay checkout instance
 */
export const createRazorpayCheckout = (options: RazorpayOptions): any => {
  if (typeof (window as any).Razorpay === 'undefined') {
    throw new Error('Razorpay is not loaded');
  }
  
  // Make a deep copy of options to avoid mutation issues
  const safeOptions = JSON.parse(JSON.stringify(options));
  
  console.log("Creating Razorpay instance with options:", safeOptions);
  
  // Clean options before sending to Razorpay
  cleanRazorpayOptions(safeOptions);
  
  return new (window as any).Razorpay(safeOptions);
};

/**
 * Clean Razorpay options to prevent errors
 */
const cleanRazorpayOptions = (options: RazorpayOptions): void => {
  // Remove any undefined, null, or empty string values
  Object.keys(options).forEach(key => {
    if (options[key] === undefined || options[key] === null || options[key] === '') {
      delete options[key];
    }
  });
  
  // Clean up prefill object
  if (options.prefill) {
    Object.keys(options.prefill).forEach(key => {
      if (!options.prefill[key] || options.prefill[key] === '') {
        delete options.prefill[key];
      }
    });
    
    // If prefill is empty after cleaning, remove it
    if (Object.keys(options.prefill).length === 0) {
      delete options.prefill;
    }
  }
  
  // Ensure notes have only string values
  if (options.notes) {
    Object.keys(options.notes).forEach(key => {
      if (options.notes[key] !== undefined && options.notes[key] !== null) {
        options.notes[key] = String(options.notes[key]);
      } else {
        delete options.notes[key];
      }
    });
    
    // If notes is empty after cleaning, remove it
    if (Object.keys(options.notes).length === 0) {
      delete options.notes;
    }
  }
  
  // Check if we have an order_id, and if not, don't send amount and currency
  if (!options.order_id && (options.amount || options.currency)) {
    console.warn("No order_id present, removing amount and currency parameters");
    delete options.amount;
    delete options.currency;
  }
  
  // Ensure we don't have both subscription_id and order_id
  if (options.subscription_id && options.order_id) {
    console.warn("Both subscription_id and order_id present, removing subscription_id");
    delete options.subscription_id;
  }
  
  // Final check to ensure mandatory fields are present
  if (!options.key) {
    options.key = RAZORPAY_KEY_ID;
  }
};

/**
 * Create a subscription through the Supabase Edge Function
 */
export const createSubscriptionViaEdgeFunction = async (
  user: any,
  packageData: ISubscriptionPackage, 
  customerData: any,
  useOneTimePreferred = true
): Promise<SubscriptionResult> => {
  // Get current auth session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw new Error(`Session error: ${sessionError.message}`);
  }
  
  const accessToken = sessionData?.session?.access_token;
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  // Make sure we have the correct URL format
  const functionUrl = `${SUPABASE_URL}/functions/v1/razorpay-integration/create-subscription`;
  console.log("Calling edge function at:", functionUrl);
  
  try {
    // Clean customer data before sending to server
    const cleanedCustomerData = {
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || ''
    };
    
    // Remove empty values
    Object.keys(cleanedCustomerData).forEach(key => {
      if (!cleanedCustomerData[key]) {
        delete cleanedCustomerData[key];
      }
    });
    
    // Create subscription via edge function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId: user.id,
        packageData: {
          ...packageData,
          // Use the appropriate payment type
          paymentType: packageData.paymentType || 'one-time'
        },
        customerData: cleanedCustomerData,
        // Add a flag to indicate autopay preference
        useOneTimePreferred: useOneTimePreferred,
        enableAutoPay: true
      })
    });
    
    // Check if response is OK
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Error response from server:', responseText);
      throw new Error(`Server error: ${response.status} - ${responseText}`);
    }
    
    // Parse the JSON response
    try {
      const result = await response.json();
      console.log("Received result from edge function:", result);
      return result;
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Error calling edge function:', error);
    throw error;
  }
};

/**
 * Build the Razorpay options based on subscription result
 */
export const buildRazorpayOptions = (
  user: any, 
  packageData: ISubscriptionPackage, 
  customerData: any, 
  result: SubscriptionResult, 
  isOneTime: boolean,
  onSuccess: (response: any) => void,
  onDismiss: () => void
): RazorpayOptions => {
  console.log("Building Razorpay options with result:", result);
  
  // Ensure we have properly formatted customer data with no empty values
  const cleanedPrefill: Record<string, string> = {};
  
  if (customerData.name) cleanedPrefill.name = customerData.name;
  if (customerData.email) cleanedPrefill.email = customerData.email;
  if (customerData.phone) cleanedPrefill.contact = customerData.phone;
  
  // Base options for Razorpay
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    name: 'Grow Bharat Vyapaar',
    description: `Payment for ${packageData.title}`,
    image: 'https://your-company-logo.png',
    notes: {
      packageId: packageData.id,
      userId: user.id,
      enableAutoPay: "true" // Flag for autopay
    },
    theme: {
      color: '#3399cc'
    },
    handler: function(response: any) {
      console.log("Payment success response:", response);
      onSuccess({
        ...response,
        subscription: result.subscription,
        order: result.order,
        subscriptionId: result.subscription?.id,
        orderId: result.order?.id,
        packageDetails: packageData,
        isSubscription: result.isSubscription,
        enableAutoPay: true
      });
    },
    modal: {
      ondismiss: onDismiss,
      escape: false,
      backdropclose: false
    },
    // Add recurring and auto_capture flags if using autopay
    recurring: true,
    remember_customer: true
  };
  
  // Only add prefill if we have values
  if (Object.keys(cleanedPrefill).length > 0) {
    options.prefill = cleanedPrefill;
  }
  
  // Always use order-based payment
  if (result.order && result.order.id) {
    console.log("Setting up order-based payment with order ID:", result.order.id);
    options.order_id = result.order.id;
    
    // Also set amount and currency for order-based payments
    if (result.order.amount) {
      options.amount = result.order.amount; // amount in paise
    }
    
    if (result.order.currency) {
      options.currency = result.order.currency;
    }
    
    // Do NOT set subscription_id if order_id is set
    delete options.subscription_id;
  } else {
    console.error("Missing required order_id in the response");
    throw new Error("Invalid response from server: missing order information");
  }
  
  return options;
};
