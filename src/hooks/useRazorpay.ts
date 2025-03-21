
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

// Types
interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  subscription_id?: string;
  [key: string]: any;
}

// Constants
const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I'; // Used client-side, so it's safe to use directly
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://kyjdfhajtdqhdoijzmgk.supabase.co";

/**
 * Hook for handling Razorpay payments and subscriptions securely
 */
export const useRazorpay = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load Razorpay script dynamically
  const loadRazorpayScript = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  
  // Create a subscription plan on the server
  const createPlan = async (packageData: ISubscriptionPackage): Promise<any> => {
    try {
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
      const functionUrl = `${SUPABASE_URL}/functions/v1/razorpay-integration/create-plan`;
      console.log("Calling edge function at:", functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ packageData })
      });
      
      // Check if response is OK
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response from server:', responseText);
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }
      
      // Parse the JSON response
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  };
  
  // Create a subscription on the server and open Razorpay checkout
  const createSubscription = async (packageData: ISubscriptionPackage): Promise<any> => {
    if (!user) {
      throw new Error('User must be logged in to create a subscription');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure Razorpay is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }
      
      // For one-time payments, we'll use standard checkout
      if (packageData.paymentType === 'one-time') {
        return initiateOneTimePayment(packageData);
      }
      
      // For recurring subscriptions
      const customerData = {
        name: user.fullName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phone: user.phone || ''
      };
      
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
          packageData,
          customerData
        })
      });
      
      // Check if response is OK
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response from server:', responseText);
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }
      
      // Parse the JSON response
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      console.log("Received result from backend:", result);
      
      // Open Razorpay checkout based on payment type
      return new Promise((resolve, reject) => {
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
          }
        };
        
        // For one-time and initial subscription payments, use order_id
        if (result.order && result.order.id) {
          console.log("Setting up order-based payment with order ID:", result.order.id);
          options.order_id = result.order.id;
          options.amount = result.order.amount; // amount in paise
          options.currency = result.order.currency || 'INR';
        }
        
        // For recurring subscription payments, use subscription_id
        if (result.isSubscription && result.subscription && result.subscription.id) {
          console.log("Setting up subscription-based payment with subscription ID:", result.subscription.id);
          // IMPORTANT: Only set subscription_id, do not set order_id at the same time
          delete options.order_id; // Remove order_id if it was set
          options.subscription_id = result.subscription.id;
          
          // Do NOT set recurring: true here as it can cause conflicts with subscription_id
          // Instead, let Razorpay handle the recurring nature based on the subscription_id
        }
        
        // Success handler
        options.handler = function(response: any) {
          console.log("Payment success response:", response);
          resolve({
            ...response,
            subscription: result.subscription,
            order: result.order,
            subscriptionId: result.subscription?.id,
            orderId: result.order?.id,
            packageDetails: packageData
          });
        };
        
        // Modal dismiss handler
        options.modal = {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
            reject(new Error('Payment cancelled by user'));
          }
        };
        
        try {
          console.log("Initializing Razorpay with options:", JSON.stringify(options, null, 2));
          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        } catch (err) {
          console.error('Razorpay initialization error:', err);
          reject(new Error('Failed to initialize payment gateway'));
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle one-time payments (not subscriptions)
  const initiateOneTimePayment = async (packageData: ISubscriptionPackage): Promise<any> => {
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    try {
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
      console.log("Calling edge function for one-time payment at:", functionUrl);
      
      // Create order via edge function (reusing the same endpoint)
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
            paymentType: 'one-time' // Ensure it's treated as one-time
          },
          customerData: {
            name: user.fullName || user.email?.split('@')[0] || '',
            email: user.email || '',
            contact: user.phone || ''
          }
        })
      });
      
      // Check if response is OK
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response from server:', responseText);
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }
      
      // Parse the JSON response
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      console.log("Received result for one-time payment:", result);
      
      if (!result.order || !result.order.id) {
        throw new Error('Invalid order response from server');
      }
      
      // Open Razorpay checkout for one-time payment
      return new Promise((resolve, reject) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          order_id: result.order.id,
          amount: result.order.amount, // amount in paise
          currency: result.order.currency || 'INR',
          name: 'Grow Bharat Vyapaar',
          description: `Payment for ${packageData.title}`,
          image: 'https://your-company-logo.png', // Replace with your logo
          prefill: {
            name: user.fullName || user.email?.split('@')[0] || '',
            email: user.email || '',
            contact: user.phone || ''
          },
          notes: {
            packageId: packageData.id,
            userId: user.id
          },
          theme: {
            color: '#3399cc'
          },
          handler: function(response: any) {
            // Process the payment success
            console.log("One-time payment success:", response);
            resolve({
              ...response,
              packageDetails: packageData,
              amount: packageData.price,
              orderId: result.order.id
            });
          },
          modal: {
            ondismiss: function() {
              console.log("One-time payment modal dismissed");
              reject(new Error('Payment cancelled by user'));
            }
          }
        };
        
        try {
          console.log("Initializing Razorpay one-time payment with options:", JSON.stringify(options, null, 2));
          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        } catch (err) {
          console.error('Razorpay initialization error:', err);
          reject(new Error('Failed to initialize payment gateway'));
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };
  
  return {
    isLoading,
    error,
    createSubscription,
    initiateOneTimePayment
  };
};
