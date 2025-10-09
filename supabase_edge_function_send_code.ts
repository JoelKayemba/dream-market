// ============================================
// Supabase Edge Function pour Envoyer le Code par Email
// ============================================

// Fichier: supabase/functions/send-reset-code/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  try {
    const { email, code } = await req.json()
    
    console.log('📧 Envoi email à:', email)
    
    // Envoyer via Resend (ou SendGrid, Mailgun, etc.)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Dream Market <noreply@votredomaine.com>',
        to: email,
        subject: '🔐 Code de réinitialisation Dream Market',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
              .header { padding: 40px 30px; text-align: center; background-color: #4CAF50; }
              .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; }
              .code-box { background-color: #E8F5E9; border: 2px dashed #4CAF50; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
              .code { font-size: 48px; font-weight: bold; color: #4CAF50; letter-spacing: 8px; margin: 0; }
              .footer { padding: 30px; text-align: center; background-color: #f5f5f5; border-top: 1px solid #e0e0e0; }
            </style>
          </head>
          <body>
            <table class="container" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header">
                  <h1>🏪 Dream Market</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Votre marketplace agricole</p>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <h2 style="color: #283106; margin: 0 0 20px 0;">Réinitialisation de mot de passe</h2>
                  
                  <p style="color: #555555; font-size: 16px; line-height: 24px;">
                    Bonjour,
                  </p>
                  
                  <p style="color: #555555; font-size: 16px; line-height: 24px;">
                    Vous avez demandé la réinitialisation de votre mot de passe Dream Market. Voici votre code de vérification :
                  </p>
                  
                  <div class="code-box">
                    <p style="color: #555555; font-size: 14px; margin: 0 0 10px 0;">Votre code de réinitialisation :</p>
                    <p class="code">${code}</p>
                    <p style="color: #777777; font-size: 12px; margin: 10px 0 0 0;">Ce code expire dans 15 minutes</p>
                  </div>
                  
                  <p style="color: #555555; font-size: 14px; line-height: 20px;">
                    Entrez ce code dans l'application Dream Market pour créer un nouveau mot de passe.
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2024 Dream Market. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Erreur envoi email')
    }
    
    console.log('✅ Email envoyé avec succès')
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('❌ Erreur:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

