import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Constants - use live key
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

// Generate a consistent transaction ID
function generateTransactionId(): string {
  return `txn_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
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

// Calculate the total package price for the full duration
function calculateTotalPackagePrice(packageData: any): number {
  if (!packageData) return 0;
  
  // One-time payment case - Include setup fee in total package price
  if (packageData.paymentType === 'one-time') {
    const total = (packageData.price || 0) + (packageData.setupFee || 0);
    console.log(`One-time total price: ${packageData.price} + ${packageData.setupFee} (setup fee) = ${total}`);
    return total;
  }
  
  // For recurring packages
  const durationMonths = packageData.durationMonths || 12;
  const setupFee = packageData.setupFee || 0;
  
  // Calculate total based on billing cycle
  let recurringTotal = 0;
  if (packageData.billingCycle === 'monthly' && packageData.monthlyPrice) {
    recurringTotal = packageData.monthlyPrice * durationMonths;
  } else {
    // For yearly billing
    const yearlyPrice = packageData.price || 0;
    const totalYears = Math.ceil(durationMonths / 12);
    recurringTotal = yearlyPrice * totalYears;
  }
  
  const total = setupFee + recurringTotal;
  console.log(`Recurring total price: ${setupFee} (setup fee) + ${recurringTotal} (recurring) = ${total}`);
  return total;
}

// Calculate the remaining amount to be paid after the initial payment
function calculateRemainingAmount(packageData: any, initialPayment: number): number {
  const totalPrice = calculateTotalPackagePrice(packageData);
  return Math.max(0, totalPrice - initialPayment);
}

// Calculate how many recurring payments will be needed based on package duration
function calculateRecurringPaymentCount(packageData: any): number {
  if (!packageData || packageData.paymentType === 'one-time') return 0;
  
  const durationMonths = packageData.durationMonths || 12;
  const advanceMonths = packageData.advancePaymentMonths || 0;
  
  // No recurring payments if advance months covers the whole duration
  if (advanceMonths >= durationMonths) return 0;
  
  if (packageData.billingCycle === 'monthly') {
    // For monthly billing, it's just the remaining months
    return durationMonths - advanceMonths;
  } else {
    // For yearly billing, calculate remaining years (rounded up)
    const remainingMonths = durationMonths - advanceMonths;
    return Math.ceil(remainingMonths / 12);
  }
}

// Calculate the amount for each recurring payment
function calculateRecurringPaymentAmount(packageData: any): number {
  if (!packageData || packageData.paymentType === 'one-time') return 0;
  
  if (packageData.billingCycle === 'monthly' && packageData.monthlyPrice) {
    return packageData.monthlyPrice;
  } else {
    return packageData.price || 0;
  }
}

// Calculate the next billing date after advance months
function calculateNextBillingDate(packageData: any): string {
  const today = new Date();
  const advanceMonths = packageData.advancePaymentMonths || 0;
  
  // Add advance months to the current date
  today.setMonth(today.getMonth() + (advanceMonths > 0 ? advanceMonths : 1));
  
  return today.toISOString();
}

// Calculate package end date
function calculatePackageEndDate(packageData: any): string {
  const today = new Date();
  const durationMonths = packageData.durationMonths || 12;
  
  // Add total duration to the current date
  today.setMonth(today.getMonth() + durationMonths);
  
  return today.toISOString();
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
    
    // For one-time packages, always use one-time payment regardless of enableAutoPay
    const isOneTime = packageData.paymentType === 'one-time' || useOneTimePreferred || !isRecurring;
    
    console.log(`Processing payment type: ${isOneTime ? 'one-time' : 'recurring'} with autopay: ${enableAutoPay}`);
    
    // Calculate the initial payment amount including setup fee and advance payments
    const initialPaymentAmount = calculateInitialPayment(packageData, enableAutoPay);
    console.log(`Calculated initial payment amount: ${initialPaymentAmount}`);
    
    // Calculate total package price
    const totalPackagePrice = calculateTotalPackagePrice(packageData);
    console.log(`Total package price: ${totalPackagePrice}`);
    
    // Calculate remaining amount for autopay
    const remainingAmount = calculateRemainingAmount(packageData, initialPaymentAmount);
    console.log(`Remaining amount for autopay: ${remainingAmount}`);
    
    // Calculate recurring payment details
    const recurringPaymentAmount = calculateRecurringPaymentAmount(packageData);
    const recurringPaymentCount = calculateRecurringPaymentCount(packageData);
    console.log(`Recurring payment amount: ${recurringPaymentAmount}, count: ${recurringPaymentCount}`);
    
    // Calculate next billing date and package end date
    const nextBillingDate = calculateNextBillingDate(packageData);
    const packageEndDate = calculatePackageEndDate(packageData);
    console.log(`Next billing: ${nextBillingDate}, End date: ${packageEndDate}`);
    
    // Calculate amount in paise (100 paise = 1 INR)
    const amountInPaise = Math.round(initialPaymentAmount * 100);
    console.log(`Amount in paise: ${amountInPaise}`);
    
    // Generate a receipt ID
    const receiptId = generateReceiptId();
    
    // Generate a unique transaction ID to track and prevent refunds
    const transactionId = generateTransactionId();
    
    // Create autopay details object for structured response
    const autopayDetails = {
      enabled: enableAutoPay && isRecurring && !isOneTime,
      nextBillingDate: nextBillingDate,
      recurringAmount: recurringPaymentAmount,
      remainingPayments: recurringPaymentCount,
      totalRemainingAmount: remainingAmount
    };
    
    // Optimize notes to stay under 15 key limit - THIS IS THE KEY FIX
    // Only include the most important fields, max 6 keys to be safe
    const notes = {
      packageId: packageData.id.toString(),
      userId: userId,
      isNonRefundable: "true",
      refundStatus: "no_refund_allowed", 
      transaction_id: transactionId,
      refundPolicy: "no_refunds"
    };
    
    // Return successful response with payment details
    return new Response(
      JSON.stringify({ 
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise, // Make sure this is included in the response
        currency: "INR",
        name: "Grow Bharat Vyapaar",
        description: packageData.title || "Subscription payment",
        notes: notes,
        isOneTime,
        isSubscription: !isOneTime,
        enableAutoPay: enableAutoPay && !isOneTime,
        setupFee: packageData.setupFee || 0,
        totalAmount: totalPackagePrice,
        remainingAmount: remainingAmount,
        autopayDetails: autopayDetails,
        // Critical flags to prevent auto-refund - separate from notes
        autoRefund: false,
        isRefundable: false, 
        isNonRefundable: true,
        refundPolicy: "no_refunds",
        transaction_id: transactionId
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
