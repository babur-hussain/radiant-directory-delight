import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Instamojo API credentials (replace with your production credentials)
const INSTAMOJO_API_KEY = Deno.env.get("INSTAMOJO_API_KEY") || "20610625a75622c10e0d8dce68fb0bef";
const INSTAMOJO_AUTH_TOKEN = Deno.env.get("INSTAMOJO_AUTH_TOKEN") || "f811ab70cae11e4f931b2d4ded9e6dc8";
const INSTAMOJO_SALT = Deno.env.get("INSTAMOJO_SALT") || "0edae1240d25438189b4c6108ef75c58";
const INSTAMOJO_BASE_URL = "https://api.instamojo.com/v2/payment_requests/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { packageData, customerData, userId } = await req.json();

    if (!packageData || !customerData || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters", details: { packageData, customerData, userId } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = (packageData.price || 0) + (packageData.setupFee || 0);
    const redirectUrl = `https://growbharatvyapaar.com/payment-success`;

    // Prepare Instamojo payment request payload
    const payload = {
      purpose: packageData.title || "Subscription Payment",
      amount: amount.toString(),
      buyer_name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      redirect_url: redirectUrl,
      send_email: true,
      send_sms: true,
      allow_repeated_payments: false
    };

    // Make request to Instamojo API
    const response = await fetch(INSTAMOJO_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": INSTAMOJO_API_KEY,
        "X-Auth-Token": INSTAMOJO_AUTH_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Log the Instamojo API response for debugging
    console.log('Instamojo API response:', JSON.stringify(data, null, 2));
    console.log('Instamojo API request payload:', JSON.stringify(payload, null, 2));
    console.log('Instamojo API response status:', response.status);

    if (!response.ok || !data.payment_request) {
      return new Response(
        JSON.stringify({ error: "Failed to create Instamojo payment request", details: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally, store transaction in DB
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      package_id: packageData.id,
      transaction_id: data.payment_request.id,
      amount: amount,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: data.payment_request.longurl,
        paymentRequestId: data.payment_request.id,
        amount: amount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 