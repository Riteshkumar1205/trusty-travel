import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { encode as hexEncode } from 'https://deno.land/std@0.208.0/encoding/hex.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface VerifyOTPRequest {
  deliveryId: string
  otpType: 'pickup' | 'delivery'
  enteredOtp: string
}

const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15

async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(otp)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return new TextDecoder().decode(hexEncode(hashArray))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { deliveryId, otpType, enteredOtp }: VerifyOTPRequest = await req.json()

    // Validate input
    if (!deliveryId || !otpType || !enteredOtp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (otpType !== 'pickup' && otpType !== 'delivery') {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP type', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!/^\d{4}$/.test(enteredOtp)) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP format', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting: check recent attempts
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count: attemptCount, error: countError } = await supabaseAdmin
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_id', deliveryId)
      .eq('user_id', user.id)
      .eq('otp_type', otpType)
      .gte('attempted_at', windowStart)

    if (countError) {
      console.error('Error checking rate limit:', countError.message)
    }

    if ((attemptCount ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.', verified: false }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the attempt
    await supabaseAdmin.from('otp_attempts').insert({
      delivery_id: deliveryId,
      user_id: user.id,
      otp_type: otpType,
    })

    // Fetch the delivery record
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from('deliveries')
      .select('id, sender_id, traveler_id, pickup_otp, delivery_otp, pickup_otp_expires_at, delivery_otp_expires_at, status')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      return new Response(
        JSON.stringify({ error: 'Delivery not found', verified: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is a participant
    if (delivery.sender_id !== user.id && delivery.traveler_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', verified: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the stored OTP hash and expiration
    const storedOtpHash = otpType === 'pickup' ? delivery.pickup_otp : delivery.delivery_otp
    const otpExpiresAt = otpType === 'pickup' ? delivery.pickup_otp_expires_at : delivery.delivery_otp_expires_at

    if (!storedOtpHash) {
      return new Response(
        JSON.stringify({ error: 'OTP not set for this delivery', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check expiration
    if (otpExpiresAt && new Date(otpExpiresAt) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'OTP has expired. Please request a new one.', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash the entered OTP and compare
    const enteredHash = await hashOtp(enteredOtp)

    if (enteredHash !== storedOtpHash) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Invalid OTP' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // OTP is correct - update delivery status
    const newStatus = otpType === 'pickup' ? 'picked-up' : 'delivered'
    const updateField = otpType === 'pickup' ? 'pickup_at' : 'delivered_at'

    const { error: updateError } = await supabaseAdmin
      .from('deliveries')
      .update({
        status: newStatus,
        [updateField]: new Date().toISOString()
      })
      .eq('id', deliveryId)

    if (updateError) {
      console.error('Failed to update delivery:', updateError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to update delivery status', verified: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        verified: true,
        message: `${otpType === 'pickup' ? 'Pickup' : 'Delivery'} verified successfully`,
        newStatus
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', verified: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
