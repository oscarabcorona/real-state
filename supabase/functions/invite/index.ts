import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface InviteUserRequest {
  email: string
  propertyId: string
  inviterId: string
  inviteType: 'tenant' | 'lawyer' | 'contractor' | 'agent'
  message?: string
  redirectUrl: string
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
    const { email, propertyId, inviterId, inviteType, message, redirectUrl } = await req.json() as InviteUserRequest

    // Validate required fields
    if (!email || !propertyId || !inviterId || !inviteType || !redirectUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if property exists
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('id', propertyId)
      .single()

    if (propertyError || !propertyData) {
      console.error('Error fetching property details:', propertyError)
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get inviter details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', inviterId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user details:', userError)
      return new Response(JSON.stringify({ error: 'Inviter not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user already has access to this property through tenant_property_access
    const { data: existingAccess } = await supabase
      .from('tenant_property_access')
      .select('tenant_user_id')
      .eq('property_id', propertyId)
      .eq('tenant_user_id', 
        supabase.from('users').select('id').eq('email', email)
      )

    if (existingAccess && existingAccess.length > 0) {
      return new Response(JSON.stringify({ error: 'User already has access to this property' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate expiration (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Check for existing pending invites and delete them
    const { data: existingInvites } = await supabase
      .from('property_invites')
      .select('id')
      .eq('property_id', propertyId)
      .eq('email', email)
      .eq('invite_type', inviteType)
      .eq('status', 'pending')

    if (existingInvites && existingInvites.length > 0) {
      // Delete existing pending invites
      await supabase
        .from('property_invites')
        .delete()
        .eq('property_id', propertyId)
        .eq('email', email)
        .eq('invite_type', inviteType)
        .eq('status', 'pending')
    }

    // Generate a unique invite token
    const inviteToken = crypto.randomUUID()
    
    // Create an entry in the property_invites table
    const { data, error: inviteError } = await supabase
      .from('property_invites')
      .insert([
        {
          email,
          property_id: propertyId,
          created_by: inviterId,
          invite_type: inviteType,
          message: message || null,
          status: 'pending',
          invite_token: inviteToken,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single()

    // Create a mutable reference to the invite data
    let inviteData = data;

    if (inviteError || !inviteData) {
      console.error('Error creating invitation:', inviteError)
      // Check if this is a notification type error
      if (inviteError && inviteError.message && inviteError.message.includes('notification_type')) {
        // Try to execute SQL to add the invite_sent value to the notification_type enum
        try {
          await supabase.rpc('add_invite_sent_to_notification_type')
          
          // Try the insert again
          const { data: retryData, error: retryError } = await supabase
            .from('property_invites')
            .insert([
              {
                email,
                property_id: propertyId,
                created_by: inviterId,
                invite_type: inviteType,
                message: message || null,
                status: 'pending',
                invite_token: inviteToken,
                expires_at: expiresAt.toISOString(),
              },
            ])
            .select()
            .single()
            
          if (retryError || !retryData) {
            console.error('Error retrying invitation creation:', retryError)
            return new Response(JSON.stringify({ error: 'Failed to create invitation after repair attempt' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          // Update inviteData reference to use the successful retry data
          inviteData = retryData
        } catch (rpcError) {
          console.error('Failed to repair notification_type enum:', rpcError)
          return new Response(JSON.stringify({ error: 'Failed to repair database enum and create invitation' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } else {
        return new Response(JSON.stringify({ error: 'Failed to create invitation' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Use Supabase's built-in inviteUserByEmail method
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl, 
      }
    )

    if (authError) {
      console.error('Error inviting user:', authError)
      
      // Update invitation status to failed
      await supabase
        .from('property_invites')
        .update({ status: 'failed' })
        .eq('id', inviteData.id)
        
      return new Response(JSON.stringify({ error: `Error inviting user: ${authError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update invitation status to sent
    await supabase
      .from('property_invites')
      .update({ status: 'sent' })
      .eq('id', inviteData.id)

    return new Response(JSON.stringify({ 
      success: true, 
      data: authData
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