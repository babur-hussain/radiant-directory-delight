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
      
      // Get the subscription details
      const { data: subscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('transaction_id', merchantTransactionId)
        .single()

      if (fetchError) {
        console.error('Failed to fetch subscription:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch subscription details' }),
          { status: 500, headers: corsHeaders }
        )
      }

      if (!subscription) {
        console.error('Subscription not found for transaction:', merchantTransactionId)
        return new Response(
          JSON.stringify({ error: 'Subscription not found' }),
          { status: 404, headers: corsHeaders }
        )
      }

      // Update subscription status in database
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          transaction_id: transactionId,
          payment_id: data.paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', merchantTransactionId)
      
      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription status' }),
          { status: 500, headers: corsHeaders }
        )
      }

      // Update user's subscription status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.user_id)

      if (userUpdateError) {
        console.error('Failed to update user subscription status:', userUpdateError)
      }
      
      console.log('Subscription status updated successfully')
      
      return new Response(
        JSON.stringify({ 
          status: 'success', 
          message: 'Payment processed successfully',
          transactionId,
          amount
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log('Payment failed or pending:', { success, message, state: data?.state })
      
      // Update subscription status to failed
      if (data?.merchantTransactionId) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', data.merchantTransactionId)

        if (updateError) {
          console.error('Failed to update failed subscription status:', updateError)
        }
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'failed', 
          message: message || 'Payment failed',
          state: data?.state
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('PhonePe webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
