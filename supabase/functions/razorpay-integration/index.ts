
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
    const { packageData } = await req.json();
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

    // For simplicity, we'll mock the plan creation
    // In a real implementation, you would call Razorpay API to create the plan
    const plan = {
      id: `plan_${packageData.id}`,
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

// Handle creating a new subscription
async function handleCreateSubscription(req: Request, user: any) {
  try {
    const { packageData, customerData, userId } = await req.json();
    console.log("Creating subscription with data:", { packageData, customerData, userId });

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

    // For simplicity, we'll mock the subscription creation
    // In a real implementation, you would call Razorpay API to create the subscription
    const subscription = {
      id: `sub_${Date.now()}`,
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
      },
      created_at: new Date().toISOString(),
    };

    console.log("Subscription created successfully:", subscription);
    return new Response(
      JSON.stringify({ subscription }),
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
