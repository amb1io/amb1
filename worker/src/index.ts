interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  locale?: string;
  website?: string; // honeypot
}

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  return headers;
}

function json(
  body: unknown,
  status: number,
  origin: string | null,
  allowed: string[],
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin, allowed),
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = env.ALLOWED_ORIGINS.split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowed),
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, origin, allowed);
    }

    if (origin && !allowed.includes(origin)) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, origin, allowed);
    }

    let payload: ContactPayload;
    try {
      payload = (await request.json()) as ContactPayload;
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400, origin, allowed);
    }

    // Honeypot — bots that fill hidden fields are ignored quietly
    if (payload.website) {
      return json({ ok: true }, 200, origin, allowed);
    }

    const name = (payload.name ?? "").trim();
    const email = (payload.email ?? "").trim().toLowerCase();
    const message = (payload.message ?? "").trim();
    const locale = payload.locale === "en-us" ? "en-us" : "pt-br";

    if (!name || name.length > 120) {
      return json({ ok: false, error: "invalid_name" }, 400, origin, allowed);
    }

    if (!email || email.length > 200 || !isValidEmail(email)) {
      return json({ ok: false, error: "invalid_email" }, 400, origin, allowed);
    }

    if (message.length > 4000) {
      return json({ ok: false, error: "invalid_message" }, 400, origin, allowed);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message || "(sem mensagem)");
    const subject =
      locale === "en-us"
        ? `AMB1 contact — ${name}`
        : `Contato AMB1 — ${name}`;

    const text = [
      "Novo contato pelo site AMB1",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Idioma: ${locale}`,
      "",
      "Mensagem:",
      message || "(sem mensagem)",
    ].join("\n");

    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #2e2e30;">
        <h1 style="font-size: 18px; margin: 0 0 12px;">Novo contato pelo site AMB1</h1>
        <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>E-mail:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 16px;"><strong>Idioma:</strong> ${locale}</p>
        <p style="margin: 0 0 6px;"><strong>Mensagem:</strong></p>
        <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `;

    try {
      const result = await env.EMAIL.send({
        to: env.CONTACT_TO,
        from: { email: env.FROM_EMAIL, name: env.FROM_NAME },
        replyTo: email,
        subject,
        text,
        html,
      });

      return json({ ok: true, id: result.messageId }, 200, origin, allowed);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "send_failed";
      console.error("EMAIL.send failed", detail);
      return json({ ok: false, error: "send_failed" }, 502, origin, allowed);
    }
  },
} satisfies ExportedHandler<Env>;
