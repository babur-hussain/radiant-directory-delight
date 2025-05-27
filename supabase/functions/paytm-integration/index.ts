
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Paytm configuration - replace with your actual credentials
const PAYTM_MID = Deno.env.get("PAYTM_MID") || "rxazcv89315285244163";
const PAYTM_KEY = Deno.env.get("PAYTM_KEY") || "";
const PAYTM_WEBSITE = Deno.env.get("PAYTM_WEBSITE") || "WEBSTAGING";
const PAYTM_ENVIRONMENT = Deno.env.get("PAYTM_ENVIRONMENT") || "TEST"; // TEST or PROD

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

// Generate a consistent transaction ID
function generateTransactionId(): string {
  return `TXN_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
}

// Generate checksum for Paytm
async function generateChecksum(params: any, key: string): Promise<string> {
  // This is a simplified checksum generation
  // In production, use Paytm's official checksum library
  const queryString = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(queryString + key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Calculate initial payment including setup fee and advance payments
function calculateInitialPayment(packageData: any): number {
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
    
    const { packageData, customerData, userId, referralId, enableAutoPay = true } = body;
    
    // Validate required fields
    if (!packageData || !userId || !customerData) {
      console.error("Missing required fields:", { packageData, userId, customerData });
      return new Response(
        JSON.stringify({ error: "Missing required fields: packageData, userId, and customerData" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate the initial payment amount including setup fee and advance payments
    const initialPaymentAmount = calculateInitialPayment(packageData);
    console.log(`Calculated initial payment amount: ${initialPaymentAmount}`);
    
    // Generate order ID and transaction token
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const txnToken = generateTransactionId();
    
    // Prepare Paytm parameters
    const paytmParams = {
      MID: PAYTM_MID,
      WEBSITE: PAYTM_WEBSITE,
      INDUSTRY_TYPE_ID: "Retail",
      CHANNEL_ID: "WEB",
      ORDER_ID: orderId,
      CUST_ID: customerData.custId,
      TXN_AMOUNT: initialPaymentAmount.toString(),
      CALLBACK_URL: `${req.headers.get("origin")}/payment-success`,
      EMAIL: customerData.email,
      MOBILE_NO: customerData.phone,
    };

    // Generate checksum if key is available
    let checksumHash = "";
    if (PAYTM_KEY) {
      checksumHash = await generateChecksum(paytmParams, PAYTM_KEY);
    }

    // For production, you would call Paytm's token generation API here
    // For now, we'll return the necessary data for frontend integration
    const response = {
      mid: PAYTM_MID,
      orderId: orderId,
      txnToken: txnToken, // In production, get this from Paytm's token API
      amount: initialPaymentAmount,
      currency: "INR",
      website: PAYTM_WEBSITE,
      industryType: "Retail",
      channelId: "WEB",
      callbackUrl: `${req.headers.get("origin")}/payment-success`,
      checksumHash: checksumHash,
      customerInfo: customerData,
      packageInfo: packageData,
      referralId: referralId,
      isOneTime: packageData.paymentType === 'one-time',
      isSubscription: packageData.paymentType === 'recurring',
      enableAutoPay: enableAutoPay && packageData.paymentType === 'recurring',
      setupFee: packageData.setupFee || 0,
      totalAmount: initialPaymentAmount,
      environment: PAYTM_ENVIRONMENT
    };

    console.log("Returning payment response:", response);

    return new Response(
      JSON.stringify(response),
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
