#!/usr/bin/env node
/**
 * Publica el newsletter en public/news/ para verlo online (GitHub Pages).
 */
const fs = require("fs");
const path = require("path");
const {
  getLatestReportFile,
  listReportDates,
  renderNewsletterHtml,
  wrapForWeb,
} = require("./lib/render-newsletter");

const outDir = path.join(__dirname, "../public/news");
const reportsDir = path.join(__dirname, "../reports");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const dates = listReportDates();
if (!dates.length) {
  console.error("No hay informes para publicar.");
  process.exit(1);
}

for (const date of dates) {
  const md = fs.readFileSync(path.join(reportsDir, `${date}-ai-news.md`), "utf8");
  const body = renderNewsletterHtml(md, date);
  const page = wrapForWeb(body, {
    title: `2894_signals — ${date}`,
    date,
    dates,
  });
  fs.writeFileSync(path.join(outDir, `${date}.html`), page);
}

const latest = getLatestReportFile();
const latestBody = renderNewsletterHtml(latest.content, latest.date);
const indexPage = wrapForWeb(latestBody, {
  title: `2894_signals — ultima edicion`,
  date: latest.date,
  dates,
});

fs.writeFileSync(path.join(outDir, "index.html"), indexPage);
console.log("Publicado en public/news/");
console.log("Ultima edicion:", latest.date);
console.log("Ediciones:", dates.length);
