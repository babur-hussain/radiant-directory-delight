
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
  return new (window as any).Razorpay(safeOptions);
};

/**
 * Create a subscription through the Supabase Edge Function
 */
export const createSubscriptionViaEdgeFunction = async (
  user: any,
  packageData: ISubscriptionPackage, 
  customerData: any,
  useOneTimePreferred = false
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
        // If we're using one-time preferred mode, treat recurring packages as one-time
        paymentType: useOneTimePreferred && packageData.paymentType !== 'one-time' 
          ? 'one-time' 
          : packageData.paymentType
      },
      customerData,
      // Add a flag to indicate we want to use one-time payment for all
      useOneTimePreferred
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
  
  // Base options for Razorpay
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    name: 'Grow Bharat Vyapaar',
    description: `Payment for ${packageData.title}`,
    image: 'https://your-company-logo.png', // Replace with your logo
    prefill: {
      name: customerData.name,
      email: customerData.email,
      contact: customerData.phone
    },
    notes: {
      packageId: packageData.id,
      userId: user.id
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
        isSubscription: result.isSubscription
      });
    },
    modal: {
      ondismiss: onDismiss,
      escape: false,
      backdropclose: false
    }
  };
  
  // Important: Only set either order_id OR subscription_id, never both
  if (result.isSubscription && result.subscription && result.subscription.id && !isOneTime) {
    console.log("Setting up subscription-based payment with subscription ID:", result.subscription.id);
    // For recurring subscription payments, use subscription_id
    options.subscription_id = result.subscription.id;
    
    // Do NOT set order_id if subscription_id is set
    delete options.order_id;
    delete options.amount;
    delete options.currency;
  } else {
    // For one-time payments, use order_id
    if (result.order && result.order.id) {
      console.log("Setting up order-based payment with order ID:", result.order.id);
      options.order_id = result.order.id;
      
      // Also set amount and currency for order-based payments
      options.amount = result.order.amount; // amount in paise
      options.currency = result.order.currency || 'INR';
      
      // Do NOT set subscription_id if order_id is set
      delete options.subscription_id;
    } else {
      console.error("Missing required order_id in the response");
      throw new Error("Invalid response from server: missing order information");
    }
  }
  
  return options;
};
