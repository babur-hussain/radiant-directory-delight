
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Constants - use live key for production
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_8PGS0Ug3QeCb2I";
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

// Generate a receipt ID for internal tracking
function generateReceiptId(): string {
  return `receipt_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
}

// Get the current timestamp in seconds (Razorpay format)
function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
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
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body, null, 2));
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
    
    // Validate required fields
    if (!packageData || !userId) {
      console.error("Missing required fields:", { packageData, userId });
      return new Response(
        JSON.stringify({ error: "Missing required fields: packageData and userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Creating subscription with data:", { 
      packageId: packageData.id, 
      userId, 
      useOneTimePreferred, 
      enableAutoPay 
    });

    // Determine payment type based on package data and user preference
    const isRecurring = packageData.paymentType === 'recurring' && enableAutoPay;
    const isOneTime = useOneTimePreferred || !isRecurring;
    
    console.log(`Processing payment type: ${isOneTime ? 'one-time' : 'recurring'} with autopay: ${enableAutoPay}`);
    
    // Calculate amount in paise (100 paise = 1 INR)
    const amountInPaise = Math.round(packageData.price * 100);
    
    // Generate a receipt ID
    const receiptId = generateReceiptId();
    
    // Key-only mode: Don't create an order or subscription ID
    // Instead, let Razorpay handle direct payment with just the key and amount
    
    console.log("Setting up direct key-only mode payment with amount:", amountInPaise);
    
    // Return successful response with payment details
    return new Response(
      JSON.stringify({ 
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise, // Make sure this is included in the response
        currency: "INR",
        name: "Grow Bharat Vyapaar",
        description: packageData.title || "Subscription payment",
        receipt: receiptId,
        notes: {
          packageId: packageData.id.toString(),
          userId: userId,
          enableAutoPay: enableAutoPay ? "true" : "false",
          isRecurring: isRecurring ? "true" : "false"
        },
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
