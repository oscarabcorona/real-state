// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Get the Resend API key from environment variables
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Create Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

interface InviteRequest {
  propertyId: string;
  tenantEmail: string;
  message?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the current authenticated user
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get request data
    const { propertyId, tenantEmail, message = '' } = await req.json() as InviteRequest

    // Validate required parameters
    if (!propertyId || !tenantEmail) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the current user is the property owner
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id, name, address, city, state, user_id')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if the current user is the property owner
    if (property.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only the property owner can send invitations' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user with this email exists
    const { data: tenantUser, error: tenantUserError } = await supabaseClient.auth.admin
      .getUserByEmail(tenantEmail)

    if (tenantUserError) {
      return new Response(JSON.stringify({ error: 'Error verifying tenant email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!tenantUser) {
      // User doesn't exist - we could add logic to invite them to the platform here
      return new Response(JSON.stringify({ error: 'User with this email does not exist in the system' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if access already exists
    const { data: existingAccess } = await supabaseClient
      .from('tenant_property_access')
      .select('*')
      .eq('tenant_user_id', tenantUser.id)
      .eq('property_id', propertyId)
      .single()

    if (existingAccess) {
      return new Response(JSON.stringify({ error: 'This tenant already has access to this property' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert the tenant_property_access record
    const { error: insertError } = await supabaseClient
      .from('tenant_property_access')
      .insert({
        tenant_user_id: tenantUser.id,
        property_id: propertyId
      })

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to grant property access' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get property owner info for the email
    const { data: ownerProfile, error: ownerProfileError } = await supabaseClient
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    if (ownerProfileError) {
      return new Response(JSON.stringify({ error: 'Error retrieving owner profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Format the property address
    const formattedAddress = `${property.address}, ${property.city}, ${property.state}`

    // Send the email via Resend API
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Real Estate <no-reply@yourdomain.com>`, // Replace with your domain
        to: tenantEmail,
        subject: `You've been granted access to ${property.name}`,
        html: `
          <h1>Property Access Granted</h1>
          <p>Hello,</p>
          <p>You've been granted access to the property: <strong>${property.name}</strong> at ${formattedAddress}.</p>
          <p><strong>From:</strong> ${ownerProfile.name} (${ownerProfile.email})</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p>You can now view this property in your dashboard.</p>
          <p>Thank you!</p>
        `,
      }),
    })

    const resendData = await res.json()

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Property access granted and invitation sent',
      data: resendData 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Handle any other errors
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    auth: {
      getUser: async (token: string) => {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: supabaseKey,
            },
          })
          
          if (!response.ok) {
            return { data: { user: null }, error: new Error('Invalid user') }
          }
          
          const user = await response.json()
          return { data: { user }, error: null }
        } catch (error) {
          return { data: { user: null }, error }
        }
      },
      admin: {
        getUserByEmail: async (email: string) => {
          try {
            const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
                apikey: supabaseKey,
              },
            })
            
            if (!response.ok) {
              return { data: null, error: new Error('Error fetching user') }
            }
            
            const users = await response.json()
            return { data: users?.users?.[0] || null, error: null }
          } catch (error) {
            return { data: null, error }
          }
        }
      }
    },
    from: (table: string) => {
      return {
        select: (columns: string) => {
          return {
            eq: async (column: string, value: string) => {
              try {
                const response = await fetch(
                  `${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, 
                  {
                    headers: {
                      Authorization: `Bearer ${supabaseKey}`,
                      apikey: supabaseKey,
                    },
                  }
                )
                
                if (!response.ok) {
                  return { data: null, error: new Error(`Error fetching from ${table}`) }
                }
                
                const result = await response.json()
                return { 
                  data: result.length > 0 ? result : null, 
                  error: null,
                  single: () => {
                    return { 
                      data: result.length > 0 ? result[0] : null, 
                      error: result.length === 0 ? new Error('No records found') : null
                    }
                  }
                }
              } catch (error) {
                return { data: null, error, single: () => ({ data: null, error }) }
              }
            }
          }
        },
        insert: async (data: Record<string, unknown>) => {
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/${table}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  apikey: supabaseKey,
                  'Content-Type': 'application/json',
                  Prefer: 'return=minimal',
                },
                body: JSON.stringify(data),
              }
            )
            
            if (!response.ok) {
              return { error: new Error(`Error inserting into ${table}`) }
            }
            
            return { error: null }
          } catch (error) {
            return { error }
          }
        }
      }
    }
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/resend' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
