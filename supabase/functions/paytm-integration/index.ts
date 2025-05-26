
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Constants - use demo credentials
const PAYTM_MID = Deno.env.get("PAYTM_MID") || "rxazcv89315285244163";
const PAYTM_KEY = Deno.env.get("PAYTM_KEY") || "demo_key";

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

// Generate a consistent transaction ID
function generateTransactionId(): string {
  return `TXN_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
}

// Calculate initial payment including setup fee and advance payments
function calculateInitialPayment(packageData: any, enableAutoPay: boolean): number {
  if (!packageData) return 0;
  
  // One-time payment case - Include setup fee for one-time packages
  if (packageData.paymentType === 'one-time') {
    const total = (packageData.price || 0) + (packageData.setupFee || 0);
    console.log(`One-time payment: ${packageData.price} + ${packageData.setupFee} (setup fee) = ${total}`);
    return total;
  }
  
  // Recurring payment case
  let initialAmount = packageData.setupFee || 0;
  const advanceMonths = packageData.advancePaymentMonths || 0;
  
  // Add advance payment if specified
  if (advanceMonths > 0) {
    if (packageData.billingCycle === 'monthly' && packageData.monthlyPrice) {
      initialAmount += (packageData.monthlyPrice * advanceMonths);
    } else {
      // For yearly billing or when monthlyPrice is not available
      initialAmount += packageData.price || 0;
    }
  }
  
  console.log(`Recurring payment initial amount: ${packageData.setupFee} (setup fee) + ${initialAmount - (packageData.setupFee || 0)} (advance payment) = ${initialAmount}`);
  return initialAmount;
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
    const isOneTime = packageData.paymentType === 'one-time' || useOneTimePreferred || !isRecurring;
    
    console.log(`Processing payment type: ${isOneTime ? 'one-time' : 'recurring'} with autopay: ${enableAutoPay}`);
    
    // Calculate the initial payment amount including setup fee and advance payments
    const initialPaymentAmount = calculateInitialPayment(packageData, enableAutoPay);
    console.log(`Calculated initial payment amount: ${initialPaymentAmount}`);
    
    // Generate order ID and transaction token
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const txnToken = generateTransactionId();
    
    // Return successful response with payment details
    return new Response(
      JSON.stringify({ 
        mid: PAYTM_MID,
        orderId: orderId,
        txnToken: txnToken,
        amount: initialPaymentAmount,
        currency: "INR",
        website: "WEBSTAGING",
        industryType: "Retail",
        channelId: "WEB",
        callbackUrl: `${req.headers.get("origin")}/payment-success`,
        isOneTime,
        isSubscription: !isOneTime,
        enableAutoPay: enableAutoPay && !isOneTime,
        setupFee: packageData.setupFee || 0,
        totalAmount: initialPaymentAmount,
        // Critical flags to prevent auto-refund
        autoRefund: false,
        isRefundable: false, 
        isNonRefundable: true,
        refundPolicy: "no_refunds",
        transaction_id: txnToken
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
