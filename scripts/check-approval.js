#!/usr/bin/env node
/**
 * Bloquea envio si el usuario no ha aprobado esta semana.
 * Exit 0 + skip = no enviar (sin error)
 * Exit 0 = OK enviar
 * Exit 1 = error real
 */
const fs = require("fs");
const path = require("path");

const approvalPath = path.join(__dirname, "../config/approval.json");
const reportsDir = path.join(__dirname, "../reports");

const approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));

const files = fs
  .readdirSync(reportsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
  .sort()
  .reverse();

if (!files.length) {
  console.log("SKIP: no hay informes para enviar.");
  process.exit(2);
}

const latestDate = files[0].replace("-ai-news.md", "");

if (!approval.approved) {
  console.log("SKIP: envio bloqueado. Esperando tu 'Aprobado' en Cursor.");
  process.exit(2);
}

if (approval.report_date !== latestDate) {
  console.log(
    `SKIP: aprobacion es para ${approval.report_date || "ninguna fecha"}, informe actual es ${latestDate}.`
  );
  process.exit(2);
}

console.log(`OK: aprobado para enviar informe ${latestDate}.`);
