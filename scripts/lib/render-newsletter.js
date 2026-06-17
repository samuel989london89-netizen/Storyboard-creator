const fs = require("fs");
const path = require("path");
const { parseReport } = require("../parse-report");

const ROOT = path.join(__dirname, "../..");

function getLatestReportFile() {
  const reportsDir = path.join(ROOT, "reports");
  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
    .sort()
    .reverse();
  if (!files.length) return null;
  const file = files[0];
  return {
    file,
    date: file.replace("-ai-news.md", ""),
    content: fs.readFileSync(path.join(reportsDir, file), "utf8"),
  };
}

function listReportDates() {
  const reportsDir = path.join(ROOT, "reports");
  return fs
    .readdirSync(reportsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
    .map((f) => f.replace("-ai-news.md", ""))
    .sort()
    .reverse();
}

function renderNewsletterHtml(markdown, date) {
  const newsletterPath = path.join(ROOT, "config/newsletter.json");
  const cfg = JSON.parse(fs.readFileSync(newsletterPath, "utf8"));
  const parsed = parseReport(markdown, date);
  const templatePath = path.join(ROOT, cfg.template);
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

function wrapForWeb(bodyHtml, { title, date, dates }) {
  const archiveLinks = dates
    .map(
      (d) =>
        `<a href="${d === date ? "index.html" : `${d}.html`}" style="color:#000;text-decoration:none;padding:6px 10px;border:1px solid #000;margin:0 4px 4px 0;display:inline-block;font-size:12px;${d === date ? "background:#4CBFFF;" : "background:#fff;"}">${d}</a>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="2894_signals — señales semanales de IA creativa" />
  <style>
    body { margin: 0; background: #f4f4f4; font-family: Helvetica, Arial, sans-serif; }
    .web-bar {
      max-width: 640px;
      margin: 0 auto;
      padding: 16px 16px 0;
    }
    .web-bar-inner {
      background: #fff;
      border: 1px solid #000;
      padding: 14px 16px;
    }
    .web-bar h1 { margin: 0 0 6px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; }
    .web-bar p { margin: 0 0 10px; font-size: 12px; color: #444; }
    .web-frame { max-width: 640px; margin: 0 auto 32px; padding: 0 16px 16px; }
  </style>
</head>
<body>
  <div class="web-bar">
    <div class="web-bar-inner">
      <h1>2894_signals · edicion web</h1>
      <p>Lee el newsletter online. No hace falta correo.</p>
      <div>${archiveLinks}</div>
    </div>
  </div>
  <div class="web-frame">${bodyHtml}</div>
</body>
</html>`;
}

module.exports = {
  getLatestReportFile,
  listReportDates,
  renderNewsletterHtml,
  wrapForWeb,
};
