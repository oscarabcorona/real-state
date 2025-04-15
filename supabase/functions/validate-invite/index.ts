import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface ValidateInviteRequest {
  token: string
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
    const { token } = await req.json() as ValidateInviteRequest

    // Validate required fields
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get invitation by token
    const { data: inviteData, error: inviteError } = await supabase
      .from('property_invites')
      .select(`
        id,
        property_id,
        invite_type,
        created_by,
        expires_at,
        status,
        properties:property_id (
          name
        ),
        users:created_by (
          full_name
        )
      `)
      .eq('invite_token', token)
      .single()

    if (inviteError || !inviteData) {
      console.error('Error fetching invitation:', inviteError)
      return new Response(JSON.stringify({ valid: false, error: 'Invitation not found' }), {
        status: 200,  // Still return 200 but with valid:false for client handling
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if invite is expired
    const now = new Date()
    const expiresAt = new Date(inviteData.expires_at)
    
    if (now > expiresAt) {
      return new Response(JSON.stringify({ valid: false, error: 'Invitation has expired' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if invite has already been used
    if (inviteData.status !== 'pending' && inviteData.status !== 'sent') {
      return new Response(JSON.stringify({ valid: false, error: 'Invitation has already been used' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Return invite details
    return new Response(JSON.stringify({ 
      valid: true,
      invitationId: inviteData.id,
      propertyId: inviteData.property_id,
      propertyName: inviteData.properties?.name,
      inviteType: inviteData.invite_type,
      inviterId: inviteData.created_by,
      inviterName: inviteData.users?.full_name,
      expiresAt: inviteData.expires_at
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ valid: false, error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 