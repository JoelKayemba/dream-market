import { supabase } from '../config/supabase';
import { validateAndSanitizeEmail, sanitizeString } from '../../utils/inputSanitizer';

// Clé API Brevo (gratuit 300 emails/jour)
// Peut venir de .env (développement local) ou eas.json (builds EAS)
// Priorité : .env > eas.json (mais Expo charge automatiquement les deux)
const getBrevoApiKey = () => {
  // Vérifier d'abord depuis process.env (peut venir de .env ou eas.json)
  const keyFromEnv = process.env.EXPO_PUBLIC_BREVO_API_KEY;
  
  if (keyFromEnv && keyFromEnv !== 'À_REMPLACER' && keyFromEnv.trim() !== '') {
    // Détecter la source (approximatif)
    const source = __DEV__ ? '(.env ou eas.json - dev)' : '(eas.json - build)';
    console.log(`✅ [PasswordReset] Clé API Brevo chargée depuis ${source}`);
    return keyFromEnv;
  }
  
  console.warn('⚠️ [PasswordReset] Clé API Brevo non trouvée dans les variables d\'environnement');
  return null;
};

// Email expéditeur Brevo (doit être vérifié dans Brevo)
// Peut venir de .env ou eas.json, sinon utilise la valeur par défaut
const getBrevoSenderEmail = () => {
  const emailFromEnv = process.env.EXPO_PUBLIC_BREVO_SENDER_EMAIL;
  
  if (emailFromEnv && emailFromEnv.trim() !== '') {
    return emailFromEnv.trim();
  }
  
  // Valeur par défaut (utilisez EXPO_PUBLIC_BREVO_SENDER_EMAIL dans .env ou eas.json)
  return 'noreply@kayembajoel.info'; // Email avec domaine vérifié dans Brevo
};

const BREVO_API_KEY = getBrevoApiKey();
const BREVO_SENDER_EMAIL = getBrevoSenderEmail();

export const passwordResetService = {
  // Demander un code de réinitialisation
  requestResetCode: async (email) => {
    try {
      // Valider et nettoyer l'email
      const emailResult = validateAndSanitizeEmail(email);
      if (!emailResult.valid) {
        throw new Error(emailResult.error);
      }

      // 1. Générer le code via fonction SQL
      const { data: codeData, error: codeError } = await supabase.rpc('request_password_reset', {
        user_email: emailResult.cleaned
      });
      
      if (codeError) {
        throw codeError;
      }
      
      // 2. Envoyer l'email via Brevo API
      // Vérifier que la clé API est présente (depuis .env ou eas.json)
      const apiKey = getBrevoApiKey();
      
      if (!apiKey || apiKey === 'À_REMPLACER' || apiKey.trim() === '') {
        console.error('❌ [PasswordReset] Clé API Brevo manquante ou non configurée');
        console.error('❌ [PasswordReset] Vérifiez que EXPO_PUBLIC_BREVO_API_KEY est défini dans:');
        console.error('   - .env (pour développement local)');
        console.error('   - eas.json (pour builds EAS)');
        throw new Error('Configuration email non disponible. Veuillez contacter le support.');
      }

      // Récupérer l'email expéditeur (depuis .env, eas.json, ou valeur par défaut)
      const senderEmail = getBrevoSenderEmail();
      
      console.log('📧 [PasswordReset] Envoi email via Brevo...');
      console.log('📧 [PasswordReset] Destinataire:', emailResult.cleaned);
      console.log('📧 [PasswordReset] Expéditeur:', senderEmail);
      console.log('📧 [PasswordReset] Clé API chargée:', apiKey ? `Oui (${apiKey.substring(0, 10)}...)` : 'Non');

      try {
        // Format exact selon la documentation Brevo API v3 SMTP
        const emailBody = {
          sender: {
            name: 'Dream Market',
            email: senderEmail // DOIT être vérifié dans Brevo (Settings → Senders & IP)
          },
          to: [
            {
              email: emailResult.cleaned,
              name: emailResult.cleaned.split('@')[0] // Nom optionnel
            }
          ],
          subject: 'Code de réinitialisation Dream Market',
          htmlContent: `
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
        };

        console.log('📧 [PasswordReset] Corps email préparé');
        console.log('📧 [PasswordReset] Body JSON:', JSON.stringify(emailBody, null, 2));

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(emailBody)
        });
        
        console.log('📧 [PasswordReset] Statut réponse:', response.status, response.statusText);
        
        // Gérer les réponses vides ou non-JSON
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const textResult = await response.text();
          console.log('📧 [PasswordReset] Réponse texte:', textResult);
          result = textResult ? JSON.parse(textResult) : {};
        }
        
        console.log('📧 [PasswordReset] Réponse Brevo complète:', JSON.stringify(result, null, 2));
        
        if (!response.ok) {
          // Brevo retourne les erreurs dans result.message, result.error, ou result.code
          const errorMessage = result.message || result.error || result.code || `Erreur HTTP ${response.status}`;
          console.error('❌ [PasswordReset] Erreur Brevo:', errorMessage);
          console.error('❌ [PasswordReset] Détails complets:', result);
          
          // Messages d'erreur spécifiques selon la documentation Brevo
          if (result.code === 'invalid_parameter' || 
              result.message?.toLowerCase().includes('sender') ||
              result.message?.toLowerCase().includes('from') ||
              response.status === 400) {
            throw new Error(`Email expéditeur non vérifié dans Brevo. Allez dans Brevo → Settings → Senders & IP et vérifiez que ${senderEmail} est vérifié (statut "Verified").`);
          }
          if (result.code === 'unauthorized' || response.status === 401) {
            throw new Error('Clé API Brevo invalide ou expirée. Vérifiez votre clé API dans Brevo → Settings → SMTP & API → API Keys.');
          }
          if (result.code === 'duplicate_parameter' || response.status === 409) {
            throw new Error('Email déjà envoyé récemment. Veuillez patienter quelques minutes.');
          }
          
          throw new Error(`Erreur Brevo: ${errorMessage}`);
        }

        // Vérifier si Brevo a retourné un messageId (succès confirmé)
        if (result.messageId) {
          console.log('✅ [PasswordReset] Email envoyé avec succès. MessageId:', result.messageId);
          console.log('✅ [PasswordReset] L\'email devrait arriver dans quelques secondes.');
        } else {
          // Parfois Brevo retourne juste un statut 201 sans messageId
          if (response.status === 201 || response.status === 200) {
            console.log('✅ [PasswordReset] Email accepté par Brevo (statut:', response.status, ')');
            console.log('✅ [PasswordReset] L\'email devrait arriver dans quelques secondes.');
          } else {
            console.warn('⚠️ [PasswordReset] Réponse Brevo inattendue:', result);
          }
        }
      } catch (emailError) {
        console.error('Erreur envoi email Brevo:', emailError);
        // Si c'est déjà une erreur avec message, la relancer
        if (emailError.message) {
          throw emailError;
        }
        throw new Error('Impossible d\'envoyer l\'email. Vérifiez votre connexion et votre clé API Brevo.');
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
      // Valider et nettoyer l'email
      const emailResult = validateAndSanitizeEmail(email);
      if (!emailResult.valid) {
        throw new Error(emailResult.error);
      }

      // Nettoyer le code (6 chiffres)
      const cleanedCode = sanitizeString(String(code || ''), {
        maxLength: 6,
        escapeHtml: false,
      }).replace(/\D/g, ''); // Garder uniquement les chiffres

      if (cleanedCode.length !== 6) {
        throw new Error('Code de réinitialisation invalide (6 chiffres requis)');
      }

      // Valider le nouveau mot de passe
      if (!newPassword || typeof newPassword !== 'string') {
        throw new Error('Le mot de passe est requis');
      }

      // Vérifier la longueur minimale du mot de passe
      if (newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Vérifier la longueur maximale du mot de passe
      if (newPassword.length > 128) {
        throw new Error('Le mot de passe ne doit pas dépasser 128 caractères');
      }

      // Nettoyer le mot de passe (supprimer les caractères de contrôle)
      const cleanedPassword = sanitizeString(newPassword, {
        maxLength: 128,
        escapeHtml: false,
        allowNewlines: false,
      });

      // Appeler la fonction SQL qui vérifie le code et change le mot de passe
      const { data, error } = await supabase.rpc('reset_password_with_code', {
        user_email: emailResult.cleaned,
        user_code: cleanedCode,
        new_password: cleanedPassword
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

