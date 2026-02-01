import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface VerifyOTPRequest {
  deliveryId: string
  otpType: 'pickup' | 'delivery'
  enteredOtp: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user client to get user info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication failed:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Parse request body
    const { deliveryId, otpType, enteredOtp }: VerifyOTPRequest = await req.json()

    // Validate input
    if (!deliveryId || !otpType || !enteredOtp) {
      console.error('Missing required fields:', { deliveryId, otpType, hasOtp: !!enteredOtp })
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

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(enteredOtp)) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP format', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Verifying OTP for delivery:', deliveryId, 'type:', otpType)

    // Fetch the delivery record using admin client
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from('deliveries')
      .select('id, sender_id, traveler_id, pickup_otp, delivery_otp, status')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      console.error('Delivery not found:', deliveryError?.message)
      return new Response(
        JSON.stringify({ error: 'Delivery not found', verified: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is a participant in this delivery
    if (delivery.sender_id !== user.id && delivery.traveler_id !== user.id) {
      console.error('User is not a participant in this delivery')
      return new Response(
        JSON.stringify({ error: 'Forbidden', verified: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the stored OTP based on type
    const storedOtp = otpType === 'pickup' ? delivery.pickup_otp : delivery.delivery_otp

    if (!storedOtp) {
      console.error('No OTP found for this delivery type')
      return new Response(
        JSON.stringify({ error: 'OTP not set for this delivery', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the OTP
    if (enteredOtp !== storedOtp) {
      console.log('OTP verification failed - incorrect OTP')
      return new Response(
        JSON.stringify({ verified: false, message: 'Invalid OTP' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('OTP verified successfully, updating delivery status')

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

    console.log('Delivery status updated to:', newStatus)

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
