/**
 * Webhook Supabase (INSERT sur public.orders) -> email Brevo aux admins.
 *
 * Secrets Supabase requis :
 * - ORDER_EMAIL_WEBHOOK_SECRET
 * - BREVO_COMMANDE_API_KEY ou BREVO_API_KEY
 * - BREVO_SENDER_EMAIL
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
// @ts-ignore - Supabase Edge Functions résout les imports npm: à l'exécution Deno.
import { createClient } from "npm:@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function escapeHtml(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeItems(items: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(items)) return items as Array<Record<string, unknown>>;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatTotals(totals: unknown): string {
  if (!totals) return "-";
  if (typeof totals === "object" && !Array.isArray(totals)) {
    const entries = Object.entries(totals as Record<string, unknown>);
    return entries
      .map(([currency, amount]) => `${escapeHtml(currency)}: ${escapeHtml(amount)}`)
      .join(" · ") || "-";
  }
  return escapeHtml(totals);
}

function buildOrderEmailHtml(order: Record<string, unknown>): string {
  const items = normalizeItems(order.items);
  const orderId = String(order.id ?? "");
  const orderRef = escapeHtml(order.order_number ?? orderId.slice(0, 8) ?? "-");
  const customerName = [order.customer_first_name, order.customer_last_name]
    .filter(Boolean)
    .join(" ");

  const rows = items.map((item) => {
    const name = escapeHtml(item.product_name ?? item.name ?? "Article");
    const quantity = escapeHtml(item.quantity ?? "-");
    const amount = escapeHtml(item.subtotal ?? item.product_price ?? "-");
    const currency = escapeHtml(item.product_currency ?? "");

    return `
      <tr>
        <td style="padding:8px;border:1px solid #e0e0e0;">${name}</td>
        <td style="padding:8px;border:1px solid #e0e0e0;text-align:center;">${quantity}</td>
        <td style="padding:8px;border:1px solid #e0e0e0;">${amount} ${currency}</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #283106;">
      <div style="background: linear-gradient(135deg, #283106 0%, #4CAF50 100%); padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Nouvelle commande Dream Market</h1>
      </div>
      <div style="padding: 24px; background: #fafafa;">
        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">Une nouvelle commande vient d'etre passée.</p>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 16px; background: #fff;">
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">N° commande</td><td style="padding:10px 12px; border-bottom:1px solid #eee;"><strong>${orderRef}</strong></td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">ID</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.id ?? "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Statut</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.status ?? "pending")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Client</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(customerName || order.customer_email || "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Email</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.customer_email ?? "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Téléphone</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.phone_number ?? "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Livraison</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.delivery_address ?? "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Paiement</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.payment_method ?? "-")}</td></tr>
          <tr><td style="padding:10px 12px; border-bottom:1px solid #eee; color:#666;">Frais livraison</td><td style="padding:10px 12px; border-bottom:1px solid #eee;">${escapeHtml(order.delivery_fee_amount ?? "-")} ${escapeHtml(order.delivery_fee_currency ?? "")}</td></tr>
          <tr><td style="padding:10px 12px; color:#666;">Totaux</td><td style="padding:10px 12px;"><strong>${formatTotals(order.totals)}</strong></td></tr>
        </table>
        ${order.notes ? `<p style="color:#555; font-size:14px;"><strong>Notes :</strong> ${escapeHtml(order.notes)}</p>` : ""}
        <h3 style="font-size: 15px; color: #283106; margin: 20px 0 8px;">Articles</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 14px; background: #fff;">
          <thead>
            <tr style="background:#E8F5E9;">
              <th style="padding:8px;border:1px solid #e0e0e0;text-align:left;">Produit</th>
              <th style="padding:8px;border:1px solid #e0e0e0;">Qté</th>
              <th style="padding:8px;border:1px solid #e0e0e0;text-align:left;">Montant</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="3" style="padding:12px;">Aucun détail d’article</td></tr>'}</tbody>
        </table>
      </div>
      <div style="padding: 16px; text-align: center; color: #777E5C; font-size: 12px; background: #D1D8BD;">
        Notification automatique - Dream Market
      </div>
    </div>
  `;
}

Deno.serve(async (req: Request) => {
  console.log("[send-order-admin-email] Invocation reçue", {
    method: req.method,
    hasWebhookSecretHeader: Boolean(req.headers.get("x-webhook-secret")),
  });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("ORDER_EMAIL_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.headers.get("x-webhook-secret") !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const order = payload.record ?? payload;
    if (!order?.id) {
      return new Response(JSON.stringify({ error: "Invalid payload: missing order id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("[send-order-admin-email] Webhook reçu pour commande", {
      orderId: order.id,
      orderNumber: order.order_number ?? null,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const brevoKey = Deno.env.get("BREVO_COMMANDE_API_KEY") || Deno.env.get("BREVO_API_KEY");
    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@kayembajoel.info";

    if (!supabaseUrl || !serviceKey || !brevoKey) {
      console.error("[send-order-admin-email] Configuration manquante", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(serviceKey),
        hasBrevoKey: Boolean(brevoKey),
        hasSenderEmail: Boolean(senderEmail),
      });
      throw new Error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or Brevo API key");
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: recipients, error: recipientsError } = await supabase
      .rpc("get_admin_order_email_recipients");

    if (recipientsError) throw recipientsError;
    console.log("[send-order-admin-email] Destinataires admin lus", {
      count: recipients?.length ?? 0,
      emails: (recipients ?? []).map((recipient: { email?: string }) => recipient.email).filter(Boolean),
    });

    const to = [
      ...new Map(
        (recipients ?? [])
          .filter((recipient: { email?: string }) => recipient.email)
          .map((recipient: { email: string; full_name?: string | null }) => [
            recipient.email.toLowerCase(),
            { email: recipient.email, name: recipient.full_name || "Admin Dream Market" },
          ]),
      ).values(),
    ];

    if (to.length === 0) {
      console.warn("[send-order-admin-email] Aucun admin destinataire avec email actif");
      return new Response(JSON.stringify({ ok: true, skipped: "no_admin_recipients" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderLabel = String(order.order_number || order.id);
    console.log("[send-order-admin-email] Envoi Brevo en cours", {
      orderLabel,
      recipientCount: to.length,
      senderEmail,
    });

    const brevoResponse = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Dream Market", email: senderEmail },
        to,
        subject: `Nouvelle commande ${orderLabel} - Dream Market`,
        htmlContent: buildOrderEmailHtml(order),
      }),
    });

    const brevoResult = await brevoResponse.json().catch(() => ({}));
    if (!brevoResponse.ok) {
      console.error("[send-order-admin-email] Brevo error", brevoResponse.status, brevoResult);
      return new Response(JSON.stringify({ error: "Brevo error", details: brevoResult }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("[send-order-admin-email] Email Brevo envoyé", {
      orderLabel,
      recipientCount: to.length,
      brevoMessageId: brevoResult?.messageId ?? null,
    });

    return new Response(JSON.stringify({ ok: true, recipients: to.length, brevo: brevoResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-order-admin-email]", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
