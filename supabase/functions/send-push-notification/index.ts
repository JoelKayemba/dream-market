/**
 * Webhook Supabase (INSERT sur public.notifications) → envoi push via Expo Push API.
 * Secrets : PUSH_WEBHOOK_SECRET (obligatoire en prod), EXPO_ACCESS_TOKEN (recommandé sur expo.dev).
 */
import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("[send-push-notification] PUSH_WEBHOOK_SECRET manquant");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const h = req.headers.get("x-webhook-secret");
    if (h !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const record = payload.record ?? payload;

    if (!record?.id || !record?.user_id) {
      return new Response(JSON.stringify({ error: "Invalid payload: missing id or user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: existing } = await supabase
      .from("notifications")
      .select("is_sent")
      .eq("id", record.id)
      .maybeSingle();

    if (existing?.is_sent) {
      return new Response(JSON.stringify({ ok: true, skipped: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tokenRows, error: tokErr } = await supabase
      .from("user_push_tokens")
      .select("expo_push_token")
      .eq("user_id", record.user_id);

    if (tokErr) throw tokErr;

    const title = String(record.title ?? "Dream Market");
    const body = String(record.message ?? "");

    if (tokenRows && tokenRows.length > 0) {
      const messages = tokenRows.map((row: { expo_push_token: string }) => ({
        to: row.expo_push_token,
        title,
        body,
        sound: "default",
        priority: "high" as const,
        channelId: "default",
        data: {
          notificationId: record.id,
          type: record.type,
          orderId: record.order_id ?? undefined,
        },
      }));

      const expoHeaders: Record<string, string> = {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      };
      const expoAccess = Deno.env.get("EXPO_ACCESS_TOKEN");
      if (expoAccess) expoHeaders.Authorization = `Bearer ${expoAccess}`;

      const expoRes = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: expoHeaders,
        body: JSON.stringify(messages),
      });

      const expoJson = await expoRes.json();
      if (!expoRes.ok) {
        console.error("[send-push-notification] Expo API error", expoRes.status, expoJson);
      } else {
        console.log("[send-push-notification] Expo response", JSON.stringify(expoJson));
      }
    } else {
      console.log("[send-push-notification] No push tokens for user", record.user_id);
    }

    const { error: updErr } = await supabase
      .from("notifications")
      .update({
        is_sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-push-notification]", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
