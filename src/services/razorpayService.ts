/**
 * Service for Razorpay API interactions
 */

import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { supabase } from '@/integrations/supabase/client';
import { RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { RazorpayOptions, SubscriptionResult, AutopayDetails } from '@/types/razorpay';

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
  if (!safeOptions.key) {
    console.error("Missing required Razorpay parameters:", safeOptions);
    throw new Error('Required parameter missing: key is mandatory for Razorpay checkout');
  }
  
  // For key-only mode, we need amount and currency
  if (!safeOptions.amount) {
    console.error("Amount must be provided for key-only mode:", safeOptions);
    throw new Error('Amount must be provided for Razorpay checkout');
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
const cleanRazorpayOptions = (options: Record<string, any>): void => {
  // Create a new clean object instead of deleting properties
  const cleanObject = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    // Copy only defined, non-null, non-empty string values
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== null && value !== '') {
        // If it's an object, clean it recursively
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const cleanedNestedObj = cleanObject(value);
          // Only add if the cleaned object has properties
          if (Object.keys(cleanedNestedObj).length > 0) {
            result[key] = cleanedNestedObj;
          }
        } else {
          result[key] = value;
        }
      }
    });
    
    return result;
  };
  
  // Clean the options object
  const cleanedOptions = cleanObject(options);
  
  // Clear the original object
  Object.keys(options).forEach(key => {
    options[key] = undefined;
  });
  
  // Copy cleaned values back to original object
  Object.assign(options, cleanedOptions);
  
  // Ensure we have a valid key
  if (!options.key) {
    options.key = RAZORPAY_KEY_ID;
  }
  
  // Special validation for Razorpay options
  if (options.subscription_id && options.order_id) {
    // Cannot have both subscription_id and order_id
    options.subscription_id = undefined;
  }
  
  // If recurring flag is true but no subscription_id, remove recurring flag
  if (options.recurring === true && !options.subscription_id) {
    options.recurring = undefined;
  }
  
  // Remove order_id - we'll use key-only mode with amount
  if (options.order_id) {
    console.log("Removing order_id to use key-only mode instead");
    options.order_id = undefined;
  }

  // Ensure amount is present for key-only mode
  if (!options.amount) {
    console.warn("Amount is required for key-only mode");
  }

  // Ensure the callback URL is valid and absolute
  if (options.callback_url) {
    try {
      // Make sure it's a valid URL and fully qualified
      const url = new URL(options.callback_url);
      // Check if protocol is present, if not, it's a relative URL
      if (!url.protocol || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
        // Convert to absolute URL
        const absoluteUrl = new URL(options.callback_url, window.location.origin).toString();
        options.callback_url = absoluteUrl;
      }
    } catch (e) {
      console.warn("Invalid callback_url, fixing it");
      // If URL parsing fails, set to current page URL
      options.callback_url = window.location.href;
    }
  } else {
    // Ensure we always have a callback URL
    options.callback_url = window.location.href;
  }
  
  // Disable redirects to prevent routing issues
  options.redirect = false;
  
  // CRUCIAL FIX: Check if notes object has too many entries (Razorpay limit is 15)
  if (options.notes && Object.keys(options.notes).length > 15) {
    console.warn("Too many notes for Razorpay (limit is 15). Keeping only essential ones.");
    
    // Create a new notes object with only essential keys
    const essentialNotes: Record<string, string> = {};
    
    // Define priority keys to keep
    const priorityKeys = [
      'packageId', 'userId', 'package_id', 'user_id', 'transaction_id',
      'referral_id', 'setup_fee', 'base_price', 'total_amount',
      'isNonRefundable', 'refundStatus', 'refundPolicy'
    ];
    
    // First add priority keys
    priorityKeys.forEach(key => {
      if (options.notes[key] !== undefined) {
        essentialNotes[key] = options.notes[key];
      }
    });
    
    // If we still have room, add other keys until we hit 15
    const remainingSlots = 15 - Object.keys(essentialNotes).length;
    if (remainingSlots > 0) {
      Object.keys(options.notes)
        .filter(key => !priorityKeys.includes(key))
        .slice(0, remainingSlots)
        .forEach(key => {
          essentialNotes[key] = options.notes[key];
        });
    }
    
    // Replace the original notes with our trimmed version
    options.notes = essentialNotes;
    console.log("Reduced notes to:", Object.keys(options.notes).length, "items");
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
    const filteredCustomerData = Object.fromEntries(
      Object.entries(cleanedCustomerData).filter(([_, value]) => value)
    );
    
    // Create request payload
    const payload = {
      userId: user.id,
      packageData: {
        ...packageData,
        // Ensure the correct payment type is set
        paymentType: packageData.paymentType || 'one-time'
      },
      customerData: filteredCustomerData,
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
    
    // Return the data directly from the edge function
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
  
  // Calculate the total amount including setup fee
  const totalAmount = (packageData.price || 0) + (packageData.setupFee || 0);
  console.log(`Total amount with setup fee: ${totalAmount} (price: ${packageData.price}, setup fee: ${packageData.setupFee})`);
  
  // Optimize notes - keep under 15 limit
  const notes: Record<string, string> = {
    packageId: packageData.id.toString(),
    userId: user.id,
    setupFee: String(packageData.setupFee || 0),
    totalAmount: String(totalAmount),
    // Critical flags - only keep the essential ones
    isNonRefundable: "true",
    refundStatus: "no_refund_allowed",
    transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
  };
  
  // Base options for Razorpay
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    name: 'Grow Bharat Vyapaar',
    description: `Payment for ${packageData.title}`,
    image: 'https://your-company-logo.png',
    // Make sure to use the totalAmount that includes setup fee
    amount: result.amount !== undefined ? result.amount : Math.round(totalAmount * 100),
    currency: 'INR',
    notes: notes,
    theme: {
      color: '#3399cc'
    },
    handler: function(response: any) {
      console.log("Payment success response:", response);
      onSuccess({
        ...response,
        ...result, // Include all data from the edge function result
        isSubscription: !isOneTime,
        enableAutoPay: enableAutoPay,
        packageDetails: packageData,
        // Use totalAmount (including setup fee) for consistency
        amount: result.amount !== undefined ? result.amount : Math.round(totalAmount * 100),
        // Add flags to prevent refunds
        preventRefunds: true,
        isNonRefundable: true,
        autoRefund: false
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
  
  // For recurring payments, set up the autopay configuration
  if (!isOneTime && enableAutoPay && packageData.paymentType === 'recurring') {
    console.log("Setting up recurring payment with autopay");
    
    // Set the recurring flag to indicate this is a recurring payment
    options.recurring = true;
    
    // Add recurring_token for autopay
    options.recurring_token = {
      max_amount: result.totalAmount ? Math.round(result.totalAmount * 100) : Math.round(packageData.price * 100 * 12),
      expire_by: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year from now in seconds
    };
    
    // If we have specific autopay details from the result, use those
    if (result.autopayDetails) {
      // Calculate total remaining amount in paise
      const totalRemainingAmount = result.autopayDetails.totalRemainingAmount || result.remainingAmount || 0;
      if (totalRemainingAmount > 0) {
        options.recurring_token.max_amount = Math.round(totalRemainingAmount * 100);
      }
    } else if (result.remainingAmount && result.remainingAmount > 0) {
      // Use remainingAmount if available
      options.recurring_token.max_amount = Math.round(result.remainingAmount * 100);
    }
    
    console.log("Configured recurring_token for autopay:", options.recurring_token);
  }
  
  return options;
};
