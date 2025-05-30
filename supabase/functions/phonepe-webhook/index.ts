
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const verifyChecksum = async (response: string, saltKey: string, saltIndex: string): Promise<boolean> => {
  try {
    const [receivedChecksum] = response.split('###')
    const encoder = new TextEncoder()
    const data = encoder.encode(response + saltKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const computedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return receivedChecksum === computedChecksum
  } catch (error) {
    console.error('Checksum verification error:', error)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get PhonePe configuration
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY') || ''
    const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1'
    
    if (!saltKey) {
      console.error('PhonePe salt key not configured')
      return new Response('Configuration error', { status: 500, headers: corsHeaders })
    }

    const body = await req.json()
    console.log('PhonePe Webhook received:', body)

    // Extract the response and verify checksum
    const xVerify = req.headers.get('X-VERIFY')
    if (!xVerify) {
      console.error('Missing X-VERIFY header')
      return new Response('Invalid request', { status: 400, headers: corsHeaders })
    }

    // Verify the checksum
    const isValidChecksum = await verifyChecksum(body.response, saltKey, saltIndex)
    if (!isValidChecksum) {
      console.error('Invalid checksum')
      return new Response('Invalid checksum', { status: 400, headers: corsHeaders })
    }

    // Decode the response
    const decodedResponse = JSON.parse(atob(body.response))
    console.log('Decoded PhonePe response:', decodedResponse)

    const { success, data, message } = decodedResponse

    if (success && data?.state === 'COMPLETED') {
      // Payment successful - update subscription in database
      const { merchantTransactionId, transactionId, amount } = data
      
      console.log(`Payment successful for transaction: ${merchantTransactionId}`)
      
      // Here you would typically:
      // 1. Update the user's subscription status in your database
      // 2. Send confirmation email
      // 3. Log the transaction
      
      // For now, we'll just log the successful payment
      console.log('Payment completed successfully:', {
        merchantTransactionId,
        transactionId,
        amount,
        state: data.state
      })
      
      return new Response(
        JSON.stringify({ status: 'success', message: 'Payment processed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('Payment failed or pending:', { success, message, state: data?.state })
      
      return new Response(
        JSON.stringify({ status: 'failed', message: message || 'Payment failed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('PhonePe webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
