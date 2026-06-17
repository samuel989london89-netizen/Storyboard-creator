/**
 * Convierte el markdown del informe en bloques HTML para la plantilla 2894_signals.
 * Sin LLM — solo parsing, reutilizable cada semana.
 */

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
      '<a href="$1" style="color:#7dd3fc;text-decoration:none;border-bottom:1px solid #38bdf8;">$1</a>'
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong style=\"color:#f1f5f9;\">$1</strong>");
}

function extractSection(md, startPattern, endPattern) {
  const start = md.search(startPattern);
  if (start === -1) return "";
  const rest = md.slice(start);
  const end = endPattern ? rest.slice(1).search(endPattern) : -1;
  const block = end === -1 ? rest : rest.slice(0, end + 1);
  return block.replace(startPattern, "").trim();
}

function bulletsToList(text) {
  const items = text
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim());
  if (!items.length) return `<p style="margin:0;color:#cbd5e1;line-height:1.6;">${linkify(text.replace(/\n/g, " "))}</p>`;
  return `<ul style="margin:8px 0 0;padding-left:18px;color:#cbd5e1;line-height:1.65;">
    ${items.map((i) => `<li style="margin-bottom:6px;">${linkify(i)}</li>`).join("")}
  </ul>`;
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
        `<p style="margin:0 0 14px;color:#e2e8f0;font-size:15px;line-height:1.7;">${linkify(l)}</p>`
    )
    .join("");
}

function parseNewsCards(md) {
  const block = extractSection(md, /^## 2\)[^\n]*\n/m, /^## 3\)/m);
  const cards = block.split(/^### /m).filter(Boolean);
  return cards
    .map((card, idx) => {
      const lines = card.trim().split("\n");
      const title = lines[0].replace(/^\d+\)\s*/, "").trim();
      const body = lines.slice(1).join("\n").trim();
      const num = String(idx + 1).padStart(2, "0");
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border:1px solid #334155;border-radius:12px;padding:20px 22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="44" valign="top">
                  <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-weight:700;font-size:13px;line-height:36px;text-align:center;font-family:Georgia,serif;">${num}</div>
                </td>
                <td valign="top" style="padding-left:12px;">
                  <h3 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.35;color:#f8fafc;font-weight:600;">${linkify(title)}</h3>
                  ${bulletsToList(body)}
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
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e293b;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22d3ee;margin-right:10px;vertical-align:middle;"></span>
        <span style="color:#e2e8f0;font-size:14px;line-height:1.6;vertical-align:middle;">${linkify(item)}</span>
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
      <td style="padding:12px 16px;background:${i % 2 === 0 ? "#0f172a" : "#111827"};border-radius:8px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="color:#fb923c;font-weight:700;font-size:13px;padding-right:12px;white-space:nowrap;">→</td>
          <td style="color:#f1f5f9;font-size:14px;line-height:1.55;">${linkify(item)}</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>`
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

function parseReport(markdown, date) {
  return {
    date,
    date_label: formatDateLabel(date),
    year: date.slice(0, 4),
    executive_html: parseExecutive(markdown) || "<p style='color:#94a3b8;'>Sin resumen esta semana.</p>",
    news_html: parseNewsCards(markdown) || "<p style='color:#94a3b8;'>Sin noticias esta semana.</p>",
    radar_html: parseRadar(markdown) || "<tr><td style='color:#94a3b8;'>—</td></tr>",
    actions_html: parseActions(markdown) || "<tr><td style='color:#94a3b8;'>—</td></tr>",
  };
}

module.exports = { parseReport, formatDateLabel };
