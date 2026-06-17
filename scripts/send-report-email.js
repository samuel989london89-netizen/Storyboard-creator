#!/usr/bin/env node
/**
 * Envia el ultimo informe a owner + affiliates (max 5).
 * Requiere secretos: RESEND_API_KEY, FROM_EMAIL
 */
const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "../reports");
const subscribersPath = path.join(__dirname, "../config/subscribers.json");

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
  const subs = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
  const max = subs.max_affiliates ?? 5;
  const affiliates = (subs.affiliates ?? []).slice(0, max);
  const emails = new Set(affiliates.filter(Boolean));
  if (subs.owner_email) emails.add(subs.owner_email);
  if (!emails.size) throw new Error("No hay correos en config/subscribers.json");
  return [...emails];
}

function markdownToHtml(md) {
  return md
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])/gm, "")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

async function send() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Faltan RESEND_API_KEY o FROM_EMAIL en secretos de GitHub");
  }

  const report = getLatestReport();
  const recipients = getRecipients();
  const subject = `Informe semanal IA creativa — ${report.date}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 720px; margin: 0 auto;">
      <p style="color:#666;">Newsletter automatica. Un solo informe semanal para el equipo creativo.</p>
      ${markdownToHtml(report.content)}
      <hr/>
      <p style="color:#999;font-size:12px;">Generado desde Storyboard-creator · ${report.file}</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log("Email enviado a:", recipients.join(", "));
  console.log("Resend id:", data.id);
}

send().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
