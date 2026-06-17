#!/usr/bin/env node
/**
 * Envia el ultimo informe usando la plantilla fija 2894_signals.
 * La estetica se define una vez en templates/2894_signals.html — sin creditos extra.
 */
const fs = require("fs");
const path = require("path");
const { parseReport } = require("./parse-report");

const reportsDir = path.join(__dirname, "../reports");
const subscribersPath = path.join(__dirname, "../config/subscribers.json");
const newsletterPath = path.join(__dirname, "../config/newsletter.json");

function loadConfig() {
  return JSON.parse(fs.readFileSync(newsletterPath, "utf8"));
}

function getLatestReport() {
  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
    .sort()
    .reverse();
  if (!files.length) throw new Error("No hay informes en reports/");
  const file = files[0];
  return {
    file,
    content: fs.readFileSync(path.join(reportsDir, file), "utf8"),
    date: file.replace("-ai-news.md", ""),
  };
}

function getRecipients() {
  const testPath = path.join(__dirname, "../config/resend-test.json");
  if (fs.existsSync(testPath)) {
    const test = JSON.parse(fs.readFileSync(testPath, "utf8"));
    if (test.test_mode && test.test_only_email) {
      console.log("Modo prueba Resend: solo envia a", test.test_only_email);
      return [test.test_only_email];
    }
  }

  const subs = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
  const max = subs.max_affiliates ?? 5;
  const affiliates = (subs.affiliates ?? []).slice(0, max);
  const emails = new Set(affiliates.filter(Boolean));
  if (subs.owner_email) emails.add(subs.owner_email);
  if (!emails.size) throw new Error("No hay correos en config/subscribers.json");
  return [...emails];
}

function renderTemplate(templatePath, data) {
  let html = fs.readFileSync(templatePath, "utf8");
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

async function send() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Faltan RESEND_API_KEY o FROM_EMAIL en secretos de GitHub");
  }

  const cfg = loadConfig();
  const report = getLatestReport();
  const parsed = parseReport(report.content, report.date);
  const templatePath = path.join(__dirname, "..", cfg.template);

  const html = renderTemplate(templatePath, {
    DATE: report.date,
    DATE_LABEL: parsed.date_label,
    WEEK_NUMBER: parsed.week_number,
    YEAR: parsed.year,
    LOGO_HTML: parsed.logo_html,
    EXECUTIVE_HTML: parsed.executive_html,
    NEWS_HTML: parsed.news_html,
    RADAR_HTML: parsed.radar_html,
    ACTIONS_HTML: parsed.actions_html,
  });

  const recipients = getRecipients();
  const allSubs = (() => {
    const subs = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
    return [subs.owner_email, ...(subs.affiliates || [])].filter(Boolean);
  })();
  const subject = `${cfg.subject_prefix} · ${parsed.date_label}`;

  const testBanner =
    recipients.length === 1 && allSubs.length > 1
      ? `<p style="background:#4CBFFF;color:#000;padding:12px 16px;font-family:Helvetica,Arial,sans-serif;font-size:13px;margin:0 0 20px;border:1px solid #000;"><strong>Modo prueba Resend.</strong> Este email iba dirigido a: ${allSubs.join(", ")}. Verifica un dominio en Resend para envio real.</p>`
      : "";

  const htmlWithBanner = html.replace(
    /<body([^>]*)>/,
    `<body$1>${testBanner}`
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from.includes("<") ? from : `2894_signals <${from}>`,
      to: recipients,
      subject,
      html: htmlWithBanner,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log("2894_signals enviado a:", recipients.join(", "));
  console.log("Plantilla:", cfg.template);
  console.log("Resend id:", data.id);
}

send().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
