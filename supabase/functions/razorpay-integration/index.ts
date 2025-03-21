
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.167.0/node/crypto.ts";

// Get Razorpay credentials from environment variables
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verify that Razorpay payload is authentic
function verifyRazorpayWebhook(payload: any, signature: string): boolean {
  try {
    const hmac = createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(JSON.stringify(payload));
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

// Helper function to create or find a Razorpay customer
async function createOrFindCustomer(userData: any) {
  try {
    const { name, email, phone } = userData;
    
    // Check if customer already exists by email
    const customerUrl = 'https://api.razorpay.com/v1/customers';
    
    // Create a new customer
    const response = await fetch(customerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify({
        name: name || 'Customer',
        email: email || '',
        contact: phone || '',
        fail_existing: 0 // Update if customer exists
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create customer');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating/finding customer:', error);
    throw error;
  }
}

// Create a subscription plan in Razorpay
async function createPlan(planData: any) {
  try {
    const planUrl = 'https://api.razorpay.com/v1/plans';
    
    // Convert period to monthly/yearly for Razorpay
    const period = planData.billingCycle === 'monthly' ? 'monthly' : 'yearly';
    const interval = 1; // 1 month or 1 year intervals
    
    // Calculate amount in paise (multiply by 100)
    const amount = Math.round((planData.billingCycle === 'monthly' 
      ? (planData.monthlyPrice || planData.price / 12) 
      : planData.price) * 100);
    
    const response = await fetch(planUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify({
        period,
        interval,
        item: {
          name: planData.name || planData.title,
          amount,
          currency: 'INR',
          description: planData.description || `${planData.title} - ${period} plan`
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create plan');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

// Create a subscription using plan and customer
async function createSubscription(planId: string, customerId: string, subscriptionData: any) {
  try {
    const subscriptionUrl = 'https://api.razorpay.com/v1/subscriptions';
    
    // Calculate total count (if applicable)
    let totalCount = null;
    
    // If this is a fixed-term subscription, calculate total count
    if (subscriptionData.durationMonths) {
      if (subscriptionData.billingCycle === 'monthly') {
        totalCount = subscriptionData.durationMonths;
      } else if (subscriptionData.billingCycle === 'yearly') {
        totalCount = Math.ceil(subscriptionData.durationMonths / 12);
      }
    }
    
    // Number of times to charge in advance
    const addons = [];
    
    // Add setup fee if applicable
    if (subscriptionData.setupFee && subscriptionData.setupFee > 0) {
      addons.push({
        item: {
          name: 'Setup Fee',
          amount: Math.round(subscriptionData.setupFee * 100),
          currency: 'INR'
        }
      });
    }
    
    // Add advance payments if applicable
    if (subscriptionData.advancePaymentMonths && subscriptionData.advancePaymentMonths > 0) {
      // We'll handle this with first_payment_advance in the API
    }
    
    const payload: any = {
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount,
      quantity: 1,
      start_at: Math.floor(Date.now() / 1000), // Start immediately
      addons,
      notes: {
        packageId: subscriptionData.id || subscriptionData.packageId,
        packageName: subscriptionData.title || subscriptionData.packageName
      }
    };
    
    // Add advance payment if applicable
    if (subscriptionData.advancePaymentMonths && subscriptionData.advancePaymentMonths > 0) {
      if (subscriptionData.billingCycle === 'monthly') {
        payload.remaining_count = totalCount ? (totalCount - subscriptionData.advancePaymentMonths) : null;
      } else {
        // For yearly plans with advance months, convert to years
        const advanceYears = Math.ceil(subscriptionData.advancePaymentMonths / 12);
        payload.remaining_count = totalCount ? (totalCount - advanceYears) : null;
      }
    }
    
    const response = await fetch(subscriptionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create subscription');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Store subscription details in the database
async function storeSubscriptionInDB(userId: string, packageDetails: any, subscriptionData: any) {
  try {
    // Calculate end date based on subscription details
    const startDate = new Date();
    const endDate = new Date();
    
    if (packageDetails.paymentType === 'one-time') {
      // For one-time, use package duration
      endDate.setMonth(endDate.getMonth() + (packageDetails.durationMonths || 12));
    } else {
      // For recurring, calculate based on billing cycle and total count
      if (packageDetails.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + (subscriptionData.total_count || 12));
      } else {
        endDate.setFullYear(endDate.getFullYear() + (subscriptionData.total_count || 1));
      }
    }
    
    // Prepare subscription DB record
    const dbSubscription = {
      id: subscriptionData.id,
      user_id: userId,
      package_id: packageDetails.id,
      package_name: packageDetails.title,
      amount: packageDetails.price,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      payment_method: 'razorpay',
      payment_type: packageDetails.paymentType,
      billing_cycle: packageDetails.billingCycle,
      signup_fee: packageDetails.setupFee || 0,
      recurring_amount: packageDetails.paymentType === 'one-time' ? 0 : packageDetails.price,
      razorpay_subscription_id: subscriptionData.id,
      is_paused: false,
      is_pausable: packageDetails.paymentType !== 'one-time',
      is_user_cancellable: packageDetails.paymentType !== 'one-time',
      assigned_by: 'system',
      assigned_at: new Date().toISOString(),
      advance_payment_months: packageDetails.advancePaymentMonths || 0,
      actual_start_date: startDate.toISOString()
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([dbSubscription]);
    
    if (error) throw error;
    
    // Also update the user record
    await supabase
      .from('users')
      .update({
        subscription: subscriptionData.id,
        subscription_id: subscriptionData.id,
        subscription_status: 'active',
        subscription_package: packageDetails.id
      })
      .eq('id', userId);
    
    return dbSubscription;
  } catch (error) {
    console.error('Error storing subscription in DB:', error);
    throw error;
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Handle different endpoints
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();

  try {
    // Create Razorpay Plan
    if (endpoint === 'create-plan') {
      const { packageData } = await req.json();
      
      if (!packageData) {
        throw new Error('Package data is required');
      }
      
      const plan = await createPlan(packageData);
      
      return new Response(JSON.stringify({ success: true, plan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create Razorpay Subscription
    else if (endpoint === 'create-subscription') {
      const { userId, packageData, customerData } = await req.json();
      
      if (!userId || !packageData || !customerData) {
        throw new Error('User ID, package data, and customer data are required');
      }
      
      // Create or find customer
      const customer = await createOrFindCustomer(customerData);
      
      // Create plan for the subscription
      const plan = await createPlan(packageData);
      
      // Create subscription
      const subscription = await createSubscription(plan.id, customer.id, packageData);
      
      // Store subscription in database
      const dbSubscription = await storeSubscriptionInDB(userId, packageData, subscription);
      
      return new Response(JSON.stringify({ success: true, subscription, dbSubscription }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle Razorpay Webhooks
    else if (endpoint === 'webhook') {
      const signature = req.headers.get('x-razorpay-signature') || '';
      const payload = await req.json();
      
      // Verify the webhook signature
      const isValid = verifyRazorpayWebhook(payload, signature);
      
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Handle different webhook events
      const event = payload.event;
      
      if (event === 'subscription.charged') {
        // Update subscription status in database
        const subscriptionId = payload.payload.subscription.entity.id;
        
        const { data: subscriptions, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('razorpay_subscription_id', subscriptionId);
        
        if (error) throw error;
        
        if (subscriptions && subscriptions.length > 0) {
          const subscription = subscriptions[0];
          
          // Update the subscription end date
          const endDate = new Date(subscription.end_date);
          if (subscription.billing_cycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          
          // Update subscription
          await supabase
            .from('user_subscriptions')
            .update({
              end_date: endDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);
        }
      }
      
      else if (event === 'subscription.cancelled') {
        // Update subscription status in database
        const subscriptionId = payload.payload.subscription.entity.id;
        
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_subscription_id', subscriptionId);
      }
      
      // Return a success response
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // For unknown endpoints
    else {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error(`Error in razorpay-integration function:`, error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
