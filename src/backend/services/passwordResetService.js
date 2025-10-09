// Remplacer TOUT le contenu de src/backend/services/passwordResetService.js par ceci :

import { supabase } from '../config/supabase';

// Clé API Resend (gratuit 3000 emails/mois)
// À ajouter dans votre fichier .env : EXPO_PUBLIC_RESEND_API_KEY=re_votre_cle
const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY ;

export const passwordResetService = {
  // Demander un code de réinitialisation
  requestResetCode: async (email) => {
    try {
      // 1. Générer le code via fonction SQL
      const { data: codeData, error: codeError } = await supabase.rpc('request_password_reset', {
        user_email: email
      });
      
      if (codeError) {
        throw codeError;
      }
      
      // 2. Envoyer l'email via Resend API
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Dream Market <onboarding@resend.dev>', // Email de test Resend
            to: email,
            subject: '🔐 Code de réinitialisation Dream Market',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px;">Dream Market</h1>
                  <p style="color: white; margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Votre marketplace agricole</p>
                </div>
                
                <!-- Contenu -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #283106; margin: 0 0 20px; font-size: 24px;">Réinitialisation de mot de passe</h2>
                  
                  <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 10px;">
                    Bonjour,
                  </p>
                  
                  <p style="color: #555555; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                    Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :
                  </p>
                  
                  <!-- Code Box -->
                  <div style="background-color: #E8F5E9; border: 3px dashed #4CAF50; border-radius: 16px; padding: 40px; text-align: center; margin: 30px 0;">
                    <p style="color: #555555; font-size: 14px; margin: 0 0 15px; font-weight: 500;">Votre code de vérification :</p>
                    <h1 style="color: #4CAF50; font-size: 56px; letter-spacing: 12px; margin: 0; font-weight: bold;">${codeData.code}</h1>
                    <p style="color: #777777; font-size: 13px; margin: 15px 0 0;">⏱️ Expire dans 15 minutes</p>
                  </div>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 22px; margin: 30px 0 0;">
                    Entrez ce code dans l'application Dream Market pour créer un nouveau mot de passe.
                  </p>
                  
                  <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 30px 0; border-radius: 4px;">
                    <p style="color: #F57C00; font-size: 14px; margin: 0;">
                      ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre compte reste sécurisé.
                    </p>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="padding: 30px; text-align: center; background-color: #f5f5f5; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2026 Dream Market. Tous droits réservés.
                  </p>
                  <p style="color: #999999; font-size: 11px; margin: 10px 0 0;">
                    Cet email a été envoyé automatiquement, veuillez ne pas y répondre.
                  </p>
                </div>
              </div>
            `
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Erreur envoi email');
        }
      } catch (emailError) {
        throw new Error('Impossible d\'envoyer l\'email. Vérifiez votre connexion.');
      }
      
      return {
        success: true,
        expiresAt: codeData?.expires_at
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Réinitialiser le mot de passe avec le code
  resetPasswordWithCode: async (email, code, newPassword) => {
    try {
      // Appeler la fonction SQL qui vérifie le code et change le mot de passe
      const { data, error } = await supabase.rpc('reset_password_with_code', {
        user_email: email,
        user_code: code,
        new_password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

