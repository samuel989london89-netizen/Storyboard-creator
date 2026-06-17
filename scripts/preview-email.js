#!/usr/bin/env node
/** Vista previa local del email 2894_signals (sin enviar). */
const fs = require("fs");
const path = require("path");
const { parseReport } = require("./parse-report");

const reportsDir = path.join(__dirname, "../reports");
const newsletterPath = path.join(__dirname, "../config/newsletter.json");
const outPath = path.join(__dirname, "../reports/preview-2894_signals.html");

const cfg = JSON.parse(fs.readFileSync(newsletterPath, "utf8"));
const files = fs
  .readdirSync(reportsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
  .sort()
  .reverse();

if (!files.length) {
  console.error("No hay informes para previsualizar.");
  process.exit(1);
}

const file = files[0];
const date = file.replace("-ai-news.md", "");
const content = fs.readFileSync(path.join(reportsDir, file), "utf8");
const parsed = parseReport(content, date);
const templatePath = path.join(__dirname, "..", cfg.template);
let html = fs.readFileSync(templatePath, "utf8");

const data = {
  DATE: date,
  DATE_LABEL: parsed.date_label,
  WEEK_NUMBER: parsed.week_number,
  YEAR: parsed.year,
  EXECUTIVE_HTML: parsed.executive_html,
  NEWS_HTML: parsed.news_html,
  RADAR_HTML: parsed.radar_html,
  ACTIONS_HTML: parsed.actions_html,
};

for (const [key, value] of Object.entries(data)) {
  html = html.replaceAll(`{{${key}}}`, value);
}

fs.writeFileSync(outPath, html);
console.log("Preview guardado en:", outPath);
