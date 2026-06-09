import { supabase } from '../config/supabase';

export const farmerInvitationService = {
  async validateInvite(loginIdentifier, code) {
    const { data, error } = await supabase.rpc('validate_farmer_invite', {
      p_login_identifier: loginIdentifier?.trim() || '',
      p_code: code?.trim() || '',
    });

    if (error) throw error;
    return data;
  },

  async completeActivation(inviteId) {
    const { data, error } = await supabase.rpc('complete_farmer_activation', {
      p_invite_id: inviteId,
    });

    if (error) throw error;
    return data;
  },

  async createInvite(farmId, loginIdentifier, expiresDays = 30) {
    const { data, error } = await supabase.rpc('create_farmer_invite', {
      p_farm_id: farmId,
      p_login_identifier: loginIdentifier?.trim() || '',
      p_expires_days: expiresDays,
    });

    if (error) throw error;
    return data;
  },

  async getFarmInvites(farmId) {
    const { data, error } = await supabase.rpc('get_farm_farmer_invites', {
      p_farm_id: farmId,
    });

    if (error) throw error;
    return data || [];
  },
};
