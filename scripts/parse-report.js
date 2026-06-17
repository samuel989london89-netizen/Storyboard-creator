/**
 * 2894_signals — estilo minimal brutalista (#4CBFFF)
 */
const THEME = {
  bg: "#ffffff",
  accent: "#4CBFFF",
  text: "#000000",
  muted: "#1a1a1a",
  soft: "#666666",
  border: "#000000",
  dark: "#111111",
  link: "#000000",
};

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      `<a href="$1" style="color:${THEME.text};text-decoration:underline;word-break:break-all;">$1</a>`
    )
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);
}

function extractSection(md, startPattern, endPattern) {
  const start = md.search(startPattern);
  if (start === -1) return "";
  const rest = md.slice(start);
  const end = endPattern ? rest.slice(1).search(endPattern) : -1;
  const block = end === -1 ? rest : rest.slice(0, end + 1);
  return block.replace(startPattern, "").trim();
}

function pickField(items, prefix) {
  const hit = items.find((i) => i.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!hit) return "";
  const idx = hit.indexOf(":");
  return idx === -1 ? hit : hit.slice(idx + 1).trim();
}

function bulletsToHighlightBox(text) {
  const items = text
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim());

  const summary =
    pickField(items, "Resumen") ||
    pickField(items, "Por que importa") ||
    items[0] ||
    text.replace(/\n/g, " ");

  const extras = [];
  const impacto = pickField(items, "Por que importa al mundo creativo");
  const caso = pickField(items, "Caso de uso");
  const riesgo = pickField(items, "Riesgo");
  const fuente = pickField(items, "Fuente oficial");
  if (impacto) extras.push(`<strong>Impacto:</strong> ${linkify(impacto)}`);
  if (caso) extras.push(`<strong>Uso:</strong> ${linkify(caso)}`);
  if (riesgo) extras.push(`<strong>Riesgo:</strong> ${linkify(riesgo)}`);
  if (fuente) extras.push(`<strong>Fuente:</strong> ${linkify(fuente)}`);

  let html = `<p style="margin:0;color:${THEME.text};font-size:14px;line-height:1.65;font-family:Helvetica,Arial,sans-serif;">${linkify(summary)}</p>`;
  if (extras.length) {
    html += `<p style="margin:14px 0 0;color:${THEME.muted};font-size:12px;line-height:1.6;font-family:Helvetica,Arial,sans-serif;">${extras.join("<br/>")}</p>`;
  }
  return html;
}

function parseExecutive(md) {
  const block = extractSection(md, /^## 1\)[^\n]*\n/m, /^## 2\)/m);
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines
    .map(
      (l) =>
        `<p style="margin:0 0 12px;color:${THEME.text};font-size:14px;line-height:1.7;font-family:Helvetica,Arial,sans-serif;">${linkify(l)}</p>`
    )
    .join("");
}

function logoIconHtml() {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="width:10px;height:10px;background:${THEME.text};font-size:0;line-height:0;">&nbsp;</td>
      <td style="width:6px;font-size:0;">&nbsp;</td>
      <td style="width:10px;height:10px;background:${THEME.text};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr><td colspan="3" style="height:6px;font-size:0;">&nbsp;</td></tr>
    <tr>
      <td style="width:10px;height:10px;background:${THEME.text};font-size:0;line-height:0;">&nbsp;</td>
      <td style="width:6px;font-size:0;">&nbsp;</td>
      <td style="width:10px;height:10px;background:${THEME.text};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;
}

function parseNewsCards(md) {
  const block = extractSection(md, /^## 2\)[^\n]*\n/m, /^## 3\)/m);
  const cards = block.split(/^### /m).filter(Boolean);

  return cards
    .map((card, idx) => {
      const lines = card.trim().split("\n");
      const title = lines[0].replace(/^\d+\)\s*/, "").trim().toUpperCase();
      const body = lines.slice(1).join("\n").trim();
      const num = String(idx + 1).padStart(2, "0");

      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid ${THEME.border};border-collapse:collapse;">
        <tr>
          <!-- Columna texto -->
          <td valign="top" width="58%" style="border-right:1px solid ${THEME.border};background:${THEME.bg};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:20px 22px 16px;border-bottom:1px solid ${THEME.border};">
                  <h3 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;line-height:1.35;color:${THEME.text};letter-spacing:0.02em;text-transform:uppercase;">${linkify(title)}</h3>
                </td>
              </tr>
              <tr>
                <td style="padding:0;background:${THEME.accent};border-bottom:1px solid ${THEME.border};">
                  <div style="padding:18px 22px;">
                    ${bulletsToHighlightBox(body)}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="56" style="padding:12px;border-right:1px solid ${THEME.border};text-align:center;vertical-align:middle;">
                        ${logoIconHtml()}
                      </td>
                      <td style="padding:12px 16px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${THEME.soft};letter-spacing:0.08em;text-transform:uppercase;">
                        Signal · Creative AI
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
          <!-- Columna visual -->
          <td valign="top" width="42%" style="background:${THEME.dark};position:relative;">
            <table role="presentation" width="100%" height="100%" cellpadding="0" cellspacing="0" style="min-height:220px;">
              <tr>
                <td valign="bottom" align="right" style="padding:16px;height:220px;background:${THEME.dark};">
                  <div style="display:inline-block;width:44px;height:44px;background:${THEME.bg};border:1px solid ${THEME.border};text-align:center;line-height:44px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${THEME.text};">${num}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
    })
    .join("");
}

function parseRadar(md) {
  const block = extractSection(md, /^## 3\)[^\n]*\n/m, /^## 4\)/m);
  const items = block
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim());
  return items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid ${THEME.border};background:${i % 2 === 0 ? THEME.bg : "#f7fbff"};">
        <span style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:${THEME.text};padding-right:10px;">${String(i + 1).padStart(2, "0")}</span>
        <span style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${THEME.muted};">${linkify(item)}</span>
      </td>
    </tr>`
    )
    .join("");
}

function parseActions(md) {
  const block = extractSection(md, /^## 4\)[^\n]*\n/m, /^## 5\)/m);
  const items = block
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim());
  return items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:16px 18px;border-bottom:1px solid ${THEME.border};background:${THEME.accent};">
        <span style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;color:${THEME.text};padding-right:12px;">0${i + 1}</span>
        <span style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${THEME.text};">${linkify(item)}</span>
      </td>
    </tr>`
    )
    .join("");
}

function formatDateLabel(isoDate) {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getWeekNumber(isoDate) {
  const d = new Date(isoDate + "T12:00:00Z");
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((d - start) / 86400000) + 1;
  return String(Math.ceil(dayOfYear / 7)).padStart(2, "0");
}

function parseReport(markdown, date) {
  return {
    date,
    date_label: formatDateLabel(date),
    week_number: getWeekNumber(date),
    year: date.slice(0, 4),
    logo_html: logoIconHtml(),
    executive_html:
      parseExecutive(markdown) ||
      `<p style='color:${THEME.soft};font-family:Helvetica,Arial,sans-serif;'>Sin resumen esta semana.</p>`,
    news_html:
      parseNewsCards(markdown) ||
      `<p style='color:${THEME.soft};'>Sin noticias esta semana.</p>`,
    radar_html:
      parseRadar(markdown) ||
      `<tr><td style='padding:14px;color:${THEME.soft};'>—</td></tr>`,
    actions_html:
      parseActions(markdown) ||
      `<tr><td style='padding:14px;color:${THEME.soft};'>—</td></tr>`,
  };
}

module.exports = { parseReport, formatDateLabel, THEME, logoIconHtml };
