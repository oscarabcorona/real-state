import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface SetPasswordRequest {
  invitationId: string
  userId: string  // Extracted from the auth session
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the request body
    const { invitationId, userId } = await req.json() as SetPasswordRequest

    // Validate required fields
    if (!invitationId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the user to verify their email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('Error fetching user:', userError)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const userEmail = userData.user.email

    // Get the invitation
    const { data: inviteData, error: inviteError } = await supabase
      .from('property_invites')
      .select('id, property_id, invite_type, email, status')
      .eq('id', invitationId)
      .single()

    if (inviteError || !inviteData) {
      console.error('Error fetching invitation:', inviteError)
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the invitation belongs to this user
    if (inviteData.email !== userEmail) {
      return new Response(JSON.stringify({ error: 'This invitation does not belong to you' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check invitation status
    if (inviteData.status !== 'pending' && inviteData.status !== 'sent' && inviteData.status !== 'processing') {
      return new Response(JSON.stringify({ error: 'Invitation has already been used or is invalid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add the user to the property
    await supabase
      .from('tenant_property_access')
      .insert({
        tenant_user_id: userId,
        property_id: inviteData.property_id
      })
      .select()

    // Update invitation status to accepted
    await supabase
      .from('property_invites')
      .update({ status: 'accepted' })
      .eq('id', invitationId)

    // Ensure the user has the correct role in their profile
    await supabase
      .from('users')
      .update({ 
        role: inviteData.invite_type === 'tenant' ? 'tenant' : 'user'
      })
      .eq('id', userId)

    return new Response(JSON.stringify({ 
      success: true,
      property_id: inviteData.property_id,
      role: inviteData.invite_type
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 