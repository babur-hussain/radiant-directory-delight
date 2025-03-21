
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
  
  // Create a subscription on the server and open Razorpay checkout
  const createSubscription = async (packageData: ISubscriptionPackage, useOneTimePreferred = false): Promise<any> => {
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
      
      // Determine payment type
      // If useOneTimePreferred is true, we'll use one-time payment even for recurring packages
      const isOneTime = packageData.paymentType === 'one-time' || useOneTimePreferred;
      console.log(`Processing payment as ${isOneTime ? 'one-time' : 'subscription'} payment`);
      
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
          packageData: {
            ...packageData,
            // If we're using one-time preferred mode, treat recurring packages as one-time
            paymentType: isOneTime ? 'one-time' : packageData.paymentType
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
            reject(new Error("Invalid response from server: missing order information"));
            return;
          }
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
            packageDetails: packageData,
            isSubscription: result.isSubscription
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
  
  return {
    isLoading,
    error,
    createSubscription
  };
};
