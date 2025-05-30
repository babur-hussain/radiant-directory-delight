
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Paytm configuration - using demo credentials for production testing
const PAYTM_MID = Deno.env.get("PAYTM_MID") || "rxazcv89315285244163";
const PAYTM_KEY = Deno.env.get("PAYTM_KEY") || "bKMfNxPPf_QdZppa";
const PAYTM_WEBSITE = Deno.env.get("PAYTM_WEBSITE") || "WEBSTAGING";
const PAYTM_ENVIRONMENT = "PROD"; // Always use PROD for live transactions

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

// Helper function to create error response
function createErrorResponse(message: string, status = 500) {
  return new Response(
    JSON.stringify({ 
      error: message,
      success: false,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Helper function to create success response
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({ 
      ...data,
      success: true,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Generate checksum for Paytm using crypto API
async function generateChecksum(params: any, key: string): Promise<string> {
  try {
    const queryString = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(queryString + key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating checksum:', error);
    throw new Error('Failed to generate payment checksum');
  }
}

// Generate transaction token from Paytm
async function getTransactionToken(params: any): Promise<string> {
  const paytmUrl = PAYTM_ENVIRONMENT === 'PROD' 
    ? `https://securegw.paytm.in/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${params.ORDER_ID}`
    : `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${params.ORDER_ID}`;

  const body = {
    body: {
      requestType: "Payment",
      mid: PAYTM_MID,
      websiteName: PAYTM_WEBSITE,
      orderId: params.ORDER_ID,
      callbackUrl: params.CALLBACK_URL,
      txnAmount: {
        value: params.TXN_AMOUNT,
        currency: "INR",
      },
      userInfo: {
        custId: params.CUST_ID,
        email: params.EMAIL,
        mobile: params.MOBILE_NO,
      },
    },
  };

  try {
    const checksum = await generateChecksum(body, PAYTM_KEY);
    
    console.log(`Making request to Paytm URL: ${paytmUrl}`);
    
    const response = await fetch(paytmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MID': PAYTM_MID,
        'X-CHECKSUM': checksum,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Paytm API request failed with status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Paytm API response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Paytm response as JSON:', responseText);
      throw new Error('Invalid response format from Paytm API');
    }
    
    if (result.body?.resultInfo?.resultStatus === 'S') {
      return result.body.txnToken;
    } else {
      const errorMsg = result.body?.resultInfo?.resultMsg || 'Unknown error from Paytm';
      throw new Error(`Paytm API error: ${errorMsg}`);
    }
  } catch (error) {
    console.error('Error in getTransactionToken:', error);
    throw error;
  }
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
  console.log("Paytm Integration Request:", req.method, new URL(req.url).pathname);
  
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
      console.log("Request body received:", JSON.stringify(body, null, 2));
    } catch (e) {
      console.error("Error parsing request body:", e);
      return createErrorResponse("Invalid request body - must be valid JSON", 400);
    }
    
    const { packageData, customerData, userId, referralId, enableAutoPay = true } = body;
    
    // Validate required fields
    if (!packageData || !userId || !customerData) {
      console.error("Missing required fields:", { packageData: !!packageData, userId: !!userId, customerData: !!customerData });
      return createErrorResponse("Missing required fields: packageData, userId, and customerData", 400);
    }

    // Validate customer data
    if (!customerData.custId || !customerData.email) {
      return createErrorResponse("Customer data must include custId and email", 400);
    }

    // Calculate the initial payment amount including setup fee and advance payments
    const initialPaymentAmount = calculateInitialPayment(packageData);
    console.log(`Calculated initial payment amount: ${initialPaymentAmount}`);
    
    if (initialPaymentAmount <= 0) {
      return createErrorResponse("Invalid payment amount calculated", 400);
    }
    
    // Generate order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    console.log(`Generated order ID: ${orderId}`);
    
    // Get the origin for callback URL
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Prepare Paytm parameters for transaction token
    const paytmParams = {
      MID: PAYTM_MID,
      WEBSITE: PAYTM_WEBSITE,
      INDUSTRY_TYPE_ID: "Retail",
      CHANNEL_ID: "WEB",
      ORDER_ID: orderId,
      CUST_ID: customerData.custId,
      TXN_AMOUNT: initialPaymentAmount.toString(),
      CALLBACK_URL: `${origin}/payment-success`,
      EMAIL: customerData.email,
      MOBILE_NO: customerData.phone || "9999999999",
    };

    console.log("Paytm parameters:", paytmParams);

    // Get transaction token from Paytm
    let txnToken;
    try {
      txnToken = await getTransactionToken(paytmParams);
      console.log('Transaction token obtained successfully');
    } catch (error) {
      console.error('Failed to get transaction token:', error);
      return createErrorResponse(`Failed to initialize payment: ${error.message}`, 500);
    }

    // Return the payment configuration for frontend
    const response = {
      mid: PAYTM_MID,
      orderId: orderId,
      txnToken: txnToken,
      amount: initialPaymentAmount,
      currency: "INR",
      website: PAYTM_WEBSITE,
      industryType: "Retail",
      channelId: "WEB",
      callbackUrl: `${origin}/payment-success`,
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
    return createSuccessResponse(response);

  } catch (error) {
    console.error("Unhandled error in Paytm integration:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error", 
      500
    );
  }
});
