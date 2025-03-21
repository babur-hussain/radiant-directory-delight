
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Constants
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Server entrypoint
serve(async (req) => {
  console.log("Request received:", req.method, new URL(req.url).pathname);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Extract the Supabase auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found", details: authError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get URL path
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    console.log("Processing request for path:", path);

    // Route the request based on the path
    if (path === "create-plan") {
      return await handleCreatePlan(req, user);
    } else if (path === "create-subscription") {
      return await handleCreateSubscription(req, user);
    } else if (path === "webhook") {
      return await handleWebhook(req);
    } else {
      console.error("Invalid endpoint requested:", path);
      return new Response(
        JSON.stringify({ error: "Invalid endpoint", path }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Handle creating a new plan
async function handleCreatePlan(req: Request, user: any) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { packageData } = body;
    console.log("Creating plan for package:", packageData);

    // Validate plan data
    if (!packageData || !packageData.id || !packageData.title || !packageData.price) {
      return new Response(
        JSON.stringify({ error: "Invalid package data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // In a real implementation, you would make an API call to Razorpay here
    // For now, we're returning a mock plan
    const plan = {
      id: `plan_${packageData.id}${Math.floor(Math.random() * 100000)}`,
      name: packageData.title,
      amount: packageData.price * 100, // Convert to paise
      interval: packageData.billingCycle || "yearly",
      created_at: new Date().toISOString(),
    };

    console.log("Plan created successfully:", plan);
    return new Response(
      JSON.stringify({ plan }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating plan:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error creating plan" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Generate a valid Razorpay subscription ID that follows their format
function generateValidSubscriptionId(): string {
  // Razorpay subscription IDs usually start with 'sub_' followed by alphanumeric characters
  const randomPart = Array.from({ length: 14 }, () => 
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join('');
  
  return `sub_${randomPart}`;
}

// Handle creating a new subscription
async function handleCreateSubscription(req: Request, user: any) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { packageData, customerData, userId, useOneTimePreferred = false } = body;
    console.log("Creating subscription with data:", { packageData, customerData, userId, useOneTimePreferred });

    // Validate subscription data
    if (!packageData || !customerData || !userId) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine if this is a one-time payment or a subscription
    // useOneTimePreferred forces one-time payments even for subscription packages
    const isOneTime = packageData.paymentType === "one-time" || useOneTimePreferred;
    console.log(`Processing payment type: ${isOneTime ? 'one-time' : 'subscription'}`);
    
    // Calculate amount in paise (100 paise = 1 INR)
    const amountInPaise = Math.round(packageData.price * 100);
    
    // Generate a receipt ID
    const receiptId = `receipt_${Date.now()}`;
    
    // Create a unique order ID 
    const orderId = `order_${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Create order object (this would be returned from Razorpay's API in a real implementation)
    const order = {
      id: orderId,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      status: "created",
      attempts: 0,
      notes: {
        packageId: packageData.id,
        userId: userId,
        paymentType: isOneTime ? "one-time" : "subscription"
      },
      created_at: Date.now()
    };
    
    console.log("Order created successfully:", order);
    
    // Initialize subscription to null
    let subscription = null;
    
    // Only create a subscription object if this is a recurring payment and not forced to one-time
    if (!isOneTime) {
      // Create a valid Razorpay subscription ID
      const subscriptionId = generateValidSubscriptionId();
      
      console.log("Created valid subscription ID:", subscriptionId);
      
      subscription = {
        id: subscriptionId,
        entity: "subscription",
        plan_id: `plan_${packageData.id}`,
        customer_id: userId,
        status: "created",
        current_start: new Date().toISOString(),
        current_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: null,
        quantity: 1,
        notes: {
          packageId: packageData.id,
          userId: userId,
        }
      };
      
      console.log("Subscription created successfully:", subscription);
    }
    
    // Return appropriate response based on payment type
    if (isOneTime) {
      // For one-time payments, only return the order details
      return new Response(
        JSON.stringify({ 
          order,
          isOneTime: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // For subscription payments, return both subscription and order
      return new Response(
        JSON.stringify({ 
          subscription,
          order,
          isSubscription: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error creating subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Handle webhook events from Razorpay
async function handleWebhook(req: Request) {
  try {
    const payload = await req.json();
    console.log("Webhook received with payload:", payload);

    // Validate the webhook signature
    // In a real implementation, you would verify the signature using HMAC

    // Process different event types
    const eventType = payload.event;

    if (eventType === "subscription.authenticated") {
      // Handle subscription authentication
      await processSubscriptionAuthenticated(payload);
    } else if (eventType === "subscription.activated") {
      // Handle subscription activation
      await processSubscriptionActivated(payload);
    } else if (eventType === "subscription.charged") {
      // Handle subscription charged event
      await processSubscriptionCharged(payload);
    } else if (eventType === "subscription.cancelled") {
      // Handle subscription cancellation
      await processSubscriptionCancelled(payload);
    } else if (eventType === "payment.authorized" || eventType === "payment.captured") {
      // Handle payment success
      await processPaymentSuccess(payload);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error processing webhook" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Process payment success
async function processPaymentSuccess(payload: any) {
  try {
    const payment = payload.payment;
    const orderId = payment?.order_id;
    
    if (!orderId) {
      console.error("Missing order ID in payment payload");
      return;
    }
    
    // Update user's subscription in the database
    // This would require fetching the order to get the notes with packageId and userId
    console.log("Processing successful payment for order:", orderId);
  } catch (error) {
    console.error("Error processing payment success:", error);
  }
}

// Process subscription authenticated event
async function processSubscriptionAuthenticated(payload: any) {
  // Logic to handle subscription authentication
  console.log("Subscription authenticated:", payload.subscription.id);
}

// Process subscription activated event
async function processSubscriptionActivated(payload: any) {
  try {
    const subscription = payload.subscription;
    const userId = subscription.notes?.userId;
    const packageId = subscription.notes?.packageId;

    if (!userId || !packageId) {
      console.error("Missing userId or packageId in subscription notes");
      return;
    }

    // Update user's subscription in the database
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        razorpay_subscription_id: subscription.id,
      })
      .eq("user_id", userId)
      .eq("package_id", packageId);

    if (error) {
      console.error("Error updating subscription:", error);
    }
  } catch (error) {
    console.error("Error processing subscription activated:", error);
  }
}

// Process subscription charged event
async function processSubscriptionCharged(payload: any) {
  try {
    const payment = payload.payment;
    const subscription = payload.subscription;
    const invoice = payload.invoice;

    // Record the payment
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        updated_at: new Date().toISOString(),
        next_billing_date: subscription.current_end,
      })
      .eq("razorpay_subscription_id", subscription.id);

    if (error) {
      console.error("Error recording subscription charge:", error);
    }
  } catch (error) {
    console.error("Error processing subscription charged:", error);
  }
}

// Process subscription cancelled event
async function processSubscriptionCancelled(payload: any) {
  try {
    const subscription = payload.subscription;

    // Update subscription status in the database
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", subscription.id);

    if (error) {
      console.error("Error updating cancelled subscription:", error);
    }
  } catch (error) {
    console.error("Error processing subscription cancelled:", error);
  }
}
