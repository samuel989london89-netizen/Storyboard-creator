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
const sitePath = path.join(__dirname, "../config/site.json");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
if (site.custom_domain) {
  fs.writeFileSync(path.join(publicDir, "CNAME"), `${site.custom_domain}\n`);
} else if (fs.existsSync(path.join(publicDir, "CNAME"))) {
  fs.unlinkSync(path.join(publicDir, "CNAME"));
}

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
