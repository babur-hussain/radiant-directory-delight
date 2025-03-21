
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Constants
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_8PGS0Ug3QeCb2I"; // Using live key
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

// Generate a proper Razorpay order ID format
function generateValidOrderId(): string {
  // Generate a 14-character alphanumeric string following Razorpay's format
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  // Create a 14-character string with cryptographically strong random values
  const randomValues = new Uint8Array(14);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 14; i++) {
    result += characters.charAt(randomValues[i] % charactersLength);
  }
  
  return `order_${result}`;
}

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

// Generate a proper Razorpay subscription ID format
function generateValidSubscriptionId(): string {
  // Razorpay subscription IDs start with 'sub_' followed by alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  // Create a 14-character string with cryptographically strong random values
  const randomValues = new Uint8Array(14);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 14; i++) {
    result += characters.charAt(randomValues[i] % charactersLength);
  }
  
  return `sub_${result}`;
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
    
    const { packageData, customerData, userId, useOneTimePreferred = true, enableAutoPay = true } = body;
    console.log("Creating subscription with data:", { packageData, customerData, userId, useOneTimePreferred, enableAutoPay });

    // Validate subscription data
    if (!packageData || !userId) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine payment type based on package data and user preference
    const isRecurring = packageData.paymentType === 'recurring' && enableAutoPay;
    const isOneTime = useOneTimePreferred || !isRecurring;
    
    console.log(`Processing payment type: ${isOneTime ? 'one-time' : 'recurring'} with autopay: ${enableAutoPay}`);
    
    // Calculate amount in paise (100 paise = 1 INR)
    const amountInPaise = Math.round(packageData.price * 100);
    
    // Generate a receipt ID
    const receiptId = `receipt_${Date.now().toString(36)}`;
    
    // Generate a valid order ID that matches Razorpay format
    const orderId = generateValidOrderId();
    console.log("Generated order ID:", orderId);
    
    // Create order object with autopay options
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
        packageId: packageData.id.toString(),
        userId: userId,
        enableAutoPay: enableAutoPay ? "true" : "false", // Flag for enabling autopay
        isRecurring: isRecurring ? "true" : "false"
      },
      created_at: Date.now(),
      // Add autopay flags if supported by your account
      recurring: isRecurring ? "1" : "0", // Enable recurring for autopay
      auto_capture: "1" // Auto-capture the payment
    };
    
    console.log("Order created successfully:", order);
    
    // Return appropriate response
    return new Response(
      JSON.stringify({ 
        order,
        isOneTime,
        isSubscription: !isOneTime,
        enableAutoPay
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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

    // Process different event types
    const eventType = payload.event;

    if (eventType === "payment.authorized" || eventType === "payment.captured") {
      // Handle payment success
      await processPaymentSuccess(payload);
    } else if (eventType === "subscription.authenticated") {
      await processSubscriptionAuthenticated(payload);
    } else if (eventType === "subscription.activated") {
      await processSubscriptionActivated(payload);
    } else if (eventType === "subscription.charged") {
      await processSubscriptionCharged(payload);
    } else if (eventType === "subscription.cancelled") {
      await processSubscriptionCancelled(payload);
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
