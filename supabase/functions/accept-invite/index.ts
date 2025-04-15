import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface AcceptInviteRequest {
  token: string
  invitationId: string
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
    const { token, invitationId } = await req.json() as AcceptInviteRequest

    // Validate required fields
    if (!token || !invitationId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the invitation exists and is valid
    const { data: inviteData, error: inviteError } = await supabase
      .from('property_invites')
      .select('id, email, status, property_id, expires_at')
      .eq('id', invitationId)
      .eq('invite_token', token)
      .single()

    if (inviteError || !inviteData) {
      console.error('Error fetching invitation:', inviteError)
      return new Response(JSON.stringify({ error: 'Invalid invitation' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check invitation status
    if (inviteData.status !== 'pending' && inviteData.status !== 'sent') {
      return new Response(JSON.stringify({ error: 'Invitation has already been used' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(inviteData.expires_at)
    
    if (now > expiresAt) {
      return new Response(JSON.stringify({ error: 'Invitation has expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update invitation status to processing
    await supabase
      .from('property_invites')
      .update({ status: 'processing' })
      .eq('id', invitationId)

    // Find existing user or create one
    const { data: existingUsers } = await supabase.auth.admin.listUsers({
      filters: {
        email: inviteData.email
      }
    })

    let userId
    
    if (existingUsers && existingUsers.users.length > 0) {
      // User exists
      userId = existingUsers.users[0].id
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: inviteData.email,
        options: {
          redirectTo: `${req.headers.get('origin')}/invites/accept?token=${token}`
        }
      })
      
      if (resetError) {
        console.error('Error sending password reset:', resetError)
        
        // Revert invitation status
        await supabase
          .from('property_invites')
          .update({ status: 'pending' })
          .eq('id', invitationId)
          
        return new Response(JSON.stringify({ error: 'Failed to send password reset email' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      // Create a new user
      const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      
      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        email_confirm: true,
        password: randomPassword,
        user_metadata: {
          invite_id: invitationId,
          property_id: inviteData.property_id,
          needs_password_set: true
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        
        // Revert invitation status
        await supabase
          .from('property_invites')
          .update({ status: 'pending' })
          .eq('id', invitationId)
          
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      userId = newUser.user.id
      
      // Create basic user profile
      await supabase.from('users').insert({
        id: userId,
        email: inviteData.email,
        role: 'user'
      })
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: inviteData.email,
        options: {
          redirectTo: `${req.headers.get('origin')}/invites/accept?token=${token}`
        }
      })
      
      if (resetError) {
        console.error('Error sending password reset:', resetError)
        // Continue anyway since the user was created
      }
    }
    
    // Update invitation with user_id and update status to processing
    await supabase
      .from('property_invites')
      .update({ 
        status: 'processing'
      })
      .eq('id', invitationId)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Password reset email sent. Check your inbox to continue.'
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