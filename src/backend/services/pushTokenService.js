import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  );
}

function normalizePlatform() {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Enregistre le jeton Expo Push pour l'utilisateur connecté (RPC sécurisée côté DB).
 * À appeler après permission accordée ; prévoir un build EAS / dev client (pas Expo Go Android récent).
 */
export async function registerExpoPushTokenForUser(userId) {
  try {
    if (!userId) return { ok: false, reason: 'no_user' };

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, reason: 'permission_denied' };
    }

    const projectId = getExpoProjectId();
    if (!projectId) {
      console.warn('[pushTokenService] projectId EAS manquant (extra.eas.projectId dans app.json)');
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const expoPushToken = tokenResponse?.data;
    if (!expoPushToken) {
      return { ok: false, reason: 'no_token' };
    }

    const platform = normalizePlatform();

    const { error } = await supabase.rpc('upsert_expo_push_token', {
      p_token: expoPushToken,
      p_platform: platform,
    });

    if (error) {
      console.error('[pushTokenService] RPC erreur:', error);
      return { ok: false, reason: 'db_error', error };
    }

    console.log('[pushTokenService] Jeton Expo Push enregistré');
    return { ok: true, expoPushToken };
  } catch (e) {
    console.error('[pushTokenService]', e);
    return { ok: false, reason: 'exception', error: e };
  }
}
