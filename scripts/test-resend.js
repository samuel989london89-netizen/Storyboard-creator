#!/usr/bin/env node
/**
 * Prueba de envio Resend con plantilla 2894_signals.
 *
 * Uso (en tu terminal, NO pegues la API key en el repo):
 *
 *   RESEND_API_KEY=re_xxxx \
 *   FROM_EMAIL=onboarding@resend.dev \
 *   TO_EMAIL=samuel989london89@gmail.com \
 *   node scripts/test-resend.js
 *
 * Nota Resend: onboarding@resend.dev solo envia al correo verificado de tu cuenta.
 */
const fs = require("fs");
const path = require("path");
const { parseReport } = require("./parse-report");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.FROM_EMAIL || "onboarding@resend.dev";
const to = process.env.TO_EMAIL;

if (!apiKey) {
  console.error("Falta RESEND_API_KEY en variables de entorno.");
  process.exit(1);
}
if (!to) {
  console.error("Falta TO_EMAIL (correo verificado en Resend).");
  process.exit(1);
}

const newsletterPath = path.join(__dirname, "../config/newsletter.json");
const reportsDir = path.join(__dirname, "../reports");
const cfg = JSON.parse(fs.readFileSync(newsletterPath, "utf8"));
const templatePath = path.join(__dirname, "..", cfg.template);

function buildHtml() {
  const previewPath = path.join(reportsDir, "preview-2894_signals.html");
  if (fs.existsSync(previewPath)) {
    return fs.readFileSync(previewPath, "utf8");
  }

  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
    .sort()
    .reverse();

  if (!files.length) {
    return "<p><strong>2894_signals</strong> — prueba de conexion Resend OK.</p>";
  }

  const file = files[0];
  const date = file.replace("-ai-news.md", "");
  const content = fs.readFileSync(path.join(reportsDir, file), "utf8");
  const parsed = parseReport(content, date);
  let html = fs.readFileSync(templatePath, "utf8");
  const data = {
    DATE: date,
    DATE_LABEL: parsed.date_label,
    WEEK_NUMBER: parsed.week_number,
    YEAR: parsed.year,
    LOGO_HTML: parsed.logo_html,
    EXECUTIVE_HTML: parsed.executive_html,
    NEWS_HTML: parsed.news_html,
    RADAR_HTML: parsed.radar_html,
    ACTIONS_HTML: parsed.actions_html,
  };
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

async function send() {
  const html = buildHtml();
  const subject = "2894_signals · Prueba de envio";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from.includes("<") ? from : `2894_signals <${from}>`,
      to: [to],
      subject,
      html,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Error Resend:", res.status, body);
    process.exit(1);
  }

  console.log("Email de prueba enviado a:", to);
  console.log("Respuesta:", body);
}

send().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
