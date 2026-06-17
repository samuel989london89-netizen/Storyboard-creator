/**
 * Paleta 2894_signals — cambia solo estos colores para ajustar la estetica.
 */
const THEME = {
  text: "#ebe6dc",
  muted: "#9c968a",
  accent: "#e8b86d",
  accentSoft: "#c9a227",
  link: "#9ed4f0",
  cardBg: "#111010",
  cardBorder: "#2c2926",
  pillBg: "#1a1816",
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
      `<a href="$1" style="color:${THEME.link};text-decoration:none;border-bottom:1px solid ${THEME.link};word-break:break-all;">$1</a>`
    )
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:#faf8f4;">$1</strong>`);
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

  const lead = items.find((i) => /^Resumen/i.test(i));
  const rest = items.filter((i) => i !== lead);

  let html = "";
  if (lead) {
    html += `<p style="margin:0 0 12px;color:${THEME.text};font-size:14px;line-height:1.65;">${linkify(lead.replace(/^Resumen[^:]*:\s*/i, ""))}</p>`;
  }

  const detail = rest.length ? rest : items.filter((i) => !/^Resumen/i.test(i));
  if (detail.length) {
    html += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">`;
    for (const item of detail) {
      const label = item.includes(":") ? item.split(":")[0] : null;
      const value = label ? item.slice(label.length + 1).trim() : item;
      html += `<tr><td style="padding:5px 0;font-size:13px;line-height:1.55;">`;
      if (label) {
        html += `<span style="color:${THEME.accent};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(label)}</span><br/>`;
        html += `<span style="color:${THEME.muted};">${linkify(value)}</span>`;
      } else {
        html += `<span style="color:${THEME.muted};">${linkify(item)}</span>`;
      }
      html += `</td></tr>`;
    }
    html += `</table>`;
  }

  if (!html) {
    return `<p style="margin:0;color:${THEME.muted};line-height:1.6;">${linkify(text.replace(/\n/g, " "))}</p>`;
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
      (l, i) =>
        `<p style="margin:0 0 ${i === lines.length - 1 ? "0" : "16px"};color:${THEME.text};font-size:15px;line-height:1.75;font-family:Georgia,'Times New Roman',serif;">${linkify(l)}</p>`
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
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td style="background:${THEME.cardBg};border:1px solid ${THEME.cardBorder};border-radius:14px;padding:0;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="4" style="background:linear-gradient(180deg,${THEME.accent},${THEME.accentSoft});font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:18px 20px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="display:inline-block;padding:3px 8px;border-radius:6px;background:${THEME.pillBg};color:${THEME.accent};font-size:11px;font-weight:700;letter-spacing:0.14em;font-family:ui-monospace,monospace;">SIGNAL ${num}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;">
                        <h3 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.35;color:#faf8f4;font-weight:500;">${linkify(title)}</h3>
                        ${bulletsToList(body)}
                      </td>
                    </tr>
                  </table>
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
      <td style="padding:11px 0;border-bottom:1px solid ${THEME.cardBorder};">
        <span style="color:${THEME.accent};font-size:14px;padding-right:8px;">◆</span>
        <span style="color:${THEME.text};font-size:14px;line-height:1.65;">${linkify(item)}</span>
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
      <td style="padding:14px 16px;background:${i % 2 === 0 ? THEME.pillBg : THEME.cardBg};border-radius:10px;border:1px solid ${THEME.cardBorder};">
        <span style="color:${THEME.accent};font-weight:700;font-size:12px;padding-right:10px;">0${i + 1}</span>
        <span style="color:${THEME.text};font-size:14px;line-height:1.6;">${linkify(item)}</span>
      </td>
    </tr>
    <tr><td style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr>`
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
    executive_html:
      parseExecutive(markdown) ||
      `<p style='color:${THEME.muted};'>Sin resumen esta semana.</p>`,
    news_html:
      parseNewsCards(markdown) ||
      `<p style='color:${THEME.muted};'>Sin noticias esta semana.</p>`,
    radar_html:
      parseRadar(markdown) ||
      `<tr><td style='color:${THEME.muted};'>—</td></tr>`,
    actions_html:
      parseActions(markdown) ||
      `<tr><td style='color:${THEME.muted};'>—</td></tr>`,
  };
}

module.exports = { parseReport, formatDateLabel, THEME };
