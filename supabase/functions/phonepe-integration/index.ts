
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PhonePeConfig {
  merchantId: string
  saltKey: string
  saltIndex: string
  environment: 'UAT' | 'PRODUCTION'
}

const getPhonePeConfig = (): PhonePeConfig => {
  return {
    merchantId: Deno.env.get('PHONEPE_MERCHANT_ID') || 'GROWBHARATPAY',
    saltKey: Deno.env.get('PHONEPE_SALT_KEY') || '',
    saltIndex: Deno.env.get('PHONEPE_SALT_INDEX') || '1',
    environment: 'PRODUCTION'
  }
}

const generateChecksum = async (payload: string, saltKey: string, saltIndex: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + '/pg/v1/pay' + saltKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex + '###' + saltIndex
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
    
    // Create redirect URLs for production
    const baseUrl = req.headers.get('origin') || 'https://growbharatvyapaar.com'
    const redirectUrl = `${baseUrl}/payment-success?txnId=${merchantTransactionId}&status=SUCCESS`
    const callbackUrl = `${req.url.split('/functions/')[0]}/functions/v1/phonepe-webhook`

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

    // Encode payload to base64
    const payloadString = JSON.stringify(paymentPayload)
    const payloadBase64 = btoa(payloadString)
    
    // Generate checksum
    const checksum = await generateChecksum(payloadBase64, config.saltKey, config.saltIndex)

    // Make request to PhonePe PRODUCTION API
    const phonePeUrl = 'https://api.phonepe.com/apis/hermes/pg/v1/pay'

    console.log('Making request to PhonePe production API:', phonePeUrl)

    const phonePeResponse = await fetch(phonePeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({
        request: payloadBase64
      })
    })

    const phonePeData = await phonePeResponse.json()
    console.log('PhonePe Response:', phonePeData)

    if (phonePeData.success && phonePeData.data?.instrumentResponse?.redirectInfo?.url) {
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
