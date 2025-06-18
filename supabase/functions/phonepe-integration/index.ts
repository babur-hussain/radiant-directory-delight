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

// PhonePe API endpoint and path
const PHONEPE_API_PATH = '/apis/hermes/pg/v1/pay'; // Update this if PhonePe provides a new path
const PHONEPE_API_URL = `https://api.phonepe.com${PHONEPE_API_PATH}`;
// For UAT testing, use:
// const PHONEPE_API_URL = `https://api-preprod.phonepe.com${PHONEPE_API_PATH}`;

// Unicode-safe base64 encoding
const encodeBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

const generateChecksum = async (payload: string, saltKey: string, saltIndex: string): Promise<string> => {
  // Use the API path variable for checksum
  const encoder = new TextEncoder();
  const data = encoder.encode(payload + PHONEPE_API_PATH + saltKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex + '###' + saltIndex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { packageData, customerData, userId, referralId, enableAutoPay } = await req.json()

    if (!packageData || !customerData || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const config = getPhonePeConfig()
    
    if (!config.saltKey) {
      return new Response(
        JSON.stringify({ error: 'PhonePe configuration not complete - missing salt key' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate amount in paise (multiply by 100)
    const amount = (packageData.price + (packageData.setupFee || 0)) * 100
    const merchantTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Always use production base URL for redirect and callback
    const baseUrl = 'https://growbharatvyapaar.com';
    const redirectUrl = `${baseUrl}/payment-success?txnId=${merchantTransactionId}&status=SUCCESS`;
    const callbackUrl = `${baseUrl}/api/phonepe-webhook`;

    // Prepare PhonePe payload
    const paymentPayload = {
      merchantId: config.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.substring(0, 36),
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    console.log('PhonePe Payment Payload:', paymentPayload)

    // Encode payload to base64 (Unicode-safe)
    const payloadString = JSON.stringify(paymentPayload)
    const payloadBase64 = encodeBase64(payloadString)
    
    // Generate checksum
    const checksum = await generateChecksum(payloadBase64, config.saltKey, config.saltIndex)

    // Make request to PhonePe API (configurable for PROD/UAT)
    console.log('Making request to PhonePe API:', PHONEPE_API_URL)

    const phonePeResponse = await fetch(PHONEPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({
        request: payloadBase64
      })
    })

    if (!phonePeResponse.ok) {
      console.error('PhonePe API error:', {
        status: phonePeResponse.status,
        statusText: phonePeResponse.statusText
      });
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: `PhonePe API error: ${phonePeResponse.status} ${phonePeResponse.statusText}` 
        }),
        { 
          status: phonePeResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const phonePeData = await phonePeResponse.json()
    console.log('PhonePe Response:', phonePeData)

    if (phonePeData.success && phonePeData.data?.instrumentResponse?.redirectInfo?.url) {
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
          paymentUrl: phonePeData.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: merchantTransactionId,
          amount: amount / 100
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.error('PhonePe payment initiation failed:', phonePeData)
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: phonePeData.message || 'Unknown error' 
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
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
