/**
 * Notifications admin (nouvelle commande) via Brevo — email uniquement.
 * Clé dédiée : EXPO_PUBLIC_BREVO_COMMANDE_API_KEY, sinon EXPO_PUBLIC_BREVO_API_KEY.
 */

const getBrevoApiKeyForOrders = () => {
  const commandeKey = process.env.EXPO_PUBLIC_BREVO_COMMANDE_API_KEY;
  const fallback = process.env.EXPO_PUBLIC_BREVO_API_KEY;
  const key = (commandeKey && commandeKey.trim()) || (fallback && fallback.trim()) || '';
  if (!key || key === 'À_REMPLACER') return null;
  return key;
};

const getBrevoSenderEmail = () => {
  const email = process.env.EXPO_PUBLIC_BREVO_SENDER_EMAIL;
  return email && email.trim() ? email.trim() : 'noreply@kayembajoel.info';
};

/** Emails admin pour les alertes commande (virgule ou point-virgule dans EXPO_PUBLIC_ADMIN_ORDER_EMAIL) */
const getAdminOrderEmails = () => {
  const raw = process.env.EXPO_PUBLIC_ADMIN_ORDER_EMAIL;
  if (raw && raw.trim()) {
    const list = raw
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean);
    return [...new Set(list)];
  }
  return ['kayembajoel92@gmail.com', 'donndekila70@gmail.com'];
};

function escapeHtml(text) {
  if (text == null || text === '') return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatTotals(totals) {
  if (totals == null) return '—';
  if (typeof totals === 'object' && !Array.isArray(totals)) {
    return Object.entries(totals)
      .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`)
      .join(' · ') || '—';
  }
  return escapeHtml(String(totals));
}

function buildOrderEmailHtml(order) {
  const items = normalizeItems(order.items);
  const rows = items
    .map((line) => {
      const name = escapeHtml(line.product_name || line.name || 'Article');
      const qty = escapeHtml(String(line.quantity ?? '—'));
      const price = escapeHtml(
        line.subtotal != null
          ? String(line.subtotal)
          : line.product_price != null
            ? String(line.product_price)
            : '—'
      );
      const cur = escapeHtml(line.product_currency || '');
      return `<tr><td style="padding:8px;border:1px solid #e0e0e0;">${name}</td><td style="padding:8px;border:1px solid #e0e0e0;text-align:center;">${qty}</td><td style="padding:8px;border:1px solid #e0e0e0;">${price} ${cur}</td></tr>`;
    })
    .join('');

  const orderRef = escapeHtml(order.order_number || order.id?.slice?.(0, 8) || order.id || '—');
  const customer = [
    order.customer_first_name,
    order.customer_last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2F8F46 0%, #256b36 100%); padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Nouvelle commande Dream Market</h1>
      </div>
      <div style="padding: 24px; background: #fafafa;">
        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
          Une nouvelle commande vient d’être passée.
        </p>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 16px; background: #fff; border-radius: 8px; overflow: hidden;">
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">N° commande</td><td style="padding:10px 12px; border-bottom:1px solid #eee;"><strong>${orderRef}</strong></td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">ID</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.id || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Statut</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.status || 'pending')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Client</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(customer || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Email</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.customer_email || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Téléphone</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.phone_number || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Livraison</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.delivery_address || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Paiement</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.payment_method || '—')}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Frais livraison</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(String(order.delivery_fee_amount ?? '—'))} ${escapeHtml(order.delivery_fee_currency || '')}</td></tr>
          <tr><td style="padding:10px 12px; color:#666;">Totaux</td><td style="padding:10px 12px;"><strong>${formatTotals(order.totals)}</strong></td></tr>
        </table>
        ${order.notes ? `<p style="color:#555; font-size:14px;"><strong>Notes :</strong> ${escapeHtml(order.notes)}</p>` : ''}
        <h3 style="font-size: 15px; color: #283106; margin: 20px 0 8px;">Articles</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 14px; background: #fff;">
          <thead><tr style="background:#E8F5E9;"><th style="padding:8px;border:1px solid #e0e0e0;text-align:left;">Produit</th><th style="padding:8px;border:1px solid #e0e0e0;">Qté</th><th style="padding:8px;border:1px solid #e0e0e0;text-align:left;">Montant</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3" style="padding:12px;">Aucun détail d’article</td></tr>'}</tbody>
        </table>
      </div>
      <div style="padding: 16px; text-align: center; color: #999; font-size: 12px; background: #f0f0f0;">
        Notification automatique — Dream Market
      </div>
    </div>
  `;
}

async function sendBrevoEmail({ apiKey, toEmail, toName, subject, htmlContent }) {
  const senderEmail = getBrevoSenderEmail();
  const body = {
    sender: { name: 'Dream Market', email: senderEmail },
    to: [{ email: toEmail, name: toName || 'Admin' }],
    subject,
    htmlContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  let result = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    result = await response.json();
  } else {
    const text = await response.text();
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { raw: text };
    }
  }

  if (!response.ok) {
    const msg = result.message || result.error || result.code || `HTTP ${response.status}`;
    throw new Error(`Brevo email: ${msg}`);
  }
  return result;
}

/**
 * Envoie l’email aux admins — ne doit pas faire échouer la commande.
 * @param {object} order - Ligne commande retournée par Supabase après insert
 */
export async function notifyAdminNewOrder(order) {
  if (!order || !order.id) {
    console.warn('[orderNotificationService] Commande invalide, notification ignorée');
    return { sent: false, reason: 'invalid_order' };
  }

  const apiKey = getBrevoApiKeyForOrders();
  if (!apiKey) {
    console.warn('[orderNotificationService] Clé Brevo absente (COMMANDE ou BREVO_API_KEY)');
    return { sent: false, reason: 'no_api_key' };
  }

  const adminEmails = getAdminOrderEmails();
  const orderLabel = order.order_number || order.id;

  const results = { emails: [] };

  const html = buildOrderEmailHtml(order);
  const subject = `Nouvelle commande ${orderLabel} — Dream Market`;

  for (const adminEmail of adminEmails) {
    try {
      const sent = await sendBrevoEmail({
        apiKey,
        toEmail: adminEmail,
        toName: 'Admin Dream Market',
        subject,
        htmlContent: html,
      });
      results.emails.push({ to: adminEmail, ok: true, result: sent });
    } catch (e) {
      console.error('[orderNotificationService] Échec email admin:', adminEmail, e?.message || e);
      results.emails.push({ to: adminEmail, ok: false, error: e?.message || String(e) });
    }
  }

  const anyEmailOk = results.emails.some((e) => e.ok);
  return { sent: anyEmailOk, results };
}

export default { notifyAdminNewOrder };
