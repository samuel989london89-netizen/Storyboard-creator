#!/usr/bin/env node
/** Marca aprobacion para enviar el informe de una fecha. */
const fs = require("fs");
const path = require("path");

const date = process.argv[2];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Uso: node scripts/approve-send.js YYYY-MM-DD");
  process.exit(1);
}

const approvalPath = path.join(__dirname, "../config/approval.json");
const approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));

approval.approved = true;
approval.report_date = date;
approval.approved_at = new Date().toISOString();

fs.writeFileSync(approvalPath, JSON.stringify(approval, null, 2) + "\n");
console.log(`Aprobado envio para informe ${date}.`);
