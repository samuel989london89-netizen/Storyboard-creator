#!/usr/bin/env node
/**
 * En cron de lunes: solo enviar si el ultimo informe tiene menos de 96h.
 * Evita reenviar informes viejos si la generacion fallo.
 */
const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "../reports");
const maxAgeHours = 96;

const files = fs
  .readdirSync(reportsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}-ai-news\.md$/.test(f))
  .sort()
  .reverse();

if (!files.length) {
  console.log("No hay informes. Skip envio.");
  process.exit(0);
}

const latest = path.join(reportsDir, files[0]);
const ageHours = (Date.now() - fs.statSync(latest).mtimeMs) / 3600000;

if (ageHours > maxAgeHours) {
  console.log(
    `Ultimo informe (${files[0]}) tiene ${Math.round(ageHours)}h. Skip envio programado.`
  );
  process.exit(0);
}

console.log(`Informe fresco: ${files[0]} (${Math.round(ageHours)}h). OK para enviar.`);
