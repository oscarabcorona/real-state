// Logic for inviting users to the platform
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define PropertyInvite interface
export interface PropertyInvite {
  id: string;
  property_id: string;
  created_by: string;
  email: string;
  invite_type: 'tenant' | 'lawyer' | 'contractor' | 'agent';
  status: string;
  message?: string;
  invite_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  property_name?: string;
  inviter_email?: string;
  inviter_name?: string;
}

interface PropertyInviteParams {
  propertyId: string;
  email: string;
  inviteType: 'tenant' | 'lawyer' | 'contractor' | 'agent';
  message?: string;
  userId: string;
}

/**
 * Sends an invitation to a user to access a property
 */
export const sendPropertyInvite = async ({
  propertyId,
  email,
  inviteType,
  message,
  userId,
}: PropertyInviteParams) => {
  try {
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Invalid email address');
    }

    // Get the redirect URL
    const redirectUrl = `${window.location.origin}/auth/set-password`;
    
    // Call the Supabase Edge Function using the client
    const { data, error } = await supabase.functions.invoke('invite', {
      body: {
        email,
        propertyId,
        inviterId: userId,
        inviteType,
        message,
        redirectUrl,
      }
    });

    if (error) {
      console.error('Error inviting user:', error);
      throw new Error(error.message || 'Failed to send invitation');
    }

    return data;
  } catch (error) {
    console.error('Error in sendPropertyInvite:', error);
    throw error;
  }
};

/**
 * Set password for an invited user
 */
export const setInvitedUserPassword = async (refreshToken: string, password: string, invitationId?: string) => {
  try {
    // Call the Supabase Edge Function using the client
    const { data, error } = await supabase.functions.invoke('set-password', {
      body: {
        refreshToken,
        password,
        invitationId,
      }
    });

    if (error) {
      console.error('Error setting password:', error);
      throw new Error(error.message || 'Failed to set password');
    }

    return data;
  } catch (error) {
    console.error('Error in setInvitedUserPassword:', error);
    throw error;
  }
};

/**
 * Delete an invitation
 */
export const deleteInvite = async (inviteId: string) => {
  try {
    const { error } = await supabase
      .from('property_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteInvite:', error);
    throw error;
  }
};

/**
 * Resend an invitation
 */
export const resendInvite = async (inviteId: string) => {
  try {
    // Get invitation details first
    const { data: inviteData, error: fetchError } = await supabase
      .from('property_invites')
      .select('email, property_id, invite_type, created_by')
      .eq('id', inviteId)
      .single();
      
    if (fetchError || !inviteData) {
      throw new Error('Failed to fetch invitation details');
    }
    
    // Create a new invite using the same details
    const result = await sendPropertyInvite({
      propertyId: inviteData.property_id,
      email: inviteData.email,
      inviteType: inviteData.invite_type as 'tenant' | 'lawyer' | 'contractor' | 'agent',
      userId: inviteData.created_by
    });
    
    // Delete the old invite
    await deleteInvite(inviteId);
    
    return result;
  } catch (error) {
    console.error('Error in resendInvite:', error);
    throw error;
  }
};

/**
 * Update invitation status
 */
export const updateInviteStatus = async (inviteId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('property_invites')
      .update({ status })
      .eq('id', inviteId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateInviteStatus:', error);
    throw error;
  }
};

/**
 * Get all invitations for a property
 */
export const getPropertyInvites = async (propertyId: string): Promise<PropertyInvite[]> => {
  try {
    const { data, error } = await supabase
      .from('property_invites_with_details')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPropertyInvites:', error);
    throw error;
  }
};