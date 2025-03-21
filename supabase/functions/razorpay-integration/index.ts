
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
    // Main request handling - simplified to handle the default case
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
    
    // Generate a valid order ID that exactly matches Razorpay format requirements
    const orderId = generateValidOrderId();
    console.log("Generated order ID:", orderId);
    
    // For subscription data
    const subscriptionData = isRecurring ? {
      id: `sub_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
      entity: "subscription",
      plan_id: `plan_${packageData.id}`,
      customer_id: userId,
      status: "created",
      current_start: Date.now(),
      current_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      ended_at: null,
      quantity: 1,
      notes: {
        packageId: packageData.id.toString(),
        userId: userId,
        enableAutoPay: enableAutoPay ? "true" : "false"
      }
    } : null;
    
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
      created_at: Date.now()
    };
    
    console.log("Order created successfully:", order);
    
    // Return appropriate response
    return new Response(
      JSON.stringify({ 
        order,
        subscription: subscriptionData,
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
