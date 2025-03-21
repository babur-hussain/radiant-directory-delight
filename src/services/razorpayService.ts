
/**
 * Service for Razorpay API interactions
 */

import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { supabase } from '@/integrations/supabase/client';
import { RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { RazorpayOptions, SubscriptionResult } from '@/types/razorpay';

/**
 * Create a new Razorpay checkout instance
 */
export const createRazorpayCheckout = (options: RazorpayOptions): any => {
  if (typeof (window as any).Razorpay === 'undefined') {
    console.error("Razorpay is not available in window.");
    throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
  }
  
  // Make a deep copy of options to avoid mutation issues
  const safeOptions = JSON.parse(JSON.stringify(options));
  
  console.log("Creating Razorpay instance with options:", safeOptions);
  
  // Clean options before sending to Razorpay
  cleanRazorpayOptions(safeOptions);
  
  // Final validation to ensure mandatory params
  if (!safeOptions.key || !safeOptions.order_id) {
    console.error("Missing required Razorpay parameters:", safeOptions);
    throw new Error('Required parameters missing: key and order_id are mandatory for Razorpay checkout');
  }
  
  try {
    // Create the Razorpay instance with cleaned options
    const RazorpayConstructor = (window as any).Razorpay;
    return new RazorpayConstructor(safeOptions);
  } catch (error) {
    console.error("Error creating Razorpay instance:", error);
    throw new Error('Failed to initialize Razorpay checkout. Please try again.');
  }
};

/**
 * Thoroughly clean Razorpay options to prevent errors
 */
const cleanRazorpayOptions = (options: RazorpayOptions): void => {
  // Remove any undefined, null, or empty string values
  Object.keys(options).forEach(key => {
    if (options[key] === undefined || options[key] === null || options[key] === '') {
      delete options[key];
    }
  });
  
  // Ensure we have a valid key
  if (!options.key) {
    options.key = RAZORPAY_KEY_ID;
  }
  
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
  
  // Ensure notes have only string values and remove empty notes
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
  
  // ** SPECIAL RAZORPAY VALIDATION **
  // 1. Ensure we don't have both subscription_id and order_id (Razorpay requirement)
  if (options.subscription_id && options.order_id) {
    console.warn("Both subscription_id and order_id present, removing subscription_id");
    delete options.subscription_id;
  }
  
  // 2. If recurring is true, ensure we have a valid subscription_id, otherwise remove recurring flag
  if (options.recurring === true && !options.subscription_id) {
    console.warn("Recurring flag present without subscription_id, removing recurring flag");
    delete options.recurring;
  }
  
  // 3. Remove amount if order_id is present (Razorpay recommendation)
  if (options.order_id && options.amount) {
    console.warn("Both order_id and amount present, removing amount since it's included in the order");
    delete options.amount;
  }
  
  // 4. If we're using standard checkout mode, make sure we don't send problematic options
  if (options.order_id && options.order_id.startsWith('order_')) {
    // For standard checkout, these options can cause conflicts
    delete options.recurring;
    delete options.subscription_id;
    delete options.amount;
    delete options.currency;
  }

  // 5. Ensure the callback URL is valid (added for route not found fix)
  if (options.callback_url) {
    // Make sure it's a valid URL
    try {
      new URL(options.callback_url);
    } catch (e) {
      console.warn("Invalid callback_url, removing it");
      delete options.callback_url;
    }
  }
};

/**
 * Create a subscription through the Supabase Edge Function
 */
export const createSubscriptionViaEdgeFunction = async (
  user: any,
  packageData: ISubscriptionPackage, 
  customerData: any,
  useOneTimePreferred = true,
  enableAutoPay = true
): Promise<SubscriptionResult> => {
  // Get current auth session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session error:", sessionError);
    throw new Error(`Authentication error: ${sessionError.message}`);
  }
  
  const accessToken = sessionData?.session?.access_token;
  
  if (!accessToken) {
    throw new Error('Not authenticated. Please log in again.');
  }
  
  try {
    // Clean customer data before sending to server
    const cleanedCustomerData = {
      name: customerData?.name || '',
      email: customerData?.email || '',
      phone: customerData?.phone || ''
    };
    
    // Remove empty values
    Object.keys(cleanedCustomerData).forEach(key => {
      if (!cleanedCustomerData[key]) {
        delete cleanedCustomerData[key];
      }
    });
    
    // Create request payload
    const payload = {
      userId: user.id,
      packageData: {
        ...packageData,
        // Ensure the correct payment type is set
        paymentType: packageData.paymentType || 'one-time'
      },
      customerData: cleanedCustomerData,
      // Add flags to indicate payment preferences
      useOneTimePreferred: useOneTimePreferred,
      enableAutoPay: enableAutoPay
    };
    
    console.log("Sending payload to edge function:", JSON.stringify(payload, null, 2));
    
    // Use Supabase's functions.invoke method to call the edge function
    const { data, error } = await supabase.functions.invoke('razorpay-integration', {
      method: 'POST',
      body: payload
    });
    
    if (error) {
      console.error('Error response from edge function:', error);
      throw new Error(`Server error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Edge function returned empty response');
    }
    
    console.log("Received result from edge function:", data);
    
    // Validate the response contains required fields
    if (!data.order || !data.order.id) {
      console.error('Invalid response from edge function:', data);
      throw new Error('Invalid response: missing order information');
    }
    
    return data;
    
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
  enableAutoPay: boolean,
  onSuccess: (response: any) => void,
  onDismiss: () => void
): RazorpayOptions => {
  console.log("Building Razorpay options with result:", result);
  
  // Ensure we have properly formatted customer data with no empty values
  const cleanedPrefill: Record<string, string> = {};
  
  if (customerData?.name) cleanedPrefill.name = customerData.name;
  if (customerData?.email) cleanedPrefill.email = customerData.email;
  if (customerData?.phone) cleanedPrefill.contact = customerData.phone;
  
  // Get current URL (to create valid return URLs)
  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  
  // Base options for Razorpay
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    name: 'Grow Bharat Vyapaar',
    description: `Payment for ${packageData.title}`,
    image: 'https://your-company-logo.png',
    notes: {
      packageId: packageData.id.toString(),
      userId: user.id,
      enableAutoPay: enableAutoPay ? "true" : "false" // Flag for autopay
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
        enableAutoPay: enableAutoPay
      });
    },
    modal: {
      ondismiss: onDismiss,
      escape: false,
      backdropclose: false
    },
    // Add return URLs to prevent routing errors
    callback_url: currentUrl,
    redirect: false
  };
  
  // Only add prefill if we have values
  if (Object.keys(cleanedPrefill).length > 0) {
    options.prefill = cleanedPrefill;
  }
  
  // Always use order-based payment (Razorpay's preferred approach)
  if (result.order && result.order.id) {
    console.log("Setting up order-based payment with order ID:", result.order.id);
    options.order_id = result.order.id;
    
    // Do NOT set subscription_id if order_id is set (Razorpay requirement)
    delete options.subscription_id;
  } else {
    console.error("Missing required order_id in the response");
    throw new Error("Invalid response from server: missing order information");
  }
  
  return options;
};
