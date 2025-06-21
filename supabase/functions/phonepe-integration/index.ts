// This file is for Supabase Edge Functions (Deno runtime). TypeScript errors in VSCode are expected and safe to ignore for Deno-specific APIs.
// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allow string for environment to avoid TS error
interface PhonePeConfig {
  merchantId: string
  saltKey: string
  saltIndex: string
  environment: string // 'UAT' | 'PRODUCTION' but allow string for TS
}

const getPhonePeConfig = (): PhonePeConfig => {
  const config = {
    // @ts-expect-error Deno.env
    merchantId: Deno.env.get('PHONEPE_MERCHANT_ID'),
    // @ts-expect-error Deno.env
    saltKey: Deno.env.get('PHONEPE_SALT_KEY'),
    saltIndex: '1',
    environment: 'PRODUCTION' as string
  }

  console.log('PhonePe Config:', {
    merchantId: config.merchantId ? 'Set' : 'Not Set',
    saltKey: config.saltKey ? 'Set' : 'Not Set',
    saltIndex: config.saltIndex,
    environment: config.environment
  })

  if (!config.merchantId || !config.saltKey) {
    throw new Error('Missing required PhonePe configuration')
  }

  return config
}

// PhonePe API endpoints according to official documentation
const IS_PROD = true; // Set to false for UAT
const PHONEPE_API_PATH = '/apis/hermes/pg/v1/pay';
const PHONEPE_API_URL = IS_PROD
  ? `https://api.phonepe.com${PHONEPE_API_PATH}`
  : `https://api-preprod.phonepe.com${PHONEPE_API_PATH}`;

// Unicode-safe base64 encoding
const encodeBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

// Generate checksum according to PhonePe documentation
const generateChecksum = async (payload: string, saltKey: string, saltIndex: string): Promise<string> => {
  try {
    // Create the string to hash: payload + /apis/hermes/pg/v1/pay + saltKey
    const stringToHash = payload + PHONEPE_API_PATH + saltKey;
    
    // Convert to Uint8Array for SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToHash);
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return hash + ### + saltIndex
    return hashHex + '###' + saltIndex;
  } catch (error) {
    console.error('Error generating checksum:', error);
    throw new Error('Failed to generate checksum');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { packageData, customerData, userId, referralId, enableAutoPay } = await req.json()

    // Validate all required fields
    if (!packageData || !customerData || !userId) {
      console.error('Missing required parameters', { packageData, customerData, userId });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', details: { packageData, customerData, userId } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = getPhonePeConfig()
    if (!config.saltKey) {
      return new Response(
        JSON.stringify({ error: 'PhonePe configuration not complete - missing salt key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate amount in paise (multiply by 100) - PhonePe expects amount in paise
    const amount = Math.round((packageData.price + (packageData.setupFee || 0)) * 100)
    const merchantTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Always use production base URL for redirect and callback
    const baseUrl = 'https://growbharatvyapaar.com';
    const redirectUrl = `${baseUrl}/payment-success?txnId=${merchantTransactionId}&status=SUCCESS`;
    const callbackUrl = `${baseUrl}/api/phonepe-webhook`;

    // Prepare PhonePe payload according to official documentation
    const paymentPayload = {
      merchantId: config.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.substring(0, 36), // PhonePe expects max 36 characters
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    // Encode payload to base64 (Unicode-safe)
    const payloadString = JSON.stringify(paymentPayload)
    const payloadBase64 = encodeBase64(payloadString)
    const checksum = await generateChecksum(payloadBase64, config.saltKey, config.saltIndex)

    // Log all request details for debugging
    console.log('PhonePe Request Details:', {
      url: PHONEPE_API_URL,
      merchantId: config.merchantId,
      merchantTransactionId: merchantTransactionId,
      amount: amount,
      redirectUrl: redirectUrl,
      callbackUrl: callbackUrl,
      payloadBase64: payloadBase64.substring(0, 100) + '...', // Log first 100 chars
      checksum: checksum.substring(0, 50) + '...' // Log first 50 chars
    });

    // Make request to PhonePe API with proper headers
    const phonePeResponse = await fetch(PHONEPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: payloadBase64 })
    })

    // Get response text first
    const responseText = await phonePeResponse.text();
    console.log('PhonePe Raw Response:', responseText);

    let phonePeData = {};
    try {
      phonePeData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse PhonePe response:', parseError);
      phonePeData = { raw: responseText };
    }

    if (!phonePeResponse.ok) {
      console.error('PhonePe API Error Response:', {
        status: phonePeResponse.status,
        statusText: phonePeResponse.statusText,
        data: phonePeData
      });
      return new Response(
        JSON.stringify({
          error: 'Payment initiation failed',
          details: phonePeData,
          status: phonePeResponse.status,
          statusText: phonePeResponse.statusText
        }),
        { status: phonePeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for successful response and extract payment URL
    if ((phonePeData as any)?.success && (phonePeData as any)?.data?.instrumentResponse?.redirectInfo?.url) {
      const paymentUrl = (phonePeData as any).data.instrumentResponse.redirectInfo.url;
      
      console.log('PhonePe Payment URL generated:', paymentUrl);

      // Store transaction details in database
      const supabase = createClient(
        // @ts-expect-error Deno.env
        Deno.env.get('SUPABASE_URL')!,
        // @ts-expect-error Deno.env
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          package_id: packageData.id,
          transaction_id: merchantTransactionId,
          amount: amount / 100,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Failed to store transaction:', dbError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: paymentUrl,
          merchantTransactionId: merchantTransactionId,
          amount: amount / 100
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('PhonePe payment initiation failed - invalid response structure:', phonePeData)
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: (phonePeData as any).message || 'Invalid response structure from PhonePe',
          response: phonePeData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('PhonePe integration error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
